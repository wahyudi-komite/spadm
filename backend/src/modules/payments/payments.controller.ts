import {
  Controller, Post, Body, Get, Param, Patch, Headers, Req, UseGuards, ParseIntPipe, BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards';
import { CurrentUser, Permissions } from '../../common/decorators';
import { ManualVerifyPaymentDto } from './dto/manual-verify-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate/:orderId')
  generatePayment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() userId: number,
  ) {
    return this.paymentsService.generatePayment(orderId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  getPaymentByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() userId: number,
  ) {
    return this.paymentsService.getPaymentByOrder(orderId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getPaymentHistory(@CurrentUser() userId: number) {
    return this.paymentsService.getPaymentHistory(userId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('bazaar.payment.manual_verify')
  @Post('manual-verify')
  manualVerify(
    @Body() dto: ManualVerifyPaymentDto & { referenceId: string },
    @CurrentUser() userId: number,
  ) {
    const { referenceId, ...rest } = dto as any;
    if (!referenceId) throw new BadRequestException('referenceId is required');
    return this.paymentsService.manualVerify(referenceId, rest, userId);
  }

  @Post('webhook/:provider')
  async webhook(
    @Param('provider') provider: string,
    @Body() payload: Record<string, unknown>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    return this.paymentsService.processWebhook(provider, payload, headers);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('bazaar.payment.manual_verify')
  @Post('webhook/simulate')
  simulateWebhookSuccess(@Body() body: { referenceId: string }) {
    if (!body.referenceId) {
      throw new BadRequestException('referenceId is required');
    }
    return this.paymentsService.simulateWebhookSuccess(body.referenceId);
  }
}
