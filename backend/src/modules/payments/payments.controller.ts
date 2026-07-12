import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate/:orderId')
  generatePayment(@Param('orderId') orderId: number) {
    return this.paymentsService.generatePayment(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  getPaymentByOrder(@Param('orderId') orderId: number) {
    return this.paymentsService.getPaymentByOrder(orderId);
  }

  @Post('webhook/simulate')
  simulateWebhookSuccess(@Body() body: { referenceId: string }) {
    return this.paymentsService.simulateWebhookSuccess(body.referenceId);
  }
}
