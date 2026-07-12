# Phase 3 — RBAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement dynamic Role-Based Access Control with roles, permissions, guard, and admin management pages.

**Architecture:** Flat permission strings (`module.action`) with many-to-many RBAC. Role ↔ Permission via `role_permissions`, User ↔ Role via `user_roles`. PermissionsGuard checks user's effective permissions against required permission decorator.

**Tech Stack:** NestJS 11, TypeORM 0.3, Angular 19, Fuse template

## Global Constraints

- Permission format: `module.action` (e.g., `member.read`, `bazaar.event.create`)
- Users can have multiple roles; effective permissions = union of all role permissions
- `isSystem` roles cannot be deleted
- All endpoints use JwtAuthGuard + PermissionsGuard
- Frontend uses standalone components with lazy `.routes.ts` files
- Navigation defined in `mock-api/common/navigation/data.ts`
- Seed migration for initial roles and permissions

---

### Task 1: Entities — Role, Permission, RolePermission, UserRole, UserRoleHistory

**Files:**
- Create: `backend/src/modules/roles/role.entity.ts`
- Create: `backend/src/modules/roles/role-permission.entity.ts`
- Create: `backend/src/modules/roles/user-role.entity.ts`
- Create: `backend/src/modules/roles/user-role-history.entity.ts`
- Create: `backend/src/modules/permissions/permission.entity.ts`
- Modify: `backend/src/modules/auth/entities/user.entity.ts`

**Interfaces:**
- Consumes: existing User entity
- Produces: Role, Permission, RolePermission, UserRole, UserRoleHistory entities

- [ ] **Step 1: Create Role entity**

```typescript
// backend/src/modules/roles/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from '../permissions/permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ default: false })
  isSystem: boolean;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 2: Create Permission entity**

```typescript
// backend/src/modules/permissions/permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany } from 'typeorm';
import { Role } from '../roles/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ length: 50 })
  group: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;
}
```

- [ ] **Step 3: Create RolePermission entity**

```typescript
// backend/src/modules/roles/role-permission.entity.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from '../permissions/permission.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn()
  roleId: number;

  @PrimaryColumn()
  permissionId: number;

  @ManyToOne(() => Role, (role) => role.permissions)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.roles)
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;
}
```

- [ ] **Step 4: Create UserRole entity**

```typescript
// backend/src/modules/roles/user-role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  roleId: number;

  @Column({ nullable: true })
  areaId: number;

  @Column({ nullable: true })
  assignedBy: number;

  @CreateDateColumn()
  assignedAt: Date;

  @Column({ nullable: true })
  revokedAt: Date;

  @Column({ nullable: true })
  revokedBy: number;

  @Column({ length: 255, nullable: true })
  reason: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;
}
```

- [ ] **Step 5: Create UserRoleHistory entity**

```typescript
// backend/src/modules/roles/user-role-history.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('user_role_histories')
export class UserRoleHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  roleId: number;

  @Column({ nullable: true })
  areaId: number;

  @Column({ type: 'enum', enum: ['ASSIGN', 'REVOKE'] })
  action: 'ASSIGN' | 'REVOKE';

  @Column()
  changedBy: number;

  @Column({ length: 255, nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

- [ ] **Step 6: Update User entity with roles relation**

```typescript
// Add to backend/src/modules/auth/entities/user.entity.ts
import { ManyToMany, JoinTable } from 'typeorm';
import { Role } from '../../roles/role.entity';

// Add inside User class:
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];
```

- [ ] **Step 7: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add backend/src/modules/roles/ backend/src/modules/permissions/ backend/src/modules/auth/entities/user.entity.ts
git commit -m "feat(rbac): add role, permission, user-role entities"
```

---

### Task 2: Permissions Module (Backend CRUD)

**Files:**
- Create: `backend/src/modules/permissions/permission.entity.ts`
- Create: `backend/src/modules/permissions/permissions.service.ts`
- Create: `backend/src/modules/permissions/permissions.controller.ts`
- Create: `backend/src/modules/permissions/permissions.module.ts`
- Create: `backend/src/modules/permissions/dto/create-permission.dto.ts`

**Interfaces:**
- Consumes: Permission entity from Task 1
- Produces: `GET /api/permissions`, `POST /api/permissions` endpoints

- [ ] **Step 1: Create DTO**

```typescript
// backend/src/modules/permissions/dto/create-permission.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'member.read', description: 'Nama permission (format: module.action)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'member', description: 'Group permission' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  group: string;

  @ApiProperty({ example: 'Melihat daftar anggota', required: false })
  @IsString()
  description?: string;
}
```

- [ ] **Step 2: Create PermissionsService**

```typescript
// backend/src/modules/permissions/permissions.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async findAll(group?: string) {
    const where = group ? { group } : {};
    const permissions = await this.permissionRepository.find({ where, order: { group: 'ASC', name: 'ASC' } });

    const grouped = permissions.reduce((acc, p) => {
      if (!acc[p.group]) acc[p.group] = [];
      acc[p.group].push(p);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return { data: permissions, grouped };
  }

  async create(dto: CreatePermissionDto) {
    const existing = await this.permissionRepository.findOne({ where: { name: dto.name } });
    if (existing) throw new BadRequestException('Permission already exists');
    return this.permissionRepository.save(this.permissionRepository.create(dto));
  }
}
```

- [ ] **Step 3: Create PermissionsController**

```typescript
// backend/src/modules/permissions/permissions.controller.ts
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('role.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Daftar semua permission' })
  async findAll(@Query('group') group?: string) {
    return this.permissionsService.findAll(group);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('role.create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat permission baru' })
  async create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }
}
```

- [ ] **Step 4: Create PermissionsModule**

```typescript
// backend/src/modules/permissions/permissions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './permission.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionsService],
  controllers: [PermissionsController],
  exports: [PermissionsService],
})
export class PermissionsModule {}
```

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/permissions/
git commit -m "feat(rbac): add permissions module with CRUD"
```

---

### Task 3: Roles Module (Backend CRUD + Role-Permission Assignment)

**Files:**
- Create: `backend/src/modules/roles/roles.service.ts`
- Create: `backend/src/modules/roles/roles.controller.ts`
- Create: `backend/src/modules/roles/roles.module.ts`
- Create: `backend/src/modules/roles/dto/create-role.dto.ts`
- Create: `backend/src/modules/roles/dto/update-role.dto.ts`

**Interfaces:**
- Consumes: Role, RolePermission entities from Task 1; PermissionsService from Task 2
- Produces: Role CRUD endpoints, role-permission assignment endpoints

- [ ] **Step 1: Create DTOs**

```typescript
// backend/src/modules/roles/dto/create-role.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'BAZAAR_ADMIN', description: 'Nama role' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'Admin bazar', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
```

```typescript
// backend/src/modules/roles/dto/update-role.dto.ts
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
```

- [ ] **Step 2: Create RolesService**

```typescript
// backend/src/modules/roles/roles.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';
import { UserRoleHistory } from './user-role-history.entity';
import { User } from '../auth/entities/user.entity';
import { Permission } from '../permissions/permission.entity';
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
    const permissions = await this.permissionRepository.findByIds(permissionIds);
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
```

- [ ] **Step 3: Create RolesController**

```typescript
// backend/src/modules/roles/roles.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @Permissions('role.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Daftar semua role' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @Permissions('role.create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat role baru' })
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get(':id')
  @Permissions('role.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail role' })
  async findOne(@Param('id') id: number) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('role.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update role' })
  async update(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('role.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus role' })
  async remove(@Param('id') id: number) {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissions')
  @Permissions('role.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign permissions ke role' })
  async assignPermissions(@Param('id') id: number, @Body() body: { permissionIds: number[] }) {
    return this.rolesService.assignPermissions(id, body.permissionIds);
  }

  @Delete(':id/permissions/:permissionId')
  @Permissions('role.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke permission dari role' })
  async removePermission(@Param('id') id: number, @Param('permissionId') permissionId: number) {
    return this.rolesService.removePermission(id, permissionId);
  }
}
```

- [ ] **Step 4: Create RolesModule**

```typescript
// backend/src/modules/roles/roles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';
import { UserRoleHistory } from './user-role-history.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Permission } from '../permissions/permission.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, RolePermission, UserRole, UserRoleHistory, Permission, User])],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
```

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/roles/ backend/src/modules/permissions/
git commit -m "feat(rbac): add roles module with CRUD and permission assignment"
```

---

### Task 4: User Roles Assignment (Backend)

**Files:**
- Create: `backend/src/modules/roles/user-role.entity.ts`
- Create: `backend/src/modules/roles/user-role-history.entity.ts`
- Modify: `backend/src/modules/roles/roles.service.ts` — add user role methods
- Modify: `backend/src/modules/roles/roles.controller.ts` — add user role endpoints

**Interfaces:**
- Consumes: UserRole, UserRoleHistory entities from Task 1; RolesService from Task 3
- Produces: User role assignment/revocation endpoints

- [ ] **Step 1: Add user role methods to RolesService**

```typescript
// Add to backend/src/modules/roles/roles.service.ts

  async getUserRoles(userId: number) {
    const userRoles = await this.userRoleRepository.find({
      where: { userId, revokedAt: IsNull() },
      relations: { role: { permissions: true } },
      order: { assignedAt: 'DESC' },
    });
    return userRoles;
  }

  async assignRole(userId: number, roleId: number, assignedBy: number, areaId?: number, reason?: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role tidak ditemukan');

    const existing = await this.userRoleRepository.findOne({
      where: { userId, roleId, revokedAt: IsNull() },
    });
    if (existing) throw new BadRequestException('User sudah memiliki role ini');

    const userRole = await this.userRoleRepository.save({
      userId, roleId, assignedBy, areaId: null,
    });

    await this.userRoleHistoryRepository.save({
      userId, roleId, action: 'ASSIGN', changedBy: assignedBy,
    });

    await this.auditLogService.log({ userId, action: 'ASSIGN_ROLE', module: 'auth', entityType: 'user', entityId: userId, description: `Role ${role.name} assigned` });

    return this.userRoleRepository.findOne({ where: { id: userRole.id }, relations: { role: true } });
  }

  async revokeRole(userId: number, roleId: number, revokedBy: number, reason?: string) {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId, revokedAt: IsNull() },
    });
    if (!userRole) throw new NotFoundException('Role assignment tidak ditemukan');

    await this.userRoleRepository.update(userRole.id, { revokedAt: new Date(), revokedBy, reason });

    await this.userRoleHistoryRepository.save({
      userId, roleId, action: 'REVOKE', changedBy: revokedBy, reason,
    });

    await this.auditLogService.log({ userId, action: 'REVOKE_ROLE', module: 'auth', entityType: 'user', entityId: userId, description: `Role revoked` });
  }

  async getUserRoleHistory(userId: number) {
    return this.userRoleHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
```

- [ ] **Step 2: Add user role endpoints to RolesController**

```typescript
// Add to backend/src/modules/roles/roles.controller.ts

  @Get('users/:userId/roles')
  @Permissions('role.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Daftar roles user' })
  async getUserRoles(@Param('userId') userId: number) {
    return this.rolesService.getUserRoles(userId);
  }

  @Post('users/:userId/roles')
  @Permissions('role.assign')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign role ke user' })
  async assignRole(
    @Param('userId') userId: number,
    @Body() body: { roleId: number; reason?: string },
    @CurrentUser() currentUserId: number,
  ) {
    return this.rolesService.assignRole(userId, body.roleId, currentUserId, null, body.reason);
  }

  @Delete('users/:userId/roles/:roleId')
  @Permissions('role.assign')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke role dari user' })
  async revokeRole(
    @Param('userId') userId: number,
    @Param('roleId') roleId: number,
    @Body() body: { reason?: string },
    @CurrentUser() currentUserId: number,
  ) {
    return this.rolesService.revokeRole(userId, roleId, currentUserId, body.reason);
  }

  @Get('users/:userId/roles/history')
  @Permissions('role.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Histori role user' })
  async getUserRoleHistory(@Param('userId') userId: number) {
    return this.rolesService.getUserRoleHistory(userId);
  }
```

- [ ] **Step 3: Add me/permissions endpoint to AuthController**

```typescript
// Add to backend/src/modules/auth/auth.controller.ts

  @Get('me/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permission user saat ini' })
  async myPermissions(@CurrentUser() userId: number) {
    return this.authService.getUserPermissions(userId);
  }
```

- [ ] **Step 4: Add getUserPermissions to AuthService**

```typescript
// Add to backend/src/modules/auth/auth.service.ts

  async getUserPermissions(userId: number) {
    const userRoles = await this.userRoleRepository.find({
      where: { userId, revokedAt: IsNull() },
      relations: { role: { permissions: true } },
    });

    const permissions = new Set<string>();
    for (const ur of userRoles) {
      for (const p of ur.role.permissions) {
        permissions.add(p.name);
      }
    }

    return { userId, permissions: Array.from(permissions) };
  }
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/roles/ backend/src/modules/auth/auth.service.ts backend/src/modules/auth/auth.controller.ts
git commit -m "feat(rbac): add user role assignment and me/permissions endpoint"
```

---

### Task 5: Permission Guard & Decorator

**Files:**
- Create: `backend/src/common/guards/permissions.guard.ts`
- Create: `backend/src/common/guards/area-access.guard.ts`
- Create: `backend/src/common/decorators/permissions.decorator.ts`
- Modify: `backend/src/common/guards/index.ts`
- Modify: `backend/src/common/decorators/index.ts`

**Interfaces:**
- Consumes: JwtAuthGuard, UserRole entity
- Produces: `@Permissions('module.action')` decorator, PermissionsGuard, AreaAccessGuard

- [ ] **Step 1: Create Permissions decorator**

```typescript
// backend/src/common/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
```

- [ ] **Step 2: Create PermissionsGuard**

```typescript
// backend/src/common/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '../../modules/roles/user-role.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
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

    const userRoles = await this.userRoleRepository.find({
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
```

- [ ] **Step 3: Create AreaAccessGuard (placeholder for Phase 8)**

```typescript
// backend/src/common/guards/area-access.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AreaAccessGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Placeholder — will be implemented in Phase 8 (Distribusi)
    return true;
  }
}
```

- [ ] **Step 4: Update guards/index.ts**

```typescript
// backend/src/common/guards/index.ts
export { JwtAuthGuard } from './jwt-auth.guard';
export { PermissionsGuard } from './permissions.guard';
export { AreaAccessGuard } from './area-access.guard';
```

- [ ] **Step 5: Update decorators/index.ts**

```typescript
// backend/src/common/decorators/index.ts
export { CurrentUser } from './current-user.decorator';
export { Permissions } from './permissions.decorator';
```

- [ ] **Step 6: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add backend/src/common/guards/ backend/src/common/decorators/
git commit -m "feat(rbac): add permissions guard and decorator"
```

---

### Task 6: Seed Migration

**Files:**
- Create: `backend/src/database/migrations/1712345678-seed-roles-permissions.ts`

**Interfaces:**
- Consumes: Role, Permission, UserRole entities
- Produces: Initial data in database

- [ ] **Step 1: Create seed migration**

```typescript
// backend/src/database/migrations/1712345678-seed-roles-permissions.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRolesPermissions1712345678 implements MigrationInterface {
  name = 'SeedRolesPermissions1712345678';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Create permissions
    const permissions = [
      { name: 'member.read', group: 'member', description: 'Melihat daftar anggota' },
      { name: 'member.create', group: 'member', description: 'Menambah anggota' },
      { name: 'member.update', group: 'member', description: 'Mengubah anggota' },
      { name: 'member.import', group: 'member', description: 'Import anggota Excel' },
      { name: 'member.reset_password', group: 'member', description: 'Reset password anggota' },
      { name: 'member.assign_role', group: 'member', description: 'Assign role ke anggota' },
      { name: 'role.read', group: 'role', description: 'Melihat daftar role' },
      { name: 'role.create', group: 'role', description: 'Membuat role' },
      { name: 'role.update', group: 'role', description: 'Mengubah role' },
      { name: 'role.assign', group: 'role', description: 'Assign role ke user' },
      { name: 'bazaar.event.read', group: 'bazaar.event', description: 'Melihat event' },
      { name: 'bazaar.event.create', group: 'bazaar.event', description: 'Membuat event' },
      { name: 'bazaar.event.update', group: 'bazaar.event', description: 'Mengubah event' },
      { name: 'bazaar.batch.read', group: 'bazaar.batch', description: 'Melihat batch' },
      { name: 'bazaar.batch.create', group: 'bazaar.batch', description: 'Membuat batch' },
      { name: 'bazaar.batch.open', group: 'bazaar.batch', description: 'Membuka batch' },
      { name: 'bazaar.batch.close', group: 'bazaar.batch', description: 'Menutup batch' },
      { name: 'bazaar.batch.distribute', group: 'bazaar.batch', description: 'Distribusi batch' },
      { name: 'bazaar.product.read', group: 'bazaar.product', description: 'Melihat produk' },
      { name: 'bazaar.product.create', group: 'bazaar.product', description: 'Membuat produk' },
      { name: 'bazaar.product.update', group: 'bazaar.product', description: 'Mengubah produk' },
      { name: 'bazaar.product.delete', group: 'bazaar.product', description: 'Menghapus produk' },
      { name: 'bazaar.order.read', group: 'bazaar.order', description: 'Melihat order' },
      { name: 'bazaar.order.create', group: 'bazaar.order', description: 'Membuat order' },
      { name: 'bazaar.order.cancel', group: 'bazaar.order', description: 'Membatalkan order' },
      { name: 'bazaar.payment.read', group: 'bazaar.payment', description: 'Melihat payment' },
      { name: 'bazaar.payment.manual_verify', group: 'bazaar.payment', description: 'Verifikasi manual payment' },
      { name: 'bazaar.distribution.read', group: 'bazaar.distribution', description: 'Melihat distribusi' },
      { name: 'bazaar.distribution.scan', group: 'bazaar.distribution', description: 'Scan distribusi' },
      { name: 'bazaar.distribution.confirm', group: 'bazaar.distribution', description: 'Konfirmasi distribusi' },
      { name: 'bazaar.report.read', group: 'bazaar.report', description: 'Melihat laporan' },
      { name: 'bazaar.report.export', group: 'bazaar.report', description: 'Export laporan' },
      { name: 'finance.dashboard.read', group: 'finance.dashboard', description: 'Melihat dashboard finance' },
      { name: 'audit.read', group: 'audit', description: 'Melihat audit log' },
      { name: 'settings.manage', group: 'settings', description: 'Mengelola pengaturan' },
    ];

    for (const p of permissions) {
      await queryRunner.query(
        `INSERT INTO permissions (name, \`group\`, description) VALUES (?, ?, ?)`,
        [p.name, p.group, p.description],
      );
    }

    // Create roles
    const roles = ['SUPER_ADMIN', 'BAZAAR_ADMIN', 'FINANCE_ADMIN', 'AREA_PIC', 'LEADERSHIP', 'MEMBER'];
    for (const name of roles) {
      await queryRunner.query(
        `INSERT INTO roles (name, description, isSystem) VALUES (?, ?, ?)`,
        [name, `Role ${name}`, name !== 'MEMBER'],
      );
    }

    // Assign all permissions to SUPER_ADMIN (roleId = 1)
    const allPerms = await queryRunner.query(`SELECT id FROM permissions`);
    for (const p of allPerms) {
      await queryRunner.query(`INSERT INTO role_permissions (roleId, permissionId) VALUES (1, ?)`, [p.id]);
    }

    // Assign BAZAAR_ADMIN (roleId = 2) permissions
    const bazaarPerms = await queryRunner.query(
      `SELECT id FROM permissions WHERE name LIKE 'bazaar.%' OR name = 'member.read'`
    );
    for (const p of bazaarPerms) {
      await queryRunner.query(`INSERT INTO role_permissions (roleId, permissionId) VALUES (2, ?)`, [p.id]);
    }

    // Assign FINANCE_ADMIN (roleId = 3) permissions
    const financePerms = await queryRunner.query(
      `SELECT id FROM permissions WHERE name LIKE 'finance.%' OR name LIKE 'bazaar.payment.%' OR name LIKE 'bazaar.report.%'`
    );
    for (const p of financePerms) {
      await queryRunner.query(`INSERT INTO role_permissions (roleId, permissionId) VALUES (3, ?)`, [p.id]);
    }

    // Assign AREA_PIC (roleId = 4) permissions
    const areaPerms = await queryRunner.query(
      `SELECT id FROM permissions WHERE name IN ('bazaar.distribution.scan', 'bazaar.distribution.confirm')`
    );
    for (const p of areaPerms) {
      await queryRunner.query(`INSERT INTO role_permissions (roleId, permissionId) VALUES (4, ?)`, [p.id]);
    }

    // Assign LEADERSHIP (roleId = 5) permissions
    const leadershipPerms = await queryRunner.query(
      `SELECT id FROM permissions WHERE name IN ('bazaar.report.read', 'finance.dashboard.read')`
    );
    for (const p of leadershipPerms) {
      await queryRunner.query(`INSERT INTO role_permissions (roleId, permissionId) VALUES (5, ?)`, [p.id]);
    }

    // Assign MEMBER (roleId = 6) permissions
    const memberPerms = await queryRunner.query(
      `SELECT id FROM permissions WHERE name IN ('bazaar.order.create', 'bazaar.order.read')`
    );
    for (const p of memberPerms) {
      await queryRunner.query(`INSERT INTO role_permissions (roleId, permissionId) VALUES (6, ?)`, [p.id]);
    }

    // Assign SUPER_ADMIN role to NPK 23893 and 15012
    const superAdminRoleId = 1;
    const users = await queryRunner.query(
      `SELECT id FROM users WHERE npk IN ('23893', '15012')`
    );
    for (const user of users) {
      await queryRunner.query(
        `INSERT INTO user_roles (userId, roleId, assignedBy, assignedAt) VALUES (?, ?, 1, NOW())`,
        [user.id, superAdminRoleId],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM user_role_histories`);
    await queryRunner.query(`DELETE FROM user_roles`);
    await queryRunner.query(`DELETE FROM role_permissions`);
    await queryRunner.query(`DELETE FROM permissions`);
    await queryRunner.query(`DELETE FROM roles`);
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add backend/src/database/
git commit -m "feat(rbac): add seed migration for initial roles and permissions"
```

---

### Task 7: Register Modules in AppModule

**Files:**
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Register RolesModule and PermissionsModule**

```typescript
// Add to backend/src/app.module.ts imports
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';

// Add to imports array:
    RolesModule,
    PermissionsModule,
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add backend/src/app.module.ts
git commit -m "feat(rbac): register roles and permissions modules"
```

---

### Task 8: Frontend — Admin Role List Page

**Files:**
- Create: `frontend/starter/src/app/modules/admin/roles/roles.component.ts`
- Create: `frontend/starter/src/app/modules/admin/roles/roles.component.html`
- Create: `frontend/starter/src/app/modules/admin/roles/roles.routes.ts`
- Create: `frontend/starter/src/app/modules/admin/admin.routes.ts`
- Modify: `frontend/starter/src/app/app.routes.ts`
- Modify: `frontend/starter/src/app/mock-api/common/navigation/data.ts`

- [ ] **Step 1: Create admin routes**

```typescript
// frontend/starter/src/app/modules/admin/admin.routes.ts
import { Routes } from '@angular/router';

export default [
  {
    path: 'roles',
    loadChildren: () => import('./roles/roles.routes'),
  },
] as Routes;
```

- [ ] **Step 2: Create role list component**

```typescript
// frontend/starter/src/app/modules/admin/roles/roles.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { environment } from 'app/environments/environment';

@Component({
  selector: 'admin-roles',
  templateUrl: './roles.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, RouterLink],
})
export class AdminRolesComponent implements OnInit {
  roles: any[] = [];
  displayedColumns = ['name', 'description', 'permissionsCount', 'isSystem', 'actions'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.http.get(`${environment.apiUrl}/roles`).subscribe((res: any) => {
      this.roles = res;
    });
  }

  deleteRole(id: number) {
    if (confirm('Hapus role ini?')) {
      this.http.delete(`${environment.apiUrl}/roles/${id}`).subscribe(() => this.loadRoles());
    }
  }
}
```

- [ ] **Step 2: Create role list template**

```html
<!-- frontend/starter/src/app/modules/admin/roles/roles.component.html -->
<div class="p-8">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Role Management</h1>
    <button mat-flat-button color="primary" [routerLink]="['/admin/roles/new']">
      <mat-icon>add</mat-icon> Tambah Role
    </button>
  </div>

  <div class="overflow-x-auto bg-card rounded-2xl shadow">
    <table mat-table [dataSource]="roles" class="w-full">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Nama</th>
        <td mat-cell *matCellDef="let role">
          <a [routerLink]="['/admin/roles', role.id]" class="text-primary-500 hover:underline font-medium">
            {{ role.name }}
          </a>
        </td>
      </ng-container>

      <ng-container matColumnDef="description">
        <th mat-header-cell *matHeaderCellDef>Deskripsi</th>
        <td mat-cell *matCellDef="let role">{{ role.description }}</td>
      </ng-container>

      <ng-container matColumnDef="permissionsCount">
        <th mat-header-cell *matHeaderCellDef>Permission</th>
        <td mat-cell *matCellDef="let role">{{ role.permissions?.length || 0 }}</td>
      </ng-container>

      <ng-container matColumnDef="isSystem">
        <th mat-header-cell *matHeaderCellDef>Sistem</th>
        <td mat-cell *matCellDef="let role">{{ role.isSystem ? 'Ya' : 'Tidak' }}</td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let role">
          <button mat-icon-button [routerLink]="['/admin/roles', role.id]" matTooltip="Edit">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button (click)="deleteRole(role.id)" [disabled]="role.isSystem" matTooltip="Hapus">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  </div>
</div>
```

- [ ] **Step 3: Create role routes**

```typescript
// frontend/starter/src/app/modules/admin/roles/roles.routes.ts
import { Routes } from '@angular/router';
import { AdminRolesComponent } from './roles.component';

export default [
  { path: '', component: AdminRolesComponent },
] as Routes;
```

- [ ] **Step 4: Update app.routes.ts to add admin route**

```typescript
// Add to the main app routes (modern layout) children array in app.routes.ts
{ path: 'admin', loadChildren: () => import('app/modules/admin/admin.routes') },
```

- [ ] **Step 5: Update navigation data**

```typescript
// Add to frontend/starter/src/app/mock-api/common/navigation/data.ts
{
    id: 'admin',
    title: 'Admin',
    type: 'basic',
    icon: 'heroicons_outline:shield-check',
    link: '/admin/roles',
},
```

- [ ] **Step 6: Verify frontend build**

Run: `npx tsc --noEmit 2>&1 | grep -v "primeng/sidebar"`
Expected: No errors (except pre-existing primeng/sidebar)

- [ ] **Step 7: Commit**

```bash
git add frontend/starter/src/app/modules/admin/ frontend/starter/src/app/app.routes.ts frontend/starter/src/app/mock-api/common/navigation/data.ts
git commit -m "feat(rbac): add admin role list page"
```

---

### Task 9: Frontend — Role Detail Page (Permission Toggle)

**Files:**
- Create: `frontend/starter/src/app/modules/admin/roles/role-detail.component.ts`
- Create: `frontend/starter/src/app/modules/admin/roles/role-detail.component.html`
- Modify: `frontend/starter/src/app/modules/admin/roles/roles.routes.ts`

- [ ] **Step 1: Create role detail component**

```typescript
// frontend/starter/src/app/modules/admin/roles/role-detail.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'app/environments/environment';

@Component({
  selector: 'admin-role-detail',
  templateUrl: './role-detail.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
})
export class AdminRoleDetailComponent implements OnInit {
  role: any = { name: '', description: '', permissions: [] };
  allPermissions: any = {};
  isNew = false;

  Object = Object;

  constructor(private http: HttpClient, private route: ActivatedRoute, public router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNew = true;
    } else {
      this.http.get(`${environment.apiUrl}/roles/${id}`).subscribe((res: any) => {
        this.role = res;
      });
    }
    this.http.get(`${environment.apiUrl}/permissions`).subscribe((res: any) => {
      this.allPermissions = res.grouped;
    });
  }

  hasPermission(permissionId: number): boolean {
    return this.role.permissions?.some((p: any) => p.id === permissionId);
  }

  togglePermission(permissionId: number) {
    if (this.hasPermission(permissionId)) {
      this.http.delete(`${environment.apiUrl}/roles/${this.role.id}/permissions/${permissionId}`)
        .subscribe(() => this.loadRole());
    } else {
      this.http.post(`${environment.apiUrl}/roles/${this.role.id}/permissions`, { permissionIds: [permissionId] })
        .subscribe(() => this.loadRole());
    }
  }

  save() {
    if (this.isNew) {
      this.http.post(`${environment.apiUrl}/roles`, this.role).subscribe(() => {
        this.router.navigate(['/admin/roles']);
      });
    } else {
      this.http.patch(`${environment.apiUrl}/roles/${this.role.id}`, this.role).subscribe(() => {
        this.router.navigate(['/admin/roles']);
      });
    }
  }

  private loadRole() {
    this.http.get(`${environment.apiUrl}/roles/${this.role.id}`).subscribe((res: any) => {
      this.role = res;
    });
  }
}
```

- [ ] **Step 3: Update roles routes**

```typescript
// frontend/starter/src/app/modules/admin/roles/roles.routes.ts
import { Routes } from '@angular/router';
import { AdminRolesComponent } from './roles.component';
import { AdminRoleDetailComponent } from './role-detail.component';

export default [
  { path: '', component: AdminRolesComponent },
  { path: ':id', component: AdminRoleDetailComponent },
] as Routes;
```

- [ ] **Step 4: Verify frontend build**

Run: `npx tsc --noEmit 2>&1 | grep -v "primeng/sidebar"`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add frontend/starter/src/app/modules/admin/roles/role-detail.component.ts frontend/starter/src/app/modules/admin/roles/role-detail.component.html frontend/starter/src/app/modules/admin/roles/roles.routes.ts
git commit -m "feat(rbac): add role detail page with permission toggle"
```

---

### Task 10: Frontend — User Role Assignment Page

**Files:**
- Create: `frontend/starter/src/app/modules/admin/users/user-roles.component.ts`
- Create: `frontend/starter/src/app/modules/admin/users/user-roles.component.html`
- Create: `frontend/starter/src/app/modules/admin/users/user-roles.routes.ts`
- Modify: `frontend/starter/src/app/modules/admin/admin.routes.ts`

- [ ] **Step 1: Create user roles component**

```typescript
// frontend/starter/src/app/modules/admin/users/user-roles.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'app/environments/environment';

@Component({
  selector: 'admin-user-roles',
  templateUrl: './user-roles.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatTableModule],
})
export class AdminUserRolesComponent implements OnInit {
  userId: number;
  userRoles: any[] = [];
  allRoles: any[] = [];
  selectedRoleId: number;
  history: any[] = [];
  displayedColumns = ['role', 'assignedAt', 'revokedAt', 'actions'];

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRoles();
    this.loadUserRoles();
  }

  loadRoles() {
    this.http.get(`${environment.apiUrl}/roles`).subscribe((res: any) => {
      this.allRoles = res;
    });
  }

  loadUserRoles() {
    this.http.get(`${environment.apiUrl}/roles/users/${this.userId}/roles`).subscribe((res: any) => {
      this.userRoles = res;
    });
    this.http.get(`${environment.apiUrl}/roles/users/${this.userId}/roles/history`).subscribe((res: any) => {
      this.history = res;
    });
  }

  assignRole() {
    if (!this.selectedRoleId) return;
    this.http.post(`${environment.apiUrl}/roles/users/${this.userId}/roles`, { roleId: this.selectedRoleId })
      .subscribe(() => {
        this.selectedRoleId = null;
        this.loadUserRoles();
      });
  }

  revokeRole(roleId: number) {
    if (confirm('Revoke role ini?')) {
      this.http.delete(`${environment.apiUrl}/roles/users/${this.userId}/roles/${roleId}`)
        .subscribe(() => this.loadUserRoles());
    }
  }
}
```

- [ ] **Step 2: Create user roles template**

```html
<!-- frontend/starter/src/app/modules/admin/users/user-roles.component.html -->
<div class="p-8 max-w-4xl">
  <h1 class="text-2xl font-bold mb-6">User Roles — #{{ userId }}</h1>

  <div class="bg-card rounded-2xl shadow p-6 mb-6">
    <h2 class="text-lg font-bold mb-4">Assign Role</h2>
    <div class="flex gap-4 items-end">
      <mat-form-field class="w-64">
        <mat-label>Pilih Role</mat-label>
        <mat-select [(ngModel)]="selectedRoleId">
          <mat-option *ngFor="let role of allRoles" [value]="role.id">{{ role.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <button mat-flat-button color="primary" (click)="assignRole()" [disabled]="!selectedRoleId">Assign</button>
    </div>
  </div>

  <div class="bg-card rounded-2xl shadow p-6">
    <h2 class="text-lg font-bold mb-4">Current Roles</h2>
    <table mat-table [dataSource]="userRoles" class="w-full">
      <ng-container matColumnDef="role">
        <th mat-header-cell *matHeaderCellDef>Role</th>
        <td mat-cell *matCellDef="let ur">{{ ur.role?.name }}</td>
      </ng-container>
      <ng-container matColumnDef="assignedAt">
        <th mat-header-cell *matHeaderCellDef>Assigned</th>
        <td mat-cell *matCellDef="let ur">{{ ur.assignedAt | date:'short' }}</td>
      </ng-container>
      <ng-container matColumnDef="revokedAt">
        <th mat-header-cell *matHeaderCellDef>Revoked</th>
        <td mat-cell *matCellDef="let ur">{{ ur.revokedAt ? (ur.revokedAt | date:'short') : '-' }}</td>
      </ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let ur">
          <button mat-icon-button (click)="revokeRole(ur.roleId)" *ngIf="!ur.revokedAt" matTooltip="Revoke">
            <mat-icon>remove_circle</mat-icon>
          </button>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="['role', 'assignedAt', 'revokedAt', 'actions']"></tr>
      <tr mat-row *matRowDef="let row; columns: ['role', 'assignedAt', 'revokedAt', 'actions'];"></tr>
    </table>
  </div>
</div>
```

- [ ] **Step 3: Create user roles routes**

```typescript
// frontend/starter/src/app/modules/admin/users/user-roles.routes.ts
import { Routes } from '@angular/router';
import { AdminUserRolesComponent } from './user-roles.component';

export default [
  { path: '', component: AdminUserRolesComponent },
] as Routes;
```

- [ ] **Step 4: Update admin routes**

```typescript
// frontend/starter/src/app/modules/admin/admin.routes.ts
import { Routes } from '@angular/router';

export default [
  {
    path: 'roles',
    loadChildren: () => import('./roles/roles.routes'),
  },
  {
    path: 'users/:id/roles',
    loadChildren: () => import('./users/user-roles.routes'),
  },
] as Routes;
```

- [ ] **Step 5: Verify frontend build**

Run: `npx tsc --noEmit 2>&1 | grep -v "primeng/sidebar"`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add frontend/starter/src/app/modules/admin/users/
git commit -m "feat(rbac): add user role assignment page"
```

---

### Task 11: Final Verification

**Files:**
- No file changes

- [ ] **Step 1: Verify backend build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Verify frontend build**

Run: `npx tsc --noEmit 2>&1 | grep -v "primeng/sidebar"`
Expected: No errors

- [ ] **Step 3: Final commit**

```bash
git add -A && git status
git commit -m "feat(rbac): complete Phase 3 role and permission system"
git push origin master
```
