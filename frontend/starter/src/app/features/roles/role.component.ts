import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { first } from 'rxjs';
import * as XLSX from 'xlsx';
import { Role } from '../../node/app/role/role';
import { RoleService } from '../../node/app/role/role.service';
import { cleanFilters } from '../../node/common/cleanFilters';
import { GlobalVariable } from '../../node/common/global-variable';
import { EditDialogEkComponent } from '../employee-kaos/edit-dialog-ek/edit-dialog-ek.component';

@Component({
    selector: 'app-role',
    standalone: true,
    imports: [
        CommonModule,
        ToastrModule,
        TableModule,
        InputTextModule,
        TagModule,
        SelectModule,
        MultiSelectModule,
        ButtonModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
    ],
    templateUrl: './role.component.html',
    styleUrl: './role.component.scss',
})
export class RoleComponent implements OnInit {
    datas: Role[] = [];
    cols!: any[];
    loading: boolean = true;
    globalFilter = '';
    searchValue: string | undefined;
    total: number = 0;
    // plantData!: any[];
    data: any;
    selectedDatas: any[] = [];
    request: any = {};

    _service = inject(RoleService);
    private cdr = inject(ChangeDetectorRef);
    readonly dialog = inject(MatDialog);
    private toastr = inject(ToastrService);

    ngOnInit() {
        this.cols = [
            {
                field: 'name',
                header: 'Role Name',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
        ];
    }

    loadLazy($event: TableLazyLoadEvent) {
        this.request.globalFilter = $event.globalFilter || '';
        this.request.sortField = $event.sortField || '';
        this.request.sortOrder = $event.sortOrder || 'DESC';
        this.request.first = $event.first || 0;
        this.request.rows = $event.rows;

        this.request.filters = cleanFilters($event.filters);
        this._service.serverside(this.request).subscribe((res) => {
            this.datas = res.data;
            this.total = res.meta.total;
            this.loading = false;
        });
    }

    load() {
        this._service.serverside(this.request).subscribe((res) => {
            this.datas = res.data;
            this.total = res.meta.total;
            this.loading = false;
        });
    }
    clear(table: Table) {
        table.clear();
        this.searchValue = '';
    }

    onRowSelect(event: any) {
        // console.log('✅ Row selected:', event.data);
        // console.log('📌 All selected rows:', this.selectedDatas);
    }

    onRowUnselect(event: any) {
        // console.log('❌ Row unselected:', event.data);
        // console.log('📌 All selected rows:', this.selectedDatas);
    }

    onHeaderToggle(event: any) {
        // console.log('Header checkbox toggled:', event.checked);
        // console.log('All selected rows:', this.selectedDatas);
    }

    displayLabel(label: string | number | null | undefined): string {
        switch (label) {
            case 'YES':
                return 'danger';

            case 'NO':
                return 'success';

            case 'C':
                return 'info';

            case 'P':
                return 'success';

            case 'M':
                return 'warn';

            case 'F':
                return 'info';
            case 0:
                return 'success';
            case 1:
                return 'success';
            case 2:
                return 'info';

            case '':
                return null;
        }
    }

    displayText(label: string | number | null | undefined): string {
        switch (label) {
            case 0:
                return '';
            case 1:
                return 'OK';
            case 2:
                return 'PRINT';

            case '':
                return null;
        }
    }

    exportExcel() {
        this.request.exportData = true;
        this._service.serverside(this.request).subscribe((data) => {
            // ambil kolom dari PrimeNG
            const exportColumns = this.cols.map((col) => ({
                title: col.header,
                dataKey: col.field,
            }));

            // atur ulang agar sesuai urutan kolom di tabel
            const ordered = data.data.map((row: any) => {
                const newRow: any = {};
                this.cols.forEach((col) => {
                    let value = row[col.field];

                    // jika kolom scan, format pakai displayText
                    if (col.field === 'scan') {
                        value = this.displayText(value);
                    }

                    if (col.field === 'scan_date') {
                        value = value !== '01-01-1970 07:00:00' ? value : '';
                    }

                    newRow[col.header] = value;
                });
                return newRow;
            });

            // convert JSON → worksheet
            const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(ordered);
            const workbook: XLSX.WorkBook = {
                Sheets: { data: worksheet },
                SheetNames: ['data'],
            };

            // export Excel
            const excelBuffer: any = XLSX.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });

            const file = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(file, 'flatag_export.xlsx');
        });
    }

    openDialog(action: string, obj: any) {
        obj = obj;

        obj.action = action;
        let dialogBoxSettings = {
            position: { top: '10px' },
            width: '1000px',
            margin: '0 auto',
            disableClose: true,
            hasBackdrop: true,
            data: obj,
        };

        const dialogRef = this.dialog.open(
            EditDialogEkComponent,
            dialogBoxSettings
        );

        dialogRef.afterClosed().subscribe((result) => {
            if (result.event == 'Add') {
                // this.redirectToAdd(result.formValue);
            } else if (result.event == 'Update') {
                this.redirectToUpdate(result.data, result.formValue);
            } else if (result.event == 'Delete') {
                this.redirectToDelete(result.data.id);
            } else if (result.event == 'Upload') {
                // this.load();
            }
        });
    }

    redirectToUpdate(data: any, formValue: any): void {
        // return;
        this._service.update(data.id, formValue).subscribe(
            (res) => {
                GlobalVariable.audioSuccess.play();
                this.toastr.success('Success', 'Update data success');
                this.load();
            },
            (error) => {
                this.errorNotif(error);
            }
        );
    }

    redirectToDelete(row_obj: number) {
        this._service
            .delete(row_obj)
            .pipe(first())
            .subscribe(
                (res) => {
                    GlobalVariable.audioSuccess.play();
                    this.toastr.success('Deleted', 'Success remove data');
                    this.load();
                },
                (error) => {
                    this.errorNotif(error);
                }
            );
    }

    errorNotif(error: any) {
        GlobalVariable.audioFailed.play();
        this.toastr.error('Failed', error.error.message, {
            timeOut: 5000,
        });
    }
}
