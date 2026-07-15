# Dashboard & Laporan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all Phase 9 dashboards (admin, finance, leadership) with export functionality

**Architecture:** Backend already has `ReportsModule` with dashboard API, Excel/PDF export, and receipt PDF. Need Finance Dashboard module (new), Leadership endpoint (reuse reports), and complete frontend pages using ApexCharts + ngx-countup.

**Tech Stack:** NestJS + TypeORM (backend), Angular standalone + ApexCharts + ngx-countup + PrimeNG (frontend), PDFKit + ExcelJS (export)

## Global Constraints

- Follow existing patterns: `RolesComponent` for admin table style, `ReportsService` for backend module style
- All new backend endpoints need JwtAuthGuard + PermissionsGuard + @Permissions decorator
- All new frontend routes need PermissionGuard with appropriate permission
- Use `inject()` for DI in frontend (not constructor) — consistent with notifications-monitor
- Use constructor DI in backend — consistent with all services
- Currency in `id-ID` locale, timezone `Asia/Jakarta`
- All new files must be committed individually with descriptive messages

---

## File Structure

### Backend (new files)
- `backend/src/modules/finance/dashboard/dashboard.module.ts`
- `backend/src/modules/finance/dashboard/dashboard.controller.ts`
- `backend/src/modules/finance/dashboard/dashboard.service.ts`
- `backend/src/modules/finance/dashboard/entities/` (none needed — uses existing entities)
- `backend/src/modules/finance/dashboard/dto/dashboard-query.dto.ts`
- `backend/src/modules/finance/finance.module.ts` (parent module)

### Backend (modified files)
- `backend/src/app.module.ts` — register FinanceModule

### Frontend (new files)
- `frontend/starter/src/app/features/dashboard/dashboard.types.ts`
- `frontend/starter/src/app/features/dashboard/dashboard.service.ts`
- `frontend/starter/src/app/features/dashboard/dashboard.component.ts` (rewrite)
- `frontend/starter/src/app/features/dashboard/dashboard.component.html` (new, extract from inline template)
- `frontend/starter/src/app/features/dashboard/components/kpi-card/kpi-card.component.ts`
- `frontend/starter/src/app/features/reports/reports.component.ts`
- `frontend/starter/src/app/features/reports/reports.component.html`
- `frontend/starter/src/app/features/reports/reports.routes.ts`
- `frontend/starter/src/app/features/finance/finance-dashboard.component.ts`
- `frontend/starter/src/app/features/finance/finance-dashboard.component.html`
- `frontend/starter/src/app/features/finance/finance.routes.ts`

### Frontend (modified files)
- `frontend/starter/src/app/features/dashboard/dashboard.routes.ts`
- (no route change needed — dashboard already at `/dashboard`)
- `frontend/starter/src/app/modules/admin/admin.routes.ts`
- `frontend/starter/src/app/mock-api/common/navigation/data.ts`

---

### Task 1: Backend — Finance Dashboard Module

**Files:**
- Create: `backend/src/modules/finance/finance.module.ts`
- Create: `backend/src/modules/finance/dashboard/dashboard.module.ts`
- Create: `backend/src/modules/finance/dashboard/dashboard.controller.ts`
- Create: `backend/src/modules/finance/dashboard/dashboard.service.ts`
- Create: `backend/src/modules/finance/dashboard/dto/dashboard-query.dto.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**
- Produces: `GET /finance/dashboard` endpoint returning `{ kpis, revenueTrend, paymentMethodBreakdown, subsidyUtilization }`
- Consumes: `BazaarOrder` entity, `Payment` entity, existing TypeORM repositories

- [ ] **Step 1: Create Finance parent module**

```typescript
// backend/src/modules/finance/finance.module.ts
import { Module } from '@nestjs/common';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [DashboardModule],
})
export class FinanceModule {}
```

- [ ] **Step 2: Create Dashboard module**

```typescript
// backend/src/modules/finance/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BazaarOrder } from '../../bazaar/orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([BazaarOrder, Payment])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
```

- [ ] **Step 3: Create DashboardQueryDto**

```typescript
// backend/src/modules/finance/dashboard/dto/dashboard-query.dto.ts
export class DashboardQueryDto {
  from?: string;
  to?: string;
}
```

- [ ] **Step 4: Create Dashboard controller**

```typescript
// backend/src/modules/finance/dashboard/dashboard.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Permissions } from '../../../common/decorators';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@ApiTags('Finance Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finance/dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  @Permissions('finance.dashboard.read')
  getDashboard(@Query() query: DashboardQueryDto) {
    return this.service.getDashboard(query);
  }
}
```

- [ ] **Step 5: Create Dashboard service**

```typescript
// backend/src/modules/finance/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BazaarOrder } from '../../bazaar/orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(BazaarOrder)
    private readonly orderRepo: Repository<BazaarOrder>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async getDashboard(query: DashboardQueryDto) {
    const kpis = await this.getKpis(query);
    const revenueTrend = await this.getRevenueTrend(query);
    const paymentMethodBreakdown = await this.getPaymentMethodBreakdown(query);
    const subsidyUtilization = await this.getSubsidyUtilization(query);
    return { kpis, revenueTrend, paymentMethodBreakdown, subsidyUtilization };
  }

  private async getKpis(query: DashboardQueryDto) {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'totalRevenue')
      .addSelect('COUNT(*)', 'totalPayments')
      .addSelect("SUM(CASE WHEN p.status IN ('PAID','MANUAL_VERIFIED') THEN 1 ELSE 0 END)", 'successfulPayments')
      .addSelect("SUM(CASE WHEN p.status = 'PENDING' THEN 1 ELSE 0 END)", 'pendingCount')
      .addSelect("SUM(CASE WHEN p.status = 'EXPIRED' THEN 1 ELSE 0 END)", 'expiredCount');
    if (query.from) qb.andWhere('p.createdAt >= :from', { from: query.from });
    if (query.to) qb.andWhere('p.createdAt <= :to', { to: query.to });
    const raw = await qb.getRawOne();
    return {
      totalRevenue: Number(raw?.totalRevenue || 0),
      totalPayments: Number(raw?.totalPayments || 0),
      successfulPayments: Number(raw?.successfulPayments || 0),
      pendingCount: Number(raw?.pendingCount || 0),
      expiredCount: Number(raw?.expiredCount || 0),
    };
  }

  private async getRevenueTrend(query: DashboardQueryDto) {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select("DATE(p.paidAt) as date")
      .addSelect('COALESCE(SUM(p.amount), 0)', 'revenue')
      .where("p.status IN ('PAID','MANUAL_VERIFIED')")
      .andWhere('p.paidAt IS NOT NULL')
      .groupBy('DATE(p.paidAt)')
      .orderBy('date', 'ASC')
      .limit(30);
    if (query.from) qb.andWhere('p.paidAt >= :from', { from: query.from });
    if (query.to) qb.andWhere('p.paidAt <= :to', { to: query.to });
    return qb.getRawMany<{ date: string; revenue: string }>();
  }

  private async getPaymentMethodBreakdown(query: DashboardQueryDto) {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select('p.provider', 'provider')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(p.amount), 0)', 'total')
      .groupBy('p.provider');
    if (query.from) qb.andWhere('p.createdAt >= :from', { from: query.from });
    if (query.to) qb.andWhere('p.createdAt <= :to', { to: query.to });
    return qb.getRawMany<{ provider: string; count: string; total: string }>();
  }

  private async getSubsidyUtilization(query: DashboardQueryDto) {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.subsidy), 0)', 'totalSubsidy')
      .addSelect('COALESCE(SUM(o.goodieBagFee), 0)', 'totalGoodieBag')
      .addSelect('COALESCE(SUM(o.applicationFee), 0)', 'totalApplicationFee')
      .innerJoin('o.payment', 'p')
      .where("p.status IN ('PAID','MANUAL_VERIFIED')");
    if (query.from) qb.andWhere('o.createdAt >= :from', { from: query.from });
    if (query.to) qb.andWhere('o.createdAt <= :to', { to: query.to });
    const raw = await qb.getRawOne();
    return {
      totalSubsidy: Number(raw?.totalSubsidy || 0),
      totalGoodieBag: Number(raw?.totalGoodieBag || 0),
      totalApplicationFee: Number(raw?.totalApplicationFee || 0),
    };
  }
}
```

- [ ] **Step 6: Register FinanceModule in AppModule**

Edit `backend/src/app.module.ts`:
- Add import of `FinanceModule` at the top
- Add `FinanceModule` to the `imports` array (after `ReportsModule`)

```typescript
// Add after existing imports
import { FinanceModule } from './modules/finance/finance.module';

// Add to imports array
FinanceModule,
```

- [ ] **Step 7: Verify compilation**

```bash
cd backend && npx tsc --noEmit --pretty 2>&1 | grep -i "error"
```

Expected: Only pre-existing errors in spec files. No errors related to finance dashboard.

- [ ] **Step 8: Commit**

```bash
git add backend/src/modules/finance/ backend/src/app.module.ts
git commit -m "feat: add finance dashboard module with revenue trends and subsidy utilization"
```

---

### Task 2: Backend — Fix reports index and permission check

**Note:** The PIC dashboard is already complete. No changes needed there.  
The Reports module's `canReadReports()` and `dashboard()` work. Finance dashboard already has `finance.dashboard.read` permission in seed.  
This task is intentionally empty — no backend changes needed beyond Task 1.

- [ ] **Step 1: Verify existing endpoints work**

```bash
cd backend && sleep 3
curl -s http://localhost:3000/api/health | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('status') == 'ok' else 'FAIL')" 2>/dev/null || echo "Server may need restart"
```

---

### Task 3: Frontend — Admin Dashboard (replace placeholder)

**Files:**
- Rewrite: `frontend/starter/src/app/features/dashboard/dashboard.component.ts`
- Create: `frontend/starter/src/app/features/dashboard/dashboard.component.html`
- Create: `frontend/starter/src/app/features/dashboard/dashboard.types.ts`
- Create: `frontend/starter/src/app/features/dashboard/dashboard.service.ts`
- Modify: `frontend/starter/src/app/features/dashboard/dashboard.routes.ts`

**Interfaces:**
- Consumes: `GET /bazaar/reports/dashboard` from ReportsService backend
- Produces: Dashboard page with KPI cards, charts, and tables

- [ ] **Step 1: Create dashboard types**

```typescript
// frontend/starter/src/app/features/dashboard/dashboard.types.ts
export interface DashboardData {
  kpis: {
    activeMembers: number;
    totalOrders: number;
    paidOrders: number;
    pendingPayments: number;
    expiredPayments: number;
    distributedOrders: number;
    participationPercentage: number;
    receivedAmount: number;
    totalSubsidy: number;
    totalGoodieBag: number;
    totalApplicationFee: number;
  };
  byArea: GroupedSummary[];
  byBatch: GroupedSummary[];
  byProduct: ProductSummary[];
}

export interface GroupedSummary {
  label: string;
  total: number;
  paid: number;
}

export interface ProductSummary {
  productName: string;
  quantity: number;
}
```

- [ ] **Step 2: Create Dashboard service**

```typescript
// frontend/starter/src/app/features/dashboard/dashboard.service.ts
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
```

- [ ] **Step 3: Rewrite Dashboard component**

```typescript
// frontend/starter/src/app/features/dashboard/dashboard.component.ts
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
```

- [ ] **Step 4: Create Dashboard template**

```html
<!-- frontend/starter/src/app/features/dashboard/dashboard.component.html -->
<div class="p-8">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Dashboard Bazar</h1>
    <div></div>
  </div>

  @if (!data) {
    <div class="flex justify-center py-16">
      <p class="text-hint">Memuat data dashboard...</p>
    </div>
  } @else {
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Total Transaksi</p>
        <p class="text-3xl font-bold mt-1">{{ data.kpis.totalOrders }}</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Pembayaran Berhasil</p>
        <p class="text-3xl font-bold mt-1 text-green-600">{{ data.kpis.paidOrders }}</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Payment Pending</p>
        <p class="text-3xl font-bold mt-1 text-amber-600">{{ data.kpis.pendingPayments }}</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Partisipasi</p>
        <p class="text-3xl font-bold mt-1">{{ data.kpis.participationPercentage }}%</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Penerimaan</p>
        <p class="text-3xl font-bold mt-1">{{ formatCurrency(data.kpis.receivedAmount) }}</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Subsidi</p>
        <p class="text-3xl font-bold mt-1">{{ formatCurrency(data.kpis.totalSubsidy) }}</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Goodie Bag</p>
        <p class="text-3xl font-bold mt-1">{{ formatCurrency(data.kpis.totalGoodieBag) }}</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Sudah Distribusi</p>
        <p class="text-3xl font-bold mt-1">{{ data.kpis.distributedOrders }}</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-card rounded-2xl shadow p-5">
        <h2 class="text-lg font-semibold mb-4">Per Area</h2>
        <apx-chart [chart]="areaChart.chart!" [series]="areaChart.series!" [xaxis]="areaChart.xaxis!" [colors]="areaChart.colors!"></apx-chart>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <h2 class="text-lg font-semibold mb-4">Per Produk</h2>
        <apx-chart [chart]="productChart.chart!" [series]="productChart.series!" [labels]="productChart.labels!" [colors]="productChart.colors!"></apx-chart>
      </div>
    </div>

    <!-- By Area Table -->
    <div class="bg-card rounded-2xl shadow overflow-hidden">
      <div class="p-5 border-b">
        <h2 class="text-lg font-semibold">Rekap per Area</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-secondary border-b">
              <th class="p-3 font-medium">Area</th>
              <th class="p-3 font-medium">Total</th>
              <th class="p-3 font-medium">Dibayar</th>
            </tr>
          </thead>
          <tbody>
            @for (area of data.byArea; track area.label) {
              <tr class="border-b last:border-0 hover:bg-gray-50">
                <td class="p-3">{{ area.label || '-' }}</td>
                <td class="p-3">{{ area.total }}</td>
                <td class="p-3">{{ area.paid }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  }
</div>
```

- [ ] **Step 5: Update dashboard routes**

```typescript
// frontend/starter/src/app/features/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

export default [
  { path: '', component: DashboardComponent },
] as Routes;
```

The route file stays the same — no changes needed beyond the component rewrite.

- [ ] **Step 6: Verify compilation**

```bash
cd frontend/starter && npx tsc --noEmit --pretty 2>&1 | grep -i "dashboard"
```

Expected: No errors related to dashboard.

- [ ] **Step 7: Commit**

```bash
git add frontend/starter/src/app/features/dashboard/
git commit -m "feat: replace admin dashboard placeholder with KPI cards and ApexCharts"
```

---

### Task 4: Frontend — Reports & Export Page

**Files:**
- Create: `frontend/starter/src/app/features/reports/reports.component.ts`
- Create: `frontend/starter/src/app/features/reports/reports.component.html`
- Create: `frontend/starter/src/app/features/reports/reports.routes.ts`
- Modify: `frontend/starter/src/app/app.routes.ts`

**Interfaces:**
- Consumes: Backend report endpoints (dashboard API, Excel, PDF)
- Produces: Admin report page with KPI display and export buttons

- [ ] **Step 1: Create Reports component**

```typescript
// frontend/starter/src/app/features/reports/reports.component.ts
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
```

- [ ] **Step 2: Create Reports template**

```html
<!-- frontend/starter/src/app/features/reports/reports.component.html -->
<div class="p-8 max-w-4xl">
  <h1 class="text-2xl font-bold mb-6">Laporan & Ekspor</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <mat-card class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <mat-icon class="text-primary">assessment</mat-icon>
        <div>
          <h2 class="text-lg font-semibold">Ekspor Excel</h2>
          <p class="text-sm text-secondary">Download semua transaksi dalam format Excel</p>
        </div>
      </div>
      <button mat-flat-button color="primary" (click)="exportExcel()">
        <mat-icon>download</mat-icon> Download Excel
      </button>
    </mat-card>

    <mat-card class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <mat-icon class="text-warn">picture_as_pdf</mat-icon>
        <div>
          <h2 class="text-lg font-semibold">Ekspor PDF</h2>
          <p class="text-sm text-secondary">Download ringkasan laporan dalam format PDF</p>
        </div>
      </div>
      <button mat-flat-button color="warn" (click)="exportPdf()">
        <mat-icon>download</mat-icon> Download PDF
      </button>
    </mat-card>
  </div>

  @if (summary) {
    <mat-card class="mt-6 p-6">
      <h2 class="text-lg font-semibold mb-4">Ringkasan</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p class="text-sm text-secondary">Total Transaksi</p>
          <p class="text-xl font-bold">{{ summary.totalOrders }}</p>
        </div>
        <div>
          <p class="text-sm text-secondary">Pembayaran Berhasil</p>
          <p class="text-xl font-bold text-green-600">{{ summary.paidOrders }}</p>
        </div>
        <div>
          <p class="text-sm text-secondary">Pending</p>
          <p class="text-xl font-bold text-amber-600">{{ summary.pendingPayments }}</p>
        </div>
        <div>
          <p class="text-sm text-secondary">Penerimaan</p>
          <p class="text-xl font-bold">{{ summary.receivedAmount | number:'1.0-0' }}</p>
        </div>
        <div>
          <p class="text-sm text-secondary">Subsidi</p>
          <p class="text-xl font-bold">{{ summary.totalSubsidy | number:'1.0-0' }}</p>
        </div>
        <div>
          <p class="text-sm text-secondary">Partisipasi</p>
          <p class="text-xl font-bold">{{ summary.participationPercentage }}%</p>
        </div>
      </div>
    </mat-card>
  }
</div>
```

- [ ] **Step 3: Create Reports routes**

```typescript
// frontend/starter/src/app/features/reports/reports.routes.ts
import { Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';

export default [
  { path: '', component: ReportsComponent },
] as Routes;
```

- [ ] **Step 4: Register route in admin.routes.ts**

Add to `frontend/starter/src/app/modules/admin/admin.routes.ts` after existing routes:
```typescript
{
  path: 'reports',
  canActivate: [PermissionGuard],
  data: { permissions: ['bazaar.report.read'] },
  loadChildren: () => import('../../features/reports/reports.routes'),
},
```

- [ ] **Step 5: Verify compilation**

```bash
cd frontend/starter && npx tsc --noEmit --pretty 2>&1 | grep -i "reports"
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/starter/src/app/features/reports/
git commit -m "feat: add admin reports page with Excel and PDF export"
```

---

### Task 5: Frontend — Finance Dashboard Page

**Files:**
- Create: `frontend/starter/src/app/features/finance/finance-dashboard.component.ts`
- Create: `frontend/starter/src/app/features/finance/finance-dashboard.component.html`
- Create: `frontend/starter/src/app/features/finance/finance.routes.ts`
- Modify: `frontend/starter/src/app/modules/admin/admin.routes.ts`

**Interfaces:**
- Consumes: `GET /finance/dashboard` from Finance Dashboard backend
- Produces: Finance page with revenue KPIs, trend chart, payment method breakdown

- [ ] **Step 1: Create Finance Dashboard component**

```typescript
// frontend/starter/src/app/features/finance/finance-dashboard.component.ts
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
```

- [ ] **Step 2: Create Finance Dashboard template**

```html
<!-- frontend/starter/src/app/features/finance/finance-dashboard.component.html -->
<div class="p-8">
  <h1 class="text-2xl font-bold mb-6">Finance Dashboard</h1>

  @if (!data) {
    <div class="flex justify-center py-16">
      <p class="text-hint">Memuat data...</p>
    </div>
  } @else {
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Total Revenue</p>
        <p class="text-2xl font-bold mt-1 text-green-600">{{ formatCurrency(data.kpis.totalRevenue) }}</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Transaksi</p>
        <p class="text-2xl font-bold mt-1">{{ data.kpis.totalPayments }}</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Berhasil</p>
        <p class="text-2xl font-bold mt-1 text-green-600">{{ data.kpis.successfulPayments }}</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Pending</p>
        <p class="text-2xl font-bold mt-1 text-amber-600">{{ data.kpis.pendingCount }}</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Expired</p>
        <p class="text-2xl font-bold mt-1 text-red-600">{{ data.kpis.expiredCount }}</p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-card rounded-2xl shadow p-5">
        <h2 class="text-lg font-semibold mb-4">Revenue Trend (30 hari)</h2>
        <apx-chart [chart]="trendChart.chart!" [series]="trendChart.series!" [xaxis]="trendChart.xaxis!" [stroke]="trendChart.stroke!" [colors]="trendChart.colors!"></apx-chart>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <h2 class="text-lg font-semibold mb-4">Metode Pembayaran</h2>
        <apx-chart [chart]="methodChart.chart!" [series]="methodChart.series!" [labels]="methodChart.labels!"></apx-chart>
      </div>
    </div>

    <!-- Subsidy Utilization -->
    <div class="bg-card rounded-2xl shadow p-5">
      <h2 class="text-lg font-semibold mb-4">Utilisasi Subsidi & Biaya</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p class="text-sm text-secondary">Total Subsidi</p>
          <p class="text-xl font-bold">{{ formatCurrency(data.subsidyUtilization.totalSubsidy) }}</p>
        </div>
        <div>
          <p class="text-sm text-secondary">Goodie Bag</p>
          <p class="text-xl font-bold">{{ formatCurrency(data.subsidyUtilization.totalGoodieBag) }}</p>
        </div>
        <div>
          <p class="text-sm text-secondary">Biaya Aplikasi</p>
          <p class="text-xl font-bold">{{ formatCurrency(data.subsidyUtilization.totalApplicationFee) }}</p>
        </div>
      </div>
    </div>
  }
</div>
```

- [ ] **Step 3: Create Finance routes**

```typescript
// frontend/starter/src/app/features/finance/finance.routes.ts
import { Routes } from '@angular/router';
import { FinanceDashboardComponent } from './finance-dashboard.component';

export default [
  { path: '', component: FinanceDashboardComponent },
] as Routes;
```

- [ ] **Step 4: Register finance route in admin.routes.ts**

Add to `frontend/starter/src/app/modules/admin/admin.routes.ts`:
```typescript
{
  path: 'finance',
  canActivate: [PermissionGuard],
  data: { permissions: ['finance.dashboard.read'] },
  loadChildren: () => import('../../features/finance/finance.routes'),
},
```

- [ ] **Step 5: Verify compilation**

```bash
cd frontend/starter && npx tsc --noEmit --pretty 2>&1 | grep -i "finance"
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/starter/src/app/features/finance/
git commit -m "feat: add finance dashboard page with revenue trend and payment breakdown"
```

---

### Task 6: Frontend — Leadership Dashboard

**Files:**
- Create: `frontend/starter/src/app/features/leadership/leadership-dashboard.component.ts`
- Create: `frontend/starter/src/app/features/leadership/leadership-dashboard.component.html`
- Create: `frontend/starter/src/app/features/leadership/leadership.routes.ts`
- Modify: `frontend/starter/src/app/modules/admin/admin.routes.ts`

**Interfaces:**
- Consumes: `GET /bazaar/reports/dashboard` (same as admin dashboard, broader read permission)
- Produces: High-level read-only dashboard for leadership

- [ ] **Step 1: Create Leadership Dashboard component**

```typescript
// frontend/starter/src/app/features/leadership/leadership-dashboard.component.ts
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
```

- [ ] **Step 2: Create Leadership Dashboard template**

```html
<!-- frontend/starter/src/app/features/leadership/leadership-dashboard.component.html -->
<div class="p-8">
  <h1 class="text-2xl font-bold mb-2">Leadership Dashboard</h1>
  <p class="text-secondary mb-6">Ringkasan level tinggi aktivitas Bazar SPADM</p>

  @if (!data) {
    <div class="flex justify-center py-16">
      <p class="text-hint">Memuat data...</p>
    </div>
  } @else {
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Anggota Aktif</p>
        <p class="text-3xl font-bold mt-1">{{ data.kpis.activeMembers }}</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Partisipasi</p>
        <p class="text-3xl font-bold mt-1">{{ data.kpis.participationPercentage }}%</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Total Transaksi</p>
        <p class="text-3xl font-bold mt-1">{{ data.kpis.totalOrders }}</p>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <p class="text-secondary text-sm font-medium">Penerimaan</p>
        <p class="text-3xl font-bold mt-1 text-green-600">{{ formatCurrency(data.kpis.receivedAmount) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-card rounded-2xl shadow p-5">
        <h2 class="text-lg font-semibold mb-4">Per Area</h2>
        <apx-chart [chart]="areaChart.chart!" [series]="areaChart.series!" [xaxis]="areaChart.xaxis!" [colors]="areaChart.colors!"></apx-chart>
      </div>
      <div class="bg-card rounded-2xl shadow p-5">
        <h2 class="text-lg font-semibold mb-4">Ringkasan Keuangan</h2>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-secondary">Penerimaan</span>
            <span class="font-semibold">{{ formatCurrency(data.kpis.receivedAmount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary">Subsidi</span>
            <span class="font-semibold">{{ formatCurrency(data.kpis.totalSubsidy) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary">Goodie Bag</span>
            <span class="font-semibold">{{ formatCurrency(data.kpis.totalGoodieBag) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary">Biaya Aplikasi</span>
            <span class="font-semibold">{{ formatCurrency(data.kpis.totalApplicationFee) }}</span>
          </div>
          <div class="flex justify-between pt-2 border-t">
            <span class="font-semibold">Total Order Dibayar</span>
            <span class="font-semibold text-green-600">{{ data.kpis.paidOrders }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-card rounded-2xl shadow p-5">
      <h2 class="text-lg font-semibold mb-4">Status Order</h2>
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <p class="text-sm text-secondary">Pending</p>
          <p class="text-xl font-bold text-amber-600">{{ data.kpis.pendingPayments }}</p>
        </div>
        <div>
          <p class="text-sm text-secondary">Expired</p>
          <p class="text-xl font-bold text-red-600">{{ data.kpis.expiredPayments }}</p>
        </div>
        <div>
          <p class="text-sm text-secondary">Sudah Distribusi</p>
          <p class="text-xl font-bold">{{ data.kpis.distributedOrders }}</p>
        </div>
        <div>
          <p class="text-sm text-secondary">Subsidi Total</p>
          <p class="text-xl font-bold">{{ formatCurrency(data.kpis.totalSubsidy) }}</p>
        </div>
      </div>
    </div>
  }
</div>
```

- [ ] **Step 3: Create Leadership routes**

```typescript
// frontend/starter/src/app/features/leadership/leadership.routes.ts
import { Routes } from '@angular/router';
import { LeadershipDashboardComponent } from './leadership-dashboard.component';

export default [
  { path: '', component: LeadershipDashboardComponent },
] as Routes;
```

- [ ] **Step 4: Register leadership route in admin.routes.ts**

Add to `frontend/starter/src/app/modules/admin/admin.routes.ts`:
```typescript
{
  path: 'leadership',
  canActivate: [PermissionGuard],
  data: { permissions: ['finance.dashboard.read'] },
  loadChildren: () => import('../../features/leadership/leadership.routes'),
},
```

- [ ] **Step 5: Verify compilation**

```bash
cd frontend/starter && npx tsc --noEmit --pretty 2>&1 | grep -i "leadership"
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/starter/src/app/features/leadership/
git commit -m "feat: add leadership dashboard page with high-level KPIs"
```

---

### Task 7: Navigation & Route Updates

**Files:**
- Modify: `frontend/starter/src/app/modules/admin/admin.routes.ts`
- Modify: `frontend/starter/src/app/mock-api/common/navigation/data.ts`

**Note:** All new admin routes go into `admin.routes.ts` (not `app.routes.ts`), following the existing pattern. The `/dashboard` root path stays as default redirect, but the main admin dashboard lives at `/admin/dashboard`.

**Interfaces:**
- Consumes: All previous tasks' routes
- Produces: Updated navigation with links to dashboard, reports, finance, leadership

- [ ] **Step 1: Update navigation data**

Edit `frontend/starter/src/app/mock-api/common/navigation/data.ts`:

Add to the `admin` collapsable children (after `admin_members`):
```typescript
{
  id: 'admin_dashboard',
  title: 'Dashboard',
  type: 'basic',
  link: '/admin/dashboard'
},
{
  id: 'admin_reports',
  title: 'Laporan',
  type: 'basic',
  link: '/admin/reports'
},
{
  id: 'admin_finance',
  title: 'Finance',
  type: 'basic',
  link: '/admin/finance'
},
{
  id: 'admin_leadership',
  title: 'Leadership',
  type: 'basic',
  link: '/admin/leadership'
},
```

- [ ] **Step 2: Update admin.routes.ts**

Ensure all routes from Tasks 3-6 are properly registered in `frontend/starter/src/app/modules/admin/admin.routes.ts`:
- `/admin/dashboard` → dashboard feature routes (uses existing `/dashboard` route, no change needed)
- `/admin/reports` → reports feature routes
- `/admin/finance` → finance feature routes
- `/admin/leadership` → leadership feature routes

Each with `PermissionGuard` and appropriate permission. `PermissionGuard` is already imported in `admin.routes.ts`.

- [ ] **Step 3: Verify compilation**

```bash
cd frontend/starter && npx tsc --noEmit --pretty 2>&1 | grep -E "error TS"
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/starter/src/app/app.routes.ts frontend/starter/src/app/mock-api/common/navigation/data.ts
git commit -m "feat: add navigation menu and routes for dashboard, reports, finance, leadership"
```

---

### Task 8: Full System Integration Test

**Files:**
- No file changes — verification only

- [ ] **Step 1: Verify backend endpoints**

```bash
# Check finance dashboard
curl -s http://localhost:3000/api/finance/dashboard -H "Authorization: Bearer <valid-token>" | head -c 200

# Check reports dashboard (should still work)
curl -s http://localhost:3000/api/bazaar/reports/dashboard -H "Authorization: Bearer <valid-token>" | head -c 200
```

Expected: Both return JSON with no errors.

- [ ] **Step 2: Verify frontend compilation**

```bash
cd frontend/starter && npx tsc --noEmit --pretty 2>&1 | grep -E "error TS"
```

Expected: Only pre-existing error in `settings.component.ts` (primeng/sidebar). Zero new errors.

- [ ] **Step 3: Final commit — navigation updates only**

```bash
git add frontend/starter/src/app/mock-api/common/navigation/data.ts
git commit -m "chore: finalize Phase 9 dashboard and reports navigation"
```
