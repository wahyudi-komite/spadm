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
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { MessagesComponent } from 'app/layout/common/messages/messages.component';
import { NotificationsComponent } from 'app/layout/common/notifications/notifications.component';
import { QuickChatComponent } from 'app/layout/common/quick-chat/quick-chat.component';
import { SearchComponent } from 'app/layout/common/search/search.component';
import { ShortcutsComponent } from 'app/layout/common/shortcuts/shortcuts.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'classic-layout',
    templateUrl: './classic.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        LoadingBarComponent,
        AppVerticalNavigationComponent,
        MatButtonModule,
        MatIconModule,
        LanguagesComponent,
        FullscreenComponent,
        SearchComponent,
        ShortcutsComponent,
        MessagesComponent,
        NotificationsComponent,
        UserComponent,
        RouterOutlet,
        QuickChatComponent,
    ]
})
export class ClassicLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: NavigationGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _appNavigationService: AppNavigationService,
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
