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
] as Routes;
