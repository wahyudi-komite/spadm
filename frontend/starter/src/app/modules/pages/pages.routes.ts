import { Routes } from '@angular/router';

export default [
    {
        path: 'dashboard',
        loadChildren: () => import('../../features/employee-kaos/employee-kaos.routes'),
    },
    {
        path: 'merchandise-print',
        loadChildren: () => import('../../features/employee-kaos/dialog-ek/dialog-ek.routes'),
    },
    {
        path: 'scan',
        loadChildren: () => import('../../features/scan-data/scan-data.routes'),
    },
    {
        path: 'scan-plant',
        loadChildren: () => import('../../features/scan-plant/scan-plant.routes'),
    },
    {
        path: 'scan-vendor',
        loadChildren: () => import('../../features/scan-vendor/scan-vendor.routes'),
    },
    {
        path: 'reject',
        loadChildren: () => import('../../features/reject/reject.routes'),
    },

    // admin routes
    {
        path: 'role',
        loadChildren: () => import('../../features/roles/role.routes'),
    },
    {
        path: 'permission',
        loadChildren: () => import('../../features/permissions/permission.routes'),
    },
    {
        path: 'profile',
        loadChildren: () => import('../../features/profile/profile.routes'),
    },
] as Routes;
