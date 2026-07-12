import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';
import { UserRole } from '../../node/common/user-role';
import { RoleComponent } from './role.component';

export default [
    {
        path: '',
        component: RoleComponent,
        canActivate: [AuthGuard],
        data: { role: [UserRole.Admin, UserRole.User] },
    },
] as Routes;
