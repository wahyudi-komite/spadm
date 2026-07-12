import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards';
import { Permissions } from '../../common/decorators';

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
