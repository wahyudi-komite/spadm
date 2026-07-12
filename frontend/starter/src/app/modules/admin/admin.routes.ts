import { Routes } from '@angular/router';

export default [
  {
    path: 'roles',
    loadChildren: () => import('./roles/roles.routes'),
  },
] as Routes;
