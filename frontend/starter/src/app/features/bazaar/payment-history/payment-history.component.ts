import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { environment } from 'environments/environment';

@Component({
  selector: 'bazaar-payment-history',
  templateUrl: './payment-history.component.html',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  standalone: true,
})
export class BazaarPaymentHistoryComponent implements OnInit {
  payments: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get(`${environment.apiUrl}/payments/history`).subscribe({
      next: (res: any) => {
        this.payments = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
