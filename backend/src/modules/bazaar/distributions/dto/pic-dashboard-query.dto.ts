import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PicDashboardQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  areaId?: number;
}
