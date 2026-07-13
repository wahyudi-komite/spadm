export const WHATSAPP_PROVIDER = 'WHATSAPP_PROVIDER';

export interface WhatsAppConnectionStatus {
  provider: string;
  state: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'QR_REQUIRED' | 'DISABLED';
  qrCode: string | null;
  lastConnectedAt: Date | null;
  lastError: string | null;
}

export interface WhatsAppProvider {
  readonly name: string;
  sendText(phone: string, message: string): Promise<string>;
  getStatus(): WhatsAppConnectionStatus;
  connect?(): Promise<void>;
}
