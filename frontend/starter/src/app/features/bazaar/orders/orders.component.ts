import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { environment } from 'environments/environment';

@Component({
  selector: 'bazaar-orders',
  templateUrl: './orders.component.html',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule],
  standalone: true
})
export class BazaarOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  cancellingId: number | null = null;

  paymentData: { [orderId: number]: any } = {};
  tokenData: { [orderId: number]: any } = {};

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/bazaar/orders/me`).subscribe({
      next: (res: any) => {
        this.orders = res;
        this.loading = false;

        this.orders.forEach(order => {
          if (order.status === 'PENDING') {
            this.loadPayment(order.id);
          } else if (order.status === 'PAID' || order.status === 'CONFIRMED' || order.status === 'COMPLETED') {
            this.loadToken(order.id);
          }
        });
      },
      error: () => this.loading = false
    });
  }

  loadPayment(orderId: number) {
    this.http.get(`${environment.apiUrl}/payments/order/${orderId}`).subscribe({
      next: (res: any) => {
        if (!res) {
          this.http.post(`${environment.apiUrl}/payments/generate/${orderId}`, {}).subscribe(payRes => {
            this.paymentData[orderId] = payRes;
          });
        } else {
          this.paymentData[orderId] = res;
        }
      }
    });
  }

  loadToken(orderId: number) {
    this.http.get(`${environment.apiUrl}/bazaar/distributions/token/${orderId}`).subscribe(res => {
      this.tokenData[orderId] = res;
    });
  }

  cancelOrder(orderId: number) {
    const confirmed = confirm('Yakin ingin membatalkan pesanan ini?');
    if (!confirmed) return;

    this.cancellingId = orderId;
    this.http.patch(`${environment.apiUrl}/bazaar/orders/${orderId}/cancel`, {}).subscribe({
      next: () => {
        this.cancellingId = null;
        this.loadOrders();
      },
      error: (err) => {
        this.cancellingId = null;
        alert('Gagal membatalkan: ' + (err.error?.message || err.message));
      }
    });
  }
}
