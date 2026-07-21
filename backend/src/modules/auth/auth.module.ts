import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { Session } from './entities/session.entity';
import { LoginHistory } from './entities/login-history.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { Member } from '../members/entities/member.entity';
import { UserRole } from '../roles/user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, LoginHistory, PasswordResetToken, Member, UserRole]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.accessSecret'),
        signOptions: { expiresIn: configService.get('jwt.accessExpiresIn') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
