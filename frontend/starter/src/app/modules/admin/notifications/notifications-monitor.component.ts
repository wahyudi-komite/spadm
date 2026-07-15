import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';
import { environment } from 'environments/environment';
import { QrCodeComponent } from 'ng-qrcode';
import { finalize, forkJoin } from 'rxjs';

interface Delivery {
  id: number;
  recipient: string;
  template: string;
  status: string;
  attempts: number;
  lastError: string | null;
  createdAt: string;
}

interface WhatsAppStatus {
  provider: string;
  state: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'QR_REQUIRED' | 'DISABLED';
  qrCode: string | null;
  lastConnectedAt: string | null;
  lastError: string | null;
}

interface DeliverySummary {
  total: number;
  pendingWork: number;
  byStatus: Record<string, number>;
}

interface MonitorSummary {
  whatsapp: WhatsAppStatus;
  deliveries: DeliverySummary;
}

@Component({
  selector: 'admin-notifications-monitor',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    QrCodeComponent,
  ],
  templateUrl: './notifications-monitor.component.html',
})
export class NotificationsMonitorComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly feedback = inject(DialogFeedbackService);

  summary: MonitorSummary | null = null;
  deliveries: Delivery[] = [];
  loading = true;
  connecting = false;
  retryingId: number | null = null;

  readonly statuses = ['PENDING', 'PROCESSING', 'RETRY', 'SENT', 'DELIVERED', 'FAILED'];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    forkJoin({
      summary: this.http.get<MonitorSummary>(`${environment.apiUrl}/notifications/deliveries-summary`),
      deliveries: this.http.get<any>(`${environment.apiUrl}/notifications/deliveries?limit=50`),
    }).pipe(
      finalize(() => this.loading = false),
    ).subscribe({
      next: ({ summary, deliveries }) => {
        this.summary = summary;
        this.deliveries = deliveries.data;
      },
      error: (error) => {
        this.feedback.error(error.error?.message || 'Monitoring notifikasi gagal dimuat.');
      },
    });
  }

  connectWhatsApp() {
    this.connecting = true;
    this.http.post<WhatsAppStatus>(`${environment.apiUrl}/notifications/whatsapp/connect`, {}).pipe(
      finalize(() => this.connecting = false),
    ).subscribe({
      next: (whatsapp) => {
        this.summary = { ...this.summary, whatsapp };
      },
      error: (error) => {
        this.feedback.error(error.error?.message || 'WhatsApp gagal dihubungkan.');
      },
    });
  }

  retry(delivery: Delivery) {
    this.retryingId = delivery.id;
    this.http.post(
      `${environment.apiUrl}/notifications/deliveries/${delivery.id}/retry`,
      {},
    ).pipe(
      finalize(() => this.retryingId = null),
    ).subscribe({
      next: () => this.load(),
      error: (error) => {
        this.feedback.error(error.error?.message || 'Pengiriman gagal dijadwalkan ulang.');
      },
    });
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
      PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
      RETRY: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
      SENT: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200',
      DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    };
    return classes[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  }
}
