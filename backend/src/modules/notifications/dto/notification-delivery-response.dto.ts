export class NotificationDeliveryResponseDto {
  id: number;
  notificationId: number;
  channel: string;
  recipient: string;
  template: string;
  status: string;
  attempts: number;
  lastError: string | null;
  providerMessageId: string | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
}
