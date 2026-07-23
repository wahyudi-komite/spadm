import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import ExcelJS from 'exceljs';
import { Member } from './entities/member.entity';
import { MemberStatusHistory } from './entities/member-status-history.entity';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { ConfigService } from '@nestjs/config';
import { MemberImport } from './entities/member-import.entity';
import { MemberImportRow } from './entities/member-import-row.entity';
import { Role } from '../roles/role.entity';
import { UserRole } from '../roles/user-role.entity';
import { UserRoleHistory } from '../roles/user-role-history.entity';

type MemberImportPreviewRow = {
  rowNumber: number;
  npk: string;
  rawData: Record<string, unknown>;
  normalizedData: Record<string, string>;
  isValid: boolean;
  action: 'INVALID' | 'UPDATE' | 'CREATE';
  errors: string[];
};

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(MemberStatusHistory)
    private memberStatusHistoryRepository: Repository<MemberStatusHistory>,
    @InjectRepository(MemberImport)
    private memberImportRepository: Repository<MemberImport>,
    @InjectRepository(MemberImportRow)
    private memberImportRowRepository: Repository<MemberImportRow>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserRoleHistory)
    private userRoleHistoryRepository: Repository<UserRoleHistory>,
    private configService: ConfigService,
    private auditLogService: AuditLogService,
  ) {}

  async findAll(query: { page?: number; limit?: number; search?: string; status?: string; plant?: string; workUnit?: string; role?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: IsNull() };

    if (query.search) {
      const searchWhere: any = [
        { name: Like(`%${query.search}%`), deletedAt: IsNull() },
        { npk: Like(`%${query.search}%`), deletedAt: IsNull() },
      ];
      if (query.status) searchWhere.forEach((w: any) => w.status = query.status);
      if (query.plant) searchWhere.forEach((w: any) => w.plant = query.plant);
      if (query.workUnit) searchWhere.forEach((w: any) => w.workUnit = query.workUnit);
      if (query.role) searchWhere.forEach((w: any) => w.userRoles = { role: { name: query.role } });

      const [data, total] = await this.memberRepository.findAndCount({
        where: searchWhere,
        relations: { userRoles: { role: true } },
        skip,
        take: limit,
        order: { updatedAt: 'DESC' },
      });

      return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.plant) {
      where.plant = query.plant;
    }
    if (query.workUnit) {
      where.workUnit = query.workUnit;
    }
    if (query.role) {
      where.userRoles = { role: { name: query.role } };
    }

    const [data, total] = await this.memberRepository.findAndCount({
      where,
      relations: { userRoles: { role: true } },
      skip,
      take: limit,
      order: { updatedAt: 'DESC' },
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

  async create(data: {
    npk: string;
    name: string;
    email?: string;
    workUnit?: string;
    phone?: string;
    plant?: string;
    organizationalPosition?: string;
  private capitalizeName(nameInput?: string): string {
    if (!nameInput) return '';
    return nameInput
      .toLowerCase()
      .split(' ')
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
      .join(' ')
      .trim();
  }

  private normalizePhone(phoneInput?: string): string {
    if (!phoneInput) return '';
    let phone = String(phoneInput).trim().replace(/\D/g, '');
    if (!phone) return '';
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    } else if (!phone.startsWith('62')) {
      phone = '62' + phone;
    }
    return phone;
  }

  async checkNpkExists(npk: string): Promise<boolean> {
    if (!npk) return false;
    const count = await this.memberRepository.count({ where: { npk: npk.trim() } });
    return count > 0;
  }

  async create(data: {
    npk: string;
    name: string;
    email?: string;
    workUnit?: string;
    phone?: string;
    plant?: string;
    organizationalPosition?: string;
    status?: string;
  }, createdByUserId?: number) {
    const existing = await this.memberRepository.findOne({ where: { npk: data.npk } });
    if (existing) throw new BadRequestException(`NPK ${data.npk} sudah terdaftar`);

    const normalizedPhone = this.normalizePhone(data.phone);
    if (normalizedPhone && !/^62\d{8,13}$/.test(normalizedPhone)) {
      throw new BadRequestException('Nomor telepon harus diawali 62 (contoh: 6281234567890)');
    }

    const passwordHash = await bcrypt.hash(
      this.configService.get<string>('DEFAULT_MEMBER_PASSWORD') || 'SmartCare',
      12,
    );

    const memberRole = await this.roleRepository.findOne({ where: { name: 'MEMBER' } });
    if (!memberRole) throw new BadRequestException('Role MEMBER belum tersedia');

    return this.memberRepository.manager.transaction(async (manager) => {
      const member = await manager.save(Member, manager.create(Member, {
        npk: data.npk,
        name: this.capitalizeName(data.name),
        email: data.email,
        workUnit: data.workUnit,
        phone: normalizedPhone,
        plant: data.plant,
        organizationalPosition: data.organizationalPosition || 'ANGGOTA',
        status: data.status || 'active',
        password: passwordHash,
        mustChangePassword: true,
        isActive: (data.status || 'active') === 'active',
      }));

      await manager.save(UserRole, {
        memberId: member.id,
        roleId: memberRole.id,
        assignedBy: createdByUserId,
        startsAt: new Date(),
        status: 'ACTIVE',
        reason: 'Pembuatan anggota baru',
      });

      await this.auditLogService.log({
        userId: createdByUserId,
        action: 'CREATE_MEMBER',
        module: 'members',
        entityType: 'member',
        entityId: member.id,
        description: `Buat anggota ${member.npk} - ${member.name}`,
      });

      return this.memberRepository.findOne({
        where: { id: member.id },
        relations: { userRoles: { role: true } },
      });
    });
  }

  async delete(id: number, deletedByUserId: number) {
    const member = await this.findOne(id);

    return this.memberRepository.manager.transaction(async (manager) => {
      await manager.softRemove(Member, member);

      const activeRoles = await manager.find(UserRole, {
        where: { memberId: id, revokedAt: IsNull() },
        relations: { role: true },
      });

      for (const ur of activeRoles) {
        await manager.update(UserRole, ur.id, {
          revokedAt: new Date(),
          revokedBy: deletedByUserId,
          status: 'REVOKED',
          reason: 'Anggota dihapus',
        });

        await manager.save(UserRoleHistory, {
          memberId: id,
          roleId: ur.roleId,
          areaId: ur.areaId,
          startsAt: ur.startsAt,
          endsAt: ur.endsAt,
          status: 'REVOKED',
          action: 'REVOKE' as const,
          changedBy: deletedByUserId,
          reason: 'Anggota dihapus',
        });
      }

      await this.auditLogService.log({
        userId: deletedByUserId,
        action: 'DELETE_MEMBER',
        module: 'members',
        entityType: 'member',
        entityId: id,
        description: `Hapus anggota ${member.npk} - ${member.name} (${activeRoles.length} role dicabut)`,
      });
    });
  }

  async update(id: number, data: Partial<Member>, changedByUserId?: number) {
    const member = await this.findOne(id);
    delete data.npk;

    if (data.name) {
      data.name = this.capitalizeName(data.name);
    }

    if (data.phone !== undefined) {
      data.phone = this.normalizePhone(data.phone);
      if (data.phone && !/^62\d{8,13}$/.test(data.phone)) {
        throw new BadRequestException('Nomor telepon harus diawali 62 (contoh: 6281234567890)');
      }
    }

    if (data.status && data.status !== member.status) {
      await this.memberStatusHistoryRepository.save({
        memberId: id,
        oldStatus: member.status,
        newStatus: data.status,
        changedByUserId,
      });

      (data as any).isActive = data.status === "active";
    }

    await this.memberRepository.update(id, data);
    await this.auditLogService.log({ userId: changedByUserId, action: 'UPDATE_MEMBER', module: 'members', entityType: 'member', entityId: id, description: `Update member ${member.npk}` });
    return this.findOne(id);
  }

  async resetPassword(id: number, changedByUserId: number) {
    const member = await this.findOne(id);
    

    const defaultPassword =
      this.configService.get<string>('DEFAULT_MEMBER_PASSWORD') || 'SmartCare';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    await this.memberRepository.update(member.id, {
      password: hashedPassword,
      mustChangePassword: true,
      failedLoginAttempts: 0,
      lockedUntil: () => 'NULL',
    });
    await this.auditLogService.log({
      userId: changedByUserId,
      action: 'RESET_MEMBER_PASSWORD',
      module: 'members',
      entityType: 'member',
      entityId: member.id,
      description: `Reset password anggota ${member.npk}`,
    });

    return { message: 'Password anggota berhasil direset' };
  }

  async findOrCreateByNpk(npk: string, name: string) {
    let member = await this.memberRepository.findOne({ where: { npk } });
    if (!member) {
      member = this.memberRepository.create({ npk, name });
      const defaultPassword = this.configService.get('DEFAULT_MEMBER_PASSWORD') || 'SmartCare';
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);
      member.password = hashedPassword;
      member.mustChangePassword = true;
      member.isActive = true;
      member = await this.memberRepository.save(member);
    }
    return member;
  }

  async exportToExcel(): Promise<Buffer> {
    const members = await this.memberRepository.find({
      where: { deletedAt: IsNull() },
      order: { name: 'ASC' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Data Anggota');

    const headers = ['NPK', 'Nama', 'Email', 'Unit Kerja', 'Nomor WhatsApp', 'Status', 'Jabatan Organisasi', 'Plant'];
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
    });

    for (const member of members) {
      sheet.addRow([
        member.npk,
        member.name,
        member.email || '',
        member.workUnit || '',
        member.phone || '',
        member.status,
        member.organizationalPosition || '',
        member.plant || '',
      ]);
    }

    sheet.columns.forEach((col) => {
      if (col) col.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generateTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Template Import Anggota');

    const headers = ['Nama', 'Email', 'NPK', 'Unit Kerja', 'Nomor WhatsApp', 'Status', 'Jabatan Organisasi', 'Plant'];
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    sheet.addRow(['John Doe', 'john@example.com', '123456', 'Unit A', '08123456789', 'active', 'Staff', 'P1']);
    sheet.addRow(['', '', '', '', '', 'active/inactive', '', '']);

    sheet.columns.forEach((col) => {
      if (col) col.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
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
            isActive: (row.status || existingMember.status) === "active",
          });

          

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
            password: hashedPassword,
            mustChangePassword: true,
            isActive: row.status !== "inactive",
          });

          results.created++;
        }
      } catch (error) {
        results.errors.push(`Error processing NPK ${row.npk}: ${error.message}`);
      }
    }

    await this.auditLogService.log({ action: 'IMPORT_MEMBERS', module: 'members', description: `Import ${results.created} created, ${results.updated} updated, ${results.errors.length} errors` });

    return results;
  }

  async previewImport(file: Express.Multer.File, userId: number) {
    if (!file) throw new BadRequestException('File Excel diperlukan');
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File harus berformat XLSX');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Uint8Array.from(file.buffer).buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('File Excel kosong');

    const requiredHeaders = [
      'Nama',
      'Email',
      'NPK',
      'Unit Kerja',
      'Nomor WhatsApp',
      'Status',
      'Jabatan Organisasi',
      'Plant',
    ];
    const headers = (sheet.getRow(1).values as Array<ExcelJS.CellValue>)
      .slice(1)
      .map((value) => String(value || '').trim());
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header),
    );
    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Header Excel tidak lengkap: ${missingHeaders.join(', ')}`,
      );
    }

    const rawRows: Array<Record<string, unknown>> = [];
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const record: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        record[header] = row.getCell(index + 1).text.trim();
      });
      rawRows.push(record);
    });
    if (rawRows.length > 10000) {
      throw new BadRequestException('Maksimal 10.000 baris per import');
    }

    const npks = rawRows
      .map((row) => String(row.NPK || '').trim())
      .filter(Boolean);
    const existingMembers = npks.length
      ? await this.memberRepository.find({ where: { npk: In(npks) } })
      : [];
    const existingNpks = new Set(existingMembers.map((member) => member.npk));
    const occurrences = new Map<string, number>();
    for (const npk of npks) {
      occurrences.set(npk, (occurrences.get(npk) || 0) + 1);
    }

    const normalizedRows: MemberImportPreviewRow[] = rawRows.map((rawData, index) => {
      const normalizedData = {
        npk: String(rawData.NPK || '').trim(),
        name: this.capitalizeName(String(rawData.Nama || '')),
        email: String(rawData.Email || '').trim(),
        workUnit: String(rawData['Unit Kerja'] || '').trim(),
        phone: this.normalizePhone(String(rawData['Nomor WhatsApp'] || '')),
        status: String(rawData.Status || 'active').trim().toLowerCase(),
        organizationalPosition: String(
          rawData['Jabatan Organisasi'] || '',
        ).trim(),
        plant: String(rawData.Plant || '').trim(),
      };
      const errors: string[] = [];
      if (!/^[A-Za-z0-9]{1,10}$/.test(normalizedData.npk)) {
        errors.push('NPK wajib diisi, maksimal 10 karakter alfanumerik');
      }
      if (!normalizedData.name) errors.push('Nama wajib diisi');
      if (normalizedData.phone && !/^62\d{8,13}$/.test(normalizedData.phone)) {
        errors.push('Nomor WhatsApp harus diawali 62 (contoh: 6281234567890)');
      }
      if (!['active', 'inactive'].includes(normalizedData.status)) {
        errors.push('Status harus active atau inactive');
      }
      if ((occurrences.get(normalizedData.npk) || 0) > 1) {
        errors.push('NPK duplikat di dalam file');
      }
      return {
        rowNumber: index + 2,
        npk: normalizedData.npk,
        rawData,
        normalizedData,
        isValid: errors.length === 0,
        action:
          errors.length > 0
            ? 'INVALID'
            : existingNpks.has(normalizedData.npk)
              ? 'UPDATE'
              : 'CREATE',
        errors,
      };
    });

    const memberImport = await this.memberImportRepository.manager.transaction(
      async (manager) => {
        const savedImport = await manager.save(MemberImport, {
          fileName: file.originalname,
          status: 'PREVIEW',
          uploadedBy: userId,
          totalRows: normalizedRows.length,
          validRows: normalizedRows.filter((row) => row.isValid).length,
          invalidRows: normalizedRows.filter((row) => !row.isValid).length,
        });
        await manager.save(
          MemberImportRow,
          normalizedRows.map((row) => ({ ...row, importId: savedImport.id })),
        );
        return savedImport;
      },
    );

    return {
      importId: memberImport.id,
      total: normalizedRows.length,
      valid: memberImport.validRows,
      invalid: memberImport.invalidRows,
      rows: normalizedRows,
    };
  }

  async confirmImport(importId: number, userId: number) {
    const memberImport = await this.memberImportRepository.findOne({
      where: { id: importId },
      relations: { rows: true },
    });
    if (!memberImport) throw new BadRequestException('Import tidak ditemukan');
    if (memberImport.status !== 'PREVIEW') {
      throw new BadRequestException('Import sudah pernah diproses');
    }
    if (memberImport.invalidRows > 0) {
      throw new BadRequestException(
        'Perbaiki seluruh baris invalid sebelum mengonfirmasi import',
      );
    }

    const passwordHash = await bcrypt.hash(
      this.configService.get<string>('DEFAULT_MEMBER_PASSWORD') || 'SmartCare',
      12,
    );
    try {
      const result = await this.memberImportRepository.manager.transaction(
        async (manager) => {
          const memberRole = await manager.findOne(Role, {
            where: { name: 'MEMBER' },
          });
          if (!memberRole) {
            throw new BadRequestException('Role MEMBER belum tersedia');
          }

          let created = 0;
          let updated = 0;
          for (const row of memberImport.rows) {
            const data = row.normalizedData as {
              npk: string;
              name: string;
              email: string;
              workUnit: string;
              phone: string;
              status: string;
              organizationalPosition: string;
              plant: string;
            };
            let member = await manager.findOne(Member, {
              where: { npk: data.npk },
            });

            if (member) {
              const previousStatus = member.status;
              Object.assign(member, data);
              await manager.save(member);
              member.isActive = data.status === "active";
              if (previousStatus !== data.status) {
                await manager.save(MemberStatusHistory, {
                  memberId: member.id,
                  oldStatus: previousStatus,
                  newStatus: data.status,
                  changedByUserId: userId,
                  reason: `Import anggota #${importId}`,
                });
              }
              updated++;
            } else {
              (data as any).password = passwordHash;
              (data as any).mustChangePassword = true;
              (data as any).isActive = data.status === "active";
              member = await manager.save(Member, manager.create(Member, data));
              await manager.save(UserRole, {
                memberId: member.id,
        roleId: memberRole.id,
                assignedBy: userId,
                startsAt: new Date(),
                status: 'ACTIVE',
                reason: `Import anggota #${importId}`,
              });
              created++;
            }
            row.processedAt = new Date();
            await manager.save(row);
          }

          memberImport.status = 'COMPLETED';
          memberImport.confirmedBy = userId;
          memberImport.confirmedAt = new Date();
          memberImport.createdCount = created;
          memberImport.updatedCount = updated;
          await manager.save(memberImport);
          return { created, updated, errors: 0 };
        },
      );
      await this.auditLogService.log({
        userId,
        action: 'IMPORT_MEMBERS',
        module: 'members',
        entityType: 'member_import',
        entityId: importId,
        newValues: result,
        description: `${result.created} anggota dibuat, ${result.updated} diperbarui`,
      });
      return result;
    } catch (error) {
      await this.memberImportRepository.update(importId, { status: 'FAILED' });
      throw error;
    }
  }
}
