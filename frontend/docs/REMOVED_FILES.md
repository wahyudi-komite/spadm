# Removed Files and Directories

## Mock API — Demo Apps (no imports to them)

All removed because they provided fake data for Fuse demo features that don't exist in this project:

- `mock-api/apps/academy/`
- `mock-api/apps/chat/`
- `mock-api/apps/contacts/`
- `mock-api/apps/ecommerce/`
- `mock-api/apps/file-manager/`
- `mock-api/apps/help-center/`
- `mock-api/apps/mailbox/`
- `mock-api/apps/notes/`
- `mock-api/apps/scrumboard/`
- `mock-api/apps/tasks/`

## Mock API — Demo Dashboards (no imports to them)

- `mock-api/dashboards/analytics/`
- `mock-api/dashboards/crypto/`
- `mock-api/dashboards/finance/`
- `mock-api/dashboards/project/`

## Mock API — Other Demo Data

- `mock-api/pages/activities/`
- `mock-api/ui/icons/` — kept for now (still imported in `mock-api/index.ts`)

## Admin / Demo Pages

- `modules/admin/example/` — demo CRUD page that was not referenced by any route

## Layout Variants

Removed to reduce bundle size and maintenance burden:

- `layout/layouts/centered/`
- `layout/layouts/compact/`
- `layout/layouts/dense/`
- `layout/layouts/enterprise/`
- `layout/layouts/futuristic/`
- `layout/layouts/material/`
- `layout/layouts/thin/`

Kept: `empty/`, `classic/`, `classy/` (default), `modern/`.

## Duplicate Role Module

- `modules/pages/app/admin/role/` — removed after validation confirmed it was a duplicate of `modules/pages/app/role/`

## Deprecated Module Files

- `modules/pages/pages.module.ts` — obsolete; all pages use standalone components or lazy-loaded route files
