# Remove @fuse/ Dependency — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the proprietary `@fuse/` template by replacing all its components/services with in-house + open-source equivalents, keeping exact same visual layout.

**Architecture:** Replace 145 files across navigation, services, and components with ~20 focused files. Navigation is the biggest piece — vertical sidebar with collapsable items, horizontal toolbar with Material menus. Services use CDK/PlatformId instead of Fuse. Mock API replaced with real backend calls.

**Tech Stack:** Angular 19.2, PrimeNG 20, Angular Material 18, CDK BreakpointObserver, TailwindCSS 3.4

**Global Constraints:**
- Visual layout must be identical to current (same HTML structure, CSS classes)
- Only implement `default` appearance for vertical navigation (compact/dense/thin unused)
- Only implement basic/collapsable/group/divider/spacer item types (aside unused)
- All `@fuse/*` imports must be replaced before removing the directory
- Build must pass after each task

---

## File Map

### Files to Create

| File | Purpose |
|------|---------|
| `src/app/core/navigation/navigation.types.ts` | FuseNavigationItem interface (copied from @fuse) |
| `src/app/core/navigation/navigation.service.ts` | Component registry + navigation store |
| `src/app/core/navigation/vertical/vertical-navigation.service.ts` | Vertical nav component class (registry name, opened state, aside) |
| `src/app/core/navigation/vertical/vertical-navigation.component.ts` | Main vertical navigation component |
| `src/app/core/navigation/vertical/vertical-navigation.component.html` | Template |
| `src/app/core/navigation/vertical/components/basic/basic.component.ts` | Basic nav item |
| `src/app/core/navigation/vertical/components/basic/basic.component.html` | Basic item template |
| `src/app/core/navigation/vertical/components/collapsable/collapsable.component.ts` | Collapsable nav item |
| `src/app/core/navigation/vertical/components/collapsable/collapsable.component.html` | Collapsable template |
| `src/app/core/navigation/vertical/components/group/group.component.ts` | Group nav item |
| `src/app/core/navigation/vertical/components/group/group.component.html` | Group template |
| `src/app/core/navigation/vertical/components/divider/divider.component.ts` | Divider nav item |
| `src/app/core/navigation/vertical/components/divider/divider.component.html` | Divider template |
| `src/app/core/navigation/vertical/components/spacer/spacer.component.ts` | Spacer nav item |
| `src/app/core/navigation/vertical/components/spacer/spacer.component.html` | Spacer template |
| `src/app/core/navigation/horizontal/horizontal-navigation.component.ts` | Main horizontal navigation |
| `src/app/core/navigation/horizontal/horizontal-navigation.component.html` | Horizontal template |
| `src/app/core/navigation/horizontal/components/basic/basic.component.ts` | Horizontal basic item |
| `src/app/core/navigation/horizontal/components/basic/basic.component.html` | Horizontal basic template |
| `src/app/core/navigation/horizontal/components/branch/branch.component.ts` | Horizontal branch (MatMenu) |
| `src/app/core/navigation/horizontal/components/branch/branch.component.html` | Branch template |
| `src/app/core/navigation/horizontal/components/divider/divider.component.ts` | Horizontal divider |
| `src/app/core/navigation/horizontal/components/divider/divider.component.html` | Divider template |
| `src/app/core/navigation/horizontal/components/spacer/spacer.component.ts` | Horizontal spacer |
| `src/app/core/navigation/horizontal/components/spacer/spacer.component.html` | Spacer template |
| `src/app/core/services/config.service.ts` | ConfigService (replaces FuseConfigService) |
| `src/app/core/services/media-watcher.service.ts` | MediaWatcherService (replaces FuseMediaWatcherService) |
| `src/app/core/services/platform.service.ts` | PlatformService (replaces FusePlatformService) |
| `src/app/core/components/loading-bar/loading-bar.component.ts` | Loading bar (p-progressbar) |
| `src/app/core/components/fullscreen/fullscreen.component.ts` | Fullscreen toggle |
| `src/app/core/components/fullscreen/fullscreen.component.html` | Fullscreen template |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/layout/layouts/vertical/classy/classy.component.ts` | Replace Fuse imports with core imports |
| `src/app/layout/layouts/vertical/classy/classy.component.html` | Replace fuse-* tags with app-* tags |
| `src/app/layout/layouts/vertical/classic/classic.component.ts` | Same |
| `src/app/layout/layouts/vertical/classic/classic.component.html` | Same |
| `src/app/layout/layouts/horizontal/modern/modern.component.ts` | Same |
| `src/app/layout/layouts/horizontal/modern/modern.component.html` | Same |
| `src/app/layout/layouts/empty/empty.component.ts` | Same |
| `src/app/layout/layouts/empty/empty.component.html` | Same |
| `src/app/layout/common/settings/settings.component.ts` | Replace FuseDrawer |
| `src/app/app.config.ts` | Remove provideFuse(), add core providers |
| `src/app/core/core.providers.ts` | Add new service providers |
| `tailwind.config.js` | Inline @fuse/tailwind plugins |
| `package.json` | Remove Fuse-specific? |

### Files to Delete

| Path | Reason |
|------|--------|
| `src/@fuse/` | Entire proprietary framework |
| `src/app/mock-api/` | No longer needed (real API) |
| `src/app/core/user/user.service.ts` | Duplicate (moved to core/services/) |
| `src/app/core/user/user.types.ts` | Duplicate (moved) |

---

## Tasks

### Task 1: Navigation Types + Core Service

**Files:**
- Create: `src/app/core/navigation/navigation.types.ts`
- Create: `src/app/core/navigation/navigation.service.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `FuseNavigationItem` type (renamed to `NavigationItem`), `AppNavigationService` class

**Step 1: Create navigation.types.ts**

Copy `FuseNavigationItem` interface from `@fuse/components/navigation/navigation.types.ts` into `src/app/core/navigation/navigation.types.ts`. Remove the `aside` type from the `type` union since we won't implement it. Keep the rest exactly the same for backward compatibility with navigation data.

```typescript
import { IsActiveMatchOptions, Params, QueryParamsHandling } from '@angular/router';

export interface NavigationItem {
    id?: string;
    title?: string;
    subtitle?: string;
    type: 'basic' | 'collapsable' | 'divider' | 'group' | 'spacer';
    hidden?: (item: NavigationItem) => boolean;
    active?: boolean;
    disabled?: boolean;
    tooltip?: string;
    link?: string;
    fragment?: string;
    preserveFragment?: boolean;
    queryParams?: Params | null;
    queryParamsHandling?: QueryParamsHandling | null;
    externalLink?: boolean;
    target?: '_blank' | '_self' | '_parent' | '_top' | string;
    exactMatch?: boolean;
    isActiveMatchOptions?: IsActiveMatchOptions;
    function?: (item: NavigationItem) => void;
    classes?: { title?: string; subtitle?: string; icon?: string; wrapper?: string };
    icon?: string;
    badge?: { title?: string; classes?: string };
    children?: NavigationItem[];
    meta?: any;
}

export type VerticalNavigationMode = 'over' | 'side';
export type VerticalNavigationPosition = 'left' | 'right';
```

**Step 2: Create navigation.service.ts**

```typescript
import { Injectable } from '@angular/core';
import { NavigationItem } from './navigation.types';

@Injectable({ providedIn: 'root' })
export class AppNavigationService {
    private _componentRegistry = new Map<string, any>();
    private _navigationStore = new Map<string, NavigationItem[]>();

    registerComponent(name: string, component: any): void {
        this._componentRegistry.set(name, component);
    }

    deregisterComponent(name: string): void {
        this._componentRegistry.delete(name);
    }

    getComponent<T>(name: string): T {
        return this._componentRegistry.get(name) as T;
    }

    storeNavigation(key: string, navigation: NavigationItem[]): void {
        this._navigationStore.set(key, navigation);
    }

    getNavigation(key: string): NavigationItem[] {
        return this._navigationStore.get(key) ?? [];
    }

    deleteNavigation(key: string): void {
        if (!this._navigationStore.has(key)) {
            console.warn(`Navigation not found: ${key}`);
        }
        this._navigationStore.delete(key);
    }

    getFlatNavigation(navigation: NavigationItem[], flatNavigation: NavigationItem[] = []): NavigationItem[] {
        for (const item of navigation) {
            if (item.type === 'basic') {
                flatNavigation.push(item);
            }
            if (item.type === 'collapsable' || item.type === 'group') {
                if (item.children?.length) {
                    this.getFlatNavigation(item.children, flatNavigation);
                }
            }
        }
        return flatNavigation;
    }

    getItem(id: string, navigation: NavigationItem[]): NavigationItem | null {
        for (const item of navigation) {
            if (item.id === id) return item;
            if (item.children?.length) {
                const found = this.getItem(id, item.children);
                if (found) return found;
            }
        }
        return null;
    }
}
```

**Step 3: Build**

```bash
npm run build
```

Expected: no errors. (Nothing imports the new files yet.)

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add NavigationItem type and AppNavigationService"
```

---

### Task 2: Core Services (Config, MediaWatcher, Platform)

**Files:**
- Create: `src/app/core/services/config.service.ts`
- Create: `src/app/core/services/media-watcher.service.ts`
- Create: `src/app/core/services/platform.service.ts`

**Interfaces:**
- Consumes: `NavigationItem` (not directly)
- Produces: `ConfigService`, `MediaWatcherService`, `PlatformService`

**Step 1: Create config.service.ts**

```typescript
import { Injectable, Inject } from '@angular/core';
import { APP_ENVIRONMENT, AppEnvironment } from '../config/app-config.types';

@Injectable({ providedIn: 'root' })
export class ConfigService {
    constructor(@Inject(APP_ENVIRONMENT) public config: AppEnvironment) {}
}
```

**Step 2: Create media-watcher.service.ts**

```typescript
import { Injectable } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MediaWatcherService {
    constructor(private _breakpointObserver: BreakpointObserver) {}

    onMediaChange$(query: string | string[]): Observable<string[]> {
        return this._breakpointObserver.observe(query).pipe(
            map((state: BreakpointState) => {
                const matchingAliases: string[] = [];
                if (state.breakpoints) {
                    for (const [key, value] of Object.entries(state.breakpoints)) {
                        if (value) matchingAliases.push(key);
                    }
                }
                return matchingAliases;
            })
        );
    }

    isActive(query: string): boolean {
        return this._breakpointObserver.isMatched(query);
    }
}
```

**Step 3: Create platform.service.ts**

```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class PlatformService {
    isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }
}
```

**Step 4: Create core/components/loading-bar/loading-bar.component.ts**

```typescript
import { Component } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
    selector: 'app-loading-bar',
    standalone: true,
    imports: [ProgressBarModule],
    template: `<p-progressbar mode="indeterminate" [style]="{ height: '3px', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 999 }"></p-progressbar>`,
})
export class LoadingBarComponent {}
```

**Step 5: Create core/components/fullscreen/fullscreen.component.ts**

```typescript
import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-fullscreen',
    standalone: true,
    imports: [MatIconModule, MatButtonModule],
    template: `
        <button mat-icon-button (click)="toggle()">
            <mat-icon [svgIcon]="isFullscreen() ? 'heroicons_outline:arrows-pointing-in' : 'heroicons_outline:arrows-pointing-out'"></mat-icon>
        </button>
    `,
})
export class FullscreenComponent {
    isFullscreen = signal(false);

    constructor() {
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen.set(!!document.fullscreenElement);
        });
    }

    toggle(): void {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }
}
```

**Step 6: Build**

```bash
npm run build
```

Expected: no errors.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add core services and UI components (config, media-watcher, platform, loading-bar, fullscreen)"
```

---

### Task 3: Vertical Navigation Item Components

**Files:**
- Create: `src/app/core/navigation/vertical/components/basic/basic.component.ts`
- Create: `src/app/core/navigation/vertical/components/basic/basic.component.html`
- Create: `src/app/core/navigation/vertical/components/collapsable/collapsable.component.ts`
- Create: `src/app/core/navigation/vertical/components/collapsable/collapsable.component.html`
- Create: `src/app/core/navigation/vertical/components/group/group.component.ts`
- Create: `src/app/core/navigation/vertical/components/group/group.component.html`
- Create: `src/app/core/navigation/vertical/components/divider/divider.component.ts`
- Create: `src/app/core/navigation/vertical/components/divider/divider.component.html`
- Create: `src/app/core/navigation/vertical/components/spacer/spacer.component.ts`
- Create: `src/app/core/navigation/vertical/components/spacer/spacer.component.html`

**Interfaces:**
- Consumes: `NavigationItem` from `core/navigation/navigation.types`
- Produces: 5 standalone item components for the vertical nav

Each item component follows the same pattern:
- `@Input({ required: true }) item: NavigationItem`
- `@Input({ required: true }) name: string` (parent component registry name)
- standalone: true
- ViewEncapsulation.None

**Basic item** (`basic.component.ts`):

```typescript
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { NavigationItem } from '../../../navigation.types';

@Component({
    selector: 'app-vertical-nav-basic-item',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, MatIconModule, NgClass],
    encapsulation: ViewEncapsulation.None,
    template: `
        @if (!item.hidden || !item.hidden(item)) {
            <div class="fuse-vertical-navigation-item-wrapper" [ngClass]="item.classes?.wrapper">
                @if (item.link && !item.externalLink) {
                    <a class="fuse-vertical-navigation-item"
                       [routerLink]="[item.link]"
                       routerLinkActive="fuse-vertical-navigation-item-active"
                       [routerLinkActiveOptions]="{ exact: item.exactMatch ?? false }"
                       [attr.disabled]="item.disabled || null"
                       [attr.target]="item.target"
                       (click)="item.function ? item.function(item) : null">
                        <ng-container *ngTemplateOutlet="itemTemplate"></ng-container>
                    </a>
                }
                @if (item.externalLink) {
                    <a class="fuse-vertical-navigation-item"
                       [href]="item.link"
                       [attr.target]="item.target || '_blank'"
                       [attr.disabled]="item.disabled || null"
                       (click)="item.function ? item.function(item) : null">
                        <ng-container *ngTemplateOutlet="itemTemplate"></ng-container>
                    </a>
                }
                @if (!item.link && !item.externalLink) {
                    <div class="fuse-vertical-navigation-item"
                         [class.fuse-vertical-navigation-item-disabled]="item.disabled"
                         (click)="item.function ? item.function(item) : null">
                        <ng-container *ngTemplateOutlet="itemTemplate"></ng-container>
                    </div>
                }
            </div>
        }

        <ng-template #itemTemplate>
            @if (item.icon) {
                <mat-icon class="fuse-vertical-navigation-item-icon"
                          [svgIcon]="item.icon"></mat-icon>
            }
            @if (item.title) {
                <span class="fuse-vertical-navigation-item-title-wrapper">
                    <span class="fuse-vertical-navigation-item-title">
                        {{ item.title }}
                    </span>
                    @if (item.subtitle) {
                        <span class="fuse-vertical-navigation-item-subtitle">
                            {{ item.subtitle }}
                        </span>
                    }
                </span>
            }
            @if (item.badge) {
                <div class="fuse-vertical-navigation-item-badge">
                    <div class="fuse-vertical-navigation-item-badge-content"
                         [ngClass]="item.badge.classes">
                        {{ item.badge.title }}
                    </div>
                </div>
            }
        </ng-template>
    `,
})
export class AppVerticalNavBasicItemComponent {
    @Input({ required: true }) item!: NavigationItem;
    @Input({ required: true }) name!: string;
}
```

**Collapsable item** key behavior:
```typescript
import { Component, inject, Input, signal, ViewEncapsulation, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-vertical-nav-collapsable-item',
    standalone: true,
    imports: [RouterLink, MatIconModule, NgClass, AppVerticalNavBasicItemComponent, AppVerticalNavCollapsableItemComponent, AppVerticalNavGroupItemComponent, AppVerticalNavDividerItemComponent, AppVerticalNavSpacerItemComponent],
    encapsulation: ViewEncapsulation.None,
    template: `
        @if (!item.hidden || !item.hidden(item)) {
            <div class="fuse-vertical-navigation-item-wrapper" [ngClass]="item.classes?.wrapper">
                <div class="fuse-vertical-navigation-item"
                     [class.fuse-vertical-navigation-item-disabled]="item.disabled"
                     (click)="toggle()">
                    @if (item.icon) {
                        <mat-icon class="fuse-vertical-navigation-item-icon" [svgIcon]="item.icon"></mat-icon>
                    }
                    @if (item.title) {
                        <span class="fuse-vertical-navigation-item-title-wrapper">
                            <span class="fuse-vertical-navigation-item-title">{{ item.title }}</span>
                            @if (item.subtitle) {
                                <span class="fuse-vertical-navigation-item-subtitle">{{ item.subtitle }}</span>
                            }
                        </span>
                    }
                    @if (item.badge) {
                        <div class="fuse-vertical-navigation-item-badge">
                            <div class="fuse-vertical-navigation-item-badge-content" [ngClass]="item.badge.classes">{{ item.badge.title }}</div>
                        </div>
                    }
                    <mat-icon class="fuse-vertical-navigation-item-arrow-icon"
                              [svgIcon]="'heroicons_solid:chevron-right'"></mat-icon>
                </div>
            </div>
            @if (isExpanded() && item.children?.length) {
                <div class="fuse-vertical-navigation-item-children">
                    @for (child of item.children; track child.id || $index) {
                        @switch (child.type) {
                            @case ('basic') {
                                <app-vertical-nav-basic-item [item]="child" [name]="name" />
                            }
                            @case ('collapsable') {
                                <app-vertical-nav-collapsable-item [item]="child" [name]="name" />
                            }
                            @case ('group') {
                                <app-vertical-nav-group-item [item]="child" [name]="name" />
                            }
                            @case ('divider') {
                                <app-vertical-nav-divider-item [item]="child" [name]="name" />
                            }
                            @case ('spacer') {
                                <app-vertical-nav-spacer-item [item]="child" [name]="name" />
                            }
                        }
                    }
                </div>
            }
        }
    `,
    host: {
        '[class.fuse-vertical-navigation-item-collapsed]': '!isExpanded()',
        '[class.fuse-vertical-navigation-item-expanded]': 'isExpanded()',
    },
})
export class AppVerticalNavCollapsableItemComponent {
    private _router = inject(Router);
    isExpanded = signal(false);
    @Input({ required: true }) item!: NavigationItem;
    @Input({ required: true }) name!: string;
    @Input() autoCollapse = true;

    constructor() {
        effect(() => {
            // Check on creation if any child is active
            if (this._hasActiveChild(this.item, this._router.url)) {
                this.isExpanded.set(true);
            }
        });
    }

    toggle(): void {
        this.isExpanded.update(v => !v);
    }

    private _hasActiveChild(item: NavigationItem, currentUrl: string): boolean {
        for (const child of item.children ?? []) {
            if (child.link && this._router.isActive(child.link, child.exactMatch ?? false)) {
                return true;
            }
            if (child.children?.length && this._hasActiveChild(child, currentUrl)) {
                return true;
            }
        }
        return false;
    }
}
```

**Group item** — renders a group header + children (similar to collapsable but always expanded, no toggle).

**Divider item** — renders `<div class="fuse-vertical-navigation-item-wrapper divider"><\/div>`.

**Spacer item** — renders `<div class="fuse-vertical-navigation-item-wrapper"><\/div>` with vertical margin.

All host classes: `{ '[class.fuse-vertical-navigation-item-active]': '...' }` pattern as needed.

Build after creating all 10 files.

```bash
npm run build
```

---

### Task 4: Vertical Navigation Main Component

**Files:**
- Create: `src/app/core/navigation/vertical/vertical-navigation.component.ts`
- Create: `src/app/core/navigation/vertical/vertical-navigation.component.html`

This is the main `<app-vertical-navigation>` component that wraps all item components.

Key features:
- Inputs: `appearance` (default only), `mode` (over/side), `name`, `navigation: NavigationItem[]`, `opened`, `position` (left/right)
- Outputs: `openedChanged`
- Public methods: `open()`, `close()`, `toggle()`, `refresh()`
- On init: registers with `AppNavigationService`
- On destroy: deregisters
- Template: follows the exact same structure as Fuse's vertical.component.html
- Content projection slots: header, contentHeader, contentFooter, footer
- Overlay for `mode: 'over'`
- Host classes: dynamic based on mode/opened state

Build after creating.

---

### Task 5: Horizontal Navigation Component

**Files:**
- Create: `src/app/core/navigation/horizontal/horizontal-navigation.component.ts`
- Create: `src/app/core/navigation/horizontal/horizontal-navigation.component.html`
- Create: `src/app/core/navigation/horizontal/components/basic/basic.component.ts`
- Create: `src/app/core/navigation/horizontal/components/basic/basic.component.html`
- Create: `src/app/core/navigation/horizontal/components/branch/branch.component.ts`
- Create: `src/app/core/navigation/horizontal/components/branch/branch.component.html`
- Create: `src/app/core/navigation/horizontal/components/divider/divider.component.ts`
- Create: `src/app/core/navigation/horizontal/components/divider/divider.component.html`
- Create: `src/app/core/navigation/horizontal/components/spacer/spacer.component.ts`
- Create: `src/app/core/navigation/horizontal/components/spacer/spacer.component.html`

Horizontal nav uses Angular Material's MatMenu for dropdown menus (branch items).

The main component template:
```html
<div class="fuse-horizontal-navigation-wrapper">
    @for (item of navigation; track item.id || $index) {
        @if (!item.hidden || !item.hidden(item)) {
            @switch (item.type) {
                @case ('basic') { <app-horizontal-nav-basic-item [item]="item" [name]="name" /> }
                @case ('collapsable') { <app-horizontal-nav-branch-item [item]="item" [name]="name" /> }
                @case ('group') { <app-horizontal-nav-branch-item [item]="item" [name]="name" /> }
                @case ('spacer') { <app-horizontal-nav-spacer-item [item]="item" [name]="name" /> }
                @case ('divider') { /* skip at top level */ }
            }
        }
    }
</div>
```

Build after creating.

---

### Task 6: Update Layout Components

**Files:**
- Modify: `src/app/layout/layouts/vertical/classy/classy.component.ts`
- Modify: `src/app/layout/layouts/vertical/classy/classy.component.html`
- Modify: `src/app/layout/layouts/vertical/classic/classic.component.ts`
- Modify: `src/app/layout/layouts/vertical/classic/classic.component.html`
- Modify: `src/app/layout/layouts/horizontal/modern/modern.component.ts`
- Modify: `src/app/layout/layouts/horizontal/modern/modern.component.html`
- Modify: `src/app/layout/layouts/empty/empty.component.ts`
- Modify: `src/app/layout/layouts/empty/empty.component.html`
- Modify: `src/app/layout/layout.component.ts`
- Modify: `src/app/app.config.ts`

Replace all `@fuse/*` imports with `app/core/*` imports in each layout component.

For classy layout:
- `FuseLoadingBarComponent` → `LoadingBarComponent`
- `FuseVerticalNavigationComponent` → `AppVerticalNavigationComponent`
- `FuseFullscreenComponent` → `FullscreenComponent`
- `FuseNavigationService` → `AppNavigationService`
- `FuseMediaWatcherService` → `MediaWatcherService`

Template changes:
- `<fuse-loading-bar>` → `<app-loading-bar>`
- `<fuse-vertical-navigation>` → `<app-vertical-navigation>`
- `<fuse-fullscreen>` → `<app-fullscreen>`
- `fuseVerticalNavigationContentHeader` → `appVerticalNavigationContentHeader`
- `fuseVerticalNavigationContentFooter` → `appVerticalNavigationContentFooter`

For modern layout:
- `FuseHorizontalNavigationComponent` → `AppHorizontalNavigationComponent`
- Same service replacements

In `app.config.ts`: Remove `provideFuse()` and the `mockApi` config. Keep only the fuse layout/themes config as a plain object or use ConfigService.

Build after each layout update.

---

### Task 7: Remove Mock API + Wire Real API

**Files:**
- Delete: `src/app/mock-api/` (entire directory)
- Modify: `src/app/core/auth/auth.service.ts` — remove mock API usage, use ApiClient
- Modify: `src/app/core/navigation/navigation.service.ts` — use ApiClient for GET /navigation
- Modify: `src/app/core/user/user.service.ts` — use ApiClient for GET /users/me
- Modify: `src/app/app.config.ts` — remove mockApiServices

Auth service changes needed:
- Replace mock-api authentication with real API calls via ApiClient
- `signIn()` → POST /auth/sign-in
- `signOut()` → POST /auth/sign-out
- `signInUsingToken()` → POST /auth/sign-in-with-token
- Remove mock-api interceptor dependencies

Navigation service:
- Replace `mockApi data.ts` with `this._apiClient.get('/navigation')`
- Return the navigation structure

User service:
- Replace `mockApi data.ts` with `this._apiClient.get('/users/me')`
- Return user object

Build after each service change.

---

### Task 8: Update Auth Pages

**Files:**
- Modify: `src/app/modules/auth/sign-in/sign-in.component.ts`
- Modify: `src/app/modules/auth/sign-up/sign-up.component.ts`
- Modify: `src/app/modules/auth/forgot-password/forgot-password.component.ts`
- Modify: `src/app/modules/auth/reset-password/reset-password.component.ts`
- Modify: `src/app/modules/auth/confirmation-required/confirmation-required.component.ts`
- Modify: `src/app/modules/auth/unlock-session/unlock-session.component.ts`

Replace:
- `FuseAlertComponent` → PrimeNG `p-message` (import `MessageModule`)
- `fuseAnimations` → standard Angular `trigger('fadeIn')` or simple CSS transitions
- `FuseValidators` → Angular `Validators` class

Example replacement for sign-in error message:
```html
<!-- Before: -->
<fuse-alert [type]="'error'">Invalid credentials</fuse-alert>

<!-- After: -->
<p-message severity="error" [text]="'Invalid credentials'"></p-message>
```

Animation replacement:
```typescript
// Before:
import { fuseAnimations } from '@fuse/animations';
@Component({ animations: fuseAnimations })

// After:
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
    animations: [
        trigger('fadeIn', [
            transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
        ]),
    ],
})
```

Build after all auth page updates.

---

### Task 9: Update Tailwind Config + Remove @fuse/

**Files:**
- Modify: `tailwind.config.js` (inline @fuse/tailwind plugins)
- Delete: `src/@fuse/` (entire directory)
- Modify: `package.json` (optional cleanup)
- Modify: `angular.json` (remove Fuse-specific refs)

**Step 1:** Check if `tailwind.config.js` references any `@fuse/tailwind/` files. If so, copy those utility files to `tailwind/` at project root and update imports.

**Step 2:** Remove `src/@fuse/` directory.

**Step 3:** Check `angular.json` for any `@fuse/` or Fuse-specific paths in styles/scripts/build config. Remove them.

**Step 4:** Run build.

```bash
npm run build
```

Expected: no errors (all imports already replaced in previous tasks).

---

### Task 10: Final Build + Verification

**Step 1:** Clean build

```bash
rm -rf dist && npm run build
```

**Step 2:** Check for any remaining `@fuse` references

```bash
grep -rn "@fuse" src/ --include="*.ts" --include="*.html" --include="*.scss" 2>/dev/null | grep -v "node_modules"
```

Expected: 0 results.

**Step 3:** Verify key areas work (if possible with test command):
- Auth flow signs in
- Navigation renders
- Layout correct for each route

**Step 4:** Commit

```bash
git add -A
git commit -m "feat: remove @fuse dependency, replace with open-source equivalents"
```
