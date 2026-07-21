import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../members/entities/member.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: { sub: number; npk: string }) {
    const user = await this.memberRepository.findOne({ where: { id: payload.sub, isActive: true } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: payload.sub, sub: payload.sub, npk: payload.npk };
  }
}
