# Frontend Audit — Phases 1–5

Audit date: 2026-07-15
Scope: `frontend/starter/src/app/`

---

## SECURITY

### HIGH — Hardcoded credentials in sign-in
**File:** `modules/auth/sign-in/sign-in.component.ts:44-71`  
Quick login exposes hardcoded default passwords — `quickLogin()` sets password to `'SmartCare'`. The `quickUsers` array also leaks real NPK numbers and role hierarchy.

**Fix:** Remove `quickUsers` array and `quickLogin()` before production. Feature-guard behind a `development` flag that is `false` in production builds.

### HIGH — Auth guard redirect loop
**File:** `core/auth/guards/auth.guard.ts:33-36,43-48`  
When unauthenticated, the guard constructs `redirectURL` from `state.url`. The redirect URL logic is duplicated (lines 33-36 identical to 43-48 inside the inner `switchMap`). If `user$` emits an empty user after authentication was confirmed, the guard still redirects to sign-in but the `check()` already returned `true`, creating a flicker.

**Fix:** Deduplicate redirect URL logic. Move the `user$` check before the redirect URL construction, or restructure to avoid re-checking `user$` when user is already known.

### HIGH — Mock data HTML injection risk
**File:** `mock-api/common/notifications/data.ts:20`  
Notification descriptions contain raw HTML (`<strong>`, `<em>`). The `NotificationsService._map()` passes `item.message` directly as `description`. If any template renders this via `[innerHTML]`, it is an XSS vector. Verify the notification template uses text interpolation, not `innerHTML`.

**Fix:** Sanitize notification descriptions in `_map()` using Angular's `DomSanitizer.sanitize(SecurityContext.HTML, ...)`, or strip all HTML tags.

### MEDIUM — Token sent in WebSocket connection query/auth
**File:** `layout/common/notifications/notifications-websocket.service.ts:35-36`  
The JWT token is passed in the Socket.IO `auth` handshake. While standard, the socket origin is derived by stripping `/api/` from `environment.apiUrl` — this regex `replace(/\/api\/?$/, '')` may produce wrong origins if the API URL doesn't end in `/api`.

**Fix:** Make socket origin a separate environment variable. Consider using the interceptor to attach the token instead of the raw socket auth.

### MEDIUM — Error messages leak server internals
**Files:**
- `features/bazaar/landing/landing.component.ts:168` — `err.error?.message || err.message`
- `features/bazaar/orders/orders.component.ts:92` — same pattern
- `features/bazaar/payment/payment.component.ts:86` — same pattern
- `modules/admin/bazaar/distribution/distribution.component.ts:87-89` — same pattern

Raw `err.message` from `HttpErrorResponse` can leak internal server error details to users.

**Fix:** Create an error-mapping utility that returns user-safe messages. Only display `err.error?.message` and fall back to a generic "Terjadi kesalahan" for unknown errors.

---

## DEAD CODE

### HIGH — Unused modules with empty declarations
**Files:**
- `shared/modules/shared.module.ts` — NgModule with empty `declarations` but exports components
- `shared/modules/share-dialog.module.ts` — NgModule with empty `declarations`, never imported

These NgModules are never imported by any component or other module. They add dead weight.

**Fix:** Remove both files, or import them where intended.

### HIGH — Duplicate `SearchInputComponent`
**Files:**
- `modules/comp/tabel/search-input/search-input.component.ts`
- `shared/forms/search-input/search-input.component.ts`

Both use the same selector `app-search-input` and identical logic. Angular will silently pick one at registration time, causing unpredictable behavior.

**Fix:** Delete one duplicate (keep `shared/forms/` if that's the canonical shared location). Remove `modules/comp/tabel/search-input/` entirely.

### HIGH — Never-used interfaces and enums
**Files:**
- `core/http/api-response.model.ts` (`ApiResponse<T>`) — defined, zero imports
- `core/http/paginated-response.model.ts` (`PaginatedResult<T>`) — defined, zero imports
- `core/types/user-role.enum.ts` (`UserRole`) — defined, zero imports
- `core/types/status.enum.ts` (`StatusEnum`) — defined, zero imports

**Fix:** Remove all four files or add imports where they are needed.

### MEDIUM — `cleanFilters` utility depends on PrimeNG but likely unused
**File:** `shared/utils/clean-filters.util.ts`  
Imports `FilterMetadata` from `primeng/api`. No component in the current codebase uses `cleanFilters`.

**Fix:** Remove file or confirm if it's used from outside the audited scope.

### MEDIUM — `ExistingValidator` is a no-op stub
**File:** `shared/validators/existing.validator.ts:7-11`  
`IsUnique()` always returns `of(null)` — it never actually validates uniqueness.

**Fix:** Implement real async validation or remove the file.

### MEDIUM — `ApiClient` abstract service exists but never extended
**File:** `core/http/api-client.service.ts`  
Abstract class with full CRUD methods but zero extensions. The `buildHttpParams` utility is only called from this class.

**Fix:** Remove if unused, or implement concrete clients that extend it.

### LOW — Stale mock API data files
**Files:**
- `mock-api/common/user/data.ts`
- `mock-api/common/shortcuts/data.ts`
- `mock-api/common/notifications/data.ts`
- `mock-api/common/messages/data.ts`
- `mock-api/common/navigation/data.ts`

Navigation data is still loaded in `app.resolvers.ts:18-22` but the rest of the app uses real API (`environment.apiUrl`). The user mock is loaded by `UserService.get()` which calls `api/common/user` — this is dead code since auth service sets user from the real sign-in response.

**Fix:** Make navigation data come from the real API as well, or remove mock files. Fix `UserService.get()` to use `environment.apiUrl` instead of hardcoded `api/common/user`.

---

## ERROR HANDLING

### HIGH — Missing HTTP error handlers in admin components
**Components with zero error handling:**
- `modules/admin/roles/roles.component.ts:32-34` — `.subscribe((res: any) => { this.roles = res; })`
- `modules/admin/roles/role-detail.component.ts:31-37` — two `.subscribe()` calls with no error callback
- `modules/admin/bazaar/events/events.component.ts:78-81` — no error handler
- `modules/admin/bazaar/products/products.component.ts:95-98` — no error handler
- `modules/admin/bazaar/batches/batches.component.ts:78-81` — no error handler
- `modules/admin/bazaar/areas/areas.component.ts:83-86` — no error handler

If any API fails, the user sees a blank screen or broken state with no feedback.

**Fix:** Add error callbacks to every HTTP `.subscribe()`. Show a user-friendly error message and stop any loading spinners.

### MEDIUM — `user-roles.component.ts:41-52` missing error handling
Both `loadRoles()` and `loadUserRoles()` lack error callbacks. If the API fails, the page renders empty tables with no feedback.

**Fix:** Add error handling with retry/refresh feedback.

### MEDIUM — Sign-up error swallows server message
**File:** `modules/auth/sign-up/sign-up.component.ts:109`  
Error callback always shows `'Something went wrong, please try again.'` regardless of actual server error. The `response` parameter has server details but they are ignored.

**Fix:** Show the server error message (`response.error?.message`) instead of a hardcoded string.

### MEDIUM — Reset password general error
**File:** `modules/auth/reset-password/reset-password.component.ts:140`  
Same pattern — always shows `'Something went wrong, please try again.'`.

**Fix:** Use the actual server error message.

### LOW — `payment-history.component.ts` silently ignores errors
**File:** `features/bazaar/payment-history/payment-history.component.ts:27`  
Error handler only sets `loading = false` but gives no user feedback.

**Fix:** Show an error toast or inline error message.

---

## TYPE SAFETY

### HIGH — Pervasive `any` types for HTTP responses
**Almost every component uses `any`:**
- `modules/admin/roles/roles.component.ts:19` — `roles: any[]`
- `modules/admin/members/members.component.ts:22` — `members: any[]`
- `modules/admin/bazaar/events/events.component.ts:64` — `events: any[]`
- `features/bazaar/landing/landing.component.ts:70-72` — `activeEvent: any`, `activeBatch: any`, `products: any[]`
- `features/bazaar/orders/orders.component.ts:19` — `orders: any[]`
- `features/bazaar/payment/payment.component.ts:28-29` — `order: any`, `payment: any`

This defeats Angular's type-checking and makes refactoring dangerous.

**Fix:** Create proper interfaces for each API response. At minimum for the bazaar domain (`BazaarEvent`, `BazaarProduct`, `BazaarOrder`, `BazaarPayment`, etc.) and admin domain (`Role`, `Member`, `Permission`, etc.).

### MEDIUM — `_unsubscribeAll: Subject<any>` pattern uses `any`
**Files (10+ occurrences):** `layout/common/notifications/notifications.component.ts`, `layout/common/messages/messages.component.ts`, `layout/common/shortcuts/shortcuts.component.ts`, `layout/layout.component.ts`, `layout/layouts/vertical/classy/classy.component.ts`, etc.

Using `Subject<any>` loses type safety. The value emitted by `.next()` is never used.

**Fix:** Use `Subject<void>` instead of `Subject<any>` for the unsubscribe sentinel pattern. Change `.next(null)` to `.next()`.

### MEDIUM — `ClassyLayoutComponent` accessor returns `number` but typed loosely
**File:** `layout/layouts/vertical/classy/classy.component.ts:44-46`  
`get currentYear(): number` — fine, but no template uses it. Dead accessor.

**Fix:** Remove unused accessor.

### MEDIUM — `trackByFn` parameter `item: any`
**Files:** `notifications.component.ts:149`, `messages.component.ts:159`, `shortcuts.component.ts:222`, `quick-chat.component.ts:243`, `search.component.ts:250`

**Fix:** Type as the specific model type (e.g., `Notification`, `Message`, `Shortcut`, `Chat`).

---

## UX BUGS

### HIGH — Missing form validation feedback in member detail
**File:** `modules/admin/members/member-detail.component.ts:36-42`  
`save()` calls PATCH but shows no inline validation errors if the API rejects the data.

**Fix:** Show API validation errors next to form fields.

### MEDIUM — No optimistic UI or loading state for role toggle
**File:** `modules/admin/roles/role-detail.component.ts:48-56`  
`togglePermission()` makes separate HTTP calls to add/delete permissions but doesn't update the UI until the full `loadRole()` call completes. The checkbox stays in its previous state during the request, causing a perceptible delay.

**Fix:** Optimistically toggle the checkbox, then roll back on error.

### MEDIUM — Quick login UI is visible in production
**File:** `modules/auth/sign-in/sign-in.component.html:64-76`  
The Quick Login section is labeled "(Development)" but still renders in production builds unless gated.

**Fix:** Wrap the quick login `<div>` with `@if (!production)` or remove for production builds.

### LOW — Inconsistent status badge colors between pages
**File:** `features/bazaar/orders/orders.component.html:32-38` vs various admin pages  
Orders page uses Tailwind classes for status badges. Admin pages lack consistent status badge styling.

**Fix:** Extract a shared status badge component or directive.

### LOW — Landing page uses deprecated `*ngIf`/`*ngFor` alongside `@if`/`@for`
**File:** `features/bazaar/landing/landing.component.html`  
The template mixes structural directives (`*ngIf`, `*ngFor`) and no `track` parameter for `*ngFor`.

**Fix:** Migrate fully to Angular 17+ `@for` with `track` for performance.

---

## PERFORMANCE

### MEDIUM — Missing `track` in `@for` / `trackBy` in `*ngFor`
**Files with `*ngFor` but no `trackBy`:**
- `modules/auth/sign-in/sign-in.component.html:69` — `@for (user of quickUsers; track user.npk)` — already has track, good
- `modules/admin/users/user-roles.component.html:10` — `*ngFor="let role of allRoles"` — no trackBy
- `modules/admin/users/user-roles.component.html:21,41` — `*matCellDef="let ur"` — template context, fine
- `modules/admin/members/members.component.html` — needs to check

**Fix:** Add `trackBy` function or `track` expression to all `*ngFor` loops, especially on data that changes.

### MEDIUM — Unnecessary `forkJoin` in resolvers loads data that may not be used
**File:** `app.resolvers.ts:25-30`  
The initial data resolver loads messages, notifications, quick-chat, and shortcuts on every route navigation under the main layout. If the user never opens the notifications panel, the HTTP calls are wasted.

**Fix:** Lazy-load these only when the user opens the respective panel, or cache aggressively.

### MEDIUM — Nested HTTP calls in `loadBatchesAndProducts`
**File:** `features/bazaar/landing/landing.component.ts:113-121`  
`loadBatchesAndProducts()` fires `/bazaar/batches` then inside its callback fires `/bazaar/products` — waterfall pattern that doubles load time.

**Fix:** Use `forkJoin` to fire both requests in parallel.

### LOW — `calculateCart` fires on every `toggleCart` without debounce
**File:** `features/bazaar/landing/landing.component.ts:137-171`  
Each click fires a POST to `/bazaar/orders/calculate`. Rapid clicking triggers multiple calculations.

**Fix:** Debounce cart calculations with `debounceTime(300)` or skip calculations for identical cart state.

---

## ADDITIONAL FINDINGS

### MEDIUM — Route conflict: sign-out defined twice in `app.routes.ts`
**File:** `app.routes.ts:47-54` and `app.routes.ts:63-66`  
`/sign-out` is defined both as a public route (no guard) and as an authenticated route (with `AuthGuard`). Angular routing will match the first definition — the public one. The second definition inside the auth-guarded block is dead code.

**Fix:** Remove the second `/sign-out` route definition (lines 63-66).

### MEDIUM — Unused `DialogFeedbackService` import in `app.component.ts`
**File:** `app.component.ts:5`  
`DialogFeedbackService` is imported and injected but the PWA update prompt uses `_dialogFeedback.confirm()`, so this is actually used. No issue here — false alarm.

### MEDIUM — `ClassyLayoutComponent` not using `MessagesComponent`, `QuickChatComponent`
**File:** `layout/layouts/vertical/classy/classy.component.ts` imports vs `classy.component.html`
The classy layout template does not include `<messages>`, `<quick-chat>`, or `<shortcuts>` elements, but the resolver still loads data for all four services. This is wasted API calls on every navigation.

**Fix:** Either add the components to the classy layout template or remove the services from the resolver for the classy layout.

### LOW — `withCredentials: true` set twice in interceptor
**File:** `core/auth/auth.interceptor.ts:12,17,34`  
The initial `newReq = req.clone({ withCredentials: true })` is immediately overwritten if `authService.accessToken` exists, which also sets `withCredentials: true`. The initial clone on line 12 is redundant.

**Fix:** Remove line 12 — only clone once inside the `if` block.
