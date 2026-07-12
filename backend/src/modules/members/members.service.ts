import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Member } from './entities/member.entity';
import { MemberStatusHistory } from './entities/member-status-history.entity';
import { User } from '../auth/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(MemberStatusHistory)
    private memberStatusHistoryRepository: Repository<MemberStatusHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async findAll(query: { page?: number; limit?: number; search?: string; status?: string; plant?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: IsNull() };

    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.plant) {
      where.plant = query.plant;
    }

    const [data, total] = await this.memberRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const member = await this.memberRepository.findOne({ where: { id, deletedAt: IsNull() } });
    if (!member) throw new NotFoundException('Anggota tidak ditemukan');
    return member;
  }

  async update(id: number, data: Partial<Member>, changedByUserId?: number) {
    const member = await this.findOne(id);

    if (data.status && data.status !== member.status) {
      await this.memberStatusHistoryRepository.save({
        memberId: id,
        oldStatus: member.status,
        newStatus: data.status,
        changedByUserId,
      });

      if (data.status === 'inactive') {
        await this.userRepository.update({ npk: member.npk }, { isActive: false });
      } else if (data.status === 'active') {
        await this.userRepository.update({ npk: member.npk }, { isActive: true });
      }
    }

    await this.memberRepository.update(id, data);
    return this.findOne(id);
  }

  async findOrCreateByNpk(npk: string, name: string) {
    let member = await this.memberRepository.findOne({ where: { npk } });
    if (!member) {
      member = this.memberRepository.create({ npk, name });
      member = await this.memberRepository.save(member);

      const defaultPassword = this.configService.get('DEFAULT_MEMBER_PASSWORD') || 'SmartCare';
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);

      await this.userRepository.save({
        npk,
        password: hashedPassword,
        mustChangePassword: true,
        memberId: member.id,
        isActive: true,
      });
    }
    return member;
  }

  async importFromExcel(rows: Array<{ npk: string; name: string; email?: string; workUnit?: string; phone?: string; plant?: string; status?: string }>) {
    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const row of rows) {
      try {
        if (!row.npk || !row.name) {
          results.errors.push(`Baris dengan NPK ${row.npk || 'kosong'}: NPK dan Nama wajib diisi`);
          continue;
        }

        const existingMember = await this.memberRepository.findOne({ where: { npk: row.npk } });

        if (existingMember) {
          await this.memberRepository.update(existingMember.id, {
            name: row.name,
            email: row.email || existingMember.email,
            workUnit: row.workUnit || existingMember.workUnit,
            phone: row.phone || existingMember.phone,
            plant: row.plant || existingMember.plant,
            status: row.status || existingMember.status,
          });

          if (row.status === 'inactive') {
            await this.userRepository.update({ npk: row.npk }, { isActive: false });
          }

          results.updated++;
        } else {
          const defaultPassword = this.configService.get('DEFAULT_MEMBER_PASSWORD') || 'SmartCare';
          const hashedPassword = await bcrypt.hash(defaultPassword, 12);

          const member = await this.memberRepository.save({
            npk: row.npk,
            name: row.name,
            email: row.email,
            workUnit: row.workUnit,
            phone: row.phone,
            plant: row.plant,
            status: row.status || 'active',
          });

          await this.userRepository.save({
            npk: row.npk,
            password: hashedPassword,
            mustChangePassword: true,
            memberId: member.id,
            isActive: row.status !== 'inactive',
          });

          results.created++;
        }
      } catch (error) {
        results.errors.push(`Error processing NPK ${row.npk}: ${error.message}`);
      }
    }

    return results;
  }
}
