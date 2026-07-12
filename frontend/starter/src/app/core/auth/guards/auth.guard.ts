import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivateChildFn,
    CanActivateFn,
    Router,
} from '@angular/router';
import { of, switchMap } from 'rxjs';
import { UserService } from '../../user/user.service';
import { AuthService } from './../auth.service';

function getLeafRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    while (route.firstChild) {
        route = route.firstChild;
    }
    return route;
}

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router: Router = inject(Router);
    const authService = inject(AuthService);
    const userService = inject(UserService);
    // Check the authentication status

    return inject(AuthService)
        .check()
        .pipe(
            switchMap((authenticated) => {
                // If the user is not authenticated...
                if (!authenticated) {
                    // Redirect to the sign-in page with a redirectUrl param
                    const redirectURL =
                        state.url === '/sign-out'
                            ? ''
                            : `redirectURL=${state.url}`;
                    const urlTree = router.parseUrl(`sign-in?${redirectURL}`);
                    return of(urlTree);
                }

                return userService.user$.pipe(
                    switchMap((user) => {
                        const redirectURL =
                            state.url === '/sign-out'
                                ? ''
                                : `redirectURL=${state.url}`;
                        const urlTree = router.parseUrl(
                            `sign-in?${redirectURL}`
                        );
                        if (!user || user.id === '') {
                            return of(urlTree);
                        }

                        if (
                            route.data['role'] &&
                            (!user.role ||
                                !route.data['role'].includes(user.role.name))
                        ) {
                            return of(urlTree);
                        }
                        return of(true);
                    })
                );
            })
        );
};
