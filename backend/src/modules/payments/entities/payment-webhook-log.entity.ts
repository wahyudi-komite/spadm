import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payment_webhook_logs')
export class PaymentWebhookLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  provider: string;

  @Column({ length: 100, nullable: true })
  eventType: string;

  @Column({ length: 255, nullable: true })
  externalReference: string;

  @Column({ type: 'json' })
  payload: Record<string, unknown>;

  @Column({ default: false })
  signatureValid: boolean;

  @Column({ length: 30 })
  processingStatus: string;

  @Column({ length: 500, nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  receivedAt: Date;

  @Column({ nullable: true })
  processedAt: Date;
}
