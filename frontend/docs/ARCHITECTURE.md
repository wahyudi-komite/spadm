# Target Architecture

## Overview

The reusable enterprise Angular starter template extracted from the fuse-angular project. This template preserves the proven Fuse layout/navigation/theme architecture while isolating business-specific code, cleaning dependencies, and standardizing on Angular standalone components.

---

## Architecture Principles

1. **Standalone-first** — All new components use Angular 19 standalone mode (`bootstrapApplication`, `provideRouter`, `withComponentInputBinding`)
2. **Layered architecture** — Core → Shared → Layout → Features (strict dependency direction)
3. **Injection token for config** — No direct `environment.*` imports in components/services
4. **Composable API layer** — `ApiClient` service provides typed HTTP methods; business services extend it without duplicating base logic
5. **Declarative auth** — `AuthGuard` + `NoAuthGuard` at route level; role metadata in route `data`
6. **Reusable authorization** — Role guard, permission guard, structural directives (`*hasPermission`, `*hasRole`)
7. **Fuse compatibility** — Keep Fuse layout/navigation/theme infrastructure; wrap with typed interfaces where needed
8. **License transparency** — Clearly marked `@fuse/` dependency vs original company code vs open-source

---

## Target Folder Structure

```
src/
├── app/
│   ├── core/                          # Global singletons, app-wide infrastructure
│   │   ├── auth/                      # Authentication service, guards, interceptor, utils
│   │   │   ├── guards/                # AuthGuard, NoAuthGuard
│   │   │   ├── interceptors/          # AuthInterceptor
│   │   │   ├── services/              # AuthService
│   │   │   ├── auth.provider.ts       # Auth providers array
│   │   │   ├── auth.routes.ts         # Auth page routes (lazy)
│   │   │   └── auth.types.ts          # Auth interfaces
│   │   │
│   │   ├── authorization/             # Role/permission engine
│   │   │   ├── guards/                # RoleGuard, PermissionGuard
│   │   │   ├── directives/            # HasPermissionDirective, HasRoleDirective
│   │   │   ├── services/              # AuthorizationService
│   │   │   └── authorization.models.ts
│   │   │
│   │   ├── config/                    # App configuration via injection token
│   │   │   ├── app.config.token.ts    # Injection token + provider
│   │   │   └── app.config.types.ts    # AppConfig, Environment interfaces
│   │   │
│   │   ├── http/                      # HTTP foundation
│   │   │   ├── api-client.service.ts  # Typed HTTP base (from AbstractService)
│   │   │   ├── api-config.ts          # API base URL token
│   │   │   ├── api-response.model.ts  # Response wrappers
│   │   │   ├── paginated-response.model.ts
│   │   │   └── query-params.util.ts
│   │   │
│   │   ├── navigation/                # Navigation system
│   │   │   ├── navigation.service.ts  # (from existing core/navigation)
│   │   │   └── navigation.types.ts
│   │   │
│   │   ├── services/                  # Cross-cutting services
│   │   │   ├── user.service.ts
│   │   │   ├── user.types.ts
│   │   │   ├── theme.service.ts       # (wraps Fuse theme config)
│   │   │   └── platform.service.ts
│   │   │
│   │   ├── storage/                   # Storage abstraction
│   │   │   └── storage.service.ts
│   │   │
│   │   ├── types/                     # Core shared types
│   │   │   ├── user-role.enum.ts
│   │   │   ├── status.enum.ts
│   │   │   └── core.types.ts
│   │   │
│   │   └── core.providers.ts          # Aggregated core providers
│   │
│   ├── layout/                        # Application shell
│   │   ├── components/                # Common UI panels
│   │   │   ├── languages/             # Language switcher
│   │   │   ├── messages/              # Message panel
│   │   │   ├── notifications/         # Notification panel
│   │   │   ├── search/                # Global search
│   │   │   ├── shortcuts/             # Shortcuts panel
│   │   │   ├── user/                  # User menu
│   │   │   └── settings/              # Quick settings panel
│   │   │
│   │   ├── layouts/                   # Layout variants (keep essential only)
│   │   │   ├── empty/
│   │   │   ├── modern/                # Horizontal nav
│   │   │   ├── classic/               # Vertical nav
│   │   │   └── classy/                # Vertical nav (current default)
│   │   │
│   │   ├── layout.component.ts        # Layout dispatcher
│   │   └── layout.routes.ts           # Layout route wrapper
│   │
│   ├── shared/                        # Reusable UI building blocks
│   │   ├── components/                # Neutral UI components
│   │   │   ├── alert/
│   │   │   ├── card/
│   │   │   ├── drawer/
│   │   │   ├── fullscreen/
│   │   │   ├── loading-bar/
│   │   │   └── masonry/
│   │   │
│   │   ├── dialogs/                   # Generic dialog system
│   │   │   ├── confirmation-dialog/
│   │   │   └── form-dialog/
│   │   │
│   │   ├── directives/
│   │   │   ├── scrollbar.directive.ts
│   │   │   └── scroll-reset.directive.ts
│   │   │
│   │   ├── forms/                     # Reusable form components
│   │   │   ├── date-time-picker/
│   │   │   ├── search-input/
│   │   │   └── paginate/
│   │   │
│   │   ├── pipes/
│   │   │   └── find-by-key.pipe.ts
│   │   │
│   │   ├── tables/                    # Generic table features
│   │   │   ├── pagination/
│   │   │   └── table-column.model.ts
│   │   │
│   │   ├── types/                     # Shared type definitions
│   │   │   ├── paginate.model.ts
│   │   │   └── shared.types.ts
│   │   │
│   │   ├── utils/                     # Pure utility functions
│   │   │   ├── clean-filters.util.ts
│   │   │   └── export.util.ts
│   │   │
│   │   ├── validators/                # Shared validators
│   │   │   └── existing-validator.ts  # (decoupled from business services)
│   │   │
│   │   └── shared.providers.ts        # Aggregated shared providers
│   │
│   ├── features/                      # Business modules (isolated)
│   │   ├── auth-pages/                # Sign-in, sign-up, etc.
│   │   │   ├── pages/
│   │   │   └── auth-pages.routes.ts
│   │   │
│   │   ├── dashboard/                 # (neutral example or project-specific)
│   │   ├── users/                     # User management
│   │   ├── roles/                     # Role CRUD
│   │   ├── permissions/               # Permission CRUD
│   │   ├── profile/                   # User profile
│   │   └── settings/                  # App settings
│   │
│   ├── app.component.ts               # Root component
│   ├── app.config.ts                  # Application providers
│   └── app.routes.ts                  # Root routes
│
├── assets/                            # Static assets
├── environments/                      # Environment files
├── styles/                            # Global styles
├── @fuse/                             # Fuse Angular library (third-party, kept as-is)
├── main.ts                            # Entry point
└── index.html
```

---

## Old → New Folder Mapping

| Old Path | New Path | Action |
|----------|----------|--------|
| `core/auth/auth.service.ts` | `core/auth/services/auth.service.ts` | MOVE, refactor API URL to injection token |
| `core/auth/auth.interceptor.ts` | `core/auth/interceptors/auth.interceptor.ts` | MOVE |
| `core/auth/auth.provider.ts` | `core/auth/auth.provider.ts` | KEEP |
| `core/auth/auth.utils.ts` | `core/auth/auth.types.ts` | MERGE utils into types |
| `core/auth/guards/auth.guard.ts` | `core/auth/guards/auth.guard.ts` | KEEP |
| `core/auth/guards/noAuth.guard.ts` | `core/auth/guards/no-auth.guard.ts` | MOVE |
| `core/navigation/` | `core/navigation/` | KEEP |
| `core/user/` | `core/services/` | MOVE |
| `core/icons/` | `core/services/icons.service.ts` | MOVE/SIMPLIFY |
| `core/transloco/` | `core/config/transloco.provider.ts` | MOVE |
| `node/common/abstract.service.ts` | `core/http/api-client.service.ts` | REFACTOR (remove scan methods) |
| `node/common/paginate.ts` | `shared/types/paginate.model.ts` | MOVE |
| `node/common/cleanFilters.ts` | `shared/utils/clean-filters.util.ts` | MOVE |
| `node/common/shared.module.ts` | `shared/` (split into standalone) | REFACTOR |
| `node/common/share-dialog.module.ts` | `shared/dialogs/` | REFACTOR |
| `node/common/existing.validator.ts` | `shared/validators/existing-validator.ts` | MOVE + DECOUPLE |
| `node/common/status.enum.ts` | `core/types/status.enum.ts` | MOVE |
| `node/common/user-role.ts` | `core/types/user-role.enum.ts` | MOVE |
| `node/common/global-variable.ts` | `core/services/app-audio.service.ts` | REFACTOR |
| `modules/shared/paginate/` | `shared/tables/pagination/` | MOVE |
| `modules/shared/paginate-take/` | `shared/tables/pagination/` | MERGE |
| `modules/shared/date-time-picker/` | `shared/forms/date-time-picker/` | MOVE |
| `modules/comp/tabel/` | `shared/forms/search-input/` | MOVE |
| `modules/pages/employee-kaos/` | `features/dashboard/` | KEEP_IN_FEATURE |
| `modules/pages/scan-data/` | `features/scan-data/` | KEEP_IN_FEATURE |
| `modules/pages/scan-plant/` | `features/scan-plant/` | KEEP_IN_FEATURE |
| `modules/pages/scan-vendor/` | `features/scan-vendor/` | KEEP_IN_FEATURE |
| `modules/pages/reject/` | `features/reject/` | KEEP_IN_FEATURE |
| `modules/pages/app/permission/` | `features/permissions/` | KEEP_IN_FEATURE |
| `modules/pages/app/role/` | `features/roles/` | KEEP_IN_FEATURE |
| `modules/pages/app/admin/role/` | — | REMOVE_AFTER_VALIDATION (duplicate) |
| `modules/pages/app/profile/` | `features/profile/` | KEEP_IN_FEATURE |
| `modules/pages/pages.module.ts` | — | REMOVE_AFTER_VALIDATION (deprecated) |
| `modules/auth/` | `features/auth-pages/` | KEEP_IN_FEATURE |
| `modules/landing/home/` | `features/landing/` | KEEP_IN_FEATURE |
| `modules/admin/example/` | — | REMOVE_AFTER_VALIDATION |
| `mock-api/apps/*` | — | REMOVE_AFTER_VALIDATION |
| `mock-api/dashboards/*` | — | REMOVE_AFTER_VALIDATION |
| `mock-api/common/*` | — | KEEP until auth/nav/user are decoupled from mock data |
| `@fuse/` | `@fuse/` | KEEP (third-party library, untouched) |

---

## Migration Phases (Detailed)

### Phase 3: Core Extraction

**Files to create:**
- `core/http/api-client.service.ts` — Clean API client from AbstractService
- `core/http/api-response.model.ts` — Response wrapper interfaces
- `core/http/paginated-response.model.ts` — Paginate response type
- `core/http/query-params.util.ts` — HttpParams builder
- `core/config/app-config.token.ts` — Injection token for app config
- `core/config/app-config.types.ts` — Config interfaces
- `core/services/app-audio.service.ts` — Audio service from GlobalVariable
- `core/services/user.service.ts` — From core/user/user.service.ts
- `core/types/user-role.enum.ts` — From node/common/user-role.ts
- `core/types/status.enum.ts` — From node/common/status.enum.ts
- `core/core.providers.ts` — Aggregated providers

**Files to move:**
- `core/auth/` files (internal reorganization)
- `core/navigation/` files
- `core/transloco/` -> `core/config/transloco.provider.ts`

**Files to refactor:**
- `node/common/abstract.service.ts` — Remove scan-specific methods, rename, move to `core/http/api-client.service.ts`
- `node/common/global-variable.ts` — Convert static class to injectable service

**Validation:**
```
[ ] ng build succeeds
[ ] Auth flow works (sign-in, sign-out, session restore)
[ ] Route guards work
[ ] Navigation loads correctly
[ ] Theme switching works
[ ] All existing services continue to function with refactored ApiClient
```

### Phase 4: Shared Extraction

**Files to create:**
- `shared/shared.providers.ts`
- `shared/types/paginate.model.ts`
- `shared/utils/clean-filters.util.ts`
- `shared/validators/existing-validator.ts` (decoupled)
- `shared/dialogs/confirmation-dialog/` (from Fuse confirmation)
- `shared/tables/table-column.model.ts`

**Files to move:**
- Pagination components -> `shared/tables/pagination/`
- Date-time-picker -> `shared/forms/date-time-picker/`
- Search input -> `shared/forms/search-input/`
- @fuse pipes/directives -> `shared/pipes/`, `shared/directives/` (kept as re-exports)

**Files to refactor:**
- `node/common/shared.module.ts` -> standalone components
- `node/common/share-dialog.module.ts` -> standalone dialog

**Validation:**
```
[ ] ng build succeeds
[ ] Shared components render correctly
[ ] Pagination works in all tables
[ ] Dialogs open correctly
[ ] Date picker works
[ ] ExistingValidator works with injected services
```

### Phase 5: Layout Cleanup

**Prune layout variants:**
- Keep: `empty/`, `classic/`, `classy/`, `modern/`
- Remove: `centered/`, `compact/`, `dense/`, `enterprise/`, `futuristic/`, `material/`, `thin/`
- Verify route data references before removal

**Files to modify:**
- `layout/layout.component.ts` — Remove deleted layout imports
- `layout/layouts/` directory

**Validation:**
```
[ ] All routes still render with correct layout
[ ] Empty layout works (auth pages)
[ ] Default vertical layout works
[ ] Modern horizontal layout works
[ ] Mobile responsive
[ ] Navigation works in all retained layouts
```

### Phase 6: Feature Isolation

**Files to move:**
- `modules/pages/employee-kaos/` -> `features/dashboard/`
- `modules/pages/scan-data/` -> `features/scan-data/`
- `modules/pages/scan-plant/` -> `features/scan-plant/`
- `modules/pages/scan-vendor/` -> `features/scan-vendor/`
- `modules/pages/reject/` -> `features/reject/`
- `modules/pages/app/permission/` -> `features/permissions/`
- `modules/pages/app/role/` -> `features/roles/`
- `modules/pages/app/profile/` -> `features/profile/`
- `modules/auth/` -> `features/auth-pages/`
- `modules/landing/home/` -> `features/landing/`
- `modules/comp/tabel/` -> `shared/forms/search-input/`
- `node/app/` -> `features/` (business-specific services stay with features)

**Files to update:**
- `app.routes.ts` — Update lazy-load paths
- Route imports in all lazy-loading points

**Validation:**
```
[ ] ng build succeeds
[ ] All feature routes work
[ ] All CRUD operations work
[ ] Role/permission management works
[ ] Auth flow (sign-in/out) works
[ ] No broken imports
```

### Phase 7: Demo Cleanup

**Remove mock-api subfolders in groups:**

Group 1 (no imports):
- `mock-api/apps/academy`
- `mock-api/apps/chat`
- `mock-api/apps/contacts`
- `mock-api/apps/ecommerce`
- `mock-api/apps/file-manager`
- `mock-api/apps/help-center`
- `mock-api/apps/mailbox`
- `mock-api/apps/notes`
- `mock-api/apps/scrumboard`
- `mock-api/apps/tasks`

Group 2 (dashboards):
- `mock-api/dashboards/analytics`
- `mock-api/dashboards/crypto`
- `mock-api/dashboards/finance`
- `mock-api/dashboards/project`

Group 3 (other):
- `mock-api/pages/activities`
- `mock-api/ui/icons`

Group 4 (keep with validation):
- `modules/admin/example`

**Validation:**
```
[ ] ng build succeeds after each group removal
[ ] No runtime errors
```

### Phase 8: Dependency Cleanup

**Remove after validation:**
- `moment` (luxon handles all date needs)
- `lodash` (keep lodash-es)
- `highlight.js` + `@types/highlight.js` (if unused outside demo)
- `ngx-quill` + `quill` (rich text, demo-only)

**Validation:**
```
[ ] npm install succeeds
[ ] ng build succeeds
[ ] No import errors for removed packages
```

### Phase 9: Starter Template Creation

**Actions:**
1. Copy cleaned project to `starter-template/`
2. Add neutral example feature (`features/example/`) with CRUD
3. Replace business-specific branding with placeholders
4. Clean business-specific assets
5. Add `.env.example`
6. Update `README.md` with template instructions
7. Update `angular.json` output path to `dist/starter`

**Validation:**
```
[ ] Fresh `npm install` + `ng build` from copied template succeeds
[ ] Example feature works
[ ] No business-specific data remains in shared/core/layout
```

### Phase 10: Documentation

**Completed docs in `docs/`:**
- `ARCHITECTURE.md` (this document)
- `PROJECT_AUDIT.md`
- `AUTHENTICATION.md`
- `AUTHORIZATION.md`
- `NAVIGATION.md`
- `GENERIC_CRUD.md`
- `SHARED_COMPONENTS.md`
- `API_INTEGRATION.md`
- `THEMING.md`
- `CODING_STANDARDS.md`
- `NEW_FEATURE_GUIDE.md`
- `PROJECT_SETUP.md`
- `ENVIRONMENT_SETUP.md`
- `MIGRATION_GUIDE.md`
- `REMOVED_FILES.md`
- `REMOVED_DEPENDENCIES.md`
- `EXTRACTION_REPORT.md`
- `README.md`

---

## Detailed Architecture Decisions

### 1. Authentication (@see AUTHENTICATION.md)

```
Core auth flow:
  signIn(email, password) → POST /auth/sign-in → { accessToken, user }
    → store accessToken in memory (BehaviorSubject)
    → refreshToken in httpOnly cookie (server-side)
  signOut() → POST /auth/logout → clear state → redirect to /sign-in
  signInUsingToken(accessToken) → POST /auth/sign-in-with-token → { user }
  checkAuth() → POST /auth/check-auth → 200 OK / 401 Unauthorized

Route guards:
  AuthGuard → requires authenticated user + optional role check
  NoAuthGuard → only accessible when NOT authenticated
```

### 2. API Layer (@see API_INTEGRATION.md)

```
ApiClient (injectable)   ← injection token for base URL
  ├── get<T>(path, params?)     → Observable<HttpResponse<T>>
  ├── post<T>(path, body?)      → Observable<HttpResponse<T>>
  ├── put<T>(path, body?)       → Observable<HttpResponse<T>>
  ├── patch<T>(path, body?)     → Observable<HttpResponse<T>>
  ├── delete<T>(path)           → Observable<HttpResponse<T>>
  ├── download(path, filename?) → Observable<Blob>
  └── buildHttpParams(query)    → HttpParams

Business services extend ApiClient via constructor injection:
  class EmployeeKaosService extends ApiClient
    getList(query) → this.get<PaginatedResult<EmployeeKaos>>('/employee_kaos', query)
```

### 3. Authorization (@see AUTHORIZATION.md)

```
AuthorizationService
  ├── user$: Observable<User>
  ├── hasRole(role: string): boolean
  ├── hasPermission(permission: string): boolean
  └── userRoles: string[]

Guards:
  AuthGuard (existing) + role check in route data: data: { role: UserRole.Admin }
  PermissionGuard (new): data: { permissions: ['user.create', 'user.edit'] }

Directives:
  *hasPermission="'permission.name'" → structural directive to show/hide elements
  *hasRole="'admin'"                 → structural directive to show/hide elements
```

### 4. Navigation (@see NAVIGATION.md)

```
NavigationService (existing Fuse service, preserved)
  ├── navigation$: Observable<FuseNavigationItem[]>
  ├── get(key: string): Observable<FuseNavigationItem[]>
  └── register(key: string, items: FuseNavigationItem[])

FuseNavigationItem interface governs type safety.
Navigation items filtered by role/permission in the service layer.
```

### 5. Theme & Branding (@see THEMING.md)

```
AppConfig (injection token):
  appName: string
  shortName?: string
  logoUrl: string
  faviconUrl?: string
  defaultLayout: string
  defaultTheme: string
  apiBaseUrl: string
  enableDebug: boolean

ThemeService wraps FuseConfigService for:
  - Light/dark mode
  - Color scheme
  - Layout density
  - Typography
```

### 6. CRUD Foundation (@see GENERIC_CRUD.md)

```
Reusable types:
  CrudQuery { page, limit, search, sortBy, sortDirection, filters }
  PaginatedResult<T> { data, total, page, limit }

Service convention:
  getList(query: CrudQuery): Observable<PaginatedResult<T>>
  getById(id: string): Observable<T>
  create(data: Partial<T>): Observable<T>
  update(id: string, data: Partial<T>): Observable<T>
  delete(id: string): Observable<void>

Table convention:
  - PrimeNG p-table for standard CRUD
  - Pagination component with page size selector
  - Search input with debounce
  - Sortable columns
  - Row actions (edit, delete)
  - Loading skeleton
  - Empty state
  - Confirmation dialog before delete
  - Success/error notification via toastr
```

### 7. Layout Strategy

- `layout.component.ts` reads `data.layout` from route data to dispatch correct layout
- Auth pages use `empty` layout (no sidebar/toolbar)
- App pages use `classy` (vertical sidebar) or `modern` (horizontal toolbar)
- Route data structure: `{ layout: 'empty' | 'classy' | 'modern' | 'classic' }`
- Layout variants kept: `empty`, `classic` (vertical), `classy` (vertical, default), `modern` (horizontal)
- Layout variants removed: `centered`, `compact`, `dense`, `enterprise`, `futuristic`, `material`, `thin`

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Auth breaks during core refactor | High | Medium | Keep auth files in place until replacement is verified; use git branches |
| AbstractService changes break 6+ business services | High | High | Keep old AbstractService working while creating new ApiClient; migrate one service at a time |
| Route lazy-load paths break during move | High | Medium | Update all route paths simultaneously; verify with `ng build` after each feature move |
| Removing layout variants breaks routes | Medium | Medium | Verify route `data.layout` references before removal |
| ExistingValidator tightly coupled to PermissionService/RoleService | Medium | High | Keep old validator working; create decoupled version with injection token pattern |
| Business-specific assets referenced by name | Medium | Low | Search all files for hardcoded asset paths before cleaning |
| npm packages with side effects (crypto-js, xlsx) | Low | Medium | Test build after each dependency removal |
| Fuse license prohibits template reuse | High | High | Clearly mark @fuse/ as third-party; document license boundaries in EXTRACTION_REPORT.md |

---

## License & IP Boundaries

```
fuse-dependent/     → @fuse/ (Fuse Angular template code — proprietary, kept as-is)
company-original/   → core/, shared/, layout/ (original code by development team)
open-source/        → Angular, PrimeNG, Material, Tailwind, RxJS, Transloco, etc.
business-specific/  → features/ (employee-kaos, scan-*, reject, permission, role — project-specific)

The reusable starter template = company-original/ + open-source/ + fuse-dependent/
Business-specific/ is NOT part of the template — it's extracted as a separate deliverable.
```

---

## Phase 2 Result

```
PHASE RESULT: Target Architecture Design Complete
FILES CREATED: docs/ARCHITECTURE.md (this file)
FILES MODIFIED: docs/EXTRACTION_PLAN.md (expanded with detailed phases)
FILES MOVED: None
FILES REMOVED: None
DEPENDENCIES REMOVED: None
BUILD RESULT: N/A (design phase, no code changes)
KNOWN ISSUES:
  - Need to verify which layouts are actually used by current routes
  - Need to verify if `modules/pages/app/admin/role/` is truly redundant
  - Need to check if moment is used anywhere beyond potential Fuse code
NEXT PHASE: 3 - Core Extraction
```

Ready to proceed with **Phase 3: Core Extraction** when you give the go-ahead.
