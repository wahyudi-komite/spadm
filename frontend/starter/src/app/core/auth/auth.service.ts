import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUtils } from './auth.utils';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private accessTokenSubject = new BehaviorSubject<string | null>(null);
    accessToken$ = this.accessTokenSubject.asObservable();

    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private _router = inject(Router);

    set accessToken(token: string) {
        this.accessTokenSubject.next(token);
    }

    get accessToken(): string | null {
        return this.accessTokenSubject.value;
    }

    get authenticated(): boolean {
        return this._authenticated;
    }

    signIn(credentials: { npk: string; password: string }): Observable<any> {
        if (this._authenticated) {
            return throwError(() => new Error('User is already logged in.'));
        }

        return this._httpClient.post(`${environment.apiUrl}/auth/sign-in`, credentials).pipe(
            switchMap((response: any) => {
                this.accessToken = response.accessToken;
                this._authenticated = true;
                this._userService.user = response.user;

                if (response.mustChangePassword) {
                    this._router.navigateByUrl('/change-password');
                    return of({ mustChangePassword: true });
                }

                return of(response);
            })
        );
    }

    signInUsingToken(): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/auth/refresh`, {}).pipe(
            catchError(() => of(false)),
            switchMap((response: any) => {
                if (!response) return of(false);

                if (response.accessToken) {
                    this.accessToken = response.accessToken;
                }

                this._authenticated = true;
                if (response.user) {
                    this._userService.user = response.user;
                }

                return of(true);
            })
        );
    }

    signOut(): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
            catchError(() => of(true)),
            tap(() => {
                this.accessTokenSubject.next(null);
                this._authenticated = false;
            }),
            switchMap(() => of(true))
        );
    }

    changePassword(currentPassword: string, newPassword: string): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/auth/change-password`, {
            currentPassword,
            newPassword,
        });
    }

    forgotPassword(npk: string): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/auth/forgot-password`, { npk });
    }

    resetPassword(token: string, newPassword: string): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/auth/reset-password`, {
            token,
            newPassword,
        });
    }

    getProfile(): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/auth/me`);
    }

    getSessions(): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/auth/me/sessions`);
    }

    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    check(): Observable<boolean> {
        if (this._authenticated) return of(true);

        if (this.accessToken && !AuthUtils.isTokenExpired(this.accessToken)) {
            return this.signInUsingToken();
        }

        return this.signInUsingToken();
    }
}
