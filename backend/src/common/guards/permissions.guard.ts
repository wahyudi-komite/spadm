import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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
    const now = new Date();
    const userRoles = await userRoleRepo
      .createQueryBuilder('userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('userRole.userId = :userId', { userId })
      .andWhere('userRole.status = :status', { status: 'ACTIVE' })
      .andWhere('userRole.revokedAt IS NULL')
      .andWhere('(userRole.startsAt IS NULL OR userRole.startsAt <= :now)', { now })
      .andWhere('(userRole.endsAt IS NULL OR userRole.endsAt >= :now)', { now })
      .getMany();

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
