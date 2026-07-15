import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BazaarOrder } from '../../bazaar/orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(BazaarOrder)
    private readonly orderRepo: Repository<BazaarOrder>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async getDashboard(query: DashboardQueryDto) {
    const kpis = await this.getKpis(query);
    const revenueTrend = await this.getRevenueTrend(query);
    const paymentMethodBreakdown = await this.getPaymentMethodBreakdown(query);
    const subsidyUtilization = await this.getSubsidyUtilization(query);
    return { kpis, revenueTrend, paymentMethodBreakdown, subsidyUtilization };
  }

  private async getKpis(query: DashboardQueryDto) {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'totalRevenue')
      .addSelect('COUNT(*)', 'totalPayments')
      .addSelect("SUM(CASE WHEN p.status IN ('PAID','MANUAL_VERIFIED') THEN 1 ELSE 0 END)", 'successfulPayments')
      .addSelect("SUM(CASE WHEN p.status = 'PENDING' THEN 1 ELSE 0 END)", 'pendingCount')
      .addSelect("SUM(CASE WHEN p.status = 'EXPIRED' THEN 1 ELSE 0 END)", 'expiredCount');
    if (query.from) qb.andWhere('p.createdAt >= :from', { from: query.from });
    if (query.to) qb.andWhere('p.createdAt <= :to', { to: query.to });
    const raw = await qb.getRawOne();
    return {
      totalRevenue: Number(raw?.totalRevenue || 0),
      totalPayments: Number(raw?.totalPayments || 0),
      successfulPayments: Number(raw?.successfulPayments || 0),
      pendingCount: Number(raw?.pendingCount || 0),
      expiredCount: Number(raw?.expiredCount || 0),
    };
  }

  private async getRevenueTrend(query: DashboardQueryDto) {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select("DATE(p.paidAt) as date")
      .addSelect('COALESCE(SUM(p.amount), 0)', 'revenue')
      .where("p.status IN ('PAID','MANUAL_VERIFIED')")
      .andWhere('p.paidAt IS NOT NULL')
      .groupBy('DATE(p.paidAt)')
      .orderBy('date', 'ASC')
      .limit(30);
    if (query.from) qb.andWhere('p.paidAt >= :from', { from: query.from });
    if (query.to) qb.andWhere('p.paidAt <= :to', { to: query.to });
    return qb.getRawMany<{ date: string; revenue: string }>();
  }

  private async getPaymentMethodBreakdown(query: DashboardQueryDto) {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select('p.provider', 'provider')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(p.amount), 0)', 'total')
      .groupBy('p.provider');
    if (query.from) qb.andWhere('p.createdAt >= :from', { from: query.from });
    if (query.to) qb.andWhere('p.createdAt <= :to', { to: query.to });
    return qb.getRawMany<{ provider: string; count: string; total: string }>();
  }

  private async getSubsidyUtilization(query: DashboardQueryDto) {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.subsidy), 0)', 'totalSubsidy')
      .addSelect('COALESCE(SUM(o.goodieBagFee), 0)', 'totalGoodieBag')
      .addSelect('COALESCE(SUM(o.applicationFee), 0)', 'totalApplicationFee')
      .innerJoin(Payment, 'p', 'p.order_id = o.id')
      .where("p.status IN ('PAID','MANUAL_VERIFIED')");
    if (query.from) qb.andWhere('o.createdAt >= :from', { from: query.from });
    if (query.to) qb.andWhere('o.createdAt <= :to', { to: query.to });
    const raw = await qb.getRawOne();
    return {
      totalSubsidy: Number(raw?.totalSubsidy || 0),
      totalGoodieBag: Number(raw?.totalGoodieBag || 0),
      totalApplicationFee: Number(raw?.totalApplicationFee || 0),
    };
  }
}
