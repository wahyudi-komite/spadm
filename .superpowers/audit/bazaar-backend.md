# Bazaar Backend Audit Report

Audited 7 modules across ~50 files. Covers Phases 1-5 (events, batches, products, orders, distributions, reports).

---

## HIGH

### H1 — `orders.service.ts:231-232` — AREA_STOCK inventory mode completely unhandled

**File:** `backend/src/modules/bazaar/orders/orders.service.ts`
**Lines:** 231-232, also lines 56, 170
**Severity:** HIGH
**Category:** Logic Bug

**Description:**
The `InventoryMode` enum defines `UNLIMITED`, `GLOBAL_STOCK`, and `AREA_STOCK`. The checkout transaction only decrements stock for `GLOBAL_STOCK` mode:

```ts
if (product.inventoryMode === 'GLOBAL_STOCK') {
```

Products with `AREA_STOCK` mode never have their stock decremented during checkout, making the stock field meaningless for area-stock products. This can lead to overselling if area stock is relied upon for availability enforcement.

Additionally, the `calculateCart` and `validateCheckout` stock checks at lines 56 and 170 use `product.inventoryMode !== 'UNLIMITED'` as the trigger for checking stock, meaning they also check stock for `AREA_STOCK` products — creating an inconsistency: stock is validated at calculation time but never deducted at checkout.

**Suggested Fix:**
Handle `AREA_STOCK` in the checkout transaction — decrement per-area stock (likely from a `distribution_area_id`-scoped stock table) or treat it equivalent to `GLOBAL_STOCK` if no per-area stock system exists yet.

---

### H2 — `reports.controller.ts:48-62` — Receipt endpoint lacks permission guard on its own (inherits class-level)

**File:** `backend/src/modules/bazaar/reports/reports.controller.ts`
**Lines:** 46-62
**Severity:** HIGH (false positive — see analysis)
**Category:** Security

**Analysis (NOT a finding):**
On re-review, the class-level `@UseGuards(JwtAuthGuard, PermissionsGuard)` at line 11 applies to all methods including `receipt`. No issue.

---

### H3 — `batches.service.ts:87-97` — TOCTOU race condition in batch status transition

**File:** `backend/src/modules/bazaar/batches/batches.service.ts`
**Lines:** 87-112
**Severity:** HIGH
**Category:** Logic Bug / Race Condition

**Description:**
There's a time-of-check-to-time-of-use gap between the `allowedTransitions` validation (line 87) and the transaction execution (line 93). Two concurrent requests to open different batches for the same event can both pass validation (both are DRAFT), then inside the transaction:

1. Txn-1: updates all other OPEN batches to CLOSED (line 95-107)
2. Txn-2: updates all other OPEN batches to CLOSED (no OPEN batches remain)
3. Txn-1: sets its batch to OPEN (line 109)
4. Txn-2: sets its batch to OPEN (line 109)

Result: two OPEN batches for the same event.

**Suggested Fix:**
Move the `allowedTransitions` check inside the transaction, or add `@VersionColumn` optimistic locking to `BazaarBatch`, or lock the batch row with `pessimistic_write` at the start of the transaction.

---

## MEDIUM

### M1 — `events.controller.ts:47` — Wrong permission name for delete endpoint

**File:** `backend/src/modules/bazaar/events/events.controller.ts`
**Line:** 47
**Severity:** MEDIUM
**Category:** Security

**Description:**
The `DELETE :id` endpoint is guarded with `@Permissions('bazaar.event.update')` instead of a dedicated delete permission (e.g. `'bazaar.event.delete'`). Users with update permission but who should not be allowed to delete events can delete them.

**Suggested Fix:**
```ts
@Permissions('bazaar.event.delete')
```

---

### M2 — `orders.service.ts:363` — `as any` cast bypasses type safety on order status

**File:** `backend/src/modules/bazaar/orders/orders.service.ts`
**Line:** 363
**Severity:** MEDIUM
**Category:** Type Safety

**Description:**
The `updateOrderStatus` method accepts `status: string` and assigns it via `order.status = status as any`. There is no validation that the string is a valid `OrderStatus` enum value. If called with an invalid status string, it will persist garbage to the database.

**Suggested Fix:**
Validate the status against `Object.values(OrderStatus)` before assignment, or accept the enum type directly.

```ts
if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
  throw new BadRequestException(`Invalid status: ${status}`);
}
order.status = status as OrderStatus;
```

---

### M3 — `orders.service.ts:296-301` — Misleading error message for duplicate order number

**File:** `backend/src/modules/bazaar/orders/orders.service.ts`
**Lines:** 296-301
**Severity:** MEDIUM
**Category:** Error Handling

**Description:**
The catch block catches `ER_DUP_ENTRY` (MySQL duplicate key) but attributes it to "Pesanan aktif atau pembelian berhasil untuk event ini sudah tersedia." If the duplicate is actually on `order_number` (unique constraint), the real error is a sequence collision, not a duplicate purchase.

**Suggested Fix:**
Check which constraint was violated, or log the actual error details and return a more accurate message.

---

### M4 — `products.entity.ts:41` — inventoryMode typed as `string` instead of `InventoryMode` enum

**File:** `backend/src/modules/bazaar/products/entities/product.entity.ts`
**Line:** 41
**Severity:** MEDIUM
**Category:** Type Safety

**Description:**
The entity field is declared as:

```ts
@Column({ type: 'varchar', length: 50, default: 'UNLIMITED' })
inventoryMode: string;
```

But the DTO defines a proper `InventoryMode` enum (`create-product.dto.ts:14-17`). The entity should use the enum type for compile-time safety.

**Suggested Fix:**
```ts
import { InventoryMode } from '../dto/create-product.dto';
// ...
@Column({ type: 'varchar', length: 50, default: 'UNLIMITED' })
inventoryMode: InventoryMode;
```

---

### M5 — `reports.service.ts:160` — `member.npk` is undefined at runtime

**File:** `backend/src/modules/bazaar/reports/reports.service.ts`
**Line:** 160
**Severity:** MEDIUM
**Category:** Logic Bug

**Description:**
The receipt PDF template renders:

```ts
doc.text(`Anggota: ${member.name} (${member.npk})`);
```

But `npk` is a column on the `User` entity, not on the `Member` entity. Everywhere else in the codebase, NPK is accessed as `order.user?.npk`. At runtime `member.npk` is `undefined`, so the receipt renders: `Anggota: Budi (undefined)`.

**Suggested Fix:**
```ts
doc.text(`Anggota: ${member.name} (${order.user?.npk || '-'})`);
```

---

### M6 — `orders.service.ts:98-101` — DistributionArea query missing soft-delete filter

**File:** `backend/src/modules/bazaar/orders/orders.service.ts`
**Lines:** 98-101
**Severity:** MEDIUM
**Category:** Security / Logic Bug

**Description:**
When resolving a member's pre-assigned area via `member.distributionAreaId`, the query uses:

```ts
const area = await this.memberRepo.manager.findOne(DistributionArea, {
  where: { id: member.distributionAreaId, isActive: true }
});
```

But it does **not** filter by `deletedAt: IsNull()`. If a `DistributionArea` is soft-deleted but still marked `isActive: true`, it could be resolved as a valid area.

**Suggested Fix:**
Add `deletedAt: IsNull()` to the where clause.

---

### M7 — `events.service.ts:106-109` — No max-iteration safeguard in uniqueCode loop

**File:** `backend/src/modules/bazaar/events/events.service.ts`
**Lines:** 106-109
**Severity:** MEDIUM
**Category:** Logic Bug

**Description:**
The `uniqueCode` method loops indefinitely until it finds a unique code. If the `order_sequences` table grows large and all suffixes are taken (extremely unlikely but theoretically possible), the loop would never terminate, causing a hanging request.

**Suggested Fix:**
```ts
let suffix = 2;
const MAX_ATTEMPTS = 1000;
while (suffix <= MAX_ATTEMPTS) {
  // ...
}
throw new BadRequestException('Tidak dapat menghasilkan kode unik');
```

---

### M8 — `batches.module.ts` — BatchesModule doesn't import AuditLogModule

**File:** `backend/src/modules/bazaar/batches/batches.module.ts`
**Lines:** 1-12
**Severity:** MEDIUM
**Category:** Error Handling / Runtime Error

**Description:**
`BatchesService` depends on `AuditLogService` (injected at line 28 of `batches.service.ts`), but `BatchesModule` does not import `AuditLogModule`. If `AuditLogModule` is not a global module, this will throw at runtime with a circular dependency or missing provider error.

The same applies to `EventsModule`, `ProductsModule`, and `DistributionsModule` which also inject `AuditLogService`.

**Suggested Fix:**
Import `AuditLogModule` in each module that uses `AuditLogService`:
```ts
imports: [TypeOrmModule.forFeature([...]), AuditLogModule],
```

---

## LOW

### L1 — Dead DTO classes: `create-distribution.dto.ts`, `update-distribution.dto.ts`

**Files:**
- `backend/src/modules/bazaar/distributions/dto/create-distribution.dto.ts` (1 line, empty class)
- `backend/src/modules/bazaar/distributions/dto/update-distribution.dto.ts` (4 lines, extends empty PartialType)

**Severity:** LOW
**Category:** Dead Code

**Description:**
These DTOs are never imported or used anywhere in the distributions controller or service. They appear to be scaffolding from a generator that was never wired up.

**Suggested Fix:**
Delete both files if distribution creation via a dedicated DTO was not part of the requirements (confirmations go through `ConfirmDistributionDto` instead).

---

### L2 — `batches.service.ts:13-21` — SCHEDULED status transition has no endpoint

**File:** `backend/src/modules/bazaar/batches/batches.service.ts`
**Lines:** 13-21
**Severity:** LOW
**Category:** Dead Code / Missing functionality

**Description:**
The `allowedTransitions` map permits `DRAFT → SCHEDULED`, but the controller exposes no endpoint to schedule a batch. Only `POST :id/open`, `:id/close`, `:id/start-distribution`, `:id/complete`, and `:id/cancel` exist. The SCHEDULED state is effectively unreachable unless set via `PATCH :id` with an explicit status value.

**Suggested Fix:**
Add a `POST :id/schedule` endpoint if the SCHEDULED state is meaningful, or remove it from the status enum.

---

### L3 — No `createdBy`/`updatedBy` tracking on event and product entities

**Files:**
- `backend/src/modules/bazaar/events/entities/event.entity.ts`
- `backend/src/modules/bazaar/products/entities/product.entity.ts`

**Severity:** LOW
**Category:** Missing feature

**Description:**
`BazaarBatch` entity tracks `createdBy` and `updatedBy`, but `BazaarEvent` and `BazaarProduct` do not. Audit logs capture the create/update events, but the entities themselves don't record who last modified them. This makes it impossible to query "who created this event" directly from the database without parsing audit logs.

**Suggested Fix:**
Add `createdBy`/`updatedBy` columns to `BazaarEvent` and `BazaarProduct` entities, similar to `BazaarBatch`.

---

### L4 — `orders.service.ts:56,170` — Stock check fires for AREA_STOCK too but is never deducted

**File:** `backend/src/modules/bazaar/orders/orders.service.ts`
**Lines:** 56, 170
**Severity:** LOW (duplicate of H1, listed for completeness)
**Category:** Logic Bug / Inconsistency

**Description:**
The stock validation at lines 56 and 170 checks `product.inventoryMode !== 'UNLIMITED'` to decide whether to validate stock, which includes `AREA_STOCK` products. But the checkout deduction at line 231 only handles `GLOBAL_STOCK`. This means `AREA_STOCK` products are validated but the global stock is never decremented — creating a false sense of inventory tracking for area-stock products.

---

### L5 — `DistributionHistory` entity uses plain IDs instead of relations

**File:** `backend/src/modules/bazaar/distributions/entities/distribution-history.entity.ts`
**Lines:** 1-25
**Severity:** LOW
**Category:** Type Safety / Design

**Description:**
`DistributionHistory` stores `distributionId`, `orderId`, `performedBy` as plain number columns without ManyToOne relations. This means joins require manual queries and there's no referential integrity at the ORM level. This is acceptable for an audit/history table but inconsistent with the rest of the codebase.

---

### L6 — `reports.service.ts:215-222` — Raw SQL in canReadReports bypasses TypeORM abstraction

**File:** `backend/src/modules/bazaar/reports/reports.service.ts`
**Lines:** 215-222
**Severity:** LOW
**Category:** Maintainability

**Description:**
The `canReadReports` method uses a raw SQL query with string concatenation (parameterized though, so injection-safe). This could be replaced with a TypeORM `findOne` using relation filters for consistency with the rest of the codebase. The query is parameterized correctly, so no injection risk.

---

## Summary

| Severity | Count | Key Areas |
|----------|-------|-----------|
| **HIGH** | 2 | AREA_STOCK not deducted (orders), TOCTOU race on batch transition (batches) |
| **MEDIUM** | 8 | Wrong delete permission (events), `as any` status cast (orders), NPK on wrong entity (reports), missing soft-delete filter (orders), infinite loop risk (events), misleading error (orders), missing AuditLogModule imports (batches/events/products), inventoryMode typing (products) |
| **LOW** | 6 | Dead DTOs (distributions), unreachable SCHEDULED state (batches), missing createdBy (events/products), type inconsistency (orders), primitive audit entity (distributions), raw SQL (reports) |
| **TOTAL** | **16** | |

**Most critical fix:** H1 (AREA_STOCK unhandled) — orders will silently ignore stock limits for area-stock products.
**Most dangerous bug:** H3 (batch transition race) — can result in two concurrent OPEN batches, causing double-purchase during the same window.
**Most common pattern:** Missing module imports (`AuditLogModule`) across four modules, and leaky `any`/`string` types instead of proper enums.
