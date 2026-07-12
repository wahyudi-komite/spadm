import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NavigationGroup, NavigationItem } from './navigation.types';

@Injectable({ providedIn: 'root' })
export class AppNavigationService {
    private _componentRegistry = new Map<string, any>();
    private _navigationStore = new Map<string, NavigationItem[]>();
    private _navigation: BehaviorSubject<NavigationGroup>;
    readonly navigation$: Observable<NavigationGroup>;

    constructor() {
        const empty: NavigationGroup = { compact: [], default: [], futuristic: [], horizontal: [] };
        this._navigation = new BehaviorSubject<NavigationGroup>(empty);
        this.navigation$ = this._navigation.asObservable();
    }

    get navigation(): NavigationGroup {
        return this._navigation.value;
    }

    set navigation(value: NavigationGroup) {
        this._navigation.next(value);
    }

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
