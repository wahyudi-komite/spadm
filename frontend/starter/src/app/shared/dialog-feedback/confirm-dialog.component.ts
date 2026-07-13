import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    tone?: 'primary' | 'warn';
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
    template: `
        <div class="flex items-start gap-4">
            <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                [ngClass]="
                    data.tone === 'warn'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-primary-50 text-primary-700'
                "
            >
                <mat-icon
                    [svgIcon]="
                        data.tone === 'warn'
                            ? 'heroicons_outline:exclamation-triangle'
                            : 'heroicons_outline:question-mark-circle'
                    "
                ></mat-icon>
            </div>
            <div class="min-w-0">
                <h2 mat-dialog-title class="!m-0 !p-0 text-xl font-bold">
                    {{ data.title || 'Konfirmasi' }}
                </h2>
                <mat-dialog-content class="!px-0 !pb-0 !pt-2 text-slate-600">
                    {{ data.message }}
                </mat-dialog-content>
            </div>
        </div>

        <mat-dialog-actions align="end" class="!mt-6 !px-0 !pb-0">
            <button mat-button type="button" (click)="close(false)">
                {{ data.cancelText || 'Batal' }}
            </button>
            <button
                mat-flat-button
                type="button"
                [color]="data.tone === 'warn' ? 'warn' : 'primary'"
                (click)="close(true)"
            >
                {{ data.confirmText || 'Ya, lanjutkan' }}
            </button>
        </mat-dialog-actions>
    `,
})
export class ConfirmDialogComponent {
    constructor(
        private _dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) {}

    close(value: boolean): void {
        this._dialogRef.close(value);
    }
}
