import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: '12345', description: 'NPK anggota' })
  @IsString()
  @IsNotEmpty()
  npk: string;

  @ApiProperty({ example: 'SmartCare', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
