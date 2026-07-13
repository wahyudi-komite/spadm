export interface CreateQrisRequest {
  referenceId: string;
  amount: number;
  expiresAt: Date;
  description: string;
}

export interface CreateQrisResult {
  providerReference: string;
  qrisPayload: string;
}

export interface NormalizedWebhook {
  eventType: string;
  referenceId: string;
  amount: number;
  status: 'PAID' | 'FAILED' | 'EXPIRED';
}

export interface PaymentGatewayProvider {
  readonly name: string;
  createDynamicQris(request: CreateQrisRequest): Promise<CreateQrisResult>;
  verifyAndNormalizeWebhook(
    payload: Record<string, unknown>,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<NormalizedWebhook>;
}
