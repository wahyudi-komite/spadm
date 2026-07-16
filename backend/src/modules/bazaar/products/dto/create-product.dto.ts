import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
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

  @IsString()
  @MaxLength(500)
  @Matches(/^(?:https?:\/\/[^\s]+|\/storage\/products\/[A-Za-z0-9._-]+)$/, {
    message: 'imageUrl harus berupa URL HTTP(S) atau path gambar produk yang valid',
  })
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
