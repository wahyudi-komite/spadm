import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localeId from '@angular/common/locales/id';
import {
    APP_INITIALIZER,
    ApplicationConfig,
    inject,
    LOCALE_ID,
} from '@angular/core';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
    PreloadAllModules,
    provideRouter,
    withInMemoryScrolling,
    withPreloading,
} from '@angular/router';
import { provideTransloco, TranslocoService } from '@ngneat/transloco';
import Aura from '@primeuix/themes/aura';
import { appRoutes } from 'app/app.routes';
import { provideAuth } from 'app/core/auth/auth.provider';
import { provideAppEnvironment } from 'app/core/config/app-config.token';
import { provideIcons } from 'app/core/icons/icons.provider';
import { provideToastr } from 'ngx-toastr';
import { providePrimeNG } from 'primeng/config';
import { firstValueFrom } from 'rxjs';
import { TranslocoHttpLoader } from './core/transloco/transloco.http-loader';
registerLocaleData(localeId, 'id');

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideToastr(),
        provideRouter(
            appRoutes,
            withPreloading(PreloadAllModules),
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
        ),
        providePrimeNG({
            theme: {
                preset: Aura,
            },
        }),

        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
        },
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: 'yyyy-MM-dd',
                },
                display: {
                    dateInput: 'yyyy-MM-dd',
                    monthYearLabel: 'LLL yyyy',
                    dateA11yLabel: 'yyyy-MM-dd',
                    monthYearA11yLabel: 'LLLL yyyy',
                },
            },
        },

        provideTransloco({
            config: {
                availableLangs: [
                    {
                        id: 'en',
                        label: 'English',
                    },
                ],
                defaultLang: 'en',
                fallbackLang: 'en',
                reRenderOnLangChange: true,
                prodMode: true,
            },
            loader: TranslocoHttpLoader,
        }),
        {
            provide: APP_INITIALIZER,
            useFactory: () => {
                const translocoService = inject(TranslocoService);
                const defaultLang = translocoService.getDefaultLang();
                translocoService.setActiveLang(defaultLang);

                return () => firstValueFrom(translocoService.load(defaultLang));
            },
            multi: true,
        },

        provideAppEnvironment(),

        provideAuth(),
        provideIcons(),
        { provide: LOCALE_ID, useValue: 'id' },
    ],
};
