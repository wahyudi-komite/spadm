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

@Injectable({ providedIn: 'root' })
export class ConfigService {
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

        let storedConfig: Partial<AppConfig> = {};
        try {
            const stored = localStorage.getItem('app-config');
            if (stored) {
                storedConfig = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to parse stored config', e);
        }

        const initialConfig = { ...defaultConfig, ...storedConfig };
        this._config = new BehaviorSubject(initialConfig);
        this.config$ = this._config.asObservable();
    }

    set config(value: Partial<AppConfig>) {
        const newConfig = { ...this._config.value, ...value };
        this._config.next(newConfig);
        try {
            localStorage.setItem('app-config', JSON.stringify(newConfig));
        } catch (e) {
            console.error('Failed to store config', e);
        }
    }

    get config(): AppConfig {
        return this._config.value;
    }
}
