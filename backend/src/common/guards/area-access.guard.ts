import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../../modules/roles/user-role.entity';

export interface AreaAccess {
  unrestricted: boolean;
  areaIds: number[];
}

@Injectable()
export class AreaAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = Number(request.user?.sub);
    if (!Number.isInteger(userId) || userId <= 0) return false;

    const now = new Date();
    const assignments = await this.userRoleRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.role', 'role')
      .where('assignment.userId = :userId', { userId })
      .andWhere('assignment.status = :status', { status: 'ACTIVE' })
      .andWhere('assignment.revokedAt IS NULL')
      .andWhere('(assignment.startsAt IS NULL OR assignment.startsAt <= :now)', { now })
      .andWhere('(assignment.endsAt IS NULL OR assignment.endsAt >= :now)', { now })
      .getMany();

    const access: AreaAccess = {
      unrestricted: assignments.some((assignment) =>
        ['SUPER_ADMIN', 'BAZAAR_ADMIN'].includes(assignment.role?.name),
      ),
      areaIds: assignments
        .filter((assignment) => assignment.role?.name === 'AREA_PIC' && assignment.areaId)
        .map((assignment) => assignment.areaId),
    };
    request.areaAccess = access;

    const requestedAreaId = Number(
      request.params?.areaId ?? request.query?.areaId ?? request.body?.areaId,
    );
    if (
      Number.isInteger(requestedAreaId) &&
      requestedAreaId > 0 &&
      !access.unrestricted &&
      !access.areaIds.includes(requestedAreaId)
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke area ini');
    }

    if (!access.unrestricted && access.areaIds.length === 0) {
      throw new ForbiddenException('Akun PIC belum memiliki penugasan area aktif');
    }
    return true;
  }
}
