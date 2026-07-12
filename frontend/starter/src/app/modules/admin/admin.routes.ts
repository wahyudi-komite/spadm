import { Routes } from '@angular/router';

export default [
  {
    path: 'roles',
    loadChildren: () => import('./roles/roles.routes'),
  },
  {
    path: 'users/:id/roles',
    loadChildren: () => import('./users/user-roles.routes'),
  },
  {
    path: 'bazaar/events',
    loadChildren: () => import('./bazaar/events/events.routes'),
  },
  {
    path: 'bazaar/batches',
    loadChildren: () => import('./bazaar/batches/batches.routes'),
  },
  {
    path: 'bazaar/products',
    loadChildren: () => import('./bazaar/products/products.routes'),
  },
  {
    path: 'bazaar/areas',
    loadChildren: () => import('./bazaar/areas/areas.routes'),
  },
] as Routes;
