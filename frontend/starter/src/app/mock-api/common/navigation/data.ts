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
];

export const defaultNavigation: NavigationItem[] = menu;
export const compactNavigation: NavigationItem[] = menu;
export const futuristicNavigation: NavigationItem[] = menu;
export const horizontalNavigation: NavigationItem[] = menu;
