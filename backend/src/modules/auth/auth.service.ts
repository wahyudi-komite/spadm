import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
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
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
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
    const user = await this.memberRepository.findOne({
      where: { npk: dto.npk },
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

    const isPasswordValid = await bcrypt.compare(dto.password, user.password!);
    if (!isPasswordValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      if (attempts >= 5) {
        await this.memberRepository.update(user.id, {
          failedLoginAttempts: attempts,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
        });
        await this.auditLogService.log({ userId: user.id, action: 'ACCOUNT_LOCKED', module: 'auth', description: 'Akun terkunci setelah 5x gagal login', ipAddress, userAgent });
      } else {
        await this.memberRepository.update(user.id, { failedLoginAttempts: attempts });
      }
      await this.saveLoginHistory(user.id, ipAddress, userAgent, false, 'Password salah');
      throw new UnauthorizedException({ message: 'NPK atau password salah', code: 'INVALID_CREDENTIALS' });
    }

    await this.memberRepository.update(user.id, { failedLoginAttempts: 0 });

    const tokens = await this.generateTokens(user);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.sessionRepository.save({
      memberId: user.id,
      refreshToken: this.hashToken(tokens.refreshToken),
      ipAddress,
      userAgent,
      expiresAt,
    });

    await this.memberRepository.update(user.id, { lastLoginAt: new Date() });
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
    const refreshTokenHash = this.hashToken(refreshToken);
    const session = await this.sessionRepository.findOne({
      where: { refreshToken: refreshTokenHash },
      relations: { member: true },
    });

    if (!session) {
      throw new UnauthorizedException({ message: 'Token tidak valid', code: 'INVALID_TOKEN' });
    }

    if (!session.isActive) {
      await this.auditLogService.log({
        userId: session.memberId,
        action: 'TOKEN_REUSE_DETECTED',
        module: 'auth',
        description: 'Refresh token yang sudah dirotasi digunakan kembali',
        ipAddress,
        userAgent,
      });
      await this.sessionRepository.update(
        { memberId: session.memberId, isActive: true },
        { isActive: false },
      );
      throw new UnauthorizedException({ message: 'Token reuse terdeteksi', code: 'INVALID_TOKEN' });
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.update(session.id, { isActive: false });
      throw new UnauthorizedException({ message: 'Session expired', code: 'SESSION_EXPIRED' });
    }

    if (!session.member.isActive) {
      throw new UnauthorizedException({ message: 'Akun tidak aktif', code: 'ACCOUNT_INACTIVE' });
    }

    const tokens = await this.generateTokens(session.member);

    try {
      await this.sessionRepository.manager.transaction(async (manager) => {
        const rotation = await manager.update(
          Session,
          { id: session.id, isActive: true },
          { isActive: false },
        );

        if (rotation.affected !== 1) {
          throw new UnauthorizedException({
            message: 'Token reuse terdeteksi',
            code: 'TOKEN_REUSE_DETECTED',
          });
        }

        await manager.save(Session, {
          memberId: session.memberId,
          refreshToken: this.hashToken(tokens.refreshToken),
          ipAddress,
          userAgent,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        });
      });
    } catch (error) {
      if (
        error instanceof UnauthorizedException &&
        (error.getResponse() as { code?: string }).code ===
          'TOKEN_REUSE_DETECTED'
      ) {
        await this.sessionRepository.update(
          { memberId: session.memberId, isActive: true },
          { isActive: false },
        );
        await this.auditLogService.log({
          userId: session.memberId,
          action: 'TOKEN_REUSE_DETECTED',
          module: 'auth',
          description: 'Refresh token digunakan secara bersamaan',
          ipAddress,
          userAgent,
        });
      }
      throw error;
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(session.member),
    };
  }

  async signOut(memberId: number, refreshToken: string) {
    if (!refreshToken) return;
    await this.sessionRepository.update(
      { refreshToken: this.hashToken(refreshToken), memberId },
      { isActive: false },
    );
  }

  async signOutFromAllDevices(memberId: number) {
    await this.sessionRepository.update({ memberId, isActive: true }, { isActive: false });
  }

  async signOutFromSession(memberId: number, sessionId: number) {
    await this.sessionRepository.update({ id: sessionId, memberId }, { isActive: false });
  }

  async changePassword(memberId: number, dto: ChangePasswordDto) {
    const user = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password!);
    if (!isPasswordValid) {
      throw new BadRequestException({ message: 'Password saat ini salah', code: 'INVALID_CURRENT_PASSWORD' });
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.memberRepository.update(memberId, {
      password: hashedPassword,
      mustChangePassword: false,
    });
    await this.auditLogService.log({ userId: memberId, action: 'CHANGE_PASSWORD', module: 'auth', description: 'Password berhasil diubah' });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.memberRepository.findOne({ where: { npk: dto.npk } });
    if (!user) {
      return { message: 'Jika NPK terdaftar, link reset password akan dikirim' };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.passwordResetTokenRepository.save({
      memberId: user.id,
      token: this.hashToken(token),
      expiresAt,
    });

    await this.auditLogService.log({ userId: user.id, action: 'FORGOT_PASSWORD', module: 'auth', description: 'Reset password diminta' });
    return { message: 'Jika NPK terdaftar, link reset password akan dikirim' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token: this.hashToken(dto.token), isUsed: false },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException({ message: 'Token tidak valid atau sudah kedaluwarsa', code: 'INVALID_TOKEN' });
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.memberRepository.update(resetToken.memberId, {
      password: hashedPassword,
      mustChangePassword: false,
    });
    await this.auditLogService.log({ userId: resetToken.memberId, action: 'RESET_PASSWORD', module: 'auth', description: 'Password direset via token' });

    await this.passwordResetTokenRepository.update(resetToken.id, { isUsed: true });
    await this.sessionRepository.update({ memberId: resetToken.memberId }, { isActive: false });
  }

  async getProfile(memberId: number) {
    const user = await this.memberRepository.findOne({
      where: { id: memberId },
          });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    return this.sanitizeUser(user);
  }

  async getSessions(memberId: number) {
    return this.sessionRepository.find({
      where: { memberId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserPermissions(memberId: number) {
    const now = new Date();
    const userRoles = await this.userRoleRepository
      .createQueryBuilder('userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('userRole.memberId = :memberId', { memberId })
      .andWhere('userRole.status = :status', { status: 'ACTIVE' })
      .andWhere('userRole.revokedAt IS NULL')
      .andWhere('(userRole.startsAt IS NULL OR userRole.startsAt <= :now)', { now })
      .andWhere('(userRole.endsAt IS NULL OR userRole.endsAt >= :now)', { now })
      .getMany();

    const permissions = new Set<string>();
    for (const ur of userRoles) {
      if (!ur.role) continue;
      for (const p of ur.role.permissions) {
        permissions.add(p.name);
      }
    }

    return { memberId, permissions: Array.from(permissions) };
  }

  private async generateTokens(user: Member) {
    const payload = { sub: user.id, npk: user.npk };

    const accessToken = this.jwtService.sign(payload as object, {
      secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload as object, {
      secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private sanitizeUser(user: Member) {
    const { password, ...rest } = user;
    return rest;
  }

  private async saveLoginHistory(memberId: number, ipAddress?: string, userAgent?: string, isSuccess = false, failureReason?: string) {
    const entry = this.loginHistoryRepository.create({
      memberId,
      ipAddress,
      userAgent,
      isSuccess,
      failureReason,
    });
    await this.loginHistoryRepository.save(entry);
  }
}
