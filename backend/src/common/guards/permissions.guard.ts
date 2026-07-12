import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull } from 'typeorm';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '../../modules/roles/user-role.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) return false;

    const userRoleRepo = this.dataSource.getRepository(UserRole);
    const userRoles = await userRoleRepo.find({
      where: { userId, revokedAt: IsNull() },
      relations: { role: { permissions: true } },
    });

    const userPermissions = new Set<string>();
    for (const ur of userRoles) {
      for (const p of ur.role.permissions) {
        userPermissions.add(p.name);
      }
    }

    const hasPermission = requiredPermissions.some((p) => userPermissions.has(p));
    if (!hasPermission) {
      throw new ForbiddenException('Anda tidak memiliki akses');
    }

    return true;
  }
}
