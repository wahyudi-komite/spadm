import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentsService } from './payments.service';

@Injectable()
export class PaymentsScheduler {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { timeZone: 'Asia/Jakarta' })
  expirePayments() {
    return this.paymentsService.expirePendingPayments();
  }
}
