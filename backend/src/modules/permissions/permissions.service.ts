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
