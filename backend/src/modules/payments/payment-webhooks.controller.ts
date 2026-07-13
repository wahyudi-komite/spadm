import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('webhooks/payments')
export class PaymentWebhooksController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':provider')
  process(
    @Param('provider') provider: string,
    @Body() payload: Record<string, unknown>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    return this.paymentsService.processWebhook(provider, payload, headers);
  }
}
