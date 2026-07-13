import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ManualVerifyPaymentDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  paymentReference: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
