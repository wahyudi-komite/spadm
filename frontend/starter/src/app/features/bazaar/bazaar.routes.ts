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
        path: 'orders/:id/payment',
        loadComponent: () => import('./payment/payment.component').then(component => component.BazaarPaymentComponent),
    },
    {
        path     : 'payments',
        component: BazaarPaymentHistoryComponent,
    },
] as Routes;
