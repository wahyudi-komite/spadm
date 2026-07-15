import { NavigationItem } from 'app/core/navigation/navigation.types';

const menu: NavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:home',
        link: '/dashboard',
    },
    {
        id: 'bazaar',
        title: 'Bazar SPADM',
        type: 'basic',
        icon: 'heroicons_outline:shopping-cart',
        link: '/bazaar',
    },
    {
        id: 'orders',
        title: 'Riwayat Pesanan',
        type: 'basic',
        icon: 'heroicons_outline:clipboard-document-list',
        link: '/bazaar/orders',
    },
    {
        id: 'admin',
        title: 'Admin',
        type: 'collapsable',
        icon: 'heroicons_outline:shield-check',
        children: [
            {
                id: 'admin_roles',
                title: 'Role Management',
                type: 'basic',
                link: '/admin/roles'
            },
            {
                id: 'admin_members',
                title: 'Anggota',
                type: 'basic',
                link: '/admin/members'
            },
            {
                id: 'admin_notifications',
                title: 'Notification Monitor',
                type: 'basic',
                link: '/admin/notifications'
            },
            {
                id: 'admin_reports',
                title: 'Laporan',
                type: 'basic',
                link: '/admin/reports'
            },
            {
                id: 'admin_finance',
                title: 'Finance',
                type: 'basic',
                link: '/admin/finance'
            },
            {
                id: 'admin_leadership',
                title: 'Leadership',
                type: 'basic',
                link: '/admin/leadership'
            }
        ]
    },
    {
        id: 'admin_bazaar',
        title: 'Bazar Master',
        type: 'collapsable',
        icon: 'heroicons_outline:calendar',
        children: [
            {
                id: 'admin_bazaar_events',
                title: 'Events',
                type: 'basic',
                link: '/admin/bazaar/events'
            },
            {
                id: 'admin_bazaar_batches',
                title: 'Batches',
                type: 'basic',
                link: '/admin/bazaar/batches'
            },
            {
                id: 'admin_bazaar_products',
                title: 'Products',
                type: 'basic',
                link: '/admin/bazaar/products'
            },
            {
                id: 'admin_bazaar_areas',
                title: 'Area Mapping',
                type: 'basic',
                link: '/admin/bazaar/areas'
            }
        ]
    },
];

export const defaultNavigation: NavigationItem[] = menu;
export const compactNavigation: NavigationItem[] = menu;
export const futuristicNavigation: NavigationItem[] = menu;
export const horizontalNavigation: NavigationItem[] = menu;
