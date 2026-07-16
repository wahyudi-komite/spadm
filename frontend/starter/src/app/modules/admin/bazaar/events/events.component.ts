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
import { environment } from 'environments/environment';
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';

@Component({
  selector: 'admin-bazaar-event-dialog',
  template: `
    <h2 mat-dialog-title>Tambah Event Baru</h2>
    <mat-dialog-content class="mat-typography py-4">
      <form [formGroup]="form" class="flex flex-col gap-4">
        <mat-form-field class="w-full">
          <mat-label>Nama Event</mat-label>
          <input matInput formControlName="name" placeholder="Contoh: Bazar HUT SPADM ke-21">
          @if (form.get('name').hasError('required')) {
            <mat-error>Nama event wajib diisi</mat-error>
          }
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Deskripsi (Opsional)</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
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
export class AdminBazaarEventDialogComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AdminBazaarEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
    this.form.markAllAsTouched();
  }
  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}

@Component({
  selector: 'admin-bazaar-events',
  templateUrl: './events.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatTableModule, MatSortModule, MatButtonModule, MatIconModule, MatDialogModule],
})
export class AdminBazaarEventsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  events = new MatTableDataSource<any>([]);
  displayedColumns = ['id', 'name', 'isActive', 'actions'];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private feedback: DialogFeedbackService
  ) {}

  ngOnInit() {
    this.loadEvents();
  }

  ngAfterViewInit() {
    this.events.sort = this.sort;
  }

  loadEvents() {
    this.http.get(`${environment.apiUrl}/bazaar/events`).subscribe((res: any) => {
      this.events.data = res;
    });
  }

  createEvent() {
    const dialogRef = this.dialog.open(AdminBazaarEventDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post(`${environment.apiUrl}/bazaar/events`, result).subscribe(() => {
          this.loadEvents();
        });
      }
    });
  }

  toggleActive(event: any) {
    this.http.patch(`${environment.apiUrl}/bazaar/events/${event.id}`, { isActive: !event.isActive }).subscribe(() => {
      this.loadEvents();
    });
  }

  deleteEvent(id: number) {
    this.feedback.confirm({
      title: 'Hapus event',
      message: 'Hapus event ini?',
      confirmText: 'Hapus',
      tone: 'warn',
    }).subscribe((confirmed) => {
      if (!confirmed) return;

      this.http.delete(`${environment.apiUrl}/bazaar/events/${id}`).subscribe(() => {
        this.loadEvents();
      });
    });
  }
}
