# Authentication

## AuthService

Central auth service at `core/auth/auth.service.ts`. Tracks auth state in-memory via `BehaviorSubject`.

```typescript
// Sign in — POSTs credentials, stores token + user
signIn(credentials: { email: string; password: string }): Observable<any>
// POST to {apiUrl}/auth/sign-in

// Sign out — POSTs to logout endpoint, clears token
signOut(): Observable<any>
// POST to {apiUrl}/auth/logout

// Re-authenticate using stored token
signInUsingToken(): Observable<any>
// POST to {apiUrl}/auth/sign-in-with-token

// Check authentication status
check(): Observable<boolean>
// 1. Hits {apiUrl}/auth/check-auth
// 2. Falls back to signInUsingToken if token exists & not expired
// 3. Returns false otherwise

// Access token (in-memory, no localStorage)
accessToken: string | null
accessToken$: Observable<string | null>
```

## AuthGuard (`core/auth/guards/auth.guard.ts`)

Functional guard. Calls `AuthService.check()`, redirects to `/sign-in` if unauthenticated. Also checks `route.data['role']` against `user.role.name`:

```typescript
export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    // ...check()...
    // If route.data['role'] is set, verifies user.role.name is in that array
    if (route.data['role'] && (!user.role || !route.data['role'].includes(user.role.name))) {
        return of(urlTree); // redirect to sign-in
    }
    return of(true);
};
```

## NoAuthGuard (`core/auth/guards/noAuth.guard.ts`)

Inverse guard — redirects already-authenticated users away (used on sign-in, sign-up pages):

```typescript
export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    return inject(AuthService).check().pipe(
        switchMap((authenticated) => {
            if (authenticated) return of(router.parseUrl(''));
            return of(true);
        })
    );
};
```

## AuthInterceptor (`core/auth/auth.interceptor.ts`)

Functional interceptor (no class — uses `HttpHandlerFn`):

```typescript
export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    let newReq = req.clone({ withCredentials: true });

    // If token exists and isn't expired, send withCredentials
    if (authService.accessToken && !AuthUtils.isTokenExpired(authService.accessToken)) {
        newReq = req.clone({ withCredentials: true });
    }

    // On 401 response: sign out + reload
    return next(newReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                authService.signOut();
                location.reload();
            }
            return throwError(error);
        })
    );
};
```

## Auth Provider (`core/auth/auth.provider.ts`)

Registered in `app.config.ts` via `provideAuth()`. Sets up the interceptor and forces `AuthService` instantiation early:

```typescript
export const provideAuth = (): Array<Provider | EnvironmentProviders> => {
    return [
        provideHttpClient(withInterceptors([authInterceptor])),
        { provide: ENVIRONMENT_INITIALIZER, useValue: () => inject(AuthService), multi: true },
    ];
};
```

## Route Configuration Example

```typescript
// Guest-only routes (sign-in, sign-up)
{ path: '', canActivate: [NoAuthGuard], canActivateChild: [NoAuthGuard], children: [
    { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
] }

// Protected routes with role check
{ path: 'admin', canActivate: [AuthGuard], data: { role: ['admin'] },
    loadChildren: () => import('app/modules/admin/admin.routes') }
```

## AuthUtils (`core/auth/auth.utils.ts`)

JWT utility class. Decodes JWT locally to check expiry without a server call — used by interceptor and `check()`:

```typescript
AuthUtils.isTokenExpired(token: string, offsetSeconds?: number): boolean
// Decodes token, compares exp with current time
```
