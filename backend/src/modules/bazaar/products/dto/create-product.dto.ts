import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export enum InventoryMode {
  UNLIMITED = 'UNLIMITED',
  GLOBAL_STOCK = 'GLOBAL_STOCK',
  AREA_STOCK = 'AREA_STOCK',
}

export class CreateProductDto {
  @Type(() => Number)
  @IsInt()
  eventId: number;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  normalPrice: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  sellingPrice: number;

  @IsUrl({ require_protocol: false })
  @IsOptional()
  imageUrl?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  maximumQuantityPerMember?: number;

  @IsEnum(InventoryMode)
  @IsOptional()
  inventoryMode?: InventoryMode;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;
}
