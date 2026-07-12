# API Integration

## ApiClient (Abstract Base Service)

Located at `core/http/api-client.service.ts`. Extend this class for any CRUD resource:

```typescript
export abstract class ApiClient {
    abstract get url(): string;    // e.g. `${environment.apiUrl}/users`

    all(page?, limit?, direction?, sort?, find?, filterParams?): Observable<any>
    serverside(params): Observable<any>      // PrimeNG table format
    create(data): Observable<any>
    get(id: number): Observable<any>
    update(id: number, data): Observable<any>
    delete(id: number): Observable<void>
    findOne(query): Observable<any>          // POST /findName
    find(query): Observable<any>             // POST /findIn
    getAll(direction, sort, field?, keyword?): Observable<any>   // GET /all
    getAllx(): Observable<any>               // plain GET to url
    getCount(plant, where?, whereNot?): Observable<{plant: string, count: number}>
}
```

### Usage Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class UsersApiClient extends ApiClient {
    get url(): string {
        return `${environment.apiUrl}/users`;
    }
}

// In a component or effect:
this.usersApiClient.all(1, 10, 'asc', 'name', '', { plant: 'plantA' }).subscribe(...);
```

## Query Params Builder (`core/http/query-params.util.ts`)

Used by `ApiClient.all()`. Builds `HttpParams` with standard pagination/sort/filter keys:

```typescript
buildHttpParams(page, limit, direction, sort, find, filterParams?): HttpParams
// Produces: ?page=1&limit=10&sort=name&direction=asc&keyword=search&plant=plantA
```

## ApiResponse & Paginate Interfaces

```typescript
// core/http/api-response.model.ts
interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status?: number;
}

// shared/types/paginate.model.ts
interface Paginate {
    data: any[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        last_page: number;
    };
}
```

## cleanFilters Utility (`shared/utils/clean-filters.util.ts`)

Strips empty/null/blank values from PrimeNG `FilterMetadata` objects before sending to the server:

```typescript
cleanFilters(filterData: Record<string, FilterMetadata | FilterMetadata[]>)
// Removes: null values, empty strings, empty arrays, and the 'global' key
```

## Environment Config

Injection token pattern at `core/config/app-config.token.ts`:

```typescript
// Register in app.config.ts
provideAppEnvironment()

// Use anywhere
const env = inject(APP_ENVIRONMENT);   // { production: boolean, apiUrl: string }
```

## Interceptor

The `authInterceptor` (`core/auth/auth.interceptor.ts`) is registered via `provideHttpClient(withInterceptors([authInterceptor]))`:

- Sends all requests with `{ withCredentials: true }`
- On 401 response: calls `authService.signOut()` + `location.reload()`

## Error Handling

Errors are handled per-request. The interceptor only catches 401 for sign-out. There is no global error handler:

```typescript
this.apiClient.get(id).pipe(
    catchError((err) => {
        // handle 4xx/5xx per component
        return throwError(err);
    })
).subscribe({
    error: (err) => this.toastr.error(err.message),
});
```
