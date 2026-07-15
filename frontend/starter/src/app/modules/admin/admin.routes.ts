import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';

export default [
  {
    path: 'roles',
    canActivate: [PermissionGuard],
    data: { permissions: ['role.read'] },
    loadChildren: () => import('./roles/roles.routes'),
  },
  {
    path: 'members',
    canActivate: [PermissionGuard],
    data: { permissions: ['member.read'] },
    loadChildren: () => import('./members/members.routes'),
  },
  {
    path: 'users/:id/roles',
    canActivate: [PermissionGuard],
    data: { permissions: ['role.assign'] },
    loadChildren: () => import('./users/user-roles.routes'),
  },
  {
    path: 'bazaar/events',
    canActivate: [PermissionGuard],
    data: { permissions: ['bazaar.event.read'] },
    loadChildren: () => import('./bazaar/events/events.routes'),
  },
  {
    path: 'bazaar/batches',
    canActivate: [PermissionGuard],
    data: { permissions: ['bazaar.batch.read'] },
    loadChildren: () => import('./bazaar/batches/batches.routes'),
  },
  {
    path: 'bazaar/products',
    canActivate: [PermissionGuard],
    data: { permissions: ['bazaar.product.read'] },
    loadChildren: () => import('./bazaar/products/products.routes'),
  },
  {
    path: 'bazaar/areas',
    canActivate: [PermissionGuard],
    data: { permissions: ['bazaar.distribution.read'] },
    loadChildren: () => import('./bazaar/areas/areas.routes'),
  },
  {
    path: 'bazaar/distribution',
    canActivate: [PermissionGuard],
    data: { permissions: ['bazaar.distribution.scan'] },
    loadComponent: () => import('./bazaar/distribution/distribution.component').then(m => m.AdminBazaarDistributionComponent)
  },
  {
    path: 'notifications',
    canActivate: [PermissionGuard],
    data: { permissions: ['settings.manage'] },
    loadComponent: () => import('./notifications/notifications-monitor.component').then(m => m.NotificationsMonitorComponent),
  },
  {
    path: 'finance',
    canActivate: [PermissionGuard],
    data: { permissions: ['finance.dashboard.read'] },
    loadChildren: () => import('../../features/finance/finance.routes'),
  },
  {
    path: 'reports',
    canActivate: [PermissionGuard],
    data: { permissions: ['bazaar.report.read'] },
    loadChildren: () => import('../../features/reports/reports.routes'),
  },
  {
    path: 'leadership',
    canActivate: [PermissionGuard],
    data: { permissions: ['finance.dashboard.read'] },
    loadChildren: () => import('../../features/leadership/leadership.routes'),
  },
] as Routes;
