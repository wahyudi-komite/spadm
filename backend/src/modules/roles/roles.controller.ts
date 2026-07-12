import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
// TODO: Add PermissionsGuard and @Permissions decorator (Task 5)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Daftar semua role' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat role baru' })
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail role' })
  async findOne(@Param('id') id: number) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update role' })
  async update(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus role' })
  async remove(@Param('id') id: number) {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign permissions ke role' })
  async assignPermissions(@Param('id') id: number, @Body() body: { permissionIds: number[] }) {
    return this.rolesService.assignPermissions(id, body.permissionIds);
  }

  @Delete(':id/permissions/:permissionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke permission dari role' })
  async removePermission(@Param('id') id: number, @Param('permissionId') permissionId: number) {
    return this.rolesService.removePermission(id, permissionId);
  }

  // User role assignment endpoints (TODO: Add PermissionsGuard and @Permissions decorator in Task 5)

  @Get('users/:userId/roles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Daftar roles user' })
  async getUserRoles(@Param('userId') userId: number) {
    return this.rolesService.getUserRoles(userId);
  }

  @Post('users/:userId/roles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign role ke user' })
  async assignRole(
    @Param('userId') userId: number,
    @Body() body: { roleId: number; reason?: string },
    @CurrentUser() currentUserId: number,
  ) {
    return this.rolesService.assignRole(userId, body.roleId, currentUserId, undefined, body.reason);
  }

  @Delete('users/:userId/roles/:roleId')
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Histori role user' })
  async getUserRoleHistory(@Param('userId') userId: number) {
    return this.rolesService.getUserRoleHistory(userId);
  }
}
