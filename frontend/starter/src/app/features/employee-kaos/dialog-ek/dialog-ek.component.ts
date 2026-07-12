import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QrCodeComponent } from 'ng-qrcode';
import { EmployeeKaosService } from '../employee-kaos.service';

@Component({
    selector: 'app-dialog-ek',
    standalone: true,
    imports: [QrCodeComponent, CommonModule],
    templateUrl: './dialog-ek.component.html',
    styleUrl: './dialog-ek.component.scss',
})
export class DialogEKComponent implements OnInit {
    data: any;

    readonly local_data = inject<any>(MAT_DIALOG_DATA);

    constructor(
        public dialogRef: MatDialogRef<DialogEKComponent>,
        private _services: EmployeeKaosService
    ) {
        this.data = { ...this.local_data };
    }
    ngOnInit(): void {}

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }

    onPrint() {
        window.print();
    }
}
