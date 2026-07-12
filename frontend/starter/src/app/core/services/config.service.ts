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
        this._config = new BehaviorSubject(defaultConfig);
        this.config$ = this._config.asObservable();
    }

    set config(value: Partial<AppConfig>) {
        this._config.next({ ...this._config.value, ...value });
    }

    get config(): AppConfig {
        return this._config.value;
    }
}
