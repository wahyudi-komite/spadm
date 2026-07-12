import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-edit-dialog-ek',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
    ],
    templateUrl: './edit-dialog-ek.component.html',
    styleUrl: './edit-dialog-ek.component.scss',
    providers: [DatePipe],
})
export class EditDialogEkComponent implements OnInit {
    form!: FormGroup;
    action?: string;
    local_data: any;
    datas = [];
    selectStatus = [];

    plantList: string[] = ['HO', 'PC', 'P5', 'P4', 'P3', 'P2', 'P1'];
    scan_plantList: string[] = [
        'admin.p1',
        'admin.p2',
        'admin.p3',
        'admin.p4',
        'admin.p5',
        'admin.pc',
        'admin.ho',
    ];
    terminatedList: string[] = ['YES', 'NO'];
    scan_vendorList = [
        { label: 'Blank', value: 0 },
        { label: 'OK', value: 1 },
    ];
    shiftList: string[] = ['NON SHIFT', 'SHIFT A', 'SHIFT B'];

    familyStatsList: string[] = [
        'K1',
        'T0',
        'K4',
        'K2',
        'K0',
        'K3',
        'K5',
        'T3',
        'T1',
        'T2',
        'T4',
    ];

    kaosEmployeeList: string[] = [
        'panjang - 3XL',
        'panjang - 4XL',
        'panjang - 5XL',
        'panjang - 6XL',
        'panjang - 7XL',
        'panjang - L',
        'panjang - M',
        'panjang - S',
        'panjang - XL',
        'panjang - XXL',
        'pendek - 3XL',
        'pendek - 4XL',
        'pendek - 5XL',
        'pendek - 6XL',
        'pendek - 7XL',
        'pendek - L',
        'pendek - M',
        'pendek - S',
        'pendek - XL',
        'pendek - XS',
        'pendek - XXL',
        '',
    ];

    kaosChild1List: string[] = [
        'pendek - XXL',
        'pendek - XS',
        'pendek - XL',
        'pendek - S',
        'pendek - M',
        'pendek - L',
        'pendek - 8',
        'pendek - 6',
        'pendek - 4XL',
        'pendek - 4',
        'pendek - 3XL',
        'pendek - 2',
        'pendek - 12',
        'pendek - 10',
        'panjang - XXL',
        'panjang - XS',
        'panjang - XL',
        'panjang - S',
        'panjang - M',
        'panjang - L',
        'panjang - 8',
        'panjang - 4XL',
        'panjang - 3XL',
        'panjang - 12',
        'panjang - 10',
        '',
    ];

    readonly dialogRef = inject(MatDialogRef<EditDialogEkComponent>);
    readonly data = inject<any>(MAT_DIALOG_DATA);
    private fb = inject(FormBuilder);
    private datepipe = inject(DatePipe);

    ngOnInit(): void {
        this.local_data = this.data;
        this.action = this.local_data.action;

        this.form = this.fb.group({
            id: [0, {}],
            name: ['', [Validators.required]],
            divisi: ['', [Validators.required]],
            department: ['', [Validators.required]],
            status: ['', [Validators.required]],
            gender: ['', [Validators.required]],
            family_stats: ['', [Validators.required]],
            section: ['', []],
            shift: ['', []],
            plant: ['', [Validators.required]],
            jabatan: ['', []],
            golongan: ['', []],
            expatriat: ['', []],
            terminated: ['', [Validators.required]],
            no_wa: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(20),
                    Validators.pattern(/^[0-9]+$/),
                ],
            ],
            kaos_employee1: ['', []],
            kaos_spouse1: ['', {}],
            kaos_child1: ['', {}],
            kaos_child2: ['', {}],
            kaos_child3: ['', {}],
            kaos_child4: ['', {}],
            kaos_child5: ['', {}],
            kaos_child6: ['', {}],
            souvenir: [0, [Validators.required]],
            dshort: ['', [Validators.required]],
            dlong: ['', {}],
            cshort: ['', {}],
            clong: ['', {}],
            scan_vendor: ['', []],
            scan_vendor_date: [null, []],
            scan_plant: [null, []],
            scan_plant_date: [null, []],
        });

        if (this.action != 'Add') {
            this.form.patchValue(this.local_data);
        }

        this.dialogRef.keydownEvents().subscribe((event) => {
            if (event.key === 'Escape') {
                this.closeDialog();
            }
        });

        this.dialogRef.backdropClick().subscribe((event) => {
            this.closeDialog();
        });
    }

    get f() {
        return this.form.controls;
    }

    doAction() {
        if (this.form.invalid) {
            return;
        }

        console.log(this.form.value.scan_plant_date);

        this.dialogRef.close({
            event: this.action,
            data: this.local_data,
            formValue: this.form.value,
        });
    }

    closeDialog() {
        this.action = 'Cancel';
        this.dialogRef.close({ event: 'Cancel' });
    }
}
