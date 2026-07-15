import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { environment } from 'environments/environment';

interface FinanceData {
  kpis: { totalRevenue: number; totalPayments: number; successfulPayments: number; pendingCount: number; expiredCount: number };
  revenueTrend: Array<{ date: string; revenue: string }>;
  paymentMethodBreakdown: Array<{ provider: string; count: string; total: string }>;
  subsidyUtilization: { totalSubsidy: number; totalGoodieBag: number; totalApplicationFee: number };
}

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  templateUrl: './finance-dashboard.component.html',
  imports: [CommonModule, NgApexchartsModule],
})
export class FinanceDashboardComponent implements OnInit {
  data: FinanceData | null = null;
  trendChart: ApexOptions;
  methodChart: ApexOptions;

  constructor(private http: HttpClient) {
    this.trendChart = {
      chart: { type: 'line', height: 300, toolbar: { show: false } },
      stroke: { curve: 'smooth' },
      xaxis: { categories: [] },
      series: [{ name: 'Revenue', data: [] }],
      colors: ['#22c55e'],
    };
    this.methodChart = {
      chart: { type: 'pie', height: 300 },
      labels: [],
      series: [],
    };
  }

  ngOnInit() {
    this.http.get<FinanceData>(`${environment.apiUrl}/finance/dashboard`).subscribe((res) => {
      this.data = res;
      this.trendChart = {
        ...this.trendChart,
        xaxis: { categories: res.revenueTrend.map((r) => r.date?.slice(5) || '') },
        series: [{ name: 'Revenue', data: res.revenueTrend.map((r) => Number(r.revenue)) }],
      };
      this.methodChart = {
        ...this.methodChart,
        labels: res.paymentMethodBreakdown.map((m) => m.provider || 'Unknown'),
        series: res.paymentMethodBreakdown.map((m) => Number(m.total)),
      };
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }
}
