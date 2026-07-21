import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Role } from './role.entity';
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';
import { UserRoleHistory } from './user-role-history.entity';
import { Member } from '../members/entities/member.entity';
import { Permission } from '../permissions/permission.entity';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserRoleHistory)
    private userRoleHistoryRepository: Repository<UserRoleHistory>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    private auditLogService: AuditLogService,
  ) {}

  async findAll() {
    return this.roleRepository.find({ relations: { permissions: true }, order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOne({ where: { id }, relations: { permissions: true } });
    if (!role) throw new NotFoundException('Role tidak ditemukan');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.roleRepository.findOne({ where: { name: dto.name } });
    if (existing) throw new BadRequestException('Role already exists');
    return this.roleRepository.save(this.roleRepository.create(dto));
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    await this.roleRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    if (role.isSystem) throw new BadRequestException('System role cannot be deleted');
    await this.roleRepository.delete(id);
  }

  async assignPermissions(roleId: number, permissionIds: number[]) {
    const role = await this.findOne(roleId);
    const permissions = await this.permissionRepository.find({ where: { id: In(permissionIds) } });
    role.permissions = permissions;
    await this.roleRepository.save(role);
    return this.findOne(roleId);
  }

  async removePermission(roleId: number, permissionId: number) {
    const role = await this.findOne(roleId);
    role.permissions = role.permissions.filter((p) => p.id !== permissionId);
    await this.roleRepository.save(role);
    return this.findOne(roleId);
  }

  async getUserRoles(memberId: number) {
    const userRoles = await this.userRoleRepository.find({
      where: { memberId, revokedAt: IsNull() },
      relations: { role: { permissions: true } },
      order: { assignedAt: 'DESC' },
    });
    return userRoles;
  }

  async assignRole(memberId: number, dto: AssignRoleDto, assignedBy: number) {
    const member = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Anggota tidak ditemukan');

    const role = await this.roleRepository.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role tidak ditemukan');

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : new Date();
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : undefined;
    if (endsAt && endsAt <= startsAt) {
      throw new BadRequestException('Tanggal selesai harus setelah tanggal mulai');
    }

    const existingQuery = this.userRoleRepository
      .createQueryBuilder('userRole')
      .where('userRole.memberId = :memberId', { memberId })
      .andWhere('userRole.roleId = :roleId', { roleId: dto.roleId })
      .andWhere('userRole.revokedAt IS NULL');
    if (dto.areaId === undefined) {
      existingQuery.andWhere('userRole.areaId IS NULL');
    } else {
      existingQuery.andWhere('userRole.areaId = :areaId', { areaId: dto.areaId });
    }
    const existing = await existingQuery.getOne();
    if (existing) throw new BadRequestException('User sudah memiliki role ini');

    const saved = await this.userRoleRepository.save(
      this.userRoleRepository.create({
        memberId,
        roleId: dto.roleId,
        assignedBy,
        areaId: dto.areaId,
        reason: dto.reason,
        startsAt,
        endsAt,
        status: 'ACTIVE',
      }),
    );

    await this.userRoleHistoryRepository.save({
      memberId,
      roleId: dto.roleId,
      areaId: dto.areaId,
      startsAt,
      endsAt,
      status: 'ACTIVE',
      action: 'ASSIGN',
      changedBy: assignedBy,
      reason: dto.reason,
    });

    await this.auditLogService.log({ userId: memberId, action: 'ASSIGN_ROLE', module: 'auth', entityType: 'member', entityId: memberId, description: `Role ${role.name} assigned` });

    return this.userRoleRepository.findOne({ where: { id: saved.id }, relations: { role: true } });
  }

  async revokeRole(memberId: number, roleId: number, revokedBy: number, reason?: string) {
    const userRole = await this.userRoleRepository.findOne({
      where: { memberId, roleId, revokedAt: IsNull() },
    });
    if (!userRole) throw new NotFoundException('Role assignment tidak ditemukan');

    await this.userRoleRepository.update(userRole.id, {
      revokedAt: new Date(),
      revokedBy,
      reason,
      status: 'REVOKED',
    });

    await this.userRoleHistoryRepository.save({
      memberId,
      roleId,
      areaId: userRole.areaId,
      startsAt: userRole.startsAt,
      endsAt: userRole.endsAt,
      status: 'REVOKED',
      action: 'REVOKE',
      changedBy: revokedBy,
      reason,
    });

    await this.auditLogService.log({ userId: memberId, action: 'REVOKE_ROLE', module: 'auth', entityType: 'member', entityId: memberId, description: `Role revoked` });
  }

  async getUserRoleHistory(memberId: number) {
    return this.userRoleHistoryRepository.find({
      where: { memberId },
      order: { createdAt: 'DESC' },
    });
  }
}
