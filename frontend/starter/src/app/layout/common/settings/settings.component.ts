import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import {
    AppConfig,
    ConfigService,
    Scheme,
    Theme,
    Themes,
} from 'app/core/services/config.service';

import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    styles: [
        `
            settings {
                position: static;
                display: block;
                flex: none;
                width: auto;
            }

            @media (screen and min-width: 1280px) {
                empty-layout + settings .settings-cog {
                    right: 0 !important;
                }
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatIconModule,
        SidebarModule,
        MatButtonModule,
        NgClass,
        MatTooltipModule,
    ]
})
export class SettingsComponent implements OnInit, OnDestroy {
    config: AppConfig;
    layout: string;
    scheme: 'dark' | 'light';
    theme: string;
    themes: Themes;
    settingsOpen = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _router: Router,
        private _configService: ConfigService
    ) {}

    ngOnInit(): void {
        this._configService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: AppConfig) => {
                this.config = config;
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    setLayout(layout: string): void {
        this._router
            .navigate([], {
                queryParams: {
                    layout: null,
                },
                queryParamsHandling: 'merge',
            })
            .then(() => {
                this._configService.config = { layout };
            });
    }

    setScheme(scheme: Scheme): void {
        this._configService.config = { scheme };
    }

    setTheme(theme: Theme): void {
        this._configService.config = { theme };
    }
}
