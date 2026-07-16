import { Controller, Get, Post, Patch, Body, Param, Query, Res, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards';
import { CurrentUser, Permissions } from '../../common/decorators';

@ApiTags('Members')
@Controller('members')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get()
  @Permissions('member.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Daftar anggota' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('plant') plant?: string,
  ) {
    return this.membersService.findAll({ page, limit, search, status, plant });
  }

  @Get(':id')
  @Permissions('member.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail anggota' })
  async findOne(@Param('id') id: number) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @Permissions('member.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update anggota' })
  async update(@Param('id') id: number, @Body() data: any, @CurrentUser() userId: number) {
    return this.membersService.update(id, data, userId);
  }

  @Post(':id/reset-password')
  @Permissions('member.reset_password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset password akun anggota ke password awal' })
  async resetPassword(
    @Param('id') id: number,
    @CurrentUser() userId: number,
  ) {
    return this.membersService.resetPassword(id, userId);
  }

  @Post('import/preview')
  @Permissions('member.import')
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Preview import anggota dari Excel' })
  async importPreview(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() userId: number,
  ) {
    return this.membersService.previewImport(file, userId);
  }

  @Post('import')
  @Permissions('member.import')
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Konfirmasi import anggota' })
  async import(
    @Body() body: { importId: number },
    @CurrentUser() userId: number,
  ) {
    return this.membersService.confirmImport(body.importId, userId);
  }

  @Get('export')
  @Permissions('member.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export anggota ke Excel' })
  async export(@Res() res: Response) {
    const buffer = await this.membersService.exportToExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="data-anggota.xlsx"');
    res.send(buffer);
  }

  @Get('import/template')
  @Permissions('member.import')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download template Excel import anggota' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.membersService.generateTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="template-import-anggota.xlsx"');
    res.send(buffer);
  }
}
