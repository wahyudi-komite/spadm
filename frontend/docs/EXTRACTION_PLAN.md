# Extraction Plan

Based on the project audit, here is the proposed extraction sequence.

---

## Target Architecture

```
src/
  app/
    core/
      auth/                    Authentication service, guards, interceptor, utils
      authorization/           Permission/role guard, directives, models
      config/                  App configuration (branding, layout settings)
      http/                    ApiClient, base API service, response models
      interceptors/            Auth interceptor, error interceptor
      navigation/              Navigation service + types
      services/                User service, platform, media watcher
      storage/                 Local storage abstraction
      theme/                   Theme service (Fuse wrapper)
      types/                   Core interfaces
      core.providers.ts        Core providers array

    layout/
      components/              Common UI (languages, messages, notifications,
                               quick-chat, search, settings, shortcuts, user)
      layouts/                 Layout variants (keep 3-5 essential ones)
      layout.component.ts      Layout dispatcher
      layout.routes.ts         Layout route configuration

    shared/
      components/              Reusable UI (alert, card, drawer, fullscreen,
                               highlight, loading-bar, masonry)
      dialogs/                 Confirmation dialog, generic form dialog
      directives/              Scrollbar, scroll-reset
      forms/                   Form components (date-picker, search-input)
      pipes/                   Shared pipes
      tables/                  Pagination components
      types/                   Shared types
      utils/                   cleanFilters, GlobalVariable as service, export utils
      validators/              Shared validators, ExistingValidator
      shared.providers.ts      Shared providers

    features/                  Business modules (isolated)
      dashboard/               Employee Kaos feature
      scan-data/               Scan data tracking
      scan-plant/              Plant scanning
      scan-vendor/             Vendor scanning
      reject/                  Reject workflow
      roles/                   Role management
      permissions/             Permission management
      profile/                 User profile
      settings/                App settings
      auth-pages/              Sign-in, sign-up, sign-out, etc.

    app.component.ts
    app.config.ts
    app.routes.ts
```

---

## Migration Sequence

### Phase 2: Target Design (current phase)
- Finalize target architecture
- Map old -> new folder structure
- Identify risks
- Define validation checkpoints

### Phase 3: Core Extraction
Steps:
1. Create `core/` subdirectories matching target
2. Move auth service, guards, interceptor, provider -> `core/auth/`
3. Move navigation service + types -> `core/navigation/`
4. Move user service + types -> `core/services/`
5. Create `core/http/api-client.service.ts` from AbstractService
6. Create `core/http/api-response.model.ts` with Paginate, CrudQuery types
7. Create `core/http/query-params.util.ts` from AbstractService.buildHttpParams
8. Create `core/config/app-config.ts` with injection token
9. Extract theme config to `core/theme/`
10. Create `core/core.providers.ts`
11. Refactor `environment.ts` to use injection tokens
12. Update `app.config.ts` to use new core providers

Risks:
- Auth flow must remain functional after move
- Route guards must be re-exported correctly
- Navigation service has complex user$ subscription

Validation:
- Build succeeds
- Auth flow works (sign-in, sign-out, session restore)
- Route guards work
- Navigation loads
- Theme switching works

### Phase 4: Shared Extraction
Steps:
1. Create `shared/` subdirectories
2. Refactor `AbstractService` -> `core/http/api-client.service.ts` (remove scan methods)
3. Move `cleanFilters` -> `shared/utils/`
4. Move `Paginate` interface -> `shared/types/`
5. Move `StatusEnum` + `StatusEnumService` -> `shared/types/`
6. Move `GlobalVariable` -> `shared/services/app-audio.service.ts`
7. Refactor `SharedModule` to standalone components
8. Refactor `ShareDialogModule` to standalone
9. Move `ExistingValidator` -> `shared/validators/` (decouple from PermissionService/RoleService)
10. Move pagination components -> `shared/tables/`
11. Move `UserRole` -> `core/types/`

Risks:
- Many components import SharedModule
- ExistingValidator directly injects PermissionService and RoleService
- AbstractService is extended by many business services

Validation:
- Build succeeds
- Shared components render correctly
- Pagination works
- Dialogs open correctly

### Phase 5: Layout Cleanup
Steps:
1. Prune unused layout variants (keep: empty, modern, classic, classy)
2. Move layout components into `layout/components/`
3. Clean up common components (languages, messages, etc.)
4. Remove commented settings drawer
5. Refactor landing page

Risks:
- Route data references specific layout names
- Removing layouts breaks lazy-loaded routes

Validation:
- All routes still render with correct layout
- Navigation works in all layouts
- Mobile responsive

### Phase 6: Feature Isolation
Steps:
1. Move all business features to `features/` directory
2. Employee Kaos -> `features/dashboard/`
3. Scan tracking -> `features/scan-data/`, `features/scan-plant/`, `features/scan-vendor/`
4. Reject -> `features/reject/`
5. Permission/Role CRUD -> `features/permissions/`, `features/roles/`
6. Profile -> `features/profile/`
7. Auth pages -> `features/auth-pages/`
8. Update page routes accordingly
9. Verify duplicate admin/role/ vs app/role/

Risks:
- Deep import paths will break
- Route lazy-loading paths need updating
- Module declarations need re-mapping

Validation:
- All routes work
- All CRUD operations work
- Role/permission management works
- Auth flow works

### Phase 7: Demo Cleanup
Steps:
1. Remove `mock-api/apps/academy/`
2. Remove `mock-api/apps/chat/`
3. Remove `mock-api/apps/contacts/`
4. Remove `mock-api/apps/ecommerce/`
5. Remove `mock-api/apps/file-manager/`
6. Remove `mock-api/apps/help-center/`
7. Remove `mock-api/apps/mailbox/`
8. Remove `mock-api/apps/notes/`
9. Remove `mock-api/apps/scrumboard/`
10. Remove `mock-api/apps/tasks/`
11. Remove `mock-api/dashboards/analytics/`
12. Remove `mock-api/dashboards/crypto/`
13. Remove `mock-api/dashboards/finance/`
14. Remove `mock-api/dashboards/project/`
15. Remove `mock-api/pages/activities/`
16. Remove `mock-api/ui/icons/`
17. Remove `modules/admin/example/`
18. Build + verify after each removal

Risks:
- Some mock API data may be referenced unexpectedly
- Removing too quickly can miss references

Validation:
- Build succeeds after each removal batch
- No runtime errors

### Phase 8: Dependency Cleanup
Steps:
1. Remove `moment` if unused
2. Remove `lodash` (keep lodash-es)
3. Remove `highlight.js` if unused
4. Remove `ngx-quill` + `quill` if unused
5. Remove `@types/highlight.js`

Validation:
- Build succeeds
- npm install succeeds

### Phase 9: Starter Template Creation
Steps:
1. Create clean `src/app/` with only core + shared + layout
2. Add neutral example feature
3. Add README with template instructions
4. Configure branding injection tokens
5. Add environment templates

### Phase 10: Documentation
Steps:
1. ARCHITECTURE.md - Target architecture overview
2. AUTHENTICATION.md - Auth flow documentation
3. AUTHORIZATION.md - Permission/role system docs
4. NAVIGATION.md - Navigation system docs
5. GENERIC_CRUD.md - CRUD architecture docs
6. SHARED_COMPONENTS.md - Component library docs
7. API_INTEGRATION.md - API layer docs
8. THEMING.md - Theme configuration
9. CODING_STANDARDS.md - Style guide
10. NEW_FEATURE_GUIDE.md - How to add features
11. PROJECT_SETUP.md - Getting started
12. ENVIRONMENT_SETUP.md - Environment config
13. MIGRATION_GUIDE.md - Migration from old structure
14. REMOVED_FILES.md - What was removed
15. REMOVED_DEPENDENCIES.md - What deps were removed
16. EXTRACTION_REPORT.md - Final extraction summary
