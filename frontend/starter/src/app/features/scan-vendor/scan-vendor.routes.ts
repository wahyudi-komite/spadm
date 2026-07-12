import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';
import { UserRole } from '../../node/common/user-role';
import { ScanVendorComponent } from './scan-vendor.component';

export default [
    {
        path: '',
        component: ScanVendorComponent,
        canActivate: [AuthGuard],
        data: {
            stateAccess: 'scan-vendor',
            role: [UserRole.Admin, UserRole.Supplier],
        },
    },
] as Routes;
