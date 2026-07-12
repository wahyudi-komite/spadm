import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import {
    BehaviorSubject,
    catchError,
    map,
    Observable,
    of,
    switchMap,
    tap,
    throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUtils } from './auth.utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private accessTokenSubject = new BehaviorSubject<string | null>(null);
    accessToken$ = this.accessTokenSubject.asObservable();

    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        // localStorage.setItem('accessToken', token);
        this.accessTokenSubject.next(token);
    }

    get accessToken(): string | null {
        // return localStorage.getItem('accessToken') ?? '';
        return this.accessTokenSubject.value;
    }

    private checkAuthStatus(): Observable<boolean> {
        return this._httpClient
            .get<{
                isAuthenticated: boolean;
            }>(`${environment.apiUrl}/auth/check-auth`)
            .pipe(
                map((response: any) => {
                    // Store the access token in the local storage
                    this.accessToken = response.accessToken;

                    // Set the authenticated flag to true
                    this._authenticated = response.isAuthenticated;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    return response.isAuthenticated;
                }),
                catchError(() => of(false))
            );
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post(`${environment.apiUrl}/auth/sign-in`, credentials)
            .pipe(
                switchMap((response: any) => {
                    // Store the access token in the local storage
                    this.accessToken = response.accessToken;

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Return a new observable with the response
                    return of(response);
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .post(`${environment.apiUrl}/auth/sign-in-with-token`, {
                accessToken: this.accessToken,
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optonal step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.
                    if (response.accessToken) {
                        this.accessToken = response.accessToken;
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        // localStorage.removeItem('accessToken');.
        return this._httpClient
            .post(`${environment.apiUrl}/auth/logout`, {})
            .pipe(
                tap(() => {
                    // Clear the access token
                    this.accessTokenSubject.next(null);

                    // Set the authenticated flag to false
                    this._authenticated = false;
                }),
                // Return the observable
                switchMap(() => of(true))
            );

        // this.accessTokenSubject.next(null);

        // Set the authenticated flag to false
        // this._authenticated = false;

        // Return the observable
        // return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        return this.checkAuthStatus().pipe(
            switchMap((isAuthenticated) => {
                if (isAuthenticated) {
                    return of(true);
                }
                // Cek token jika tidak terautentikasi
                if (!this.accessToken) {
                    return of(false);
                }

                // Cek tanggal kedaluwarsa token
                if (AuthUtils.isTokenExpired(this.accessToken)) {
                    return of(false);
                }

                // Jika token ada dan belum kedaluwarsa, sign in menggunakan token
                return this.signInUsingToken();
            })
        );
    }

    roleAccess(id, permission) {
        return this._httpClient.get(`${environment.apiUrl}/roles/roleAccess`, {
            params: {
                id: id.toString(),
                permission: permission,
            },
        });
    }
}
