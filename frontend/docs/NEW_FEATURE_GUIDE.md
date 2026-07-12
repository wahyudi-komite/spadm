# New Feature Guide

This guide walks through adding a new CRUD feature. All new features go in `src/app/features/<name>/` as standalone Angular components.

## 1. Create Feature Directory

```
src/app/features/<name>/
  <name>.types.ts
  <name>.service.ts
  <name>.routes.ts
  list/
    list.component.ts
  detail/
    detail.component.ts
```

## 2. Define Types

```typescript
// features/<name>/<name>.types.ts
export interface Widget {
    id: string;
    name: string;
    description: string;
    status: string;
    createdAt: string;
}
```

## 3. Create Service

Extend `ApiClient` and use `HttpClient` directly with `observe: 'response'` to get full `HttpResponse`:

```typescript
// features/<name>/<name>.service.ts
import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../core/http/api-client.service';
import { Paginate } from '../../shared/types/paginate.model';
import { Widget } from './<name>.types';

@Injectable({ providedIn: 'root' })
export class WidgetService extends ApiClient {
    override url = '/widgets';

    getList(query?: Record<string, unknown>): Observable<HttpResponse<Paginate>> {
        return this.http.get<Paginate>(this.url, {
            params: query as any,
            observe: 'response',
        });
    }

    getById(id: string): Observable<HttpResponse<Widget>> {
        return this.http.get<Widget>(`${this.url}/${id}`, { observe: 'response' });
    }

    create(data: Partial<Widget>): Observable<HttpResponse<Widget>> {
        return this.http.post<Widget>(this.url, data, { observe: 'response' });
    }

    update(id: string, data: Partial<Widget>): Observable<HttpResponse<Widget>> {
        return this.http.put<Widget>(`${this.url}/${id}`, data, { observe: 'response' });
    }

    remove(id: string): Observable<HttpResponse<void>> {
        return this.http.delete<void>(`${this.url}/${id}`, { observe: 'response' });
    }
}
```

## 4. Create List Component

Use PrimeNG `p-table` with lazy loading:

```typescript
// features/<name>/list/list.component.ts
import { DatePipe, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { map } from 'rxjs';
import { cleanFilters } from '../../../shared/utils/clean-filters.util';
import { WidgetService } from '../<name>.service';
import { Widget } from '../<name>.types';

@Component({
    selector: 'app-widget-list',
    standalone: true,
    imports: [NgIf, DatePipe, FormsModule, TableModule, InputTextModule],
    template: `
        <div class="card">
            <p-table
                #dt
                [value]="items"
                [lazy]="true"
                [loading]="loading"
                [totalRecords]="total"
                [rows]="10"
                [rowsPerPageOptions]="[10, 20, 50]"
                [paginator]="true"
                showGridlines
                stripedRows
                (onLazyLoad)="loadLazy($event)"
            >
                <ng-template #caption>
                    <div class="flex items-center justify-between">
                        <span class="text-xl font-bold">Widgets</span>
                        <input pInputText type="text" [(ngModel)]="searchValue"
                            (input)="dt.filterGlobal(searchValue, 'contains')"
                            placeholder="Search keyword" />
                    </div>
                </ng-template>
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="id">ID <p-sortIcon field="id" /></th>
                        <th pSortableColumn="name">Name <p-sortIcon field="name" /></th>
                        <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
                        <th pSortableColumn="createdAt">Created <p-sortIcon field="createdAt" /></th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{ item.id }}</td>
                        <td>{{ item.name }}</td>
                        <td>{{ item.status }}</td>
                        <td>{{ item.createdAt | date }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `,
})
export class WidgetListComponent implements OnInit {
    private service = inject(WidgetService);
    items: Widget[] = [];
    total = 0;
    loading = true;
    searchValue = '';
    request: any = {};

    ngOnInit() { this.load(); }

    loadLazy(event: TableLazyLoadEvent) {
        this.request.globalFilter = event.globalFilter || '';
        this.request.sortField = event.sortField || '';
        this.request.sortOrder = event.sortOrder || 'DESC';
        this.request.first = event.first || 0;
        this.request.rows = event.rows;
        this.request.filters = cleanFilters(event.filters);
        this.load();
    }

    private load() {
        this.loading = true;
        this.service.getList(this.request).pipe(map(res => res.body!)).subscribe({
            next: (res) => {
                this.items = res.data;
                this.total = res.meta.total;
                this.loading = false;
            },
            error: () => (this.loading = false),
        });
    }
}
```

## 5. Create Detail/Form Component

```typescript
// features/<name>/detail/detail.component.ts
import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-widget-detail',
    standalone: true,
    imports: [ButtonModule],
    template: `
        <div class="card p-4">
            <h2 class="text-xl font-bold mb-4">Widget Detail</h2>
            <p class="mb-4">Viewing item with ID: {{ id }}</p>
            <p-button label="Back" icon="pi pi-arrow-left" (click)="goBack()" severity="secondary" />
        </div>
    `,
})
export class WidgetDetailComponent {
    private route = inject(ActivatedRoute);
    private location = inject(Location);
    id = this.route.snapshot.paramMap.get('id');
    goBack() { this.location.back(); }
}
```

## 6. Create Routes File

```typescript
// features/<name>/<name>.routes.ts
import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./list/list.component').then(m => m.WidgetListComponent),
    },
    {
        path: ':id',
        loadComponent: () => import('./detail/detail.component').then(m => m.WidgetDetailComponent),
    },
] as Routes;
```

## 7. Register in app.routes.ts

Add a lazy-loaded child route under the admin layout parent:

```typescript
// app.routes.ts — inside the admin children array
{
    path: 'widgets',
    loadChildren: () => import('app/features/widgets/widgets.routes'),
},
```

## 8. Add Navigation Item

Edit `mock-api/common/navigation/data.ts` and add an entry:

```typescript
{
    id: 'widgets',
    title: 'Widgets',
    type: 'basic',
    icon: 'heroicons_outline:cube',
    link: '/widgets',
    meta: { roles: ['admin', 'user'] },
},
```

Navigation items support role-based visibility via `meta.roles`. The available icon set is `heroicons_outline`.

## 9. Generate Mock API Data (Optional)

If you need mock data for development, create a mock API service:

```typescript
// mock-api/common/widgets/api.ts
import { Injectable } from '@angular/core';
import { FuseMockApiService } from '@fuse/lib/mock-api';

@Injectable({ providedIn: 'root' })
export class WidgetsMockApi {
    constructor(private _fuseMockApiService: FuseMockApiService) {
        this.registerHandlers();
    }

    registerHandlers(): void {
        this._fuseMockApiService.onGet('api/common/widgets').reply(() => [200, []]);
    }
}
```

Then add it to the `mockApiServices` array in `mock-api/index.ts`.
