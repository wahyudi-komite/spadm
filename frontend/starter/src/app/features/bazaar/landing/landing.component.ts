import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';

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
      <button class="spadm-checkout-confirm" mat-flat-button color="primary" [disabled]="form.invalid" (click)="confirm()">Setuju & Buat Pesanan</button>
    </mat-dialog-actions>
  `,
  styles: [`
    button.spadm-checkout-confirm:disabled {
      background: #cbd5e1 !important;
      color: #64748b !important;
      box-shadow: none !important;
      opacity: 1;
    }
  `],
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
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, MatProgressSpinnerModule],
  standalone: true
})
export class BazaarLandingComponent implements OnInit {
  activeEvent: any = null;
  activeBatch: any = null;
  products: any[] = [];
  readonly storageBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
  loading = true;
  
  cartIds: number[] = [];
  cartSubtotal = 0;
  goodieBagFee = 3000;
  appFee = 1000;
  subsidy = 20000;
  grandTotal = 0;

  calculating = false;
  calculationError = '';
  checkingOut = false;
  private calculationVersion = 0;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    private feedback: DialogFeedbackService
  ) {}

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
    if (this.cartIds.length === 0) {
      this.calculationVersion++;
      this.calculating = false;
      this.calculationError = '';
      this.resetBreakdown();
      return;
    }

    const version = ++this.calculationVersion;
    this.calculating = true;
    this.calculationError = '';

    this.http.post(`${environment.apiUrl}/bazaar/orders/calculate`, {
      productIds: this.cartIds,
    }).subscribe({
      next: (result: any) => {
        if (version !== this.calculationVersion) return;

        const breakdown = result.breakdown;
        this.cartSubtotal = Number(breakdown.productSubtotal);
        this.goodieBagFee = Number(breakdown.goodieBagFee);
        this.appFee = Number(breakdown.applicationFee);
        this.subsidy = Number(breakdown.subsidy);
        this.grandTotal = Number(breakdown.grandTotal);
        this.calculating = false;
      },
      error: (error) => {
        if (version !== this.calculationVersion) return;

        this.calculating = false;
        this.calculationError = error.error?.message || 'Rincian harga tidak dapat dihitung.';
        this.resetBreakdown();
      },
    });
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
          next: (order: any) => {
            this.checkingOut = false;
            this.cartIds = [];
            this.calculateCart();
            this.router.navigate(['/bazaar/orders', order.id, 'payment']);
          },
          error: (err) => {
            this.checkingOut = false;
            this.feedback.error('Gagal membuat pesanan: ' + (err.error?.message || err.message));
          }
        });
      }
    });
  }

  getProduct(id: number): any {
    return this.products.find(p => p.id === id);
  }

  productImageUrl(imageUrl: string): string {
    return /^https?:\/\//i.test(imageUrl)
      ? imageUrl
      : `${this.storageBaseUrl}${imageUrl}`;
  }

  private resetBreakdown() {
    this.cartSubtotal = 0;
    this.goodieBagFee = 0;
    this.appFee = 0;
    this.subsidy = 0;
    this.grandTotal = 0;
  }
}

