import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  CreateQrisRequest,
  CreateQrisResult,
  NormalizedWebhook,
  PaymentGatewayProvider,
} from './payment-gateway.provider';

@Injectable()
export class MockQrisProvider implements PaymentGatewayProvider {
  readonly name = 'mock';

  async createDynamicQris(request: CreateQrisRequest): Promise<CreateQrisResult> {
    const nonce = randomBytes(12).toString('hex');
    return {
      providerReference: `MOCK-${nonce}`,
      qrisPayload: `SPADM-MOCK-QRIS:${request.referenceId}:${request.amount}:${nonce}`,
    };
  }

  async verifyAndNormalizeWebhook(
    payload: Record<string, unknown>,
  ): Promise<NormalizedWebhook> {
    return {
      eventType: String(payload.eventType || 'payment.updated'),
      referenceId: String(payload.referenceId || ''),
      amount: Number(payload.amount),
      status: String(payload.status).toUpperCase() as NormalizedWebhook['status'],
    };
  }
}
