export const QRIS_PROVIDER = 'QRIS_PROVIDER';

export interface QrisProvider {
  generateQris(amount: number, referenceId: string): Promise<{
    qrisPayload: string;
    expiresAt: Date;
  }>;
  verifyPayment(referenceId: string): Promise<boolean>;
  getPaymentStatus(referenceId: string): Promise<string>;
  getName(): string;
}
