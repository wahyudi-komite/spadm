import { Routes } from '@angular/router';
import { BazaarLandingComponent } from './landing/landing.component';
import { BazaarOrdersComponent } from './orders/orders.component';
import { BazaarPaymentHistoryComponent } from './payment-history/payment-history.component';

export default [
    {
        path     : '',
        component: BazaarLandingComponent,
    },
    {
        path     : 'orders',
        component: BazaarOrdersComponent,
    },
    {
        path     : 'payments',
        component: BazaarPaymentHistoryComponent,
    },
] as Routes;
