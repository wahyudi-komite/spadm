import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FullscreenComponent } from 'app/core/components/fullscreen/fullscreen.component';
import { LoadingBarComponent } from 'app/core/components/loading-bar/loading-bar.component';
import { AppNavigationService } from 'app/core/navigation/navigation.service';
import { NavigationGroup, NavigationItem } from 'app/core/navigation/navigation.types';
import { AppVerticalNavigationComponent } from 'app/core/navigation/vertical/vertical-navigation.component';
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
        FullscreenComponent,
        RouterOutlet,
    ],
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: NavigationGroup;
    user: User;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _appNavigationService: AppNavigationService,
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

        this._mediaWatcherService.onMediaChange$(['(min-width: 960px)'])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((matchingAliases) => {
                this.isScreenSmall = !matchingAliases.includes('(min-width: 960px)');
            });
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
