import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable } from 'rxjs';
import {
    ConfirmDialogComponent,
    ConfirmDialogData,
} from './confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogFeedbackService {
    constructor(
        private _dialog: MatDialog,
        private _snackBar: MatSnackBar
    ) {}

    confirm(data: ConfirmDialogData): Observable<boolean> {
        return this._dialog
            .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
                ConfirmDialogComponent,
                {
                    width: '420px',
                    maxWidth: 'calc(100vw - 32px)',
                    autoFocus: false,
                    restoreFocus: true,
                    data,
                }
            )
            .afterClosed()
            .pipe(map(Boolean));
    }

    success(message: string): void {
        this._snackBar.open(message, 'Tutup', {
            duration: 3500,
            panelClass: ['spadm-snackbar-success'],
        });
    }

    error(message: string): void {
        this._snackBar.open(message, 'Tutup', {
            duration: 5000,
            panelClass: ['spadm-snackbar-error'],
        });
    }
}
