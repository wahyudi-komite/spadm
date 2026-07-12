import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: '12345', description: 'NPK anggota' })
  @IsString()
  @IsNotEmpty()
  npk: string;
}
