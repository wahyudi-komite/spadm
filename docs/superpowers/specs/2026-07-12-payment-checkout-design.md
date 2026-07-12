# Phase 5-6: Checkout & QRIS Payment Design

Date: 2026-07-12
Status: Draft

## Overview

Complete the checkout-to-payment flow for SPADM Bazaar. Phase 5 fills the missing frontend components (cart, checkout). Phase 6 adds QRIS payment with a provider abstraction layer (mock for now, swappable later).

---

## Phase 5 — Checkout & Order Frontend

### Route Structure

```
/bazaar                          → Landing (existing) + Cart sidebar
/bazaar/checkout                 → Checkout page (perhitungan + konfirmasi)
/bazaar/orders                   → Order history (existing)
/bazaar/orders/:id/payment       → Payment page (QRIS + polling)
```

### New Components

#### 1. CartService (`features/bazaar/services/cart.service.ts`)
- `BehaviorSubject<BazaarProduct[]>` — selected products
- `addProduct(product)`, `removeProduct(productId)`, `clear()`
- `total$` computed from selected products

#### 2. BazaarCartSidebarComponent (`features/bazaar/cart/cart-sidebar.component.ts`)
- PrimeNG Sidebar (slide-over from right)
- Shows list of selected products with remove button
- Shows subtotal
- "Lanjut ke Checkout" button → navigate to `/bazaar/checkout`

#### 3. BazaarCheckoutComponent (`features/bazaar/checkout/checkout.component.ts`)
- Calls `POST /bazaar/orders/calculate` with selected product IDs
- Shows breakdown: subtotal, goodie bag fee (3k), app fee (1k), subsidi (20k), grand total
- Confirm button → calls `POST /bazaar/orders/checkout`
- On success → navigate to `/bazaar/orders/:id/payment`

#### 4. BazaarPaymentComponent (`features/bazaar/payment/payment.component.ts`)
- Shows QRIS payload (displayed as QR code or text for mock)
- Polls `GET /payments/order/:orderId` every 5 seconds, stops on PAID/EXPIRED/CANCELLED
- Shows countdown for payment expiry (from mock, default 60 menit)
- On PAID status → show success message + "Lihat Pesanan" button
- On EXPIRED → show "Pembayaran kedaluwarsa" + tombol kembali ke checkout

### Data Flow

```
Landing (pilih produk)
  → CartService.addProduct()
  → Cart sidebar (review)
  → BazaarCheckoutComponent
    → POST /bazaar/orders/calculate → show breakdown
    → POST /bazaar/orders/checkout → receive order
  → BazaarPaymentComponent
    → POST /payments/generate/:orderId → get QRIS
    → Poll GET /payments/order/:id → wait for PAID
  → Success / Order history
```

---

## Phase 6 — QRIS Payment Provider

### Backend: Provider Abstraction

```typescript
// src/modules/payments/providers/qris-provider.interface.ts
interface QrisProvider {
  generateQris(amount: number, referenceId: string): Promise<{
    qrisPayload: string;
    expiresAt: Date;
  }>;
  verifyPayment(referenceId: string): Promise<boolean>;
  getPaymentStatus(referenceId: string): Promise<string>;
  getName(): string;
}

// src/modules/payments/providers/mock-qris.provider.ts
class MockQrisProvider implements QrisProvider {
  // Returns mock QRIS string
  // verifyPayment always returns false (manual verify only)
  // getName() returns 'mock'
}

// src/modules/payments/providers/provider.module.ts
// Registers MockQrisProvider with InjectionToken 'QRIS_PROVIDER'
```

### Provider Injection Token

```typescript
export const QRIS_PROVIDER = 'QRIS_PROVIDER';
```

In `PaymentsModule`, provide `MockQrisProvider` as `QRIS_PROVIDER`.

### Modified PaymentsService

- `generatePayment(orderId)` → call `QrisProvider.generateQris(amount, refId)` instead of hardcoded mock string
- Store `qrisPayload` and `expiresAt` from provider
- New endpoint: `POST /payments/manual-verify/:referenceId` (admin verifikasi manual, protected by PermissionsGuard('payment.verify'), trigger same flow as simulateWebhook)

### Webhook / Manual Verify

Existing `simulateWebhookSuccess` renamed/refactored:
- `POST /payments/manual-verify/:referenceId` — for admin/manual confirmation
- Flow: update payment → PAID → update order → PAID → generatePickupToken → distribution

### Backend: Payment Expiry (Future)

- Schedule job (e.g., `@nestjs/schedule`) to auto-cancel payments past `expiresAt`
- Not implemented in this phase (deferred)

---

## Frontend: New Files Summary

| File | Purpose |
|------|---------|
| `features/bazaar/services/cart.service.ts` | Cart state management |
| `features/bazaar/cart/cart-sidebar.component.ts` | Cart sidebar UI |
| `features/bazaar/checkout/checkout.component.ts` | Checkout + confirm |
| `features/bazaar/payment/payment.component.ts` | Show QRIS + poll status |
| Update `bazaar.routes.ts` | Register new routes |

## Backend: New/Modified Files Summary

| File | Purpose |
|------|---------|
| `payments/providers/qris-provider.interface.ts` | Interface |
| `payments/providers/mock-qris.provider.ts` | Mock implementation |
| `payments/providers/provider.module.ts` | Module registration |
| Modified `payments.service.ts` | Use QRIS_PROVIDER |
| Modified `payments.controller.ts` | Add manual-verify endpoint |

---

## Success Criteria

1. User can select multiple products from landing, review in cart sidebar
2. Checkout shows correct calculation (subtotal + fees - subsidy = grand total)
3. Order created with pending status, redirect to payment page
4. Payment page shows QRIS payload (mock) for the order amount
5. Payment page polls status automatically
6. Manual verify (via backend endpoint or admin) marks payment as PAID
7. PAID payment updates order → paid, generates pickup token
8. Provider abstraction allows swapping Mock → real provider with 1 file change + 1 module change
