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
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';

@Component({
  selector: 'admin-bazaar-area-dialog',
  template: `
    <h2 mat-dialog-title>Tambah Mapping Area</h2>
    <mat-dialog-content class="mat-typography py-4">
      <form [formGroup]="form" class="flex flex-col gap-4">
        <mat-form-field class="w-full">
          <mat-label>Plant</mat-label>
          <input matInput formControlName="plant">
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Unit Kerja</mat-label>
          <input matInput formControlName="workUnit">
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>ID Area Distribusi</mat-label>
          <input matInput type="number" formControlName="distributionAreaId">
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
export class AdminBazaarAreaDialogComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AdminBazaarAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      plant: ['', Validators.required],
      workUnit: ['', Validators.required],
      distributionAreaId: [null, Validators.required]
    });
  }
  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

@Component({
  selector: 'admin-bazaar-areas',
  templateUrl: './areas.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
})
export class AdminBazaarAreasComponent implements OnInit {
  mappings: any[] = [];
  displayedColumns = ['id', 'plant', 'workUnit', 'areaCode', 'actions'];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private feedback: DialogFeedbackService
  ) {}

  ngOnInit() {
    this.loadMappings();
  }

  loadMappings() {
    this.http.get(`${environment.apiUrl}/bazaar/distributions/mappings`).subscribe((res: any) => {
      this.mappings = res;
    });
  }

  createMapping() {
    const dialogRef = this.dialog.open(AdminBazaarAreaDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post(`${environment.apiUrl}/bazaar/distributions/mappings`, result).subscribe(() => {
          this.loadMappings();
        });
      }
    });
  }

  deleteMapping(id: number) {
    this.feedback.confirm({
      title: 'Hapus pemetaan area',
      message: 'Hapus pemetaan area ini?',
      confirmText: 'Hapus',
      tone: 'warn',
    }).subscribe((confirmed) => {
      if (!confirmed) return;

      this.http.delete(`${environment.apiUrl}/bazaar/distributions/mappings/${id}`).subscribe(() => {
        this.loadMappings();
      });
    });
  }
}
