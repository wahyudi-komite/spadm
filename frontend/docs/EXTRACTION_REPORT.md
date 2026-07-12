# Extraction Report

## What Was Extracted

The fuse-angular project (deployed as `flatag` / Famday Labelin Tag) was restructured from a monolithic Fuse template with mixed business code into a clean layered architecture.

### Core (`src/app/core/`)

- **Auth:** AuthService, AuthInterceptor, AuthGuard, NoAuthGuard, auth provider, utils
- **HTTP:** `ApiClient` (abstract base service extracted from `AbstractService`), `ApiResponse` model, `query-params.util`
- **Config:** Injection token for app config (decoupled from hardcoded `environment.*` imports)
- **Navigation:** NavigationService + navigation types (from existing `core/navigation/`)
- **Services:** User service + types, platform service
- **Types:** UserRole enum, Status enum

### Shared (`src/app/shared/`)

- **Forms:** `DateTimePickerComponent` (Material date+time), `SearchInputComponent`
- **Directives:** `FuseScrollbarDirective` (Perfect Scrollbar wrapper), `FuseScrollResetDirective` (scroll-to-top on route change)
- **Pipes:** `FuseFindByKeyPipe` (find object by key in array)
- **Types:** `Paginate` interface (`data`, `meta.total/page/pageSize/last_page`)
- **Utils:** `cleanFilters` (strips empty PrimeNG filter values)
- **Validators:** `ExistingValidator` (async uniqueness check for role/permission names)
- **Dialogs:** `FuseConfirmationService` + `FuseConfirmationDialogComponent` (Material-based confirmation dialog)

### Layout (`src/app/layout/`)

- 4 layout variants: `empty`, `classic` (vertical), `classy` (vertical, default), `modern` (horizontal)
- Common panels: languages, messages, notifications, search, shortcuts, user, settings

### Features (`src/app/features/`)

- `dashboard/` — Employee Kaos (Family Day gift tracking)
- `scan-data/`, `scan-plant/`, `scan-vendor/` — Scan tracking
- `reject/` — Reject workflow
- `roles/`, `permissions/` — Role and permission CRUD
- `profile/` — User profile
- `auth-pages/` — Sign-in, sign-up, sign-out, password pages
- `landing/` — Landing page

## What Was Removed

### Demo Code (Phase 7 — 41 files)

- `mock-api/apps/` (academy, chat, contacts, ecommerce, file-manager, help-center, mailbox, notes, scrumboard, tasks — 10 modules, ~40+ files)
- `mock-api/dashboards/` (analytics, crypto, finance, project — 4 modules)
- `mock-api/pages/activities`
- `mock-api/ui/icons`
- `modules/admin/example/`

### Unused Layout Variants (Phase 5 — 7 layouts)

Removed: `centered`, `compact`, `dense`, `enterprise`, `futuristic`, `material`, `thin`

### Duplicate Modules

- `modules/pages/app/admin/role/` (duplicate of `app/role/`)

### Unused Dependencies (Phase 8 — 2 packages)

- `moment` (luxon covers all date needs)
- `highlight.js` + `@types/highlight.js` (demo-only)

## File Migration Summary

| Phase | Action | Count |
|-------|--------|-------|
| 3 — Core Extraction | Created/moved core files | ~20 files |
| 4 — Shared Extraction | Moved/created shared components | ~15 files |
| 5 — Layout Cleanup | Removed 7 layout variants | ~84 files removed |
| 6 — Feature Isolation | Moved features to `features/` | ~59+ files moved |
| 7 — Demo Cleanup | Removed mock-api demo code | 41 files deleted |
| 8 — Dependency Cleanup | Removed 2 unused packages | 2 deps |

## Final Architecture

```
src/app/
  core/         Global singletons (auth, http, config, navigation, services, types)
  shared/       Reusable UI (forms, directives, pipes, dialogs, validators, types, utils)
  layout/       App shell (4 layout variants, common panels)
  features/     Business modules (isolated, standalone-ready)
```

**Dependency direction:** `core ← shared ← layout ← features` (features depend on everything else, nothing depends on features).

## Business vs Template Boundary

| Layer | Contents | Ownership |
|-------|----------|-----------|
| `@fuse/` | Fuse Angular library (navigation, components, services) | Third-party (keep as-is) |
| `core/` | Auth, HTTP, config, services | Reusable starter |
| `shared/` | UI components, directives, pipes, validators | Reusable starter |
| `layout/` | Layout dispatch + panels | Reusable starter |
| `features/` | Employee Kaos, scan, reject, roles, permissions | Business-specific (swap out) |
| `environments/` | API URLs, app config | Project-specific |

## License Notes

- `@fuse/` contains Fuse Angular template code (proprietary, kept as a third-party dependency)
- `core/`, `shared/`, `layout/` are original code by the development team
- `features/` is business-specific and not part of the reusable template
- Open-source dependencies: Angular, PrimeNG, Angular Material, TailwindCSS, RxJS, Transloco, Luxon, ApexCharts, etc.
