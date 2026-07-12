import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';
import { UserRole } from '../../node/common/user-role';
import { PermissionComponent } from './permission.component';

export default [
    {
        path: '',
        component: PermissionComponent,
        canActivate: [AuthGuard],
        data: { role: [UserRole.Admin] },
    },
] as Routes;
