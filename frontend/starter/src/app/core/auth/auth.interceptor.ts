import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);

    let newReq = req.clone({ withCredentials: true });

    if (authService.accessToken) {
        newReq = req.clone({
            withCredentials: true,
            setHeaders: {
                Authorization: `Bearer ${authService.accessToken}`,
            },
        });
    }

    return next(newReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                if (req.url.includes('/auth/refresh') || req.url.includes('/auth/sign-in')) {
                    return throwError(() => error);
                }

                return authService.signInUsingToken().pipe(
                    switchMap((refreshed) => {
                        if (refreshed) {
                            const retryReq = req.clone({
                                withCredentials: true,
                                setHeaders: {
                                    Authorization: `Bearer ${authService.accessToken}`,
                                },
                            });
                            return next(retryReq);
                        }
                        authService.signOut().subscribe(() => {
                            window.location.href = '/sign-in';
                        });
                        return throwError(() => error);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
