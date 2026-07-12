import { InjectionToken } from '@angular/core';

export interface AppEnvironment {
    production: boolean;
    apiUrl: string;
}

export interface AppBranding {
    appName: string;
    shortName?: string;
    logoUrl?: string;
    faviconUrl?: string;
}

export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT');
export const APP_BRANDING = new InjectionToken<AppBranding>('APP_BRANDING');
