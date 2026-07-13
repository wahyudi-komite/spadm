import { Controller, Get, Header, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser, Permissions } from '../../../common/decorators';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { ReportsService } from './reports.service';
import type { ReportFilters } from './reports.service';

@ApiTags('Bazaar Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('bazaar/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @Permissions('bazaar.report.read')
  dashboard(@Query() filters: ReportFilters) {
    return this.reportsService.dashboard(filters);
  }

  @Get('transactions.xlsx')
  @Permissions('bazaar.report.export')
  async exportTransactions(@Query() filters: ReportFilters, @Res() response: Response) {
    const file = await this.reportsService.transactionsExcel(filters);
    response.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="transaksi-bazar-${Date.now()}.xlsx"`,
    });
    response.send(file);
  }

  @Get('summary.pdf')
  @Permissions('bazaar.report.export')
  async exportSummary(
    @Query() filters: ReportFilters,
    @CurrentUser() userId: number,
    @Res() response: Response,
  ) {
    const file = await this.reportsService.summaryPdf(filters, userId);
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="laporan-bazar-${Date.now()}.pdf"`,
    });
    response.send(file);
  }

  @Get('orders/:id/receipt.pdf')
  @Header('Cache-Control', 'private, no-store')
  async receipt(
    @Param('id') id: number,
    @CurrentUser() userId: number,
    @Res() response: Response,
  ) {
    const file = await this.reportsService.receiptPdf(id, userId);
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="bukti-pembayaran-${id}.pdf"`,
      'Cache-Control': 'private, no-store',
    });
    response.send(file);
  }
}
