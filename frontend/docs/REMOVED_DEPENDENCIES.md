# Removed Dependencies

| Package | Reason |
|---------|--------|
| `moment` | Replaced entirely by `luxon` which was already in the project. All date formatting/parsing uses Luxon via `@angular/material-luxon-adapter`. |
| `@types/highlight.js` | `highlight.js` remains as a dependency (used by Fuse's code highlight component), but the separate `@types/highlight.js` package was redundant — Angular CLI resolves types from the main package. |

## Packages Kept

These were considered for removal but kept because they are actively used outside demo code:

- `lodash-es` — used in `NavigationMockApi` and business services
- `lodash` — dev dependency for type generation
- `highlight.js` — used by Fuse's `@fuse/components/highlight`
- `ngx-quill` / `quill` — used in business features, not just demo
- `crypto-js` — used for HMAC signing in auth
- `xlsx` — used for export functionality
