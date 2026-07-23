import { AfterViewInit, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from 'environments/environment';
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';

function formatDateForInput(dateVal: any): string {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: 'admin-bazaar-batch-dialog',
  template: `
    <h2 mat-dialog-title>{{ data?.id ? 'Edit Batch' : 'Tambah Batch Baru' }}</h2>
    <mat-dialog-content class="mat-typography py-4">
      <form [formGroup]="form" class="flex flex-col gap-4">
        <mat-form-field class="w-full" appearance="outline" floatLabel="always">
          <mat-label>ID Event</mat-label>
          <input matInput type="number" formControlName="eventId" placeholder="ID Event">
        </mat-form-field>
        <mat-form-field class="w-full" appearance="outline" floatLabel="always">
          <mat-label>Nama Batch</mat-label>
          <input matInput formControlName="name" placeholder="Contoh: Batch 1">
        </mat-form-field>

        <div class="border rounded-xl p-3 bg-gray-50 dark:bg-gray-800/40 flex flex-col gap-3">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Jadwal Pembelian (Buka & Tutup)</span>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <mat-form-field appearance="outline" floatLabel="always" class="w-full">
              <mat-label>Waktu Buka Pembelian</mat-label>
              <input matInput type="datetime-local" formControlName="purchaseStartAt">
            </mat-form-field>
            <mat-form-field appearance="outline" floatLabel="always" class="w-full">
              <mat-label>Waktu Tutup Pembelian</mat-label>
              <input matInput type="datetime-local" formControlName="purchaseEndAt">
            </mat-form-field>
          </div>
        </div>

        <div class="border rounded-xl p-3 bg-gray-50 dark:bg-gray-800/40 flex flex-col gap-3">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Jadwal Distribusi</span>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <mat-form-field appearance="outline" floatLabel="always" class="w-full">
              <mat-label>Mulai Distribusi</mat-label>
              <input matInput type="datetime-local" formControlName="distributionStartAt">
            </mat-form-field>
            <mat-form-field appearance="outline" floatLabel="always" class="w-full">
              <mat-label>Selesai Distribusi</mat-label>
              <input matInput type="datetime-local" formControlName="distributionEndAt">
            </mat-form-field>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Batal</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Simpan</button>
    </mat-dialog-actions>
  `,
  imports: [CommonModule, MatDialogModule, MatButtonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatTooltipModule],
  standalone: true
})
export class AdminBazaarBatchDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AdminBazaarBatchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      eventId: [data?.eventId ?? null, Validators.required],
      name: [data?.name ?? '', Validators.required],
      purchaseStartAt: [formatDateForInput(data?.purchaseStartAt)],
      purchaseEndAt: [formatDateForInput(data?.purchaseEndAt)],
      distributionStartAt: [formatDateForInput(data?.distributionStartAt)],
      distributionEndAt: [formatDateForInput(data?.distributionEndAt)]
    });
  }

  save() {
    if (this.form.valid) {
      const val = { ...this.form.value };
      val.purchaseStartAt = val.purchaseStartAt ? new Date(val.purchaseStartAt).toISOString() : null;
      val.purchaseEndAt = val.purchaseEndAt ? new Date(val.purchaseEndAt).toISOString() : null;
      val.distributionStartAt = val.distributionStartAt ? new Date(val.distributionStartAt).toISOString() : null;
      val.distributionEndAt = val.distributionEndAt ? new Date(val.distributionEndAt).toISOString() : null;
      this.dialogRef.close(val);
    }
  }
}

@Component({
  selector: 'admin-bazaar-batches',
  templateUrl: './batches.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatTableModule, MatSortModule, MatButtonModule, MatIconModule, MatDialogModule, MatTooltipModule],
})
export class AdminBazaarBatchesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  batches = new MatTableDataSource<any>([]);
  displayedColumns = ['id', 'event', 'name', 'purchaseSchedule', 'distributionSchedule', 'status', 'actions'];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private feedback: DialogFeedbackService
  ) {
    this.batches.sortingDataAccessor = (batch, column) =>
      column === 'event' ? batch.event?.name ?? '' : batch[column];
  }

  ngOnInit() {
    this.loadBatches();
  }

  ngAfterViewInit() {
    this.batches.sort = this.sort;
  }

  loadBatches() {
    this.http.get(`${environment.apiUrl}/bazaar/batches`).subscribe((res: any) => {
      this.batches.data = res;
    });
  }

  createBatch() {
    const dialogRef = this.dialog.open(AdminBazaarBatchDialogComponent, { width: '520px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post(`${environment.apiUrl}/bazaar/batches`, result).subscribe({
          next: () => {
            this.feedback.success('Batch berhasil dibuat');
            this.loadBatches();
          },
          error: (err) => {
            this.feedback.error(err.error?.message || 'Gagal membuat batch');
          }
        });
      }
    });
  }

  changeStatus(batch: any, newStatus: string) {
    this.feedback.confirm({
      title: 'Ubah status batch',
      message: `Ubah status menjadi ${newStatus}?`,
      confirmText: 'Ubah status',
    }).subscribe((confirmed) => {
      if (!confirmed) return;

      const endpoint = newStatus === 'OPEN' ? 'open' : 'close';
      this.http.post(`${environment.apiUrl}/bazaar/batches/${batch.id}/${endpoint}`, {}).subscribe({
        next: () => {
          this.feedback.success(`Status batch berhasil diubah menjadi ${newStatus}`);
          this.loadBatches();
        },
        error: (err) => {
          this.feedback.error(err.error?.message || 'Gagal mengubah status batch');
        }
      });
    });
  }

  editBatch(batch: any) {
    const dialogRef = this.dialog.open(AdminBazaarBatchDialogComponent, {
      width: '520px',
      data: {
        id: batch.id,
        eventId: batch.eventId,
        name: batch.name,
        purchaseStartAt: batch.purchaseStartAt,
        purchaseEndAt: batch.purchaseEndAt,
        distributionStartAt: batch.distributionStartAt,
        distributionEndAt: batch.distributionEndAt,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.patch(`${environment.apiUrl}/bazaar/batches/${batch.id}`, result).subscribe({
          next: () => {
            this.feedback.success('Batch berhasil diperbarui');
            this.loadBatches();
          },
          error: (err) => {
            this.feedback.error(err.error?.message || 'Gagal memperbarui batch');
          }
        });
      }
    });
  }

  deleteBatch(id: number) {
    this.feedback.confirm({
      title: 'Hapus batch',
      message: 'Hapus batch ini?',
      confirmText: 'Hapus',
      tone: 'warn',
    }).subscribe((confirmed) => {
      if (!confirmed) return;

      this.http.delete(`${environment.apiUrl}/bazaar/batches/${id}`).subscribe(() => {
        this.loadBatches();
      });
    });
  }
}
