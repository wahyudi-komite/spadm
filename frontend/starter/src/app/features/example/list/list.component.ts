import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { map } from 'rxjs';
import { cleanFilters } from '../../../shared/utils/clean-filters.util';
import { ExampleItem } from '../example.types';
import { ExampleService } from '../example.service';

@Component({
    selector: 'app-example-list',
    standalone: true,
    imports: [
        DatePipe,
        FormsModule,
        TableModule,
        InputTextModule,
    ],
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
                        <span class="text-xl font-bold">Example Items</span>
                        <input
                            pInputText
                            type="text"
                            [(ngModel)]="searchValue"
                            (input)="dt.filterGlobal(searchValue, 'contains')"
                            placeholder="Search keyword"
                        />
                    </div>
                </ng-template>
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="id">ID <p-sortIcon field="id" /></th>
                        <th pSortableColumn="name">Name <p-sortIcon field="name" /></th>
                        <th pSortableColumn="description">Description <p-sortIcon field="description" /></th>
                        <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
                        <th pSortableColumn="createdAt">Created At <p-sortIcon field="createdAt" /></th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{ item.id }}</td>
                        <td>{{ item.name }}</td>
                        <td>{{ item.description }}</td>
                        <td>{{ item.status }}</td>
                        <td>{{ item.createdAt | date }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `,
})
export class ExampleListComponent implements OnInit {
    private service = inject(ExampleService);

    items: ExampleItem[] = [];
    total = 0;
    loading = true;
    searchValue = '';
    request: any = {};

    ngOnInit() {
        this.load();
    }

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
        this.service
            .getList(this.request)
            .pipe(map(res => res.body!))
            .subscribe({
                next: (res) => {
                    this.items = res.data;
                    this.total = res.meta.total;
                    this.loading = false;
                },
                error: () => (this.loading = false),
            });
    }
}
