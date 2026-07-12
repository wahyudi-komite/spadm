import { NavigationItem } from 'app/core/navigation/navigation.types';

const menu: NavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:queue-list',
        link: '/dashboard',
        meta: { roles: ['admin', 'user', 'supplier'] },
    },
    {
        id: 'scan',
        title: 'Sto Print',
        type: 'basic',
        icon: 'heroicons_outline:qr-code',
        link: '/scan',
        meta: { roles: ['admin'] },
    },
    {
        id: 'scan-vendor',
        title: 'Sto Vendor',
        type: 'basic',
        icon: 'heroicons_outline:qr-code',
        link: '/scan-vendor',
        meta: { roles: ['supplier', 'admin'] },
    },
    {
        id: 'scan-plant',
        title: 'Sto Plant',
        type: 'basic',
        icon: 'heroicons_outline:qr-code',
        link: '/scan-plant',
        meta: { roles: ['user', 'admin'] },
    },
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:cube',
        link: '/example',
        meta: { roles: ['admin', 'user', 'supplier'] },
    },
];
export const defaultNavigation: NavigationItem[] = menu;
export const compactNavigation: NavigationItem[] = menu;
export const futuristicNavigation: NavigationItem[] = menu;
export const horizontalNavigation: NavigationItem[] = menu;
