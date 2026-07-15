import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-leadership-dashboard',
  standalone: true,
  templateUrl: './leadership-dashboard.component.html',
  imports: [CommonModule, NgApexchartsModule],
})
export class LeadershipDashboardComponent implements OnInit {
  data: any = null;
  areaChart: ApexOptions;

  constructor(private http: HttpClient) {
    this.areaChart = {
      chart: { type: 'bar', height: 300 },
      xaxis: { categories: [] },
      series: [{ name: 'Total', data: [] }, { name: 'Dibayar', data: [] }],
      colors: ['#6366f1', '#22c55e'],
    };
  }

  ngOnInit() {
    this.http.get(`${environment.apiUrl}/bazaar/reports/dashboard`).subscribe((res: any) => {
      this.data = res;
      this.areaChart = {
        ...this.areaChart,
        xaxis: { categories: res.byArea?.map((a: any) => a.label) || [] },
        series: [
          { name: 'Total', data: res.byArea?.map((a: any) => a.total) || [] },
          { name: 'Dibayar', data: res.byArea?.map((a: any) => a.paid) || [] },
        ],
      };
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }
}
