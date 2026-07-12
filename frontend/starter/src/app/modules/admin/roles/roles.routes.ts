import { Routes } from '@angular/router';
import { AdminRolesComponent } from './roles.component';
import { AdminRoleDetailComponent } from './role-detail.component';

export default [
  { path: '', component: AdminRolesComponent },
  { path: ':id', component: AdminRoleDetailComponent },
] as Routes;
