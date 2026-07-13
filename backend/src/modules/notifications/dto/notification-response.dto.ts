export class NotificationResponseDto {
  id: number;
  type: string;
  title: string;
  message: string;
  deepLink: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}
