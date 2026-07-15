import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppConfig {
    layout: string;
    scheme: 'auto' | 'dark' | 'light';
    theme: string;
    themes: { id: string; name: string }[];
    screens: Record<string, string>;
}

export type Scheme = AppConfig['scheme'];
export type Theme = AppConfig['theme'];
export type Themes = AppConfig['themes'];

type StoredPreferences = Pick<AppConfig, 'layout' | 'scheme' | 'theme'>;

@Injectable({ providedIn: 'root' })
export class ConfigService {
    private static readonly _storageKey = 'spadm.app.preferences';
    private _config: BehaviorSubject<AppConfig>;
    readonly config$: Observable<AppConfig>;

    constructor() {
        const defaultConfig: AppConfig = {
            layout: 'classy',
            scheme: 'auto',
            theme: 'theme-brand',
            screens: {
                sm: '600px',
                md: '960px',
                lg: '1280px',
                xl: '1440px',
            },
            themes: [
                { id: 'theme-default', name: 'Default' },
                { id: 'theme-brand', name: 'Brand' },
                { id: 'theme-teal', name: 'Teal' },
                { id: 'theme-rose', name: 'Rose' },
                { id: 'theme-purple', name: 'Purple' },
                { id: 'theme-amber', name: 'Amber' },
            ],
        };
        this._config = new BehaviorSubject({
            ...defaultConfig,
            ...this._loadPreferences(defaultConfig),
        });
        this.config$ = this._config.asObservable();
    }

    set config(value: Partial<AppConfig>) {
        const config = { ...this._config.value, ...value };
        this._config.next(config);
        this._savePreferences(config);
    }

    get config(): AppConfig {
        return this._config.value;
    }

    private _loadPreferences(defaultConfig: AppConfig): Partial<StoredPreferences> {
        try {
            const storedValue = globalThis.localStorage?.getItem(
                ConfigService._storageKey
            );
            if (!storedValue) {
                return {};
            }

            const stored = JSON.parse(storedValue) as Partial<StoredPreferences>;
            const preferences: Partial<StoredPreferences> = {};

            if (['auto', 'dark', 'light'].includes(stored.scheme ?? '')) {
                preferences.scheme = stored.scheme;
            }
            if (typeof stored.layout === 'string' && stored.layout) {
                preferences.layout = stored.layout;
            }
            if (defaultConfig.themes.some((theme) => theme.id === stored.theme)) {
                preferences.theme = stored.theme;
            }

            return preferences;
        } catch {
            return {};
        }
    }

    private _savePreferences(config: AppConfig): void {
        try {
            const preferences: StoredPreferences = {
                layout: config.layout,
                scheme: config.scheme,
                theme: config.theme,
            };
            globalThis.localStorage?.setItem(
                ConfigService._storageKey,
                JSON.stringify(preferences)
            );
        } catch {
            // Storage may be blocked by browser privacy settings.
        }
    }
}
