import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token reset password' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Password baru' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
