import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { saveAs } from 'file-saver';
import { CountUpModule } from 'ngx-countup';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { SelectModule } from 'primeng/select';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, takeUntil } from 'rxjs';
import * as XLSX from 'xlsx';
import { UserService } from '../../core/user/user.service';
import { User } from '../../core/user/user.types';
import { cleanFilters } from '../../node/common/cleanFilters';
import { GlobalVariable } from '../../node/common/global-variable';
import { EmployeeKaos } from '../employee-kaos/employee-kaos';
import { EmployeeKaosService } from '../employee-kaos/employee-kaos.service';

@Component({
    selector: 'app-scan-plant',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
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
        MatIconModule,
        CountUpModule,
        BadgeModule,
        OverlayBadgeModule,
        MessageModule,
    ],
    templateUrl: './scan-plant.component.html',
    styleUrl: './scan-plant.component.scss',
})
export class ScanPlantComponent implements OnInit {
    user: User;
    responScan: any;
    responScanx: any = {
        id: 33947,
        name: 'NURUL HUDA',
        divisi: 'DIV SAP PAINT & ASSY',
        department: 'DPT PRODUCTION CONTROL & LOGISTIC',
        lokasiKerja: 'ADM Plant-4',
        status: 'P',
        gender: 'M',
        family_stats: 'K3',
        no_wa: '085227502727',
        kaos_employee1: 'pendek - XL',
        kaos_spouse1: 'pendek - XL',
        kaos_child1: 'pendek - 6',
        kaos_child2: 'pendek - 2',
        kaos_child3: 'pendek - 4',
        kaos_child4: '',
        kaos_child5: '',
        kaos_child6: '',
        souvenir: 1,
        plant: 'P4',
        dlong: '',
        dshort: 'XL-2',
        clong: '',
        cshort: '6-1; 4-1; 2-1',
        scan: 2,
        scan_date: '1970-01-01 07:00:00',
        scan_vendor: 0,
        scan_vendor_date: '1970-01-01 07:00:00',
        scan_plant: null,
        scan_plant_date: '1970-01-01 07:00:00',
        created_at: '06-09-2025 13:29:48',
        updated_at: '17-09-2025 10:53:38',
        terminated: 'NO',
        section: 'SCT PRODUCTION',
        golongan: 2,
        jabatan: 'Team Member / Clerk',
        expatriat: 'Local',
        shift: 'SHIFT A',
    };
    form!: FormGroup;
    datas: EmployeeKaos[] = [];
    cols!: any[];
    loading: boolean = true;
    globalFilter = '';
    searchValue: string | undefined;
    total: number = 0;
    data: any;
    selectedDatas: any[] = [];
    request: any = {};
    errorNotifikasi: any = {};
    plantData = [
        { label: 'P1', value: 'P1' },
        { label: 'P2', value: 'P2' },
        { label: 'P3', value: 'P3' },
        { label: 'P4', value: 'P4' },
        { label: 'P5', value: 'P5' },
        { label: 'PC', value: 'PC' },
        { label: 'HO', value: 'HO' },
    ];
    plantDataAll = [
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
    counts: { [key: string]: number } = {};
    countsAll: { [key: string]: number } = {};
    totalCounts = 0;
    totalCountsAll = 0;
    enableDataScan: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('id', { static: false }) scan!: ElementRef;

    private fb = inject(FormBuilder);
    private toastr = inject(ToastrService);
    private _service = inject(EmployeeKaosService);
    _userService = inject(UserService);

    ngOnInit(): void {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                if (this.user.plant) {
                    this.plantData = [
                        { label: this.user.plant, value: this.user.plant },
                    ];
                }
            });

        this.form = this.fb.group({
            id: ['', [Validators.required]],
        });
        this.cols = [
            {
                field: 'scan_plant',
                header: 'Scan STO Plant',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
            {
                field: 'scan_plant_date',
                header: 'Scan STO Plant Date',
                sortable: true,
                filter: true,
                filterType: 'text',
            },
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
            // {
            //     field: 'no_wa',
            //     header: 'whatsapp',
            //     sortable: true,
            //     filter: true,
            //     filterType: 'text',
            // },
        ];
        this.getCount();
        this.getCountAll();
    }
    get f(): { [key: string]: AbstractControl } {
        return this.form.controls;
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

    errorNotif(error: any) {
        this.loading = false;
        const message = error?.error?.message || 'Unknown error';
        if (message.toLowerCase().includes('print')) {
            GlobalVariable.audioInfo.play();
            // this.toastr.info(message, 'Info', {
            //     timeOut: 5000,
            //     positionClass: 'toast-bottom-center',
            // });
            this.errorNotifikasi = {
                message: message,
                divDisplay: true,
                bgColor: 'bg-orange-500',
            };
        } else {
            GlobalVariable.audioFailed.play();
            // this.toastr.error(message, 'Failed', {
            //     timeOut: 5000,
            //     positionClass: 'toast-bottom-center',
            // });
            let bgColor = 'bg-rose-500';
            let sizeFont = 'text-10xl';
            let returnHro = false;

            if (message.toLowerCase().includes('already')) {
                bgColor = 'bg-pink-800';
                sizeFont = 'text-7xl';
            } else if (message.toLowerCase().includes('plant')) {
                bgColor = 'bg-indigo-800';
                sizeFont = 'text-7xl';
                returnHro = true;
            } else if (message.toLowerCase().includes('packing')) {
                bgColor = 'bg-orange-500';
                sizeFont = 'text-7xl';
            } else if (message.toLowerCase().includes('terminated')) {
                bgColor = 'bg-black';
                sizeFont = 'text-7xl';
                returnHro = true;
            }

            this.errorNotifikasi = {
                message: message,
                divDisplay: true,
                bgColor: bgColor,
                sizeFont: sizeFont,
                returnHro: returnHro,
            };
        }
    }

    setFocus() {
        this.scan.nativeElement.focus();
    }

    resetForm() {
        this.form.reset();
        this.form.markAsUntouched();
        this.form.markAsPristine();
        this.setFocus();
    }
    onSubmit() {
        this.errorNotifikasi = {};
        this.enableDataScan = false;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const data = {
            ...this.form.getRawValue(),
            scan_plant: this.user.name,
            ...(this.user.plant ? { plant: this.user.plant } : { plant: null }),
        };
        this._service.updateScanPlant(data).subscribe(
            (res) => {
                this.enableDataScan = true;
                this.loading = false;
                if (GlobalVariable.audioSuccess) {
                    GlobalVariable.audioSuccess.pause(); // pastikan berhenti dulu
                    GlobalVariable.audioSuccess.currentTime = 0; // reset ke awal
                    GlobalVariable.audioSuccess.play(); // mainkan ulang
                }
                this.toastr.success('Success', res.id + ' ' + res.name, {
                    timeOut: 2000,
                    positionClass: 'toast-bottom-center',
                });
                this.responScan = res;
                this.form.reset();

                this.form.markAsUntouched();
                this.form.markAsPristine();
                this.setFocus();
                this.load();
                this.getCount();
                this.getCountAll();
            },
            (error) => {
                this.enableDataScan = false;
                this.errorNotif(error);
            }
        );
    }

    getCount(): void {
        const where = { souvenir: 1 };
        const whereNot = { scan_plant: '' };
        this.totalCounts = 0;
        this.plantDataAll.forEach((plant) => {
            this._service
                .getCount(plant.value, where, whereNot)
                .subscribe((res) => {
                    plant.counting = res.count;
                    this.totalCounts += res.count;
                });
        });
    }

    // getCountx(): void {
    //     const where = { souvenir: 1 };
    //     const whereNot = { scan_plant: '' };
    //     this.plantDataAll.forEach((plant) => {
    //         this.totalCounts = 0;
    //         this._service
    //             .getCount(plant.value, where, whereNot)
    //             .subscribe((res) => {
    //                 this.counts[plant.value] = res.count;
    //                 this.totalCounts += res.count;
    //             });
    //     });
    // }

    // getCountAll(): void {
    //     const where = { terminated: 'NO' };
    //     this.totalCountsAll = 0;
    //     this.plantData.forEach((plant) => {
    //         this._service.getCount(plant.value, where).subscribe((res) => {
    //             this.countsAll[plant.value] = res.count;
    //             this.totalCountsAll += res.count;
    //         });
    //     });
    // }

    getCountAll(): void {
        const where = { terminated: 'NO' };
        this.plantDataAll.forEach((plant) => {
            this.totalCounts = 0;
            this._service.getCount(plant.value, where).subscribe((res) => {
                this.countsAll[plant.value] = res.count;
                this.totalCountsAll += res.count;
            });
        });
    }

    loadLazy($event: TableLazyLoadEvent) {
        this.request.globalFilter = $event.globalFilter || '';
        this.request.sortField = $event.sortField || '';
        this.request.sortOrder = $event.sortOrder || 'DESC';
        this.request.first = $event.first || 0;
        this.request.rows = $event.rows;

        this.request.filters = cleanFilters($event.filters);
        if (this.user.plant !== null) {
            this.request.filters['plant'] = [
                {
                    value: this.user.plant,
                    matchMode: 'equals',
                    operator: 'and',
                },
            ];
        }
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
}
