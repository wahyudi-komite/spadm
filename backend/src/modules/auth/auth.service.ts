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
import { UserRole } from '../roles/user-role.entity';
import { AuditLogService } from '../audit-logs/audit-log.service';
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
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditLogService: AuditLogService,
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

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException({ message: 'Akun terkunci. Coba lagi nanti.', code: 'ACCOUNT_LOCKED' });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      if (attempts >= 5) {
        await this.userRepository.update(user.id, {
          failedLoginAttempts: attempts,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
        });
        await this.auditLogService.log({ userId: user.id, action: 'ACCOUNT_LOCKED', module: 'auth', description: 'Akun terkunci setelah 5x gagal login', ipAddress, userAgent });
      } else {
        await this.userRepository.update(user.id, { failedLoginAttempts: attempts });
      }
      await this.saveLoginHistory(user.id, ipAddress, userAgent, false, 'Password salah');
      throw new UnauthorizedException({ message: 'NPK atau password salah', code: 'INVALID_CREDENTIALS' });
    }

    await this.userRepository.update(user.id, { failedLoginAttempts: 0 });

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
    await this.auditLogService.log({ userId: user.id, action: 'LOGIN_SUCCESS', module: 'auth', description: `Login NPK ${user.npk}`, ipAddress, userAgent });

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

    if (!session) {
      const oldSession = await this.sessionRepository.findOne({
        where: { isActive: true },
        relations: { user: true },
        order: { createdAt: 'DESC' },
      });
      if (oldSession) {
        await this.sessionRepository.update({ userId: oldSession.userId }, { isActive: false });
      }
      throw new UnauthorizedException({ message: 'Token tidak valid', code: 'INVALID_TOKEN' });
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.update(session.id, { isActive: false });
      throw new UnauthorizedException({ message: 'Session expired', code: 'SESSION_EXPIRED' });
    }

    if (!session.user.isActive) {
      throw new UnauthorizedException({ message: 'Akun tidak aktif', code: 'ACCOUNT_INACTIVE' });
    }

    if (session.refreshToken !== refreshToken) {
      await this.auditLogService.log({ userId: session.userId, action: 'TOKEN_REUSE_DETECTED', module: 'auth', description: 'Refresh token reuse detected, all sessions invalidated', ipAddress, userAgent });
      await this.sessionRepository.update({ userId: session.userId }, { isActive: false });
      throw new UnauthorizedException({ message: 'Token reuse terdeteksi', code: 'INVALID_TOKEN' });
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
    await this.auditLogService.log({ userId, action: 'CHANGE_PASSWORD', module: 'auth', description: 'Password berhasil diubah' });
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

    await this.auditLogService.log({ userId: user.id, action: 'FORGOT_PASSWORD', module: 'auth', description: 'Reset password diminta' });
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
    await this.auditLogService.log({ userId: resetToken.userId, action: 'RESET_PASSWORD', module: 'auth', description: 'Password direset via token' });

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

  async getUserPermissions(userId: number) {
    const userRoles = await this.userRoleRepository.find({
      where: { userId, revokedAt: IsNull() },
      relations: { role: { permissions: true } },
    });

    const permissions = new Set<string>();
    for (const ur of userRoles) {
      for (const p of ur.role.permissions) {
        permissions.add(p.name);
      }
    }

    return { userId, permissions: Array.from(permissions) };
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
