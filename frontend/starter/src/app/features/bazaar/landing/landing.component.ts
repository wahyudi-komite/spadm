import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from 'environments/environment';

@Component({
  selector: 'bazaar-checkout-dialog',
  template: `
    <h2 mat-dialog-title>Konfirmasi Pembelian</h2>
    <mat-dialog-content class="mat-typography py-4">
      <div class="mb-6 p-4 bg-blue-50 text-blue-900 rounded-lg text-sm">
        <strong>PENTING:</strong> Mohon periksa kembali pesanan Anda.
      </div>
      
      <form [formGroup]="form" class="flex flex-col gap-3">
        <mat-checkbox formControlName="term1" color="primary">
          Saya memahami bahwa pembelian hanya dapat dilakukan <strong>satu kali</strong> selama periode event ini.
        </mat-checkbox>
        <mat-checkbox formControlName="term2" color="primary">
          Saya memahami bahwa pesanan yang sudah dibayar tidak dapat diubah, dibatalkan, atau dikembalikan.
        </mat-checkbox>
        <mat-checkbox formControlName="term3" color="primary">
          Saya bersedia mengambil barang sesuai dengan area distribusi yang ditentukan berdasarkan data keanggotaan saya.
        </mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Batal</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="confirm()">Setuju & Buat Pesanan</button>
    </mat-dialog-actions>
  `,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule, ReactiveFormsModule],
  standalone: true
})
export class BazaarCheckoutDialogComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BazaarCheckoutDialogComponent>
  ) {
    this.form = this.fb.group({
      term1: [false, Validators.requiredTrue],
      term2: [false, Validators.requiredTrue],
      term3: [false, Validators.requiredTrue],
    });
  }
  confirm() {
    if (this.form.valid) {
      this.dialogRef.close(true);
    }
  }
}

@Component({
  selector: 'bazaar-landing',
  templateUrl: './landing.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  standalone: true
})
export class BazaarLandingComponent implements OnInit {
  activeEvent: any = null;
  activeBatch: any = null;
  products: any[] = [];
  loading = true;
  
  cartIds: number[] = [];
  cartSubtotal = 0;
  goodieBagFee = 3000;
  appFee = 1000;
  subsidy = 20000;
  grandTotal = 0;
  
  checkingOut = false;

  constructor(private http: HttpClient, private dialog: MatDialog, private router: Router) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get(`${environment.apiUrl}/bazaar/events`).subscribe({
      next: (events: any) => {
        this.activeEvent = events.find(e => e.isActive);
        if (this.activeEvent) {
          this.loadBatchesAndProducts(this.activeEvent.id);
        } else {
          this.loading = false;
        }
      },
      error: () => this.loading = false
    });
  }

  loadBatchesAndProducts(eventId: number) {
    this.http.get(`${environment.apiUrl}/bazaar/batches`).subscribe((batches: any) => {
      this.activeBatch = batches.find(b => b.event?.id === eventId && b.status === 'OPEN');
      
      this.http.get(`${environment.apiUrl}/bazaar/products`).subscribe((products: any) => {
        this.products = products;
        this.loading = false;
      });
    });
  }

  toggleCart(product: any) {
    const idx = this.cartIds.indexOf(product.id);
    if (idx >= 0) {
      this.cartIds.splice(idx, 1);
    } else {
      this.cartIds.push(product.id);
    }
    this.calculateCart();
  }

  isInCart(productId: number): boolean {
    return this.cartIds.includes(productId);
  }

  calculateCart() {
    this.cartSubtotal = this.cartIds.reduce((sum, id) => {
      const p = this.products.find(x => x.id === id);
      return sum + (p ? Number(p.sellingPrice) : 0);
    }, 0);

    if (this.cartIds.length === 0) {
      this.grandTotal = 0;
    } else {
      let t = this.cartSubtotal + this.goodieBagFee + this.appFee - this.subsidy;
      this.grandTotal = t < 0 ? 0 : t;
    }
  }

  checkout() {
    if (this.cartIds.length === 0) return;

    const dialogRef = this.dialog.open(BazaarCheckoutDialogComponent, { width: '500px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.checkingOut = true;
        this.http.post(`${environment.apiUrl}/bazaar/orders/checkout`, {
          eventId: this.activeEvent.id,
          productIds: this.cartIds,
          termsAccepted: true
        }).subscribe({
          next: (res) => {
            this.checkingOut = false;
            this.cartIds = [];
            this.calculateCart();
            this.router.navigate(['/bazaar/orders']);
          },
          error: (err) => {
            this.checkingOut = false;
            alert('Gagal membuat pesanan: ' + (err.error?.message || err.message));
          }
        });
      }
    });
  }

  getProduct(id: number): any {
    return this.products.find(p => p.id === id);
  }
}

