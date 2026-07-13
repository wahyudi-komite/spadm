import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty()
  @IsInt()
  roleId: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  areaId?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endsAt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;
}
