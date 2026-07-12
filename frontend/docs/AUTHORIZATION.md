# Authorization

This codebase uses a **lightweight, server-driven** authorization model. There is no dedicated `RoleGuard`, `PermissionGuard`, or structural directive (`*hasRole`, `*hasPermission`). Role checking is done inline inside `AuthGuard`, and navigation items are filtered via mock API data.

## User & Role Types

```typescript
// core/user/user.types.ts
interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
    role: Role;          // single-role model
    plant: string;
}

// node/app/role/role.ts
interface Role {
    id: number;
    name: string;        // e.g. 'admin', 'user', 'supplier'
    permissions?: Permission[];
}

// node/app/permission/permission.ts
interface Permission {
    id: number;
    name: string;
}
```

## Route-Level Role Check

Handled inside `AuthGuard` after authentication succeeds. The guard reads `route.data['role']` (a string array) and compares it against `user.role.name`:

```typescript
// core/auth/guards/auth.guard.ts
if (route.data['role'] && (!user.role || !route.data['role'].includes(user.role.name))) {
    return of(router.parseUrl(`sign-in?redirectURL=${state.url}`));
}
```

Usage in routes:

```typescript
{
    path: 'admin-panel',
    canActivate: [AuthGuard],
    data: { role: ['admin'] },
    loadChildren: () => import('./admin.routes'),
}
```

## Navigation Filtering via meta.roles

The mock API navigation data (`mock-api/common/navigation/data.ts`) attaches allowed roles per menu item:

```typescript
{ id: 'dashboard', title: 'Dashboard', link: '/dashboard', meta: { roles: ['admin', 'user', 'supplier'] } },
{ id: 'scan',     title: 'Sto Print',   link: '/scan',        meta: { roles: ['admin'] } },
{ id: 'scan-vendor', title: 'Sto Vendor', link: '/scan-vendor', meta: { roles: ['supplier', 'admin'] } },
```

The mock API service uses these `meta.roles` to filter the navigation response by the current user's role. Items are hidden server-side based on the role array.

## Server-Side Permission Check

The `AuthService` exposes a single permission check method that delegates to the backend:

```typescript
// auth.service.ts
roleAccess(id: number, permission: string): Observable<any> {
    return this._httpClient.get(`${environment.apiUrl}/roles/roleAccess`, {
        params: { id: id.toString(), permission }
    });
}
```

## Summary

| Mechanism | Location | How it works |
|-----------|----------|--------------|
| Route role guard | `AuthGuard` via `route.data['role']` | Redirects to sign-in if role doesn't match |
| Navigation filtering | Mock API `data.ts` `meta.roles` | Backend filters menu items by user role |
| Permission check | `AuthService.roleAccess()` | Server-side boolean check by role ID + permission name |
| Role/permission models | `Role`, `Permission` interfaces | Typed on `User.role` |
