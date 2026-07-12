import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './role.entity';
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';
import { UserRoleHistory } from './user-role-history.entity';
import { User } from '../auth/entities/user.entity';
import { Permission } from '../permissions/permission.entity';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

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
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
}
