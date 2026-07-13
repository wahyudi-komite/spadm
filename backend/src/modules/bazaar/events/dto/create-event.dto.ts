import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsNumber, IsUrl, Min, MaxLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(30)
  @IsOptional()
  code?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl({ require_protocol: false })
  @IsOptional()
  bannerImageUrl?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  subsidy?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  goodieBagFee?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  applicationFee?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
