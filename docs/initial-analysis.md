# Initial Repository Analysis — SPADM Super App

**Date:** 2026-07-12
**Repository:** https://github.com/wahyudi-komite/spadm

---

## 1. Repository Overview

| Item | Value |
|------|-------|
| **Remote** | https://github.com/wahyudi-komite/spadm.git |
| **Branch** | main (2 commits) |
| **Last commit** | `88620ee` — chore: unify repository layout and migrate frontend to starter template |
| **Backend** | **Not yet created** — folder `backend/` does not exist |
| **Frontend** | Fuse Angular v20.0.0 template (Angular 19.2.1) in `frontend/starter/` |
| **Docs** | `frontend/docs/` — extensive analysis from previous extraction work |
| **Backend folder** | `backend/` — does not exist, needs to be created from scratch |

---

## 2. Frontend Template Analysis

### Template Identity
- **Template:** Fuse Angular v20.0.0 (premium admin template by srcn on ThemeForest)
- **Angular:** 19.2.1 (standalone bootstrap)
- **TypeScript:** 5.8.2 (strict mode not explicitly enabled in tsconfig)
- **Node:** 20.x (.nvmrc)
- **Package Manager:** npm

### Key Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| PrimeNG | ^20.1.1 | Primary UI (tables, dialogs, forms) |
| Angular Material | 18.0.6 | Legacy/Fuse dependency |
| TailwindCSS | 3.4.3 | Styling |
| ApexCharts | 3.49.1 | Charts |
| ngx-toastr | ^19.0.0 | Notifications |
| ng-qrcode | ^20.0.0 | QR code generation |
| xlsx | ^0.18.5 | Excel export |
| luxon | 3.4.4 | Date handling |
| @ngneat/transloco | 6.0.4 | i18n |

### Layout System
- 11 layout variants (empty, horizontal: 4, vertical: 6)
- Default: `classy` (vertical navigation)
- Dark mode support via `class` strategy
- Theme system with multiple color palettes (brand, teal, rose, purple, amber)

### Auth System (Existing)
- JWT-based with access token in memory (BehaviorSubject)
- Refresh token via httpOnly cookie (`withCredentials: true`)
- Endpoints: `/auth/sign-in`, `/auth/logout`, `/auth/check-auth`, `/auth/sign-in-with-token`
- AuthGuard with role checking via `route.data.role`
- NoAuthGuard for guest-only routes

### Existing Business Features (from previous project)
- Employee Kaos (Family Day gift tracking) — `/dashboard`
- Scan Data, Scan Plant, Scan Vendor
- Reject Workflow
- Role & Permission management
- Profile page

---

## 3. Git & Configuration

| Item | Status |
|------|--------|
| **Git remote** | https://github.com/wahyudi-komite/spadm.git |
| **Commits** | 2 (initial + template migration) |
| **.gitignore** | Covers .env, node_modules, dist, logs, IDE files |
| **.env.example** | Exists in `frontend/starter/` (basic API_URL, APP_NAME, DEFAULT_LAYOUT) |
| **Backend .env** | Not yet created |

---

## 4. Key Findings

### What Exists
1. **Frontend template** — Fuse Angular v20.0.0 (Angular 19.2.1) with full layout system, auth, PrimeNG, TailwindCSS
2. **Previous business features** — Employee Kaos, Scan system, Role/Permission management, Profile
3. **Auth infrastructure** — JWT auth service, interceptor, guards, user service
4. **Documentation** — Extensive docs in `frontend/docs/` from previous extraction work

### What's Missing (Needs to be Built)
1. **Backend entirely** — NestJS project with TypeORM, MySQL, JWT auth, all modules
2. **SPADM-specific frontend modules** — Authentication (NPK login), Bazaar, Dashboard, etc.
3. **Database migrations** — All tables for members, roles, bazaar, payments, etc.
4. **Infrastructure** — Docker, Nginx config, PM2, GitHub Actions, deployment scripts
5. **PWA configuration** — Service worker, manifest, app icons

### Key Decisions Needed
1. **Backend location** — `backend/` folder (needs NestJS project initialization)
2. **Frontend restructuring** — Move `frontend/starter/` content to `frontend/` root or keep as-is
3. **Auth refactoring** — Adapt existing Fuse auth to NPK-based login
4. **Database** — MySQL with TypeORM
5. **Existing features** — Keep or clean up previous business features (Employee Kaos, Scan, etc.)

---

## 5. Architecture Plan

### Backend Structure (to be created)
```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   ├── pipes/
│   │   ├── constants/
│   │   ├── enums/
│   │   ├── helpers/
│   │   └── interfaces/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── members/
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── organizations/
│   │   ├── notifications/
│   │   ├── audit-logs/
│   │   ├── files/
│   │   ├── settings/
│   │   ├── bazaar/
│   │   │   ├── events/
│   │   │   ├── batches/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── distributions/
│   │   │   ├── subsidies/
│   │   │   └── reports/
│   │   └── health/
│   └── main.ts
```

### Frontend Structure (to be adapted)
```
frontend/starter/src/app/
├── core/           (keep — auth, navigation, icons, user, config)
├── shared/         (keep — forms, tables, validators, utils)
├── layout/         (keep — layout system)
├── features/       (keep existing + add SPADM modules)
│   ├── employee-kaos/  (existing — keep)
│   ├── scan-data/      (existing — keep)
│   ├── scan-plant/     (existing — keep)
│   ├── scan-vendor/    (existing — keep)
│   ├── reject/         (existing — keep)
│   ├── roles/          (existing — keep)
│   ├── permissions/    (existing — keep)
│   ├── profile/        (existing — keep)
│   └── ... (new SPADM modules)
├── modules/        (keep — auth pages, landing, pages routes)
├── @fuse/          (keep — third-party library)
```

---

## 6. Technology Versions

| Technology | Version |
|------------|---------|
| Angular | 19.2.1 |
| NestJS | (to be determined — latest stable) |
| TypeScript | 5.8.2 |
| Node.js | 20.x |
| PrimeNG | 20.1.1 |
| TailwindCSS | 3.4.3 |
| MySQL | 8.x |
| TypeORM | (to be determined) |

---

## 7. Risks & Considerations

1. **Backend from scratch** — Entire NestJS backend needs to be built
2. **Auth refactoring** — Fuse auth uses email/password; needs NPK-based login
3. **Template adaptation** — Must preserve Fuse layout while adding SPADM-specific modules
4. **Existing features** — Previous business code (Employee Kaos, Scan) may need cleanup
5. **Angular Material 18.0.6** — Version mismatch with Angular 19.2.1 (potential compatibility issues)
6. **No testing infrastructure** — Backend needs Jest setup; frontend has Karma/Jasmine

---

## 8. Next Steps (Phase 1)

1. Initialize NestJS backend in `backend/`
2. Setup database connection (MySQL + TypeORM)
3. Create `.env.example` for backend
4. Setup response/error handling infrastructure
5. Create initial database migrations
6. Setup Swagger/OpenAPI
7. Configure CORS, Helmet, Rate limiting
8. Create health check endpoint
