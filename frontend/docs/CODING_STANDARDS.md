# Coding Standards

## Standalone Components

All components use `imports` array instead of NgModules. No `NgModule` declarations.

```ts
@Component({
    selector: 'app-example-list',
    standalone: true,
    imports: [TableModule, FormsModule, DatePipe, InputTextModule],
    templateUrl: './list.component.html',
})
export class ExampleListComponent {}
```

## inject() DI Pattern

Use `inject()` rather than constructor-based DI for services:

```ts
@Component({...})
export class ExampleListComponent implements OnInit {
    private service = inject(ExampleService);
    private _fuseConfigService = inject(FuseConfigService);
}
```

Constructor injection is still used occasionally in layout-level components (e.g. `LayoutComponent`, `ClassyLayoutComponent`) — prefer `inject()` in new code.

## ApiClient Extension Pattern

Services extend `ApiClient` (defined in `core/http/api-client.service.ts`):

```ts
@Injectable({ providedIn: 'root' })
export class ExampleService extends ApiClient {
    override url = '/example-items';

    getList(query?: Record<string, unknown>): Observable<HttpResponse<Paginate>> {
        return this.http.get<Paginate>(this.url, {
            params: query as any,
            observe: 'response',
        });
    }
}
```

`ApiClient` provides built-in `all()`, `create()`, `get()`, `update()`, `delete()`, `serverside()`, `find()`, `getAll()`, and `getCount()` methods. Override `url` with the API endpoint path.

## Routing Conventions

- Lazy-load children via `loadChildren` with dynamic `import()`
- Route files **export default** the route array

```ts
// example.routes.ts
import { Routes } from '@angular/router';

export default [
    { path: '', loadComponent: () => import('./list/list.component').then(m => m.ExampleListComponent) },
    { path: ':id', loadComponent: () => import('./detail/detail.component').then(m => m.ExampleDetailComponent) },
] as Routes;
```

- Feature routes are registered in `modules/pages/pages.routes.ts`
- Auth routes live in `modules/auth/`
- Landing routes live in `modules/landing/`
- Redirections and guards are configured in `app.routes.ts`

## PrimeNG Table Pattern with Lazy Loading

```ts
@Component({...})
export class ExampleListComponent implements OnInit {
    private service = inject(ExampleService);
    items: ExampleItem[] = [];
    total = 0;
    loading = true;
    request: any = {};

    ngOnInit() { this.load(); }

    loadLazy(event: TableLazyLoadEvent) {
        this.request.globalFilter = event.globalFilter || '';
        this.request.sortField = event.sortField || '';
        this.request.sortOrder = event.sortOrder || 'DESC';
        this.request.first = event.first || 0;
        this.request.rows = event.rows;
        this.request.filters = cleanFilters(event.filters);
        this.load();
    }

    private load() {
        this.loading = true;
        this.service.getList(this.request)
            .pipe(map(res => res.body!))
            .subscribe({
                next: (res) => {
                    this.items = res.data;
                    this.total = res.meta.total;
                    this.loading = false;
                },
                error: () => (this.loading = false),
            });
    }
}
```

Template uses `<p-table [lazy]="true" (onLazyLoad)="loadLazy($event)">` with `[paginator]="true"`.

## cleanFilters Usage

Import and use `cleanFilters(event.filters)` inside `loadLazy()` to strip null/empty values and the `global` key before sending filter data to the API:

```ts
import { cleanFilters } from '../../../shared/utils/clean-filters.util';
```

The utility removes:
- `global` filter key
- Filters with `null` values
- Empty string values
- Empty array values (for multi-select)

## Pagination Conventions

The `Paginate` interface (`shared/types/paginate.model.ts`) defines the API response shape:

```ts
interface Paginate {
    data: any[];
    meta: { total: number; page: number; pageSize: number; last_page: number };
}
```

Use `ApiClient.serverside()` for PrimeNG-driven endpoints (sends `first`, `rows`, `sortField`, `sortOrder`, `globalFilter`, and `filters` as query params). Use `ApiClient.all()` for simpler pagination.

## Directory Structure

```
src/app/
├── core/            # Singletons, guards, services, config, auth
│   ├── config/
│   ├── http/
│   ├── navigation/
│   ├── auth/
│   ├── icons/
│   ├── transloco/
│   └── user/
├── features/        # Feature modules (domain-specific)
│   └── example/
│       ├── list/
│       ├── detail/
│       ├── example.routes.ts
│       ├── example.service.ts
│       └── example.types.ts
├── modules/         # App-level route aggregators
│   ├── auth/
│   ├── landing/
│   └── pages/
├── layout/          # Layout components and common UI
│   ├── common/
│   └── layouts/
│       ├── empty/
│       └── vertical/
│           ├── classy/
│           └── classic/
├── shared/          # Reusable utils, validators, types, forms
│   ├── types/
│   ├── utils/
│   └── forms/
└── mock-api/        # Mock API data and handlers
```

## Naming Conventions

- **Files**: `kebab-case` (e.g. `clean-filters.util.ts`, `example.service.ts`)
- **Classes**: `PascalCase` (e.g. `ExampleService`, `ExampleListComponent`)
- **Selector prefix**: `app-` for all components (e.g. `app-search-input`)
- **Route files**: `*.routes.ts` (e.g. `example.routes.ts`)
- **Type files**: `*.types.ts` (e.g. `example.types.ts`)
- **Service suffix**: `*.service.ts`
- **Component suffix**: `*.component.ts` for standalone components

## Key Files Reference

| Path | Purpose |
|------|---------|
| `app.config.ts` | App-wide providers, Fuse config, PrimeNG theme |
| `app.routes.ts` | Top-level routes with guards and layout data |
| `core/http/api-client.service.ts` | Base class for all API services |
| `shared/types/paginate.model.ts` | Paginated API response shape |
| `shared/utils/clean-filters.util.ts` | PrimeNG filter sanitization |
| `core/navigation/navigation.service.ts` | Navigation loading + role filtering |
