import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./list/list.component').then(m => m.ExampleListComponent),
    },
    {
        path: ':id',
        loadComponent: () => import('./detail/detail.component').then(m => m.ExampleDetailComponent),
    },
] as Routes;
