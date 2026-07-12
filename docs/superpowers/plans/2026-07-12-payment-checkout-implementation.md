# Phase 5-6: Checkout & QRIS Payment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete checkout-to-payment flow: cart, checkout, QRIS payment with provider abstraction.

**Architecture:** New frontend components (CartService, cart sidebar, checkout, payment) integrate with existing backend (orders, payments). Backend adds QrisProvider interface with MockQrisProvider, injectable via DI token.

**Tech Stack:** Angular 19 standalone, PrimeNG 20, NestJS, TypeORM

## Global Constraints

- Follow existing patterns in frontend (standalone components, inject() DI)
- Use PrimeNG components (Sidebar, Message, Button, Divider) not Material
- Backend: follow existing module structure (controller/service/entity)
- No real payment provider — mock only
- Cart: max 1 unit per product, multiple products allowed
- Payment expiry: 60 minutes (stored in DB, not yet scheduled)

---

## File Structure

### Frontend — New Files
- `frontend/starter/src/app/features/bazaar/services/cart.service.ts`
- `frontend/starter/src/app/features/bazaar/cart/cart-sidebar.component.ts`
- `frontend/starter/src/app/features/bazaar/cart/cart-sidebar.component.html`
- `frontend/starter/src/app/features/bazaar/checkout/checkout.component.ts`
- `frontend/starter/src/app/features/bazaar/checkout/checkout.component.html`
- `frontend/starter/src/app/features/bazaar/payment/payment.component.ts`
- `frontend/starter/src/app/features/bazaar/payment/payment.component.html`

### Frontend — Modified Files
- `frontend/starter/src/app/features/bazaar/bazaar.routes.ts`
- `frontend/starter/src/app/features/bazaar/landing/landing.component.ts`
- `frontend/starter/src/app/features/bazaar/landing/landing.component.html`

### Backend — New Files
- `backend/src/modules/payments/providers/qris-provider.interface.ts`
- `backend/src/modules/payments/providers/mock-qris.provider.ts`
- `backend/src/modules/payments/providers/provider.module.ts`

### Backend — Modified Files
- `backend/src/modules/payments/payments.module.ts`
- `backend/src/modules/payments/payments.service.ts`
- `backend/src/modules/payments/payments.controller.ts`

---

### Task 1: Backend — QrisProvider Interface + Mock Implementation

**Files:**
- Create: `backend/src/modules/payments/providers/qris-provider.interface.ts`
- Create: `backend/src/modules/payments/providers/mock-qris.provider.ts`
- Create: `backend/src/modules/payments/providers/provider.module.ts`

**Interfaces:**
- Produces: `QRIS_PROVIDER` injection token, `QrisProvider` interface, `MockQrisProvider` class, `ProviderModule`

- [ ] **Step 1: Create interface + token**

```typescript
// backend/src/modules/payments/providers/qris-provider.interface.ts
export const QRIS_PROVIDER = 'QRIS_PROVIDER';

export interface QrisProvider {
  generateQris(amount: number, referenceId: string): Promise<{
    qrisPayload: string;
    expiresAt: Date;
  }>;
  verifyPayment(referenceId: string): Promise<boolean>;
  getPaymentStatus(referenceId: string): Promise<string>;
  getName(): string;
}
```

- [ ] **Step 2: Create MockQrisProvider**

```typescript
// backend/src/modules/payments/providers/mock-qris.provider.ts
import { Injectable } from '@nestjs/common';
import { QrisProvider } from './qris-provider.interface';

@Injectable()
export class MockQrisProvider implements QrisProvider {
  async generateQris(amount: number, referenceId: string) {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes
    const qrisPayload = `00020101021226590014ID.CO.QRIS.WWW01189360091530182604970214488319089063610303UME51440014ID.CO.QRIS.WWW0215ID10242200194880303UME5204541153033605404${String(amount).padStart(5, '0')}5802ID5919SPADM BAZAAR 20266007JAKARTA61051211062220118${referenceId}6304${Math.floor(1000 + Math.random() * 9000)}`;
    return { qrisPayload, expiresAt };
  }

  async verifyPayment(referenceId: string): Promise<boolean> {
    return false; // Mock: must be manually verified
  }

  async getPaymentStatus(referenceId: string): Promise<string> {
    return 'PENDING';
  }

  getName(): string {
    return 'mock';
  }
}
```

- [ ] **Step 3: Create ProviderModule**

```typescript
// backend/src/modules/payments/providers/provider.module.ts
import { Module, Global } from '@nestjs/common';
import { QRIS_PROVIDER } from './qris-provider.interface';
import { MockQrisProvider } from './mock-qris.provider';

@Global()
@Module({
  providers: [
    {
      provide: QRIS_PROVIDER,
      useClass: MockQrisProvider,
    },
  ],
  exports: [QRIS_PROVIDER],
})
export class ProviderModule {}
```

- [ ] **Step 4: Verify files compile**

```bash
cd backend && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/payments/providers/
git commit -m "feat(payment): add QrisProvider interface + MockQrisProvider"
```

---

### Task 2: Backend — Update PaymentsService + Controller

**Files:**
- Modify: `backend/src/modules/payments/payments.service.ts`
- Modify: `backend/src/modules/payments/payments.controller.ts`
- Modify: `backend/src/modules/payments/payments.module.ts`

**Interfaces:**
- Consumes: `QRIS_PROVIDER` from Task 1
- Produces: `POST /payments/manual-verify/:referenceId` endpoint

- [ ] **Step 1: Update PaymentsModule to import ProviderModule**

```typescript
// backend/src/modules/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { PaymentStatusHistory } from './entities/payment-status-history.entity';
import { OrdersModule } from '../bazaar/orders/orders.module';
import { DistributionsModule } from '../bazaar/distributions/distributions.module';
import { ProviderModule } from './providers/provider.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentStatusHistory]),
    OrdersModule,
    DistributionsModule,
    ProviderModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
```

- [ ] **Step 2: Update PaymentsService to use QrisProvider**

```typescript
// backend/src/modules/payments/payments.service.ts
import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { PaymentStatusHistory } from './entities/payment-status-history.entity';
import { OrdersService } from '../bazaar/orders/orders.service';
import { DistributionsService } from '../bazaar/distributions/distributions.service';
import { QRIS_PROVIDER, QrisProvider } from './providers/qris-provider.interface';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(PaymentStatusHistory)
    private statusHistoryRepo: Repository<PaymentStatusHistory>,
    private ordersService: OrdersService,
    private distributionsService: DistributionsService,
    @Inject(QRIS_PROVIDER)
    private qrisProvider: QrisProvider,
  ) {}

  async generatePayment(orderId: number) {
    const order = await this.ordersService.getOrderById(orderId);
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    let payment = await this.paymentRepo.findOne({ where: { order: { id: orderId } } });
    if (!payment) {
      const referenceId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const { qrisPayload, expiresAt } = await this.qrisProvider.generateQris(order.grandTotal, referenceId);

      payment = this.paymentRepo.create({
        order: { id: orderId },
        referenceId,
        amount: order.grandTotal,
        status: PaymentStatus.PENDING,
        qrisPayload,
        expiresAt,
      });
      await this.paymentRepo.save(payment);

      await this.statusHistoryRepo.save(
        this.statusHistoryRepo.create({
          payment: { id: payment.id },
          status: PaymentStatus.PENDING,
          notes: `QRIS Generated via ${this.qrisProvider.getName()}`,
        })
      );
    }
    return payment;
  }

  async manualVerify(referenceId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { referenceId },
      relations: { order: true },
    });

    if (!payment) throw new NotFoundException('Payment tidak ditemukan');
    if (payment.status === PaymentStatus.PAID) return payment;

    payment.status = PaymentStatus.PAID;
    payment.paidAt = new Date();
    await this.paymentRepo.save(payment);

    await this.statusHistoryRepo.save(
      this.statusHistoryRepo.create({
        payment: { id: payment.id },
        status: PaymentStatus.PAID,
        notes: 'Manual verification by admin',
      })
    );

    await this.ordersService.updateOrderStatus(payment.order.id, 'PAID');
    await this.distributionsService.generatePickupToken(payment.order.id);

    return payment;
  }

  async getPaymentByOrder(orderId: number) {
    return this.paymentRepo.findOne({ where: { order: { id: orderId } } });
  }
}
```

- [ ] **Step 3: Update PaymentsController**

```typescript
// backend/src/modules/payments/payments.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate/:orderId')
  generatePayment(@Param('orderId') orderId: number) {
    return this.paymentsService.generatePayment(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  getPaymentByOrder(@Param('orderId') orderId: number) {
    return this.paymentsService.getPaymentByOrder(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('manual-verify/:referenceId')
  manualVerify(@Param('referenceId') referenceId: string) {
    return this.paymentsService.manualVerify(referenceId);
  }
}
```

- [ ] **Step 4: Remove old simulateWebhook endpoint (no longer needed, replaced by manual-verify)**

Verify no remaining references to `simulateWebhookSuccess`.

- [ ] **Step 5: Verify backend compiles**

```bash
cd backend && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/payments/
git commit -m "feat(payment): update service + controller to use QrisProvider, add manual-verify"
```

---

### Task 3: Frontend — CartService

**Files:**
- Create: `frontend/starter/src/app/features/bazaar/services/cart.service.ts`

**Interfaces:**
- Consumes: `BazaarProduct` type (existing from products entity)
- Produces: `CartService` with `addProduct`, `removeProduct`, `clear`, `products$`, `total$`, `count$`

- [ ] **Step 1: Create CartService**

```typescript
// frontend/starter/src/app/features/bazaar/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';

export interface CartProduct {
  id: number;
  name: string;
  sellingPrice: number;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _products = new BehaviorSubject<CartProduct[]>([]);

  products$ = this._products.asObservable();
  count$ = this._products.pipe(map(p => p.length));
  total$ = this._products.pipe(map(p => p.reduce((sum, item) => sum + Number(item.sellingPrice), 0)));

  addProduct(product: CartProduct): void {
    const current = this._products.value;
    if (current.some(p => p.id === product.id)) return;
    this._products.next([...current, product]);
  }

  removeProduct(productId: number): void {
    this._products.next(this._products.value.filter(p => p.id !== productId));
  }

  clear(): void {
    this._products.next([]);
  }

  getProducts(): CartProduct[] {
    return this._products.value;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/starter/src/app/features/bazaar/services/cart.service.ts
git commit -m "feat(bazaar): add CartService for checkout flow"
```

---

### Task 4: Frontend — Cart Sidebar Component

**Files:**
- Create: `frontend/starter/src/app/features/bazaar/cart/cart-sidebar.component.ts`
- Create: `frontend/starter/src/app/features/bazaar/cart/cart-sidebar.component.html`

**Interfaces:**
- Consumes: `CartService` from Task 3
- Produces: Cart sidebar UI component

- [ ] **Step 1: Create component TS**

```typescript
// frontend/starter/src/app/features/bazaar/cart/cart-sidebar.component.ts
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { CartProduct } from '../services/cart.service';

@Component({
  selector: 'bazaar-cart-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, RouterLink, SidebarModule, ButtonModule, DividerModule],
  template: `
    <p-sidebar [(visible)]="visible" position="right" styleClass="w-96">
      <ng-template pTemplate="header">
        <h3 class="text-lg font-semibold m-0">Keranjang Belanja</h3>
      </ng-template>

      <div class="flex flex-col gap-4">
        <div *ngIf="products().length === 0" class="text-gray-400 text-center py-8">
          Keranjang masih kosong
        </div>

        <div *ngFor="let product of products()" class="flex items-center justify-between">
          <div class="flex-1">
            <div class="font-medium">{{ product.name }}</div>
            <div class="text-sm text-gray-500">{{ product.sellingPrice | currency:'IDR':'symbol':'1.0-0' }}</div>
          </div>
          <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm"
            (click)="remove.emit(product.id)"></button>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div *ngIf="products().length > 0">
          <p-divider></p-divider>
          <div class="flex justify-between font-semibold text-lg mb-4">
            <span>Total</span>
            <span>{{ total() | currency:'IDR':'symbol':'1.0-0' }}</span>
          </div>
          <button pButton label="Lanjut ke Checkout" class="w-full" severity="success"
            [routerLink]="['/bazaar/checkout']" (click)="visible = false"></button>
        </div>
      </ng-template>
    </p-sidebar>
  `,
})
export class BazaarCartSidebarComponent {
  visible = false;
  products = input<CartProduct[]>([]);
  total = input<number>(0);
  remove = output<number>();

  open(): void {
    this.visible = true;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/starter/src/app/features/bazaar/cart/
git commit -m "feat(bazaar): add CartSidebar component"
```

---

### Task 5: Frontend — Update Bazaar Landing with Add-to-Cart

**Files:**
- Modify: `frontend/starter/src/app/features/bazaar/landing/landing.component.ts`
- Modify: `frontend/starter/src/app/features/bazaar/landing/landing.component.html`

**Interfaces:**
- Consumes: `CartService` (Task 3), `BazaarCartSidebarComponent` (Task 4)

- [ ] **Step 1: Read existing landing component to understand current UI**

- [ ] **Step 2: Update landing component TS**

Add cart injection, product listing integration, and sidebar reference.

```typescript
// Add to imports in landing.component.ts
import { CartService, CartProduct } from '../services/cart.service';
import { BazaarCartSidebarComponent } from '../cart/cart-sidebar.component';
```

- [ ] **Step 3: Update landing template**

Add "Tambah ke Keranjang" button per product + cart sidebar + cart icon in header.

- [ ] **Step 4: Commit**

```bash
git add frontend/starter/src/app/features/bazaar/landing/
git commit -m "feat(bazaar): add add-to-cart to landing page"
```

---

### Task 6: Frontend — Checkout Component

**Files:**
- Create: `frontend/starter/src/app/features/bazaar/checkout/checkout.component.ts`
- Create: `frontend/starter/src/app/features/bazaar/checkout/checkout.component.html`

**Interfaces:**
- Consumes: `CartService` (Task 3), HttpClient
- Produces: Checkout UI, redirect to payment page

- [ ] **Step 1: Create checkout component TS**

```typescript
// frontend/starter/src/app/features/bazaar/checkout/checkout.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { CartService } from '../services/cart.service';
import { firstValueFrom } from 'rxjs';

interface CartCalculation {
  products: any[];
  breakdown: {
    productSubtotal: number;
    goodieBagFee: number;
    applicationFee: number;
    subsidy: number;
    grandTotal: number;
  };
}

@Component({
  selector: 'bazaar-checkout',
  standalone: true,
  imports: [NgIf, CurrencyPipe, RouterLink, ButtonModule, MessageModule, DividerModule, CardModule],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-6">Checkout</h2>

      <p-message *ngIf="error" severity="error" [text]="error" styleClass="w-full mb-4"></p-message>
      <p-message *ngIf="loading" severity="info" text="Menghitung pesanan..." styleClass="w-full mb-4"></p-message>

      <div *ngIf="calculation" class="space-y-4">
        <p-card>
          <ng-template pTemplate="header">
            <div class="px-6 pt-4 font-semibold text-lg">Ringkasan Pesanan</div>
          </ng-template>
          <div class="space-y-2">
            <div *ngFor="let product of calculation.products" class="flex justify-between">
              <span>{{ product.name }}</span>
              <span>{{ product.sellingPrice | currency:'IDR':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </p-card>

        <p-card>
          <ng-template pTemplate="header">
            <div class="px-6 pt-4 font-semibold text-lg">Rincian Biaya</div>
          </ng-template>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>Subtotal Produk</span>
              <span>{{ calculation.breakdown.productSubtotal | currency:'IDR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="flex justify-between">
              <span>Goodie Bag</span>
              <span>{{ calculation.breakdown.goodieBagFee | currency:'IDR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="flex justify-between">
              <span>Biaya Aplikasi</span>
              <span>{{ calculation.breakdown.applicationFee | currency:'IDR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="flex justify-between text-green-600">
              <span>Subsidi</span>
              <span>-{{ calculation.breakdown.subsidy | currency:'IDR':'symbol':'1.0-0' }}</span>
            </div>
            <p-divider></p-divider>
            <div class="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{{ calculation.breakdown.grandTotal | currency:'IDR':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </p-card>

        <div class="flex gap-3">
          <button pButton label="Kembali" severity="secondary" [routerLink]="['/bazaar']"></button>
          <button pButton label="Konfirmasi Pesanan" severity="success" (click)="confirmOrder()"
            [loading]="submitting"></button>
        </div>
      </div>
    </div>
  `,
})
export class BazaarCheckoutComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cartService = inject(CartService);

  calculation: CartCalculation | null = null;
  loading = false;
  error = '';
  submitting = false;

  async ngOnInit() {
    const products = this.cartService.getProducts();
    if (products.length === 0) {
      this.router.navigate(['/bazaar']);
      return;
    }
    this.loading = true;
    try {
      this.calculation = await firstValueFrom(
        this.http.post<CartCalculation>('/api/bazaar/orders/calculate', {
          productIds: products.map(p => p.id),
        })
      );
    } catch (err: any) {
      this.error = err.error?.message || 'Gagal menghitung pesanan';
    } finally {
      this.loading = false;
    }
  }

  async confirmOrder() {
    const products = this.cartService.getProducts();
    this.submitting = true;
    this.error = '';
    try {
      const order: any = await firstValueFrom(
        this.http.post('/api/bazaar/orders/checkout', {
          eventId: 1,
          productIds: products.map(p => p.id),
        })
      );
      this.cartService.clear();
      this.router.navigate(['/bazaar/orders', order.id, 'payment']);
    } catch (err: any) {
      this.error = err.error?.message || 'Gagal checkout';
    } finally {
      this.submitting = false;
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/starter/src/app/features/bazaar/checkout/
git commit -m "feat(bazaar): add checkout component with calculation + confirm"
```

---

### Task 7: Frontend — Payment Component

**Files:**
- Create: `frontend/starter/src/app/features/bazaar/payment/payment.component.ts`
- Create: `frontend/starter/src/app/features/bazaar/payment/payment.component.html`

**Interfaces:**
- Consumes: HttpClient, ActivatedRoute
- Produces: Payment UI with QRIS display + polling

- [ ] **Step 1: Create payment component TS**

```typescript
// frontend/starter/src/app/features/bazaar/payment/payment.component.ts
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { firstValueFrom, interval, Subscription, switchMap, takeWhile } from 'rxjs';

interface Payment {
  id: number;
  referenceId: string;
  amount: number;
  status: string;
  qrisPayload: string;
  expiresAt: string;
  paidAt: string | null;
}

@Component({
  selector: 'bazaar-payment',
  standalone: true,
  imports: [NgIf, CurrencyPipe, DatePipe, RouterLink, ButtonModule, MessageModule, CardModule],
  template: `
    <div class="max-w-md mx-auto p-6 text-center" *ngIf="payment">
      <h2 class="text-2xl font-bold mb-2">Pembayaran</h2>
      <p class="text-gray-500 mb-6">Scan QRIS untuk membayar</p>

      <p-card>
        <div class="text-center py-4">
          <div class="bg-white p-4 inline-block rounded-lg border mb-4">
            <code class="text-xs break-all">{{ payment.qrisPayload }}</code>
          </div>
          <div class="text-2xl font-bold mb-2">{{ payment.amount | currency:'IDR':'symbol':'1.0-0' }}</div>
          <div class="text-sm text-gray-500">Referensi: {{ payment.referenceId }}</div>
        </div>
      </p-card>

      <p-message *ngIf="payment.status === 'PAID'" severity="success" text="Pembayaran berhasil!" styleClass="w-full mt-4"></p-message>
      <p-message *ngIf="payment.status === 'EXPIRED'" severity="warn" text="Pembayaran kadaluwarsa" styleClass="w-full mt-4"></p-message>
      <p-message *ngIf="payment.status === 'PENDING'" severity="info" text="Menunggu pembayaran..." styleClass="w-full mt-4"></p-message>

      <div class="flex gap-3 justify-center mt-6">
        <button pButton label="Pesanan Saya" severity="secondary" [routerLink]="['/bazaar/orders']"></button>
        <button *ngIf="payment.status === 'PAID'" pButton label="Dashboard" severity="success" routerLink="/dashboard"></button>
      </div>
    </div>
  `,
})
export class BazaarPaymentComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  payment: Payment | null = null;
  private sub: Subscription | null = null;

  async ngOnInit() {
    const orderId = this.route.snapshot.params['orderId'];
    if (!orderId) return;

    // Generate payment first
    try {
      await firstValueFrom(this.http.post(`/api/payments/generate/${orderId}`, {}));
    } catch {}

    // Start polling
    this.sub = interval(5000).pipe(
      switchMap(() => this.http.get<Payment>(`/api/payments/order/${orderId}`)),
      takeWhile(p => p.status === 'PENDING', true),
    ).subscribe(p => {
      this.payment = p;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/starter/src/app/features/bazaar/payment/
git commit -m "feat(bazaar): add payment component with QRIS display + polling"
```

---

### Task 8: Frontend — Update Bazaar Routes

**Files:**
- Modify: `frontend/starter/src/app/features/bazaar/bazaar.routes.ts`

- [ ] **Step 1: Add checkout and payment routes**

```typescript
// frontend/starter/src/app/features/bazaar/bazaar.routes.ts
import { Routes } from '@angular/router';
import { BazaarLandingComponent } from './landing/landing.component';
import { BazaarOrdersComponent } from './orders/orders.component';
import { BazaarCheckoutComponent } from './checkout/checkout.component';
import { BazaarPaymentComponent } from './payment/payment.component';

export default [
  { path: '', component: BazaarLandingComponent },
  { path: 'checkout', component: BazaarCheckoutComponent },
  { path: 'orders', component: BazaarOrdersComponent },
  { path: 'orders/:orderId/payment', component: BazaarPaymentComponent },
] as Routes;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/starter/src/app/features/bazaar/bazaar.routes.ts
git commit -m "feat(bazaar): add checkout + payment routes"
```

---

### Task 9: Verify & Smoke Test

- [ ] **Step 1: Verify backend compiles**

```bash
cd backend && npx tsc --noEmit
```

- [ ] **Step 2: Verify frontend compiles**

```bash
cd frontend/starter && npx tsc --noEmit
```

- [ ] **Step 3: Start backend, start frontend, test flow**

- /bazaar → select products → cart sidebar → checkout → perhitungan → confirm → payment page → QRIS display
- POST /payments/manual-verify/:referenceId → payment PAID → order PAID → pickup token generated

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix: post-review fixes for checkout-payment flow"
```
