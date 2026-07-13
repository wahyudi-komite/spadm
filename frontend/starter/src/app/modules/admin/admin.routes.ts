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
  }
] as Routes;
