# Audit Findings — Phases 1-5

> Tanggal: 2026-07-15
> Lingkup: Backend (`backend/src/`) + Frontend (`frontend/starter/src/app/`)
> Total: **89 findings** (18 HIGH, 36 MEDIUM, 34 LOW)

---

# A. Backend — Auth & RBAC

## HIGH

### A-H1. Hardcoded default password fallback — `MembersService`
- **File:** `backend/src/modules/members/members.service.ts:127, 169, 346`
- **Deskripsi:** `configService.get('DEFAULT_MEMBER_PASSWORD') || 'SmartCare'` — jika env var tidak diset, fallback ke string `'SmartCare'`. Semua member import dapat password yang sama dan predictable.
- **Fix:** Ganti ke `getOrThrow('DEFAULT_MEMBER_PASSWORD')`. Hapus `|| 'SmartCare'`.

### A-H2. `MembersController.update` pakai `@Body() data: any`
- **File:** `backend/src/modules/members/members.controller.ts:41`
- **Deskripsi:** Tidak ada DTO, tidak ada validasi. Attacker bisa overwrite kolom `deletedAt`, `createdAt`, dll.
- **Fix:** Buat `UpdateMemberDto` dengan `@IsOptional()` + whitelist.

### A-H3. `DB_PASSWORD` default fallback ke string kosong
- **File:** `backend/src/config/database.config.ts:7`
- **Deskripsi:** `password: process.env.DB_PASSWORD || ''` — jika env tidak ter-set, koneksi tanpa password.
- **Fix:** Hapus `|| ''`, gunakan `getOrThrow` atau env validation.

### A-H4. `LoginHistory` dan `PasswordResetToken` missing FK relations
- **File:**
  - `backend/src/modules/auth/entities/login-history.entity.ts:8-9`
  - `backend/src/modules/auth/entities/password-reset-token.entity.ts:8-9`
- **Deskripsi:** Kolom `userId` cuma `@Column()` biasa tanpa `@ManyToOne`. Orphaned records bisa terjadi.
- **Fix:** Tambah `@ManyToOne(() => User) @JoinColumn({ name: 'userId' })`.

### A-H5. Refresh token dari request body (bypass httpOnly cookie)
- **File:** `backend/src/modules/auth/auth.controller.ts:44, 73`
- **Deskripsi:** `req.cookies?.refreshToken || req.body?.refreshToken` — body fallback memungkinkan XSS mencuri token.
- **Fix:** Hapus `|| req.body?.refreshToken`. Cookie-only.

### A-H6. `signOut` return 200 padahal token tidak ada
- **File:** `backend/src/modules/auth/auth.service.ts:191-192`
- **Deskripsi:** Logout tanpa refresh token tetap return "Logout berhasil" tanpa invalidasi sesi.
- **Fix:** Wajibkan refresh token, atau invalidate ALL sesi user.

### A-H7. `ChangePasswordDto` tidak ada password complexity
- **File:** `backend/src/modules/auth/dto/change-password.dto.ts:13`
- **Deskripsi:** Cuma `@MinLength(8)`. Tidak ada upper/lower/digit.
- **Fix:** Tambah `@Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)`.

## MEDIUM

### A-M1. `AreaAccessGuard` pakai hardcoded role names
- **File:** `backend/src/common/guards/area-access.guard.ts:41`
- **Deskripsi:** `['SUPER_ADMIN', 'BAZAAR_ADMIN'].includes(...)` — jika role diganti nama, guard rusak.
- **Fix:** Ganti ke permission-based check.

### A-M2. `PermissionsGuard` query tiap request tanpa cache
- **File:** `backend/src/common/guards/permissions.guard.ts:30-41`
- **Deskripsi:** 4 tabel join tiap request guarded. Tidak ada caching.
- **Fix:** Tambah in-memory cache (TTL 30s).

### A-M3. `AuditLogService` pakai `Record<string, any>`
- **File:** `backend/src/modules/audit-logs/audit-log.entity.ts:24-27`, `audit-log.service.ts:19-20`
- **Deskripsi:** JSON columns tidak type-safe, bisa menyimpan circular reference.
- **Fix:** Ganti `any` ke `Record<string, unknown>`.

### A-M4. `PermissionsGuard` pakai `DataSource.getRepository()` bukan injected repository
- **File:** `backend/src/common/guards/permissions.guard.ts:12, 30`
- **Deskripsi:** Anti-pattern yang menyulitkan testing.
- **Fix:** Inject repository langsung via `@InjectRepository(UserRole)`.

### A-M5. `UserRoleHistory.action` pakai TypeORM `enum` — compatibility risk
- **File:** `backend/src/modules/roles/user-role-history.entity.ts:28`
- **Deskripsi:** MySQL ENUM non-standard SQL, rawan migration issues.
- **Fix:** Ganti ke `varchar` + validasi aplikasi.

### A-M6. `MembersService.findAll` duplikasi query logic
- **File:** `backend/src/modules/members/members.service.ts:48-89`
- **Deskripsi:** Branch `if (query.search)` duplikasi seluruh query logic.
- **Fix:** Refactor ke single query path dengan OR syntax.

### A-M7. `generateTokens` pakai `payload as object`
- **File:** `backend/src/modules/auth/auth.service.ts:307, 312`
- **Deskripsi:** Type assertion bypass untuk JWT payload.
- **Fix:** Buat interface `JwtPayload { sub: number; npk: string }`.

### A-M8. `RoleGuard` tidak ada
- **File:** Tidak ditemukan di `common/guards/`
- **Deskripsi:** Guard disebut di dokumentasi tapi tidak pernah diimplementasi.
- **Fix:** Implement atau hapus dari dokumentasi.

## LOW

### A-L1. Unused `IsNull` import
- **File:** `backend/src/modules/auth/auth.service.ts:3`

### A-L2. `RolePermission` entity dead code
- **File:** `backend/src/modules/roles/role-permission.entity.ts`

### A-L3. `MembersModule` tidak declare `Role` + `UserRole` di `TypeOrm.forFeature`
- **File:** `backend/src/modules/members/members.module.ts:12-19`

### A-L4. (Informational) `AuthModule` imports sudah benar
- **File:** `backend/src/modules/auth/auth.module.ts:17`

### A-L5. `AuthController.refresh` tidak ada `@Throttle()`
- **File:** `backend/src/modules/auth/auth.controller.ts:40-65`

### A-L6. Timing leak di `forgotPassword`
- **File:** `backend/src/modules/auth/auth.service.ts:225-241`

### A-L7. `session.entity.ts` tidak ada index di `refreshToken`
- **File:** `backend/src/modules/auth/entities/session.entity.ts:16-17`

### A-L8. `UserRole` entity missing FK di `assignedBy`/`revokedBy`
- **File:** `backend/src/modules/roles/user-role.entity.ts:19-20, 37-38`

### A-L9. `AllExceptionsFilter` tangkap SEMUA error termasuk programming error
- **File:** `backend/src/common/filters/http-exception.filter.ts:4-5`

### A-L10. `SanitizeUser` bisa bocorkan relasi object
- **File:** `backend/src/modules/auth/auth.service.ts:324-326`

### A-L11. `PermissionsGuard` pakai `some()` — OR semantics
- **File:** `backend/src/common/guards/permissions.guard.ts:50`

### A-L12. `importFromExcel` dead code
- **File:** `backend/src/modules/members/members.service.ts:141-200`

### A-L13. `ErrorCode` enum partial usage
- **File:** `backend/src/common/enums/error-code.enum.ts`

### A-L14. `confirmImport` reason leak internal ID
- **File:** `backend/src/modules/members/members.service.ts:352-357`

---

# B. Backend — Bazaar

## HIGH

### B-H1. `AREA_STOCK` inventory mode tidak pernah didecrement
- **File:** `backend/src/modules/bazaar/orders/orders.service.ts:231-232`
- **Deskripsi:** Checkout cuma handle `GLOBAL_STOCK`. Produk `AREA_STOCK` stock-nya tidak pernah dikurangi. Overselling risk.
- **Fix:** Handle per-area stock decrement, atau treat `AREA_STOCK` sebagai `GLOBAL_STOCK`.

### B-H2. TOCTOU race condition di batch status transition
- **File:** `backend/src/modules/bazaar/batches/batches.service.ts:87-112`
- **Deskripsi:** Concurrent requests bisa hasilkan 2 OPEN batch untuk event yang sama.
- **Fix:** Pindahkan `allowedTransitions` check ke dalam transaction, atau pakai `pessimistic_write` lock.

## MEDIUM

### B-M1. Delete event pakai permission `bazaar.event.update`
- **File:** `backend/src/modules/bazaar/events/events.controller.ts:47`
- **Deskripsi:** User dengan update permission bisa hapus event. Seharusnya `bazaar.event.delete`.
- **Fix:** Ganti `@Permissions('bazaar.event.update')` → `@Permissions('bazaar.event.delete')`.

### B-M2. `as any` cast bypass type safety di order status
- **File:** `backend/src/modules/bazaar/orders/orders.service.ts:363`
- **Deskripsi:** `order.status = status as any` — string apapun bisa masuk DB.
- **Fix:** Validasi status terhadap `Object.values(OrderStatus)`.

### B-M3. Misleading error message duplicate order
- **File:** `backend/src/modules/bazaar/orders/orders.service.ts:296-301`
- **Deskripsi:** Catch `ER_DUP_ENTRY` tapi pesan error selalu bilang "duplicate purchase", padahal bisa juga duplicate pada `order_number`.
- **Fix:** Check constraint mana yang violated.

### B-M4. `inventoryMode` di entity typed sebagai `string`
- **File:** `backend/src/modules/bazaar/products/entities/product.entity.ts:41`
- **Deskripsi:** `inventoryMode: string` — padahal DTO punya `InventoryMode` enum.
- **Fix:** Ganti ke `InventoryMode`.

### B-M5. `member.npk` undefined di receipt PDF
- **File:** `backend/src/modules/bazaar/reports/reports.service.ts:160`
- **Deskripsi:** `member.npk` selalu undefined karena NPK ada di `User`, bukan `Member`. Receipt nampil: `(undefined)`.
- **Fix:** Ganti ke `order.user?.npk`.

### B-M6. Missing soft-delete filter di DistributionArea query
- **File:** `backend/src/modules/bazaar/orders/orders.service.ts:98-101`
- **Deskripsi:** Query area tidak filter `deletedAt: IsNull()`. Area soft-deleted bisa terpakai.
- **Fix:** Tambah `deletedAt: IsNull()`.

### B-M7. No max-iteration safeguard di `uniqueCode` loop
- **File:** `backend/src/modules/bazaar/events/events.service.ts:106-109`
- **Deskripsi:** Loop infinite jika semua suffix terpakai.
- **Fix:** Tambah `MAX_ATTEMPTS = 1000` guard.

### B-M8. `BatchesModule` tidak import `AuditLogModule` (sudah @Global — false alarm)
- **File:** `backend/src/modules/bazaar/batches/batches.module.ts:1-12`
- **Status:** NOT AN ISSUE — `AuditLogModule` is `@Global()`.

## LOW

### B-L1. Dead DTO classes: `create-distribution.dto.ts`, `update-distribution.dto.ts`
- **File:** `backend/src/modules/bazaar/distributions/dto/`

### B-L2. SCHEDULED status tidak punya endpoint
- **File:** `backend/src/modules/bazaar/batches/batches.service.ts:13-21`

### B-L3. No `createdBy`/`updatedBy` di event & product entities
- **File:** `backend/src/modules/bazaar/events/entities/event.entity.ts`, `products/entities/product.entity.ts`

### B-L4. Stock check untuk AREA_STOCK jalan tapi tidak didecrement (duplikat B-H1)
- **File:** `backend/src/modules/bazaar/orders/orders.service.ts:56, 170`

### B-L5. `DistributionHistory` plain IDs instead of relations
- **File:** `backend/src/modules/bazaar/distributions/entities/distribution-history.entity.ts`

### B-L6. Raw SQL di `canReadReports`
- **File:** `backend/src/modules/bazaar/reports/reports.service.ts:215-222`

---

# C. Frontend

## Security

### C-H1. Hardcoded credentials in sign-in
- **File:** `frontend/starter/src/app/modules/auth/sign-in/sign-in.component.ts:44-71`
- **Deskripsi:** `quickLogin()` set password `'SmartCare'`. Array `quickUsers` expose NPK nyata.
- **Fix:** Guard dengan `isProduction` flag, atau hapus untuk production.

### C-H2. Auth guard redirect loop
- **File:** `frontend/starter/src/app/core/auth/guards/auth.guard.ts:33-36,43-48`
- **Deskripsi:** Duplikasi logic redirect URL. Jika `user$` emit user kosong, terjadi flicker.
- **Fix:** Deduplikasi redirect URL logic.

### C-H3. Mock data HTML injection risk
- **File:** `frontend/starter/src/app/mock-api/common/notifications/data.ts:20`
- **Deskripsi:** Notification descriptions mengandung raw HTML. Risk XSS jika di-render dengan `[innerHTML]`.
- **Fix:** Sanitize atau strip HTML tags.

### C-M1. Token sent in WebSocket connection — origin parsing rawan
- **File:** `frontend/starter/src/app/layout/common/notifications/notifications-websocket.service.ts:35-36`
- **Deskripsi:** Regex `replace(/\/api\/?$/, '')` bisa produce wrong origin jika API URL tidak berakhiran `/api`.
- **Fix:** Buat environment variable terpisah untuk socket origin.

### C-M2. Error messages leak server internals
- **Files:**
  - `frontend/starter/src/app/features/bazaar/landing/landing.component.ts:168`
  - `frontend/starter/src/app/features/bazaar/orders/orders.component.ts:92`
  - `frontend/starter/src/app/features/bazaar/payment/payment.component.ts:86`
  - `frontend/starter/src/app/modules/admin/bazaar/distribution/distribution.component.ts:87-89`
- **Deskripsi:** `err.error?.message || err.message` bisa leak internal server error ke user.
- **Fix:** Buat error-mapping utility. Fallback ke "Terjadi kesalahan" untuk unknown errors.

## Dead Code

### C-H4. Unused NgModules
- **Files:**
  - `frontend/starter/src/app/shared/modules/shared.module.ts`
  - `frontend/starter/src/app/shared/modules/share-dialog.module.ts`
- **Deskripsi:** Dua NgModules tidak pernah di-import oleh komponen mana pun.
- **Fix:** Hapus atau import sesuai intended.

### C-H5. Duplicate `SearchInputComponent`
- **Files:**
  - `frontend/starter/src/app/modules/comp/tabel/search-input/`
  - `frontend/starter/src/app/shared/forms/search-input/`
- **Deskripsi:** Kedua file pakai selector `app-search-input` yang sama. Angular pick salah satu secara acak.
- **Fix:** Hapus yang di `modules/comp/tabel/search-input/`, pertahankan `shared/forms/search-input/`.

### C-H6. Never-used interfaces & enums
- **Files:**
  - `frontend/starter/src/app/core/http/api-response.model.ts`
  - `frontend/starter/src/app/core/http/paginated-response.model.ts`
  - `frontend/starter/src/app/core/types/user-role.enum.ts`
  - `frontend/starter/src/app/core/types/status.enum.ts`
- **Deskripsi:** 4 file didefinisikan tapi zero imports.
- **Fix:** Hapus atau implementasikan.

### C-M3. `cleanFilters` utility tergantung PrimeNG tapi tidak dipakai
- **File:** `frontend/starter/src/app/shared/utils/clean-filters.util.ts`

### C-M4. `ExistingValidator` adalah no-op stub
- **File:** `frontend/starter/src/app/shared/validators/existing.validator.ts:7-11`
- **Deskripsi:** `IsUnique()` selalu return `of(null)`. Tidak pernah validasi.
- **Fix:** Implement real async validation atau hapus.

### C-M5. `ApiClient` abstract service never extended
- **File:** `frontend/starter/src/app/core/http/api-client.service.ts`

### C-L1. Stale mock API data files
- **Files:** `mock-api/common/{user,shortcuts,notifications,messages,navigation}/data.ts`
- **Deskripsi:** Navigation data masih diload oleh `app.resolvers.ts`. User mock dipanggil oleh `UserService.get()` yang seharusnya pake real API.
- **Fix:** Pakai real API atau hapus mock files.

## Error Handling

### C-H7. Missing HTTP error handlers di 6 admin components
- **Files:**
  - `frontend/starter/src/app/modules/admin/roles/roles.component.ts:32-34`
  - `frontend/starter/src/app/modules/admin/roles/role-detail.component.ts:31-37`
  - `frontend/starter/src/app/modules/admin/bazaar/events/events.component.ts:78-81`
  - `frontend/starter/src/app/modules/admin/bazaar/products/products.component.ts:95-98`
  - `frontend/starter/src/app/modules/admin/bazaar/batches/batches.component.ts:78-81`
  - `frontend/starter/src/app/modules/admin/bazaar/areas/areas.component.ts:83-86`
- **Deskripsi:** Semua `.subscribe()` tanpa error callback. Jika API gagal, user lihat blank screen.
- **Fix:** Tambah error callback + user-friendly message di setiap subscribe.

### C-M6. `user-roles.component.ts` missing error handling
- **File:** `frontend/starter/src/app/modules/admin/users/user-roles.component.ts:41-52`

### C-M7. Sign-up error swallows server message
- **File:** `frontend/starter/src/app/modules/auth/sign-up/sign-up.component.ts:109`

### C-M8. Reset password general error
- **File:** `frontend/starter/src/app/modules/auth/reset-password/reset-password.component.ts:140`

### C-L2. `payment-history.component.ts` ignore errors silently
- **File:** `frontend/starter/src/app/features/bazaar/payment-history/payment-history.component.ts:27`

## Type Safety

### C-H8. Pervasive `any` types untuk HTTP responses
- **Files:**
  - `modules/admin/roles/roles.component.ts:19` — `roles: any[]`
  - `modules/admin/members/members.component.ts:22` — `members: any[]`
  - `modules/admin/bazaar/events/events.component.ts:64` — `events: any[]`
  - `features/bazaar/landing/landing.component.ts:70-72` — multiple `any`
  - `features/bazaar/orders/orders.component.ts:19` — `orders: any[]`
  - `features/bazaar/payment/payment.component.ts:28-29` — `order: any`, `payment: any`
- **Deskripsi:** 10+ komponen pakai `any` untuk response API. Menghilangkan type-checking.
- **Fix:** Buat interfaces terpisah untuk setiap domain entity.

### C-M9. `_unsubscribeAll: Subject<any>` pattern
- **Files (10+):** `layout/common/notifications/`, `layout/common/messages/`, `layout/common/shortcuts/`, `layout/layout.component.ts`, `layout/layouts/vertical/classy/classy.component.ts`, dll.
- **Fix:** Ganti `Subject<any>` → `Subject<void>`, `.next(null)` → `.next()`.

### C-M10. `currentYear` accessor tidak dipakai template
- **File:** `frontend/starter/src/app/layout/layouts/vertical/classy/classy.component.ts:44-46`
- **Fix:** Hapus unused accessor.

### C-M11. `trackByFn` parameter `item: any`
- **Files:** Notifications, Messages, Shortcuts, QuickChat, Search components
- **Fix:** Type sebagai model specifik.

## UX Bugs

### C-H9. Missing form validation feedback di member detail
- **File:** `frontend/starter/src/app/modules/admin/members/member-detail.component.ts:36-42`
- **Deskripsi:** `save()` panggil PATCH tapi tidak ada feedback kalau API reject data.
- **Fix:** Tampilkan validation errors dari API di samping form fields.

### C-M12. No optimistic UI untuk role toggle
- **File:** `frontend/starter/src/app/modules/admin/roles/role-detail.component.ts:48-56`
- **Deskripsi:** Checkbox tetap di state lama sampai full `loadRole()` complete.

### C-M13. Quick login UI visible di production
- **File:** `frontend/starter/src/app/modules/auth/sign-in/sign-in.component.html:64-76`
- **Fix:** Wrap dengan `@if (!production)` atau hapus.

### C-L3. Inconsistent status badge colors
- **File:** `frontend/starter/src/app/features/bazaar/orders/orders.component.html:32-38`

### C-L4. Landing page campur `*ngIf`/`*ngFor` dengan `@if`/`@for`
- **File:** `frontend/starter/src/app/features/bazaar/landing/landing.component.html`

## Performance

### C-M14. Missing `track`/`trackBy` di `*ngFor`
- **File:** `frontend/starter/src/app/modules/admin/users/user-roles.component.html:10`

### C-M15. Unnecessary `forkJoin` di resolvers
- **File:** `frontend/starter/src/app/app.resolvers.ts:25-30`
- **Deskripsi:** Load messages, notifications, quick-chat, shortcuts di setiap navigasi — padahal panel notif mungkin tidak pernah dibuka.

### C-M16. Nested HTTP calls di `loadBatchesAndProducts`
- **File:** `frontend/starter/src/app/features/bazaar/landing/landing.component.ts:113-121`
- **Deskripsi:** Waterfall pattern — `/bazaar/batches` dulu, baru `/bazaar/products`.
- **Fix:** Pakai `forkJoin` untuk parallel requests.

### C-L5. `calculateCart` tanpa debounce
- **File:** `frontend/starter/src/app/features/bazaar/landing/landing.component.ts:137-171`
- **Fix:** Tambah `debounceTime(300)`.

## Additional

### C-M17. Route conflict: sign-out didefinisikan dua kali
- **File:** `frontend/starter/src/app/app.routes.ts:47-54` dan `63-66`
- **Deskripsi:** Dua definisi route `/sign-out`. Yang kedua (di dalam auth-guarded block) adalah dead code.
- **Fix:** Hapus route kedua (lines 63-66).

### C-M18. `ClassyLayoutComponent` tidak pakai Messages/QuickChat tapi resolver tetap load
- **File:** `frontend/starter/src/app/layout/layouts/vertical/classy/classy.component.ts`

### C-L6. `withCredentials: true` set dua kali di interceptor
- **File:** `frontend/starter/src/app/core/auth/auth.interceptor.ts:12,17,34`
- **Fix:** Hapus clone redundant di line 12.

---

# Ringkasan

| Area | HIGH | MEDIUM | LOW | Total |
|------|------|--------|-----|-------|
| Backend — Auth & RBAC | 7 | 8 | 14 | 30 |
| Backend — Bazaar | 2 | 8 | 6 | 16 |
| Frontend | 9 | 20 | 14 | 43 |
| **Total** | **18** | **36** | **34** | **89** |
