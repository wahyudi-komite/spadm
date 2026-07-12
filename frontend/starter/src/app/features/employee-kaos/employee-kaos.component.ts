import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { saveAs } from 'file-saver';
import { CountUpModule } from 'ngx-countup';
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
import { first, Subject, takeUntil } from 'rxjs';
import * as XLSX from 'xlsx';
import { UserService } from '../../core/user/user.service';
import { User } from '../../core/user/user.types';
import { cleanFilters } from '../../node/common/cleanFilters';
import { GlobalVariable } from '../../node/common/global-variable';
import { EditDialogEkComponent } from './edit-dialog-ek/edit-dialog-ek.component';
import { EmployeeKaos } from './employee-kaos';
import { EmployeeKaosService } from './employee-kaos.service';
import { PrintLabelComponent } from './print-label/print-label.component';

interface Column {
    field: string;
    header: string;
    sortable: boolean;
}

@Component({
    selector: 'app-employee-kaos',
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
        PrintLabelComponent,
        TooltipModule,
        MatIconModule,
        CountUpModule,
    ],
    templateUrl: './employee-kaos.component.html',
    styleUrl: './employee-kaos.component.scss',
})
export class EmployeeKaosComponent implements OnInit {
    user: User;
    datas: EmployeeKaos[] = [];
    cols!: any[];
    loading: boolean = true;
    globalFilter = '';
    searchValue: string | undefined;
    total: number = 0;
    // plantData!: any[];
    data: any;
    selectedDatas: any[] = [];
    request: any = {};
    plantData = [
        { label: 'P1', value: 'P1', counting: 0 },
        { label: 'P2', value: 'P2', counting: 0 },
        { label: 'P3', value: 'P3', counting: 0 },
        { label: 'P4', value: 'P4', counting: 0 },
        { label: 'P5', value: 'P5', counting: 0 },
        { label: 'PC', value: 'PC', counting: 0 },
        { label: 'HO', value: 'HO', counting: 0 },
    ];

    statusData = [
        { label: 'P', value: 'P' },
        { label: 'C', value: 'C' },
    ];
    terminatedData = [
        { label: 'YES', value: 'YES' },
        { label: 'NO', value: 'NO' },
    ];
    genderData = [
        { label: 'M', value: 'M' },
        { label: 'F', value: 'F' },
    ];
    scanData = [
        { label: 'Blank', value: '0' },
        { label: 'OK', value: '1' },
        { label: 'PRINT', value: '2' },
    ];
    shiftData = [
        { label: 'NON SHIFT', value: 'NON SHIFT' },
        { label: 'SHIFT A', value: 'SHIFT A' },
        { label: 'SHIFT B', value: 'SHIFT B' },
    ];
    expatriatData = [
        { label: 'Expatriate', value: 'Expatriate' },
        { label: 'Local', value: 'Local' },
    ];
    scan_vendorData = [
        { label: 'Blank', value: '0' },
        { label: 'OK', value: '1' },
    ];

    counts: { [key: string]: number } = {};
    totalCounts = 0;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    _service = inject(EmployeeKaosService);
    private cdr = inject(ChangeDetectorRef);
    readonly dialog = inject(MatDialog);
    private toastr = inject(ToastrService);
    _userService = inject(UserService);

    ngOnInit() {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });
        this.cols = [
            {
                field: 'id',
                header: 'NPK',
                sortable: true,
                filter: true,
                filterType: 'numeric',
            },
            {
                field: 'name',
                header: 'Name',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'divisi',
                header: 'Division',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'department',
                header: 'Departement',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'section',
                header: 'Section',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'shift',
                header: 'Shift',
                sortable: true,
                filter: true,
                filterType: 'select',
            },
            {
                field: 'plant',
                header: 'plant',
                sortable: true,
                filter: true,
                filterType: 'select',
            },
            {
                field: 'jabatan',
                header: 'Jabatan',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'golongan',
                header: 'Golongan',
                sortable: true,
                filter: true,
                filterType: 'numeric',
            },
            {
                field: 'expatriat',
                header: 'Expatriate',
                sortable: true,
                filter: true,
                filterType: 'select',
            },
            {
                field: 'status',
                header: 'status',
                sortable: true,
                filter: true,
                filterType: 'select',
            },
            {
                field: 'terminated',
                header: 'terminated',
                sortable: true,
                filter: true,
                filterType: 'select',
            },
            {
                field: 'gender',
                header: 'gender',
                sortable: true,
                filter: true,
                filterType: 'select',
            },
            {
                field: 'family_stats',
                header: 'family Status',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'no_wa',
                header: 'whatsapp',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'souvenir',
                header: 'souvenir',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'scan',
                header: 'Scan STO',
                sortable: true,
                filter: true,
                filterType: 'select',
            },
            {
                field: 'scan_date',
                header: 'Scan STO Date',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'scan_vendor',
                header: 'Scan STO Vendor',
                sortable: true,
                filter: true,
                filterType: 'select',
            },
            {
                field: 'scan_vendor_date',
                header: 'Scan STO Vendor Date',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'scan_plant',
                header: 'Scan STO Plant',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'scan_palnt_date',
                header: 'Scan STO Plant Date',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'kaos_employee1',
                header: 'Kaos Employee',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'kaos_spouse1',
                header: 'Kaos Spouse',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'dlong',
                header: 'dewasa panjang',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'dshort',
                header: 'dewasa pendek',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'kaos_child1',
                header: 'Kaos Anak 1',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'kaos_child2',
                header: 'Kaos Anak 2',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'kaos_child3',
                header: 'Kaos Anak 3',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'kaos_child4',
                header: 'Kaos Anak 4',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'kaos_child5',
                header: 'Kaos Anak 5',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'kaos_child6',
                header: 'Kaos Anak 6',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'clong',
                header: 'anak panjang',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'cshort',
                header: 'anak pendek',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
        ];

        this.getCount();
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
            case 'NON SHIFT':
                return 'secondary';
            case 'SHIFT A':
                return 'warn';
            case 'SHIFT B':
                return 'info';
            case 'Local':
                return 'secondary';
            case 'Expatriate':
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

    printSelected(selectionRow: any) {
        this.data = [selectionRow];
        this.cdr.detectChanges();

        const logo = document.getElementById('printLogo') as HTMLImageElement;
        if (logo.complete) {
            window.print();
        } else {
            logo.onload = () => window.print();
        }
    }

    printMultipleSelected() {
        this.data = this.selectedDatas;
        setTimeout(() => window.print(), 100);
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
                        value = value !== '1970-01-01 07:00:00' ? value : '';
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
            height: 'auto', // biar mengikuti konten
            maxHeight: 'none',
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
                this.getCount();
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

    // getCount(): void {
    //     this.plantData.forEach((plant) => {
    //         this.totalCounts = 0;
    //         this._service.getCount(plant.value).subscribe((res) => {
    //             this.counts[plant.value] = res.count;
    //             this.totalCounts += res.count;
    //         });
    //     });
    // }

    getCount(): void {
        this.totalCounts = 0;
        this.plantData.forEach((plant) => {
            this._service.getCount(plant.value).subscribe((res) => {
                plant.counting = res.count;
                this.totalCounts += res.count;
            });
        });
    }
}
