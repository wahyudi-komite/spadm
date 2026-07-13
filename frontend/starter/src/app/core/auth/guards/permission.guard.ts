import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { catchError, map, of } from 'rxjs';

interface PermissionResponse {
    permissions: string[];
}

export const PermissionGuard: CanActivateFn = (route) => {
    const http = inject(HttpClient);
    const router = inject(Router);
    const required = (route.data?.['permissions'] as string[] | undefined) ?? [];

    if (required.length === 0) return true;

    return http
        .get<PermissionResponse>(`${environment.apiUrl}/auth/me/permissions`)
        .pipe(
            map((response) =>
                required.every((permission) =>
                    response.permissions.includes(permission)
                )
                    ? true
                    : router.createUrlTree(['/dashboard'])
            ),
            catchError(() => of(router.createUrlTree(['/dashboard'])))
        );
};
