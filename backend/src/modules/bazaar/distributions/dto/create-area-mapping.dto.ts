import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength } from 'class-validator';

export class CreateAreaMappingDto {
  @IsString()
  @MaxLength(100)
  plant: string;

  @IsString()
  @MaxLength(100)
  workUnit: string;

  @Type(() => Number)
  @IsInt()
  distributionAreaId: number;
}
