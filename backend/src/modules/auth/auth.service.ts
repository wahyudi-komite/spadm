import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { LoginHistory } from './entities/login-history.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { Member } from '../members/entities/member.entity';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(dto: SignInDto, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepository.findOne({
      where: { npk: dto.npk },
      relations: { member: true },
    });

    if (!user) {
      throw new UnauthorizedException({ message: 'NPK atau password salah', code: 'INVALID_CREDENTIALS' });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({ message: 'Akun tidak aktif', code: 'ACCOUNT_INACTIVE' });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      await this.saveLoginHistory(user.id, ipAddress, userAgent, false, 'Password salah');
      throw new UnauthorizedException({ message: 'NPK atau password salah', code: 'INVALID_CREDENTIALS' });
    }

    const tokens = await this.generateTokens(user);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.sessionRepository.save({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      ipAddress,
      userAgent,
      expiresAt,
    });

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });
    await this.saveLoginHistory(user.id, ipAddress, userAgent, true);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      mustChangePassword: user.mustChangePassword,
      user: this.sanitizeUser(user),
    };
  }

  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const session = await this.sessionRepository.findOne({
      where: { refreshToken, isActive: true },
      relations: { user: { member: true } },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException({ message: 'Session expired', code: 'SESSION_EXPIRED' });
    }

    if (!session.user.isActive) {
      throw new UnauthorizedException({ message: 'Akun tidak aktif', code: 'ACCOUNT_INACTIVE' });
    }

    const tokens = await this.generateTokens(session.user);

    await this.sessionRepository.update(session.id, {
      refreshToken: tokens.refreshToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(session.user),
    };
  }

  async signOut(userId: number, refreshToken: string) {
    await this.sessionRepository.update({ refreshToken, userId }, { isActive: false });
  }

  async signOutFromAllDevices(userId: number) {
    await this.sessionRepository.update({ userId, isActive: true }, { isActive: false });
  }

  async signOutFromSession(userId: number, sessionId: number) {
    await this.sessionRepository.update({ id: sessionId, userId }, { isActive: false });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException({ message: 'Password saat ini salah', code: 'INVALID_CURRENT_PASSWORD' });
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepository.update(userId, {
      password: hashedPassword,
      mustChangePassword: false,
    });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ where: { npk: dto.npk } });
    if (!user) {
      return { message: 'Jika NPK terdaftar, link reset password akan dikirim' };
    }

    const token = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.passwordResetTokenRepository.save({
      userId: user.id,
      token,
      expiresAt,
    });

    return { message: 'Jika NPK terdaftar, link reset password akan dikirim' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token: dto.token, isUsed: false },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException({ message: 'Token tidak valid atau sudah kedaluwarsa', code: 'INVALID_TOKEN' });
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepository.update(resetToken.userId, {
      password: hashedPassword,
      mustChangePassword: false,
    });

    await this.passwordResetTokenRepository.update(resetToken.id, { isUsed: true });
    await this.sessionRepository.update({ userId: resetToken.userId }, { isActive: false });
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { member: true },
    });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    return this.sanitizeUser(user);
  }

  async getSessions(userId: number) {
    return this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, npk: user.npk };

    const accessToken = this.jwtService.sign(payload as object, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload as object, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { password, ...rest } = user;
    return rest;
  }

  private async saveLoginHistory(userId: number, ipAddress?: string, userAgent?: string, isSuccess = false, failureReason?: string) {
    const entry = this.loginHistoryRepository.create({
      userId,
      ipAddress,
      userAgent,
      isSuccess,
      failureReason,
    });
    await this.loginHistoryRepository.save(entry);
  }
}
