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

@Component({
  selector: 'admin-bazaar-batch-dialog',
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Batch' : 'Tambah Batch Baru' }}</h2>
    <mat-dialog-content class="mat-typography py-4">
      <form [formGroup]="form" class="flex flex-col gap-4">
        <mat-form-field class="w-full">
          <mat-label>ID Event</mat-label>
          <input matInput type="number" formControlName="eventId" placeholder="ID Event">
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Nama Batch</mat-label>
          <input matInput formControlName="name" placeholder="Contoh: Batch 1">
        </mat-form-field>
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
      name: [data?.name ?? '', Validators.required]
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
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
  displayedColumns = ['id', 'event', 'name', 'status', 'actions'];

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
    const dialogRef = this.dialog.open(AdminBazaarBatchDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post(`${environment.apiUrl}/bazaar/batches`, result).subscribe(() => {
          this.loadBatches();
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
      this.http.post(`${environment.apiUrl}/bazaar/batches/${batch.id}/${endpoint}`, {}).subscribe(() => {
        this.loadBatches();
      });
    });
  }

  editBatch(batch: any) {
    const dialogRef = this.dialog.open(AdminBazaarBatchDialogComponent, {
      width: '400px',
      data: { eventId: batch.eventId, name: batch.name },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.patch(`${environment.apiUrl}/bazaar/batches/${batch.id}`, result).subscribe(() => {
          this.loadBatches();
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
