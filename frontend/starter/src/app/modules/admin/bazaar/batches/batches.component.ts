import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { environment } from 'environments/environment';

@Component({
  selector: 'admin-bazaar-batch-dialog',
  template: `
    <h2 mat-dialog-title>Tambah Batch Baru</h2>
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
  imports: [CommonModule, MatDialogModule, MatButtonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
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
      eventId: [null, Validators.required],
      name: ['', Validators.required]
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
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
})
export class AdminBazaarBatchesComponent implements OnInit {
  batches: any[] = [];
  displayedColumns = ['id', 'event', 'name', 'status', 'actions'];

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadBatches();
  }

  loadBatches() {
    this.http.get(`${environment.apiUrl}/bazaar/batches`).subscribe((res: any) => {
      this.batches = res;
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
    if (confirm(`Ubah status menjadi ${newStatus}?`)) {
      this.http.patch(`${environment.apiUrl}/bazaar/batches/${batch.id}`, { status: newStatus }).subscribe(() => {
        this.loadBatches();
      });
    }
  }

  deleteBatch(id: number) {
    if (confirm('Hapus batch ini?')) {
      this.http.delete(`${environment.apiUrl}/bazaar/batches/${id}`).subscribe(() => {
        this.loadBatches();
      });
    }
  }
}
