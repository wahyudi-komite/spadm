# Theme System

## FuseConfig Interface

Defined in `@fuse/services/config/config.types.ts`:

```ts
type Scheme = 'auto' | 'dark' | 'light';
type Theme = 'theme-default' | string;
type Themes = { id: string; name: string }[];

interface FuseConfig {
    layout: string;
    scheme: Scheme;
    screens: { [key: string]: string };
    theme: Theme;
    themes: Themes;
}
```

## Default Configuration

Set in `app.config.ts` via `provideFuse()`:

```ts
provideFuse({
    mockApi: { delay: 0, services: mockApiServices },
    fuse: {
        layout: 'classy',
        scheme: 'auto',
        screens: {
            sm: '600px', md: '960px', lg: '1280px', xl: '1440px',
        },
        theme: 'theme-brand',
        themes: [
            { id: 'theme-default', name: 'Default' },
            { id: 'theme-brand',   name: 'Brand' },
            { id: 'theme-teal',    name: 'Teal' },
            { id: 'theme-rose',    name: 'Rose' },
            { id: 'theme-purple',  name: 'Purple' },
            { id: 'theme-amber',   name: 'Amber' },
        ],
    },
})
```

## Available Layouts

| Layout    | Type       | Description                    |
|-----------|------------|--------------------------------|
| `empty`   | no nav     | Full-screen (auth pages, etc.) |
| `modern`  | horizontal | Top navigation bar             |
| `classic` | vertical   | Sidebar navigation             |
| `classy`  | vertical   | Sidebar with header            |

Layouts are resolved in `layout.component.ts` — selectable via:
1. The default `config.layout`
2. A `?layout=` query parameter
3. Route `data.layout` (takes highest priority)

## Per-Route Layout Override

Set `data.layout` in route config:

```ts
{
    path: 'sign-in',
    component: LayoutComponent,
    data: { layout: 'empty' },
    children: [...]
}
```

The `LayoutComponent` walks the matched route tree (`pathFromRoot`) and picks the last `data.layout` found.

## Scheme & Theme Application

The `LayoutComponent` subscribes to `FuseConfigService.config$` and applies theme classes to `<body>`:

- **Scheme**: adds `light` or `dark` class to `document.body`
- **Theme**: adds the theme ID (e.g. `theme-brand`) as a class

When `scheme: 'auto'` is set, the system respects `prefers-color-scheme` media query.

## Changing Theme Programmatically

Inject `FuseConfigService` and call `config`:

```ts
import { FuseConfigService } from '@fuse/services/config';

private _fuseConfigService = inject(FuseConfigService);

this._fuseConfigService.config = {
    layout: 'classy',
    scheme: 'dark',
    theme: 'theme-teal',
};
```

The `FuseConfigService` is a singleton that emits new config values via its `config$` observable. Layout and theme changes take effect immediately via the subscription in `LayoutComponent`.
