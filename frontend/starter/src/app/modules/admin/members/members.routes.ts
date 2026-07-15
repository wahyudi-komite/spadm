import { Routes } from '@angular/router';
import { AdminMembersComponent } from './members.component';
import { AdminMemberDetailComponent } from './member-detail.component';

export default [
  { path: '', component: AdminMembersComponent },
  { path: ':id', component: AdminMemberDetailComponent },
] as Routes;
