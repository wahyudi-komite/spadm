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
