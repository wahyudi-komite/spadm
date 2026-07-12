import { Routes } from '@angular/router';
import { AuthChangePasswordComponent } from './change-password.component';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';

export default [
    {
        path: '',
        canActivate: [AuthGuard],
        component: AuthChangePasswordComponent,
    },
] as Routes;
