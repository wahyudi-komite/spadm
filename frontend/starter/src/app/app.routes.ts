import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

export const appRoutes: Route[] = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

    {
        path: 'signed-in-redirect',
        pathMatch: 'full',
        redirectTo: 'dashboard',
    },

    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            {
                path: 'confirmation-required',
                loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes'),
            },
            {
                path: 'forgot-password',
                loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes'),
            },
            {
                path: 'reset-password',
                loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes'),
            },
            {
                path: 'sign-in',
                loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes'),
            },
            {
                path: 'sign-up',
                loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes'),
            },
        ],
    },

    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            {
                path: 'sign-out',
                loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes'),
            },
            {
                path: 'unlock-session',
                loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes'),
            },
            {
                path: 'change-password',
                loadChildren: () => import('app/modules/auth/change-password/change-password.routes'),
            },
        ],
    },

    {
        path: '',
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            {
                path: 'home',
                loadChildren: () => import('app/modules/landing/home/home.routes'),
            },
        ],
    },

    {
        path: '',
        component: LayoutComponent,
        data: { layout: 'modern' },
        resolve: { initialData: initialDataResolver },
        children: [
            {
                path: 'dashboard',
                loadChildren: () => import('app/features/dashboard/dashboard.routes'),
            },
            {
                path: 'admin',
                loadChildren: () => import('app/modules/admin/admin.routes'),
            },
        ],
    },
];
