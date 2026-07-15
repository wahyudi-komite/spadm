import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FullscreenComponent } from 'app/core/components/fullscreen/fullscreen.component';
import { LoadingBarComponent } from 'app/core/components/loading-bar/loading-bar.component';
import { AppNavigationService } from 'app/core/navigation/navigation.service';
import { NavigationGroup, NavigationItem } from 'app/core/navigation/navigation.types';
import { AppVerticalNavigationComponent } from 'app/core/navigation/vertical/vertical-navigation.component';
import { ConfigService } from 'app/core/services/config.service';
import { MediaWatcherService } from 'app/core/services/media-watcher.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { UserComponent } from 'app/layout/common/user/user.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        LoadingBarComponent,
        AppVerticalNavigationComponent,
        UserComponent,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        FullscreenComponent,
        RouterOutlet,
    ],
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: NavigationGroup;
    user: User;
    scheme: 'auto' | 'dark' | 'light' = 'auto';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    readonly schemeIcons: Record<string, string> = {
        light: 'heroicons_solid:sun',
        dark: 'heroicons_solid:moon',
        auto: 'heroicons_solid:computer-desktop',
    };

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _appNavigationService: AppNavigationService,
        private _configService: ConfigService,
        private _userService: UserService,
        private _mediaWatcherService: MediaWatcherService
    ) {}

    get currentYear(): number {
        return new Date().getFullYear();
    }

    ngOnInit(): void {
        this._appNavigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: NavigationGroup) => {
                this.navigation = navigation;
            });

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });

        this._configService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.scheme = config.scheme;
            });

        this._mediaWatcherService.onMediaChange$(['(min-width: 960px)'])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((matchingAliases) => {
                this.isScreenSmall = !matchingAliases.includes('(min-width: 960px)');
            });
    }

    toggleScheme(): void {
        const cycle: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
        const idx = cycle.indexOf(this.scheme);
        const next = cycle[(idx + 1) % cycle.length];
        this._configService.config = { scheme: next };
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    toggleNavigation(name: string): void {
        const navigation = this._appNavigationService.getComponent<AppVerticalNavigationComponent>(name);

        if (navigation) {
            navigation.toggle();
        }
    }
}
