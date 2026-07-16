import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from 'environments/environment';
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';

@Component({
  selector: 'admin-bazaar-product-dialog',
  template: `
    <h2 mat-dialog-title>Tambah Produk Baru</h2>
    <mat-dialog-content class="mat-typography py-4">
      <form [formGroup]="form" class="flex flex-col gap-4">
        <mat-form-field class="w-full">
          <mat-label>ID Event</mat-label>
          <input matInput type="number" formControlName="eventId">
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Nama Produk</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>SKU (Opsional)</mat-label>
          <input matInput formControlName="sku">
        </mat-form-field>
        <mat-form-field class="w-full">
          <mat-label>Harga Jual (Rp)</mat-label>
          <input matInput type="number" formControlName="sellingPrice">
        </mat-form-field>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Foto Produk</label>
          @if (previewUrl) {
            <div class="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              <img [src]="previewUrl" class="w-full h-full object-cover" />
            </div>
          }
          <button type="button" mat-stroked-button color="primary" (click)="fileInput.click()">
            <mat-icon>upload</mat-icon>
            {{ previewUrl ? 'Ganti Foto' : 'Pilih Foto' }}
          </button>
          <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelected($event)" />
          @if (uploading) {
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <mat-spinner diameter="16"></mat-spinner>
              Mengunggah...
            </div>
          }
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Batal</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || uploading" (click)="save()">Simpan</button>
    </mat-dialog-actions>
  `,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  standalone: true
})
export class AdminBazaarProductDialogComponent {
  form: FormGroup;
  previewUrl: string | null = null;
  uploading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<AdminBazaarProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      eventId: [null, Validators.required],
      name: ['', Validators.required],
      sku: [''],
      normalPrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, Validators.required],
      imageUrl: [''],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    this.uploading = true;

    this.http.post(`${environment.apiUrl}/bazaar/products/upload-image`, formData, {
      reportProgress: true,
    }).subscribe({
      next: (res: any) => {
        this.previewUrl = `${environment.apiUrl}${res.url}`;
        this.form.patchValue({ imageUrl: res.url });
        this.uploading = false;
      },
      error: () => {
        this.uploading = false;
      },
    });
  }

  save() {
    if (this.form.valid) {
      const vals = this.form.value;
      const payload = {
        ...vals,
        slug: vals.name.toLowerCase().replace(/ /g, '-'),
        sku: vals.sku || vals.name.substring(0, 5).toUpperCase()
      };
      this.dialogRef.close(payload);
    }
  }
}

@Component({
  selector: 'admin-bazaar-products',
  templateUrl: './products.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
})
export class AdminBazaarProductsComponent implements OnInit {
  products: any[] = [];
  apiUrl = environment.apiUrl;
  displayedColumns = ['image', 'id', 'name', 'sku', 'sellingPrice', 'stock', 'actions'];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private feedback: DialogFeedbackService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get(`${environment.apiUrl}/bazaar/products`).subscribe((res: any) => {
      this.products = res;
    });
  }

  createProduct() {
    const dialogRef = this.dialog.open(AdminBazaarProductDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post(`${environment.apiUrl}/bazaar/products`, result).subscribe(() => {
          this.loadProducts();
        });
      }
    });
  }

  deleteProduct(id: number) {
    this.feedback.confirm({
      title: 'Hapus produk',
      message: 'Hapus produk ini?',
      confirmText: 'Hapus',
      tone: 'warn',
    }).subscribe((confirmed) => {
      if (!confirmed) return;

      this.http.delete(`${environment.apiUrl}/bazaar/products/${id}`).subscribe(() => {
        this.loadProducts();
      });
    });
  }
}
