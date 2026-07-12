import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { environment } from 'environments/environment';

@Component({
  selector: 'bazaar-orders',
  templateUrl: './orders.component.html',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  standalone: true
})
export class BazaarOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;

  // Active payment and token data
  paymentData: { [orderId: number]: any } = {};
  tokenData: { [orderId: number]: any } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/bazaar/orders/me`).subscribe({
      next: (res: any) => {
        this.orders = res;
        this.loading = false;
        
        // For each order, fetch payment or token if applicable
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
          // If no payment found, generate it
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

  simulatePaymentSuccess(orderId: number) {
    const payment = this.paymentData[orderId];
    if (!payment) return;
    
    this.http.post(`${environment.apiUrl}/payments/webhook/simulate`, {
      referenceId: payment.referenceId
    }).subscribe(() => {
      alert('Pembayaran berhasil disimulasikan!');
      this.loadOrders(); // Reload to get new status and tokens
    });
  }
}
