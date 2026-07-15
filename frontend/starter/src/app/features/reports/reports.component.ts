import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.component.html',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
})
export class ReportsComponent implements OnInit {
  summary: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get(`${environment.apiUrl}/bazaar/reports/dashboard`).subscribe((res: any) => {
      this.summary = res.kpis;
    });
  }

  exportExcel() {
    this.http.get(`${environment.apiUrl}/bazaar/reports/transactions.xlsx`, { responseType: 'blob' })
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transaksi-bazar-${Date.now()}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  exportPdf() {
    this.http.get(`${environment.apiUrl}/bazaar/reports/summary.pdf`, { responseType: 'blob' })
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-bazar-${Date.now()}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
