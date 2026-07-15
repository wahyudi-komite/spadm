import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';
import { environment } from 'environments/environment';
import { QrCodeComponent } from 'ng-qrcode';
import { forkJoin, of, switchMap, takeWhile, timer } from 'rxjs';

@Component({
  selector: 'bazaar-payment',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    QrCodeComponent,
    RouterLink,
  ],
  templateUrl: './payment.component.html',
})
export class BazaarPaymentComponent implements OnInit {
  order: any = null;
  payment: any = null;
  loading = true;
  errorMessage = '';
  secondsLeft = 0;

  private readonly destroyRef = inject(DestroyRef);
  private readonly orderId = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  private readonly http = inject(HttpClient);
  private readonly feedback = inject(DialogFeedbackService);

  ngOnInit() {
    if (!Number.isInteger(this.orderId) || this.orderId <= 0) {
      this.loading = false;
      this.errorMessage = 'ID pesanan tidak valid.';
      return;
    }

    this.loadOrderAndPayment();
  }

  get paymentComplete(): boolean {
    return ['PAID', 'MANUAL_VERIFIED'].includes(this.payment?.status)
      || ['CONFIRMED', 'PAID', 'COMPLETED'].includes(this.order?.status);
  }

  get paymentExpired(): boolean {
    return this.payment?.status === 'EXPIRED' || this.order?.status === 'EXPIRED';
  }

  get countdown(): string {
    const hours = Math.floor(this.secondsLeft / 3600);
    const minutes = Math.floor((this.secondsLeft % 3600) / 60);
    const seconds = this.secondsLeft % 60;
    return [hours, minutes, seconds].map(value => String(value).padStart(2, '0')).join(':');
  }

  private loadOrderAndPayment() {
    this.http.get(`${environment.apiUrl}/bazaar/orders/${this.orderId}`).pipe(
      switchMap((order: any) => {
        this.order = order;
        if (order.status !== 'PENDING') return of(null);
        return this.http.get(`${environment.apiUrl}/payments/order/${this.orderId}`);
      }),
      switchMap((payment: any) => {
        if (this.order.status !== 'PENDING' || payment) return of(payment);
        return this.http.post(`${environment.apiUrl}/payments/generate/${this.orderId}`, {});
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (payment: any) => {
        this.payment = payment;
        this.loading = false;
        this.startCountdown();
        this.startPolling();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Pembayaran tidak dapat disiapkan.';
      },
    });
  }

  private startPolling() {
    if (!this.payment || this.paymentComplete || this.paymentExpired) return;

    timer(5000, 5000).pipe(
      switchMap(() => forkJoin({
        order: this.http.get(`${environment.apiUrl}/bazaar/orders/${this.orderId}`),
        payment: this.http.get(`${environment.apiUrl}/payments/order/${this.orderId}`),
      })),
      takeWhile((result: any) => {
        const paymentPending = result.payment?.status === 'PENDING';
        const orderPending = result.order?.status === 'PENDING';
        return paymentPending && orderPending;
      }, true),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (result: any) => {
        this.order = result.order;
        this.payment = result.payment;
      },
      error: () => {
        this.feedback.error('Status pembayaran gagal diperbarui. Silakan muat ulang halaman.');
      },
    });
  }

  private startCountdown() {
    if (!this.payment?.expiredAt) return;

    timer(0, 1000).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      const remaining = new Date(this.payment.expiredAt).getTime() - Date.now();
      this.secondsLeft = Math.max(0, Math.floor(remaining / 1000));
    });
  }
}