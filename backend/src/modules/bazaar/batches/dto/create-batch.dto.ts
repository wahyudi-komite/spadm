import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString } from 'class-validator';

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

  @IsString()
  @IsOptional()
  status?: string;
}
