# Migration Guide

For developers moving code from the old Fuse module-based structure to the new standalone architecture.

## Folder Mapping

| Old Path | New Path |
|----------|----------|
| `modules/pages/employee-kaos/` | `features/dashboard/` |
| `modules/pages/scan-data/` | `features/scan-data/` |
| `modules/pages/scan-plant/` | `features/scan-plant/` |
| `modules/pages/scan-vendor/` | `features/scan-vendor/` |
| `modules/pages/reject/` | `features/reject/` |
| `modules/pages/app/permission/` | `features/permissions/` |
| `modules/pages/app/role/` | `features/roles/` |
| `modules/pages/app/profile/` | `features/profile/` |
| `modules/auth/` | `features/auth-pages/` |
| `modules/landing/home/` | `features/landing/` |
| `modules/pages/app/admin/role/` | Removed (duplicate of `app/role/`) |
| `modules/admin/example/` | Removed |

## Module to Standalone Migration

Old modules used `NgModule` with `declarations`, `imports`, and `providers`. New components use Angular standalone mode with `bootstrapApplication`:

**Before (NgModule):**
```typescript
@NgModule({
    declarations: [ExampleListComponent],
    imports: [CommonModule, TableModule, SharedModule],
})
export class ExampleModule {}
```

**After (standalone):**
```typescript
@Component({
    standalone: true,
    imports: [NgIf, DatePipe, FormsModule, TableModule, InputTextModule],
    // ...
})
export class ExampleListComponent {}
```

Lazy loading now uses `loadComponent` and default-exported route arrays instead of `loadChildren` pointing to modules.

## Shared Components

- `node/common/shared.module.ts` → split into standalone components in `shared/`
- `node/common/share-dialog.module.ts` → `shared/dialogs/`
- `node/common/paginate.ts` → `shared/types/paginate.model.ts`
- `node/common/cleanFilters.ts` → `shared/utils/clean-filters.util.ts`
- `node/common/existing.validator.ts` → `shared/validators/existing-validator.ts`
- `node/common/status.enum.ts` → `core/types/status.enum.ts`
- `node/common/user-role.ts` → `core/types/user-role.enum.ts`
- `modules/shared/paginate/` → `shared/tables/pagination/`
- `modules/shared/date-time-picker/` → `shared/forms/date-time-picker/`
- `modules/comp/tabel/` → `shared/forms/search-input/`

## AbstractService → ApiClient

The old `AbstractService` in `node/common/` has been replaced by `ApiClient` in `core/http/api-client.service.ts`.

**Before:** `class MyService extends AbstractService`
**After:** `class MyService extends ApiClient`

Changes:
- `url` is now an abstract getter property instead of a constructor parameter
- No more `scan`-specific methods — use `HttpClient` directly with `observe: 'response'` for full control
- Use `ApiClient` base methods (`all`, `serverside`, `create`, `get`, `update`, `delete`) or call `this.http` directly

## Environment Injection Tokens

Do **not** import `environment.ts` directly. Use the `APP_ENVIRONMENT` injection token:

```typescript
const env = inject(APP_ENVIRONMENT);
// env.apiUrl, env.production
```

Provided by `provideAppEnvironment()` in `app.config.ts`.

## Route Lazy-Loading

Old-style `loadChildren: () => import('./path').then(m => m.ModuleName)` has been replaced with default-exported route arrays:

```typescript
// feature.routes.ts
export default [
    { path: '', loadComponent: () => import('./list/list.component').then(m => m.ListComponent) },
] as Routes;
```

When adding new features, register them as children under the `admin` route group in `app.routes.ts`. The main route shell uses `LayoutComponent` with `data.layout` to dispatch the correct layout variant (`'empty'`, `'classy'`, `'modern'`, `'classic'`).
