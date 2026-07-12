# Generic CRUD

## ApiClient Base Service

`core/http/api-client.service.ts` is the abstract base for all API services.

### Methods

| Method | HTTP | Path | Description |
|--------|------|------|-------------|
| `all(page, limit, direction, sort, find, filterParams)` | GET | `url` | Paginated list with query params built via `buildHttpParams` |
| `serverside(params)` | GET | `url` | PrimeNG server-side mode params (first, rows, sortField, sortOrder, globalFilter, filters) |
| `create(data)` | POST | `url` | Create resource |
| `get(id)` | GET | `url/:id` | Get by ID |
| `update(id, data)` | PUT | `url/:id` | Update resource |
| `delete(id)` | DELETE | `url/:id` | Delete resource |
| `findOne(query)` | POST | `url/findName` | Find by name/query for uniqueness checks |
| `find(query)` | POST | `url/findIn` | Find in set |
| `getAll(direction, sort, field?, keyword?)` | GET | `url/all` | Get sorted list with optional field filter |
| `getAllx()` | GET | `url` | Get all (no params) |
| `getCount(plant, where?, whereNot?)` | GET | `url/count` | Get count with filter conditions |

### Service Pattern

Extend `ApiClient`, set `url`, use `this.http.*`:

```typescript
@Injectable({ providedIn: 'root' })
export class EmployeeKaosService extends ApiClient {
    override url = environment.apiUrl + '/employee_kaos';

    getList(query: CrudQuery): Observable<Paginate> {
        const { page, limit, direction, sort, find, filterParams } = query;
        return this.all(page, limit, direction, sort, find, filterParams);
    }

    getById(id: number): Observable<ApiResponse> {
        return this.get(id);
    }
}
```

## Types

### Paginate (`shared/types/paginate.model.ts`)

```typescript
interface Paginate {
    data: any[];
    meta: { total: number; page: number; pageSize: number; last_page: number };
}
```

Used as the standard paginated response wrapper throughout all CRUD features.

### CrudQuery

The de facto query shape passed to CRUD service methods:

| Field | Type | Purpose |
|-------|------|---------|
| `page` | `number` | Current page (1-based) |
| `limit` | `number` | Items per page |
| `sort` | `string` | Sort field name |
| `direction` | `'asc' \| 'desc'` | Sort direction |
| `find` | `string` | Global search keyword |
| `filterParams` | `Record<string, unknown>` | Column-specific filter values |

### ApiResponse (`core/http/api-response.model.ts`)

```typescript
interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status?: number;
}
```

## Query Params Utility

`core/http/query-params.util.ts` — `buildHttpParams(page, limit, direction, sort, find, filterParams)`:

Builds `HttpParams` appending each non-null value. `filterParams` entries are iterated and appended individually. Used by `ApiClient.all()`.

## cleanFilters Utility

`shared/utils/clean-filters.util.ts` — Strips empty/null values from PrimeNG `FilterMetadata` objects:

- Removes the `global` key
- Filters out null/empty string/empty array values
- Returns only valid filter entries as `Record<string, FilterMetadata[]>`

## PrimeNG Table + Pagination Conventions

| Concept | Implementation |
|---------|---------------|
| Table component | `<p-table>` with `[lazy]="true"` + `(onLazyLoad)` |
| Page size selector | `<p-paginator>` with `[rows]` and `[rowsPerPageOptions]` |
| Sorting | `(onLazyLoad)` receives `sortField` + `sortOrder` |
| Global filter | `globalFilter` in PrimeNG params |
| Column filters | `filters` as `JSON.stringify` of `FilterMetadata` map |
| Table loading | `[loading]` binding during async operation |
| Server-side mode | `ApiClient.serverside(params)` passes PrimeNG's lazy event directly |
| Delete confirmation | `FuseConfirmationService.open()` before delete |
| Success/error toast | `ngx-toastr` notifications after CRUD operations |

### CRUD Service Convention

Business services typically expose 5 methods:

| Method | Returns | Purpose |
|--------|---------|---------|
| `getList(query)` | `Observable<Paginate>` | Paginated, filtered, sorted list |
| `getById(id)` | `Observable<ApiResponse>` | Single record |
| `create(data)` | `Observable<ApiResponse>` | Create record |
| `update(id, data)` | `Observable<ApiResponse>` | Update record |
| `delete(id)` | `Observable<void>` | Delete record |
