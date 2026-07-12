import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';
import { UserRole } from '../../node/common/user-role';
import { RejectComponent } from './reject.component';

export default [
    {
        path: '',
        component: RejectComponent,
        canActivate: [AuthGuard],
        data: {
            role: [UserRole.Admin, UserRole.User],
        },
    },
] as Routes;
