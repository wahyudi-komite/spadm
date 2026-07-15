import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ConfirmDistributionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  tokenCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
