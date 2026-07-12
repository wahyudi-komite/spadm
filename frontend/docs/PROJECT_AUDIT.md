# Project Audit Report

Generated: 2026-07-11
Project: fuse-extract (fuse-angular based)

---

## 1. Project Information

| Field | Value |
|-------|-------|
| **Project Name** | fuse-angular (deployed as `flatag`) |
| **App Title** | Famday Labelin Tag |
| **Angular Version** | 19.2.1 |
| **TypeScript Version** | 5.8.2 |
| **Node Requirement** | Not specified (nvmrc exists) |
| **Package Manager** | npm |
| **Build System** | Angular CLI 19.2.1 |
| **Architecture** | Standalone (bootstrapApplication) + mixed NgModule |
| **Fuse Version** | 20.0.0 |
| **Base Href** | /flatag/ |
| **Output Path** | dist/flatag |
| **Default Layout** | classy (vertical navigation) |
| **Default Theme** | theme-brand |
| **Color Scheme** | auto (light/dark) |
| **i18n** | Transloco (English, Turkish) |
| **Backend URL (dev)** | http://{hostname}:3010/api-flatag/v1 |
| **Backend URL (prod)** | http://p2-pro16110d:3002/api-flatag/v1 |
| **Proxy** | /api/** -> http://localhost:3010 |
| **Locale** | Indonesian (id) |

### Main UI Libraries
- **PrimeNG** 20.1.1 (primary table/dialog/form components)
- **Angular Material** 18.0.6 (legacy/Fuse dependency)
- **TailwindCSS** 3.4.3 (styling)
- **ApexCharts** 3.49.1 + ng-apexcharts (charts)
- **ngx-toastr** (notifications)
- **ngx-quill** (rich text editor)
- **ngx-countup** (animated counters)
- **ng-qrcode** (QR code generation)
- **perfect-scrollbar** (custom scrollbars)
- **highlight.js** (code highlighting)
- **xlsx** (Excel export)
- **luxon** (date handling)
- **lodash-es** (utility)
- **crypto-js** (JWT token handling)
- **ngx-trim-directive** (input trimming)

### Authentication
- JWT-based authentication
- Access token stored in memory (BehaviorSubject)
- Refresh token via httpOnly cookie (withCredentials: true)
- Token expiration check via AuthUtils
- Session restoration via signInUsingToken
- Backend endpoints: /auth/sign-in, /auth/logout, /auth/check-auth, /auth/sign-in-with-token
- Auth guard with role checking
- NoAuth guard for guest-only routes

### Authorization
- Role-based access at route level (route.data.role)
- No permission guard exists
- No structural directive for permission/role checking
- Hardcoded roles: UserRole enum (user, admin, superadmin, supplier)
- Navigation filtered by user role
- Permission management feature exists but no engine layer

---

## 2. Source Structure

```
src/
  @fuse/                          Fuse template library (proprietary)
    animations/                   Reusable Angular animations
    components/                   UI components (alert, card, drawer, fullscreen,
                                  highlight, loading-bar, masonry, navigation)
    directives/                   scrollbar, scroll-reset
    lib/mock-api/                 Mock API engine
    pipes/                        find-by-key pipe
    services/                     config, confirmation, loading, media-watcher,
                                  platform, splash-screen, utils
    styles/                       Tailwind plugins, themes, overrides
    tailwind/                     Custom Tailwind plugins
    validators/                   Validators
    version/                      Version info

  app/                            Application code
    core/
      auth/                       Auth service, interceptor, utils, guards
      icons/                      Icon provider/service
      navigation/                 Navigation service + types
      transloco/                  i18n HTTP loader
      user/                       User service + types

    layout/
      common/                     languages, messages, notifications,
                                  quick-chat, search, settings, shortcuts, user
      layouts/                    11 layout variants
        empty/
        horizontal/               centered, enterprise, material, modern
        vertical/                 classic, classy, compact, dense, futuristic, thin
      layout.component.ts         Layout dispatcher

    mock-api/                     Fuse demo mock APIs
      apps/                       academy, chat, contacts, ecommerce, file-manager,
                                  help-center, mailbox, notes, scrumboard, tasks
      common/                     auth, messages, navigation, notifications, search,
                                  shortcuts, user
      dashboards/                 analytics, crypto, finance, project
      pages/                      activities
      ui/                         icons

    modules/                      Feature modules
      admin/example/              Demo admin example (dashboard, test)
      auth/                       sign-in, sign-up, sign-out, confirmation-required,
                                  forgot-password, reset-password, unlock-session
      comp/tabel/                 search-input component
      landing/home/               Landing page
      pages/                      Main app pages (business features)
        app/admin/role/           Role management page
        app/permission/           Permission management page
        app/profile/              Profile page
        app/role/                 Role CRUD (separate from admin/role)
        employee-kaos/            Employee Kaos (Family Day gift tracking)
        reject/                   Reject workflow
        scan-data/                Data scanning
        scan-plant/               Plant scanning
        scan-vendor/              Vendor scanning
      shared/                     paginate, paginate-take, date-time-picker

    node/                         API service layer
      app/
        permission/               Permission service + model
        role/                     Role service + model
      common/                     AbstractService, cleanFilters, shared.module,
                                  share-dialog.module, validators, enums, paginate

  environments/
    environment.ts                Production config
    environment.development.ts    Development config

  styles/                         Global styles (vendors, tailwind, styles)
  main.ts                         Entry point (bootstrapApplication)
  index.html                      Root HTML
```

---

## 3. Dependency Inventory

### Required Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| @angular/core | ^19.2.1 | Framework |
| @angular/common | ^19.2.1 | Common module |
| @angular/forms | ^19.2.1 | Forms |
| @angular/router | ^19.2.1 | Routing |
| @angular/platform-browser | ^19.2.1 | Browser |
| @angular/animations | ^19.2.1 | Animations |
| @angular/cdk | 18.0.6 | Component Dev Kit |
| @angular/material | 18.0.6 | Material components |
| @angular/material-luxon-adapter | 18.0.6 | Material date adapter |
| rxjs | 7.8.1 | Reactive Extensions |
| tslib | 2.6.2 | TypeScript helpers |
| zone.js | 0.15.0 | Zone.js |

### UI Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| primeng | ^20.1.1 | UI components (tables, dialogs, etc.) |
| primeicons | ^7.0.0 | Icons for PrimeNG |
| @primeuix/themes | ^1.2.3 | PrimeNG themes |
| tailwindcss | 3.4.3 | Utility CSS |
| apexcharts | 3.49.1 | Charts |
| ng-apexcharts | 1.10.0 | Angular wrapper for ApexCharts |
| ngx-toastr | ^19.0.0 | Toast notifications |
| ngx-quill | 26.0.1 | Rich text editor |
| ngx-countup | ^13.2.0 | Animated counters |
| ng-qrcode | ^20.0.0 | QR code generation |
| perfect-scrollbar | 1.5.5 | Custom scrollbar |
| highlight.js | 11.9.0 | Code syntax highlighting |

### Utility Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| luxon | 3.4.4 | Date/time library |
| lodash-es | 4.17.21 | Utility (tree-shakeable) |
| crypto-js | 4.2.0 | Encryption/JWT handling |
| file-saver | ^2.0.5 | File download |
| xlsx | ^0.18.5 | Excel export |
| quill | 2.0.2 | Rich text editor dependency |
| @ngneat/transloco | 6.0.4 | i18n library |
| ngx-trim-directive | ^3.0.1 | Input whitespace trimming |
| moment | ^2.30.1 | Legacy date (potentially unused) |

### Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| @angular-devkit/build-angular | ^19.2.1 | Build |
| @angular/cli | 19.2.1 | CLI |
| @angular/compiler-cli | 19.2.1 | Compiler |
| typescript | 5.8.2 | Language |
| jasmine-core | 5.1.2 | Testing |
| karma | 6.4.3 | Test runner |
| autoprefixer | 10.4.19 | PostCSS |
| postcss | 8.4.38 | CSS processor |
| prettier | 3.3.0 | Code formatter |
| chroma-js | 2.4.2 | Color manipulation |
| @tailwindcss/typography | 0.5.13 | Typography plugin |

### Potentially Unused / Duplicate / Deprecated
| Package | Issue |
|---------|-------|
| moment ^2.30.1 | Both luxon and moment are present. Luxon is used (Material adapter), moment may be unused |
| lodash 4.17.21 (devDeps) | Also lodash-es in dependencies. Likely redundant |
| highlight.js | Only used if Fuse demo code reference exists |
| ngx-quill / quill | Rich text editor - likely only used in demo modules |
| @types/highlight.js | Only needed if highlight.js used outside Fuse |

---

## 4. Route Map

```
/                           -> redirect to /dashboard
/signed-in-redirect         -> redirect to /dashboard

[NoAuthGuard - empty layout]
  /confirmation-required    -> Auth confirmation
  /forgot-password          -> Forgot password
  /reset-password           -> Reset password
  /sign-in                  -> Sign in
  /sign-up                  -> Sign up

[AuthGuard - empty layout]
  /sign-out                 -> Sign out
  /unlock-session           -> Unlock session

[No guard - empty layout]
  /home                     -> Landing page

[AuthGuard - modern layout]
  /dashboard                -> Employee Kaos (Family Day gift tracking)
  /merchandise-print        -> Print label dialog
  /scan                     -> Scan Data
  /scan-plant               -> Scan Plant
  /scan-vendor              -> Scan Vendor
  /reject                   -> Reject workflow
  /role                     -> Role management
  /permission               -> Permission management
  /profile                  -> User profile
```

---

## 5. Business-Specific Code

### Employee Kaos (Family Day gift tracking)
- `modules/pages/employee-kaos/` - Full feature: list, CRUD dialogs, print label
- Model: EmployeeKaos (interface, currently empty)
- Service: EmployeeKaosService extends AbstractService
- Route: /dashboard

### Scan Tracking System
- `modules/pages/scan-data/` - Scan data tracking (route: /scan)
- `modules/pages/scan-plant/` - Plant scanning (route: /scan-plant)
- `modules/pages/scan-vendor/` - Vendor scanning (route: /scan-vendor)
- All extend AbstractService with scan-specific URLs
- Route-level state access: stateAccess: 'scan-sto'

### Reject Workflow
- `modules/pages/reject/` - Reject handling (route: /reject)

### Permission & Role Management
- `modules/pages/app/permission/` - Permission CRUD
- `modules/pages/app/role/` - Role CRUD (separate from admin/role/)
- `modules/pages/app/admin/role/` - Admin role page
- `node/app/permission/` + `node/app/role/` - API service layer

### Business-Specific Assets
- `public/images/logo/logo_ed_small.png` - Custom logo
- `public/images/logo/logo_print.png` - Custom print logo
- `public/images/logo/logo_small.png` - Small logo variant
- `public/sound/` - Custom sound effects (success, error, info)
- `public/images/avatars/` - Custom avatar images

### Hardcoded Business Values
- API URL: http://p2-pro16110d:3002/api-flatag/v1 (production)
- App title: Famday Labelin Tag
- Base href: /flatag/
- Output path: dist/flatag
- Business roles: user, admin, superadmin, supplier
- Hardcoded roles in route data: UserRole.Admin, UserRole.User, UserRole.Supplier
- Permission/role names are hardcoded in the existing validator

---

## 6. Fuse Demo / Unused Modules

### Mock APIs (100% demo, can be removed)
| Module | Route | Status |
|--------|-------|--------|
| apps/academy | Not routed | Remove |
| apps/chat | Not routed | Remove |
| apps/contacts | Not routed | Remove |
| apps/ecommerce/inventory | Not routed | Remove |
| apps/file-manager | Not routed | Remove |
| apps/help-center | Not routed | Remove |
| apps/mailbox | Not routed | Remove |
| apps/notes | Not routed | Remove |
| apps/scrumboard | Not routed | Remove |
| apps/tasks | Not routed | Remove |
| dashboards/analytics | Not routed | Remove |
| dashboards/crypto | Not routed | Remove |
| dashboards/finance | Not routed | Remove |
| dashboards/project | Not routed | Remove |
| pages/activities | Not routed | Remove |
| ui/icons | Not routed | Remove |

### Used Mock APIs
| Module | Ref |
|--------|-----|
| common/auth | Referenced in app.config via mockApiServices |
| common/navigation | Referenced (navigation service) |
| common/messages | Referenced (messages service) |
| common/notifications | Referenced (notifications service) |
| common/shortcuts | Referenced (shortcuts service) |
| common/user | Referenced (user service) |
| common/search | Referenced (search component) |

---

## 7. Architecture Assessment

### Strengths
- Modern Angular standalone bootstrap
- Strongly typed interfaces where used
- Clean separation of Fuse template vs application code
- Good use of lazy loading for routes
- Role-based route protection
- Centralized auth interceptor
- Reusable AbstractService for CRUD operations
- Environment-based configuration

### Issues Found
1. **Mixed architecture**: Both standalone components and NgModules coexist inconsistently
2. **PagesModule**: Legacy NgModule that manually declares many components
3. **AbstractService overloaded**: Contains scan-specific methods (updateScan, updateScanVendor, updateScanPlant)
4. **Empty method**: exportExcel() in AbstractService has no implementation
5. **GlobalVariable**: Static class with mutable state, audio references
6. **Two date libraries**: luxon (used) + moment (potentially unused)
7. **lodash duplicate**: Both lodash and lodash-es
8. **Hardcoded API URLs**: Direct environment imports in services
9. **No permission guard/directive**: Only role checking at route level
10. **Duplicate role components**: admin/role/ and app/role/ appear to be duplicates
11. **Commented code**: Navigation filtering has commented-out legacy version
12. **Direct URL in auth interceptor**: No configurable redirect routes
13. **Settings drawer disabled**: Commented out in layout template
14. **No loading state abstraction**: Fuse loading service available but not consistently used
15. **Splash screen**: Custom splash screen with loading.webm video

---

## 8. File Classification

### CORE (reusable infrastructure)
| Path | Action |
|------|--------|
| core/auth/auth.service.ts | KEEP - refactor API URL |
| core/auth/auth.interceptor.ts | KEEP |
| core/auth/auth.provider.ts | KEEP |
| core/auth/auth.utils.ts | KEEP |
| core/auth/guards/auth.guard.ts | KEEP |
| core/auth/guards/noAuth.guard.ts | KEEP |
| core/navigation/navigation.service.ts | KEEP |
| core/navigation/navigation.types.ts | KEEP |
| core/user/user.service.ts | KEEP |
| core/user/user.types.ts | KEEP |
| core/icons/ | KEEP |
| core/transloco/ | KEEP |

### SHARED (reusable UI blocks)
| Path | Action |
|------|--------|
| node/common/abstract.service.ts | REFACTOR (remove scan methods) |
| node/common/paginate.ts | KEEP |
| node/common/cleanFilters.ts | KEEP |
| node/common/shared.module.ts | REFACTOR to standalone |
| node/common/share-dialog.module.ts | REFACTOR to standalone |
| node/common/existing.validator.ts | REFACTOR (remove hardcoded services) |
| node/common/status.enum.ts | KEEP |
| node/common/status-enum.service.ts | KEEP |
| node/common/global-variable.ts | REFACTOR to injectable service |
| node/common/user-role.ts | MOVE_TO_CORE |
| modules/shared/paginate/ | KEEP |
| modules/shared/paginate-take/ | KEEP |
| modules/shared/date-time-picker/ | KEEP |

### LAYOUT (application shell)
| Path | Action |
|------|--------|
| layout/layout.component.ts | KEEP |
| layout/layouts/ (all 11) | KEEP - may prune unused |
| layout/common/languages/ | KEEP |
| layout/common/messages/ | KEEP |
| layout/common/notifications/ | KEEP |
| layout/common/search/ | KEEP |
| layout/common/settings/ | KEEP |
| layout/common/shortcuts/ | KEEP |
| layout/common/user/ | KEEP |

### FEATURES (business-specific)
| Path | Action |
|------|--------|
| modules/pages/employee-kaos/ | KEEP_IN_FEATURE |
| modules/pages/scan-data/ | KEEP_IN_FEATURE |
| modules/pages/scan-plant/ | KEEP_IN_FEATURE |
| modules/pages/scan-vendor/ | KEEP_IN_FEATURE |
| modules/pages/reject/ | KEEP_IN_FEATURE |
| modules/pages/app/permission/ | KEEP_IN_FEATURE |
| modules/pages/app/role/ | KEEP_IN_FEATURE |
| modules/pages/app/admin/role/ | REMOVE_AFTER_VALIDATION (duplicate) |
| modules/pages/app/profile/ | KEEP_IN_FEATURE |
| node/app/permission/ | KEEP_IN_FEATURE |
| node/app/role/ | KEEP_IN_FEATURE |

### DEMO (Fuse demo, removable)
| Path | Action |
|------|--------|
| modules/admin/example/ | REMOVE_AFTER_VALIDATION |
| mock-api/apps/academy/ | REMOVE_AFTER_VALIDATION |
| mock-api/apps/chat/ | REMOVE_AFTER_VALIDATION |
| mock-api/apps/contacts/ | REMOVE_AFTER_VALIDATION |
| mock-api/apps/ecommerce/ | REMOVE_AFTER_VALIDATION |
| mock-api/apps/file-manager/ | REMOVE_AFTER_VALIDATION |
| mock-api/apps/help-center/ | REMOVE_AFTER_VALIDATION |
| mock-api/apps/mailbox/ | REMOVE_AFTER_VALIDATION |
| mock-api/apps/notes/ | REMOVE_AFTER_VALIDATION |
| mock-api/apps/scrumboard/ | REMOVE_AFTER_VALIDATION |
| mock-api/apps/tasks/ | REMOVE_AFTER_VALIDATION |
| mock-api/dashboards/analytics/ | REMOVE_AFTER_VALIDATION |
| mock-api/dashboards/crypto/ | REMOVE_AFTER_VALIDATION |
| mock-api/dashboards/finance/ | REMOVE_AFTER_VALIDATION |
| mock-api/dashboards/project/ | REMOVE_AFTER_VALIDATION |
| mock-api/pages/activities/ | REMOVE_AFTER_VALIDATION |
| mock-api/ui/icons/ | REMOVE_AFTER_VALIDATION |

### NEEDS_MANUAL_REVIEW
| Path | Reason |
|------|--------|
| modules/pages/app/admin/role/ | Appears to duplicate app/role/ |
| modules/pages/pages.module.ts | Legacy NgModule |
| @fuse/lib/mock-api/ | Fuse proprietary code - license check needed |
| @fuse/components/navigation/ | Fuse proprietary code - license check needed |
| public/sound/ | Custom sounds for business app |
| public/images/logo/ | Mix of Fuse logos and custom logos |
| public/images/avatars/ | Business-specific avatars |
