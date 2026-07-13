import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString } from 'class-validator';
import { IsEnum } from 'class-validator';
import { BatchStatus } from '../entities/batch.entity';

export class CreateBatchDto {
  @IsNumber()
  eventId: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  purchaseStartAt?: string;

  @IsDateString()
  @IsOptional()
  purchaseEndAt?: string;

  @IsDateString()
  @IsOptional()
  distributionStartAt?: string;

  @IsDateString()
  @IsOptional()
  distributionEndAt?: string;

  @IsEnum(BatchStatus)
  @IsOptional()
  status?: BatchStatus;

  @IsBoolean()
  @IsOptional()
  isPurchaseEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  displayNextBatchInformation?: boolean;
}
