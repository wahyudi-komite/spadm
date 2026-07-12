import { Provider } from '@angular/core';
import { provideAppEnvironment } from './config/app-config.token';

export function provideCore(): Provider[] {
    return [
        provideAppEnvironment(),
    ];
}
