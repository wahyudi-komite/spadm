import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Repository } from 'typeorm';
import ExcelJS from 'exceljs';
import { BazaarOrder } from '../orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { PickupToken } from '../distributions/entities/pickup-token.entity';
import { signPickupToken } from '../distributions/pickup-token.util';

export interface ReportFilters {
  eventId?: number;
  batchId?: number;
  areaId?: number;
  from?: string;
  to?: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(BazaarOrder)
    private readonly orderRepository: Repository<BazaarOrder>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PickupToken)
    private readonly pickupTokenRepository: Repository<PickupToken>,
    private readonly config: ConfigService,
  ) {}

  async dashboard(filters: ReportFilters) {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.event', 'event')
      .leftJoin('order.batch', 'batch')
      .leftJoin('order.distributionArea', 'area')
      .leftJoin(Payment, 'payment', 'payment.order_id = order.id')
      .leftJoin('distributions', 'distribution', 'distribution.order_id = order.id')
      .select('COUNT(DISTINCT order.id)', 'totalOrders')
      .addSelect("SUM(CASE WHEN payment.status IN ('PAID','MANUAL_VERIFIED') THEN 1 ELSE 0 END)", 'paidOrders')
      .addSelect("SUM(CASE WHEN payment.status = 'PENDING' THEN 1 ELSE 0 END)", 'pendingPayments')
      .addSelect("SUM(CASE WHEN payment.status = 'EXPIRED' THEN 1 ELSE 0 END)", 'expiredPayments')
      .addSelect("COALESCE(SUM(CASE WHEN payment.status IN ('PAID','MANUAL_VERIFIED') THEN order.grandTotal ELSE 0 END), 0)", 'receivedAmount')
      .addSelect("COALESCE(SUM(CASE WHEN payment.status IN ('PAID','MANUAL_VERIFIED') THEN order.subsidy ELSE 0 END), 0)", 'totalSubsidy')
      .addSelect("COALESCE(SUM(CASE WHEN payment.status IN ('PAID','MANUAL_VERIFIED') THEN order.goodieBagFee ELSE 0 END), 0)", 'totalGoodieBag')
      .addSelect("COALESCE(SUM(CASE WHEN payment.status IN ('PAID','MANUAL_VERIFIED') THEN order.applicationFee ELSE 0 END), 0)", 'totalApplicationFee')
      .addSelect('COUNT(DISTINCT distribution.id)', 'distributedOrders');
    this.applyFilters(query, filters);
    const totals = (await query.getRawOne<Record<string, string>>()) || {};

    const activeMembers = await this.orderRepository.manager.query(
      "SELECT COUNT(*) AS total FROM members WHERE status = 'active' AND deletedAt IS NULL",
    ) as Array<{ total: string }>;
    const paidOrders = Number(totals.paidOrders || 0);
    const active = Number(activeMembers[0]?.total || 0);

    return {
      kpis: {
        activeMembers: active,
        totalOrders: Number(totals.totalOrders || 0),
        paidOrders,
        pendingPayments: Number(totals.pendingPayments || 0),
        expiredPayments: Number(totals.expiredPayments || 0),
        distributedOrders: Number(totals.distributedOrders || 0),
        participationPercentage: active ? Number(((paidOrders / active) * 100).toFixed(2)) : 0,
        receivedAmount: Number(totals.receivedAmount || 0),
        totalSubsidy: Number(totals.totalSubsidy || 0),
        totalGoodieBag: Number(totals.totalGoodieBag || 0),
        totalApplicationFee: Number(totals.totalApplicationFee || 0),
      },
      byArea: await this.groupedSummary('area.id', 'area.code', filters),
      byBatch: await this.groupedSummary('batch.id', 'batch.name', filters),
      byProduct: await this.productSummary(filters),
    };
  }

  async transactionsExcel(filters: ReportFilters): Promise<Buffer> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.member', 'member')
      .leftJoinAndSelect('order.event', 'event')
      .leftJoinAndSelect('order.batch', 'batch')
      .leftJoinAndSelect('order.distributionArea', 'area')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndMapOne('order.payment', Payment, 'payment', 'payment.order_id = order.id')
      .orderBy('order.createdAt', 'DESC');
    this.applyFilters(query, filters);
    const orders = await query.getMany() as Array<BazaarOrder & { payment?: Payment }>;
    const rows = orders.map((order) => ({
      'Nomor Transaksi': order.orderNumber,
      NPK: order.user?.npk,
      Nama: order.user?.member?.name,
      Event: order.event?.name,
      Batch: order.batch?.name,
      Area: order.distributionArea?.code,
      Produk: order.items?.map((item) => `${item.productNameSnapshot} (${item.quantity})`).join(', '),
      Subtotal: Number(order.productSubtotal),
      'Goodie Bag': Number(order.goodieBagFee),
      'Biaya Aplikasi': Number(order.applicationFee),
      Subsidi: Number(order.subsidy),
      Total: Number(order.grandTotal),
      'Status Order': order.status,
      'Status Pembayaran': order.payment?.status || 'UNPAID',
      'Tanggal Transaksi': order.createdAt,
    }));
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SPADM';
    const worksheet = workbook.addWorksheet('Transaksi', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });
    const keys = rows.length ? Object.keys(rows[0]) : ['Nomor Transaksi'];
    worksheet.columns = keys.map((key) => ({ header: key, key, width: 22 }));
    worksheet.addRows(rows);
    worksheet.getRow(1).font = { bold: true };
    worksheet.autoFilter = { from: 'A1', to: `${worksheet.getColumn(keys.length).letter}1` };
    const output = await workbook.xlsx.writeBuffer();
    return Buffer.from(output);
  }

  async summaryPdf(filters: ReportFilters, generatedBy: number): Promise<Buffer> {
    const summary = await this.dashboard(filters);
    return this.createPdf((doc) => {
      doc.fontSize(18).text('SPADM', { align: 'center' });
      doc.fontSize(14).text('Laporan Bazar', { align: 'center' });
      doc.moveDown().fontSize(10).text(`Dibuat: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
      doc.text(`User pembuat: #${generatedBy}`).moveDown();
      const labels: Record<string, string> = {
        activeMembers: 'Anggota aktif', totalOrders: 'Total transaksi', paidOrders: 'Pembayaran berhasil',
        pendingPayments: 'Pembayaran pending', expiredPayments: 'Pembayaran expired',
        distributedOrders: 'Sudah didistribusikan', participationPercentage: 'Partisipasi (%)',
        receivedAmount: 'Pembayaran diterima', totalSubsidy: 'Total subsidi',
        totalGoodieBag: 'Total goodie bag', totalApplicationFee: 'Total biaya aplikasi',
      };
      for (const [key, value] of Object.entries(summary.kpis)) doc.text(`${labels[key]}: ${value}`);
      doc.moveDown().fontSize(12).text('Rekap per Area');
      for (const row of summary.byArea) doc.fontSize(10).text(`${row.label || '-'}: ${row.total} transaksi, ${row.paid} dibayar`);
    });
  }

  async receiptPdf(orderId: number, userId: number): Promise<Buffer> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { user: { member: true }, event: true, batch: true, distributionArea: true, items: true },
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    if (order.user.id !== userId && !(await this.canReadReports(userId))) throw new ForbiddenException('Anda tidak dapat mengakses bukti ini');
    const payment = await this.paymentRepository.findOne({ where: { order: { id: orderId } } });
    if (!payment || !['PAID', 'MANUAL_VERIFIED'].includes(payment.status)) throw new NotFoundException('Bukti pembayaran belum tersedia');
    const token = await this.pickupTokenRepository.findOne({ where: { order: { id: orderId } } });
    const qrImage = token ? await QRCode.toDataURL(this.signPickupToken(token.tokenCode), { margin: 1, width: 220 }) : null;
    return this.createPdf((doc) => {
      const member = order.user.member;
      doc.fontSize(18).text('SPADM', { align: 'center' });
      doc.fontSize(13).text('Bukti Pembayaran Bazar', { align: 'center' }).moveDown();
      doc.fontSize(10).text(`Nomor transaksi: ${order.orderNumber}`);
      doc.text(`Event: ${order.event.name}`);
      doc.text(`Anggota: ${member.name} (${member.npk})`);
      doc.text(`Unit/Plant: ${member.workUnit || '-'} / ${member.plant || '-'}`);
      doc.text(`Area pengambilan: ${order.distributionArea?.code || '-'}`);
      doc.text(`Status pembayaran: ${payment.status}`);
      doc.text(`Referensi: ${payment.providerReference || payment.referenceId}`).moveDown();
      doc.fontSize(11).text('Rincian');
      for (const item of order.items) doc.fontSize(10).text(`${item.productNameSnapshot} x${item.quantity}: Rp${Number(item.subtotal).toLocaleString('id-ID')}`);
      doc.text(`Subtotal: Rp${Number(order.productSubtotal).toLocaleString('id-ID')}`);
      doc.text(`Goodie bag: Rp${Number(order.goodieBagFee).toLocaleString('id-ID')}`);
      doc.text(`Biaya aplikasi: Rp${Number(order.applicationFee).toLocaleString('id-ID')}`);
      doc.text(`Subsidi SPADM: -Rp${Number(order.subsidy).toLocaleString('id-ID')}`);
      doc.fontSize(12).text(`Total: Rp${Number(order.grandTotal).toLocaleString('id-ID')}`).moveDown();
      if (qrImage) {
        doc.image(Buffer.from(qrImage.split(',')[1], 'base64'), { fit: [130, 130], align: 'center' });
        doc.fontSize(9).text('QR pengambilan — pengambilan tidak dapat diwakilkan.', { align: 'center' });
      }
    });
  }

  private async groupedSummary(groupField: string, labelField: string, filters: ReportFilters) {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoin('order.event', 'event').leftJoin('order.batch', 'batch')
      .leftJoin('order.distributionArea', 'area')
      .leftJoin(Payment, 'payment', 'payment.order_id = order.id')
      .select(groupField, 'id').addSelect(labelField, 'label')
      .addSelect('COUNT(DISTINCT order.id)', 'total')
      .addSelect("SUM(CASE WHEN payment.status IN ('PAID','MANUAL_VERIFIED') THEN 1 ELSE 0 END)", 'paid')
      .groupBy(groupField).addGroupBy(labelField).orderBy(labelField, 'ASC');
    this.applyFilters(query, filters);
    const rows = await query.getRawMany<Record<string, string>>();
    return rows.map((row) => ({ id: Number(row.id), label: row.label, total: Number(row.total), paid: Number(row.paid) }));
  }

  private async productSummary(filters: ReportFilters) {
    const query = this.orderRepository.createQueryBuilder('order')
      .innerJoin('order.items', 'item').leftJoin('order.event', 'event')
      .leftJoin('order.batch', 'batch').leftJoin('order.distributionArea', 'area')
      .leftJoin(Payment, 'payment', 'payment.order_id = order.id')
      .select('item.productNameSnapshot', 'label').addSelect('SUM(item.quantity)', 'quantity')
      .where("payment.status IN ('PAID','MANUAL_VERIFIED')")
      .groupBy('item.productNameSnapshot').orderBy('quantity', 'DESC');
    this.applyFilters(query, filters);
    const rows = await query.getRawMany<Record<string, string>>();
    return rows.map((row) => ({ label: row.label, quantity: Number(row.quantity) }));
  }

  private applyFilters(query: ReturnType<Repository<BazaarOrder>['createQueryBuilder']>, filters: ReportFilters): void {
    if (filters.eventId) query.andWhere('event.id = :eventId', { eventId: filters.eventId });
    if (filters.batchId) query.andWhere('batch.id = :batchId', { batchId: filters.batchId });
    if (filters.areaId) query.andWhere('area.id = :areaId', { areaId: filters.areaId });
    if (filters.from) query.andWhere('order.createdAt >= :from', { from: `${filters.from} 00:00:00` });
    if (filters.to) query.andWhere('order.createdAt <= :to', { to: `${filters.to} 23:59:59` });
  }

  private async canReadReports(userId: number): Promise<boolean> {
    const rows = await this.orderRepository.manager.query(
      `SELECT 1 FROM user_roles ur INNER JOIN role_permissions rp ON rp.roleId = ur.roleId
       INNER JOIN permissions p ON p.id = rp.permissionId
       WHERE ur.userId = ? AND ur.status = 'ACTIVE' AND ur.revokedAt IS NULL
       AND (ur.startsAt IS NULL OR ur.startsAt <= NOW()) AND (ur.endsAt IS NULL OR ur.endsAt >= NOW())
       AND p.name = 'bazaar.report.read' LIMIT 1`, [userId],
    ) as unknown[];
    return rows.length > 0;
  }

  private signPickupToken(tokenCode: string): string {
    const secret = this.config.getOrThrow<string>('PICKUP_TOKEN_SECRET');
    return signPickupToken(tokenCode, secret);
  }

  private createPdf(render: (document: PDFKit.PDFDocument) => void): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const document = new PDFDocument({ size: 'A4', margin: 48, info: { Title: 'SPADM' } });
      const chunks: Buffer[] = [];
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);
      render(document);
      document.end();
    });
  }
}
