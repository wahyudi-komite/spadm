import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService } from './dashboard.service';
import { DashboardData } from './dashboard.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatButtonModule, MatIconModule, NgApexchartsModule],
})
export class DashboardComponent implements OnInit {
  data: DashboardData | null = null;
  areaChart: ApexOptions;
  productChart: ApexOptions;

  constructor(private service: DashboardService) {
    this.areaChart = {
      chart: { type: 'bar', height: 300 },
      xaxis: { categories: [] },
      series: [{ name: 'Total', data: [] }, { name: 'Dibayar', data: [] }],
      colors: ['#6366f1', '#22c55e'],
    };
    this.productChart = {
      chart: { type: 'pie', height: 300 },
      labels: [],
      series: [],
      colors: ['#6366f1', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6', '#06b6d4'],
    };
  }

  ngOnInit() {
    this.service.getDashboard().subscribe((res) => {
      this.data = res;
      this.areaChart = {
        ...this.areaChart,
        xaxis: { categories: res.byArea.map((a) => a.label) },
        series: [
          { name: 'Total', data: res.byArea.map((a) => a.total) },
          { name: 'Dibayar', data: res.byArea.map((a) => a.paid) },
        ],
      };
      this.productChart = {
        ...this.productChart,
        labels: res.byProduct.map((p) => p.productName),
        series: res.byProduct.map((p) => p.quantity),
      };
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }
}
