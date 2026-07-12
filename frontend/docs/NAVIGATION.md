# Navigation System

## FuseNavigationItem Interface

Defined in `@fuse/components/navigation/navigation.types.ts`:

```ts
interface FuseNavigationItem {
    id?: string;
    title?: string;
    subtitle?: string;
    type: 'aside' | 'basic' | 'collapsable' | 'divider' | 'group' | 'spacer';
    hidden?: (item: FuseNavigationItem) => boolean;
    active?: boolean;
    disabled?: boolean;
    tooltip?: string;
    link?: string;
    fragment?: string;
    preserveFragment?: boolean;
    queryParams?: Params | null;
    queryParamsHandling?: QueryParamsHandling | null;
    externalLink?: boolean;
    target?: string;
    exactMatch?: boolean;
    isActiveMatchOptions?: IsActiveMatchOptions;
    function?: (item: FuseNavigationItem) => void;
    classes?: { title?: string; subtitle?: string; icon?: string; wrapper?: string };
    icon?: string;
    badge?: { title?: string; classes?: string };
    children?: FuseNavigationItem[];
    meta?: any;
}
```

## Navigation Types

| Type         | Behavior                                  |
|--------------|-------------------------------------------|
| `basic`      | Single clickable link, renders as a menu item |
| `group`      | Section header with children              |
| `collapsable`| Expandable group, toggles children visibility |
| `divider`    | Visual separator line                     |
| `spacer`     | Empty space for layout                    |
| `aside`      | Side content with children                |

## Navigation Data Structure

Defined in `mock-api/common/navigation/data.ts`. The navigation is exported as four layout variants — `defaultNavigation`, `compactNavigation`, `futuristicNavigation`, `horizontalNavigation` — all typically pointing to the same array:

```ts
const menu: FuseNavigationItem[] = [
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
];

export const defaultNavigation: FuseNavigationItem[] = menu;
export const compactNavigation: FuseNavigationItem[] = menu;
export const futuristicNavigation: FuseNavigationItem[] = menu;
export const horizontalNavigation: FuseNavigationItem[] = menu;
```

The `Navigation` type (`core/navigation/navigation.types.ts`) maps these layouts:

```ts
interface Navigation {
    compact: FuseNavigationItem[];
    default: FuseNavigationItem[];
    futuristic: FuseNavigationItem[];
    horizontal: FuseNavigationItem[];
}
```

## NavigationService

Located in `core/navigation/navigation.service.ts`. Loads navigation from the mock API and filters by user role:

```ts
@Injectable({ providedIn: 'root' })
export class NavigationService {
    get(): Observable<Navigation> {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            switchMap((navigation) =>
                this._userService.user$.pipe(
                    take(1),
                    map((user: User) => {
                        const filteredNavigation = { ...navigation };
                        Object.keys(filteredNavigation).forEach((layout) => {
                            filteredNavigation[layout] = filteredNavigation[layout]
                                .filter((item) => item.meta?.roles?.includes(user?.role?.name));
                        });
                        return filteredNavigation;
                    })
                )
            )
        );
    }
}
```

## Role-Based Filtering

Each navigation item may include `meta.roles` — an array of role names. Items whose `meta.roles` does not include the current user's role are filtered out at load time. If `meta.roles` is absent or `meta` is undefined, the item is excluded.

## How to Add Navigation Items

1. Open `mock-api/common/navigation/data.ts`
2. Add a new object to the `menu` array with `id`, `title`, `type`, `icon`, `link`, and `meta.roles`
3. Create the corresponding route module (lazy-loaded) in `features/` or `modules/`
4. Register the route in the appropriate routes file (e.g. `modules/pages/pages.routes.ts`)

For a collapsable group with children:

```ts
{
    id: 'settings',
    title: 'Settings',
    type: 'collapsable',
    icon: 'heroicons_outline:cog-6-tooth',
    children: [
        {
            id: 'settings-profile',
            title: 'Profile',
            type: 'basic',
            link: '/settings/profile',
        },
    ],
    meta: { roles: ['admin'] },
}
```

## FuseNavigationService

The lower-level `FuseNavigationService` (in `@fuse/components/navigation/`) manages component registration and a navigation item store. It provides utility methods:

- `getFlatNavigation()` – flattens a nested navigation tree (only `basic` items)
- `getItem(id)` – finds an item by ID recursively
- `getItemParent(id)` – finds the parent of an item
- `storeNavigation(key)` – stores a navigation array in memory
- `getNavigation(key)` – retrieves a stored navigation array
