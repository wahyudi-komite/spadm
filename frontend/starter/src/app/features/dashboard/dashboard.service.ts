import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { DashboardData } from './dashboard.types';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getDashboard() {
    return this.http.get<DashboardData>(`${environment.apiUrl}/bazaar/reports/dashboard`);
  }
}
