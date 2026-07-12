import { Routes } from '@angular/router';
import { UserRole } from '../../node/common/user-role';
import { ProfileComponent } from './profile.component';

export default [
    {
        path: '',
        component: ProfileComponent,
        data: {
            role: [UserRole.Admin, UserRole.User, UserRole.Supplier],
        },
    },
] as Routes;
