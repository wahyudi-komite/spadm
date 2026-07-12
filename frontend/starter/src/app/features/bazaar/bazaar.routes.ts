import { Routes } from '@angular/router';
import { BazaarLandingComponent } from './landing/landing.component';
import { BazaarOrdersComponent } from './orders/orders.component';

export default [
    {
        path     : '',
        component: BazaarLandingComponent,
    },
    {
        path     : 'orders',
        component: BazaarOrdersComponent,
    },
] as Routes;
