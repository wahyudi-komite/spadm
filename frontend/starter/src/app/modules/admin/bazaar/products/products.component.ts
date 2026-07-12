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
export class AdminBazaarProductDialogComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AdminBazaarProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      eventId: [null, Validators.required],
      name: ['', Validators.required],
      sku: [''],
      sellingPrice: [0, Validators.required]
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
  displayedColumns = ['id', 'name', 'sku', 'sellingPrice', 'stock', 'actions'];

  constructor(private http: HttpClient, private dialog: MatDialog) {}

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
    if (confirm('Hapus produk ini?')) {
      this.http.delete(`${environment.apiUrl}/bazaar/products/${id}`).subscribe(() => {
        this.loadProducts();
      });
    }
  }
}
