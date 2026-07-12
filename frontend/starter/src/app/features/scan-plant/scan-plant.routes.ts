import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';
import { UserRole } from '../../node/common/user-role';
import { ScanPlantComponent } from './scan-plant.component';

export default [
    {
        path: '',
        component: ScanPlantComponent,
        canActivate: [AuthGuard],
        data: {
            stateAccess: 'scan-plant',
            role: [UserRole.Admin, UserRole.User],
        },
    },
] as Routes;
