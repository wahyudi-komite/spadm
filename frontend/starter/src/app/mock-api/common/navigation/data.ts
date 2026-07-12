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
        id: 'profile',
        title: 'Profil',
        type: 'basic',
        icon: 'heroicons_outline:user',
        link: '/profile',
    },
    {
        id: 'admin',
        title: 'Admin',
        type: 'basic',
        icon: 'heroicons_outline:shield-check',
        link: '/admin/roles',
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
