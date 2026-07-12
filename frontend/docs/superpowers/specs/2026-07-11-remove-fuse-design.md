# Remove @fuse/ Dependency — Design Spec

## Goal

Remove the proprietary `@fuse/` template dependency entirely, replacing all Fuse components/services with open-source alternatives (PrimeNG, Angular CDK, custom implementations) while keeping the exact same visual layout and behavior.

---

## Architecture

### New file structure

```
src/app/core/
  navigation/
    vertical/
      vertical-navigation.component.ts     ← replaces FuseVerticalNavigationComponent
      vertical-navigation.component.html
      vertical-navigation.service.ts       ← registry + store
    horizontal/
      horizontal-navigation.component.ts   ← replaces FuseHorizontalNavigationComponent
      horizontal-navigation.component.html
    navigation.types.ts                    ← FuseNavigationItem interface (copied)
    navigation.service.ts                  ← navigation$ observable, getFlatNavigation()
  services/
    config.service.ts                      ← replaces FuseConfigService
    media-watcher.service.ts               ← replaces FuseMediaWatcherService (uses CDK BreakpointObserver)
    platform.service.ts                    ← replaces FusePlatformService (uses PLATFORM_ID)
  components/
    loading-bar/
      loading-bar.component.ts             ← replaces fuse-loading-bar (uses p-progressbar)
    fullscreen/
      fullscreen.component.ts              ← replaces fuse-fullscreen (uses native Fullscreen API)
```

### Components removed (no replacement needed)

| Component | Reason |
|-----------|--------|
| `FuseAlertComponent` | Replaced by PrimeNG `p-message` / `p-toast` in auth pages |
| `FuseCardComponent` | Replaced by `<div class="bg-card shadow rounded-2xl">` |
| `FuseDrawerComponent` | Replaced by PrimeNG `p-sidebar` |
| `FuseHighlightComponent` | Not used by any business feature |
| `FuseMasonryComponent` | Not used anywhere |
| `FuseConfirmationService` | Replaced by PrimeNG `p-confirmdialog` |

### Services removed (absorbed or replaced)

| Service | Replacement |
|---------|-------------|
| `FuseNavigationService` | `AppNavigationService` (same API: register/deregister/getComponent, store/get/deleteNavigation, getFlatNavigation) |
| `FuseConfigService` | `ConfigService` (injectable, reads from APP_CONFIG injection token) |
| `FuseMediaWatcherService` | `MediaWatcherService` (uses CDK `BreakpointObserver`) |
| `FusePlatformService` | `PlatformService` (uses Angular `PLATFORM_ID`) |
| `FuseSplashScreenService` | Removed (splash screen is static CSS in index.html) |
| `FuseLoadingService` | Removed (loading state managed per-component) |
| `FuseUtilsService` | Removed (simple utilities inlined where needed) |
| `FuseConfirmationService` | Removed (use PrimeNG p-confirmdialog) |

### Mock API removed entirely

All `app/mock-api/*` files deleted. Auth, navigation, and user data fetched from real backend:

- `AuthService` → calls `POST /auth/sign-in`, `POST /auth/sign-out`, `POST /auth/refresh` via `ApiClient`
- `NavigationService` → calls `GET /navigation` via `ApiClient`
- `UserService` → calls `GET /users/me` via `ApiClient`

---

## Component Specifications

### 1. AppVerticalNavigationComponent

**Purpose:** Replace `FuseVerticalNavigationComponent`. Renders vertical sidebar navigation identical to current Fuse implementation.

**Inputs:**
- `mode: 'over' | 'side'` — over = overlay on small screens, side = static on large screens
- `name: string` — unique name for component registry
- `navigation: FuseNavigationItem[]` — navigation items to render
- `opened: boolean` — initial open state

**Outputs:**
- `openedChange: boolean`

**Public Methods:**
- `toggle()` — toggle opened state
- `open()` — open navigation
- `close()` — close navigation

**Content Projection:**
- Header: `<ng-content select="[appVerticalNavigationContentHeader]">`
- Footer: `<ng-content select="[appVerticalNavigationContentFooter]">`

**Menu Item Rendering:**
- `type: 'group'` → section header
- `type: 'collapsable'` → expandable group with children
- `type: 'basic'` → clickable link with routerLink
- `type: 'divider'` → horizontal line
- `type: 'spacer'` → empty space
- Supports: icon, badge, active detection via Router, tooltip

**CSS:** Copy exact CSS classes from `@fuse/components/navigation/vertical/` — the TailwindCSS classes already handle styling. The visual appearance is determined by the HTML structure + CSS classes, which we replicate exactly.

### 2. AppHorizontalNavigationComponent

**Purpose:** Replace `FuseHorizontalNavigationComponent` for the modern layout.

Same basic structure as vertical but renders horizontally. Only used by `horizontal/modern` layout.

### 3. LoadingBarComponent

Simple component wrapping `<p-progressbar mode="indeterminate" [style]="{height: '3px', position: 'fixed', top: 0, zIndex: 999}">`.

Service to show/hide via `BehaviorSubject<boolean>`.

### 4. FullscreenComponent

Button component using `document.documentElement.requestFullscreen()` / `document.exitFullscreen()`.

Watches `document.fullscreenElement` for state. Same icon toggle as current (heroicons_outline:arrows-pointing-in / arrows-pointing-out).

---

## Layout Component Changes

### ClassyLayoutComponent (vertical/classy)

Current imports to replace:
- `FuseLoadingBarComponent` → `LoadingBarComponent` from `core/components/loading-bar`
- `FuseVerticalNavigationComponent` → `AppVerticalNavigationComponent` from `core/navigation/vertical`
- `FuseFullscreenComponent` → `FullscreenComponent` from `core/components/fullscreen`
- `FuseNavigationService` → `AppNavigationService` from `core/navigation/vertical/vertical-navigation.service`
- `FuseMediaWatcherService` → `MediaWatcherService` from `core/services/media-watcher.service`

Template changes:
- `<fuse-loading-bar>` → `<app-loading-bar>`
- `<fuse-vertical-navigation>` → `<app-vertical-navigation>`
- `fuseVerticalNavigationContentHeader` → `appVerticalNavigationContentHeader`
- `fuseVerticalNavigationContentFooter` → `appVerticalNavigationContentFooter`
- `<fuse-fullscreen>` → `<app-fullscreen>`

### ClassicLayoutComponent (vertical/classic)

Same changes as classy.

### ModernLayoutComponent (horizontal/modern)

- `FuseHorizontalNavigationComponent` → `AppHorizontalNavigationComponent` from `core/navigation/horizontal`
- Same service replacements

### EmptyLayoutComponent (empty)

Minimal changes — only needs `FuseLoadingBarComponent` replacement.

---

## Service API Compatibility

### AppNavigationService

```typescript
class AppNavigationService {
    registerComponent(name: string, component: any): void
    deregisterComponent(name: string): void
    getComponent<T>(name: string): T
    storeNavigation(key: string, navigation: FuseNavigationItem[]): void
    getNavigation(key: string): FuseNavigationItem[]
    deleteNavigation(key: string): void
    getFlatNavigation(navigation: FuseNavigationItem[]): FuseNavigationItem[]
}
```

### ConfigService

```typescript
class ConfigService {
    config: Config  // from APP_CONFIG token
}
```

### MediaWatcherService

```typescript
class MediaWatcherService {
    onMediaChange$: Observable<{ matchingAliases: string[] }>
    // Uses CDK BreakpointObserver internally
}
```

### PlatformService

```typescript
class PlatformService {
    isBrowser: boolean
    // Uses Angular PLATFORM_ID
}
```

---

## Auth Pages Changes

- `FuseAlertComponent` → `p-message` (PrimeNG), use `severity="error"` for errors
- `fuseAnimations` → standard Angular `@angular/animations` with `trigger('fadeIn')` etc
- `FuseValidators` → Angular built-in `Validators` class

---

## Tailwind Config Migration

The following plugins from `@fuse/tailwind/` need to be inlined:
- `plugins/theming.js` — custom TailwindCSS theme colors
- `utils/generate-contrasts.js` — contrast color generation
- `utils/generate-palette.js` — palette generation

Copy these utility files to `tailwind/` at project root and import in `tailwind.config.js`.

---

## Migration Order

1. Create `core/navigation/` (types, vertical component, horizontal component, services)
2. Create `core/services/` (config, media-watcher, platform)
3. Create `core/components/` (loading-bar, fullscreen)
4. Update layout components (classy, classic, modern, empty)
5. Update layout common components (settings, search, etc.)
6. Remove mock API, wire real API to auth/navigation/user
7. Update auth pages (replace FuseAlert, animations, validators)
8. Migrate tailwind config
9. Remove `@fuse/` directory
10. Update `package.json` and `angular.json`
11. Build + verify

---

## Files to Delete

After migration:
- `src/@fuse/` (entire directory, ~145 files)
- `src/app/mock-api/` (entire directory)
- `LICENSE.md` (Fuse Envato license, replace with project license)
- Various Fuse-specific configuration references
