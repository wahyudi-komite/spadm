import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';
import { UserRoleHistory } from './user-role-history.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Permission } from '../permissions/permission.entity';
import { Member } from '../members/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, RolePermission, UserRole, UserRoleHistory, Permission, Member])],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
