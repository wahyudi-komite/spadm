import { Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { APP_ENVIRONMENT, AppEnvironment } from './app-config.types';

export function provideAppEnvironment(config?: Partial<AppEnvironment>): Provider {
    return {
        provide: APP_ENVIRONMENT,
        useValue: { ...environment, ...config } as AppEnvironment,
    };
}
