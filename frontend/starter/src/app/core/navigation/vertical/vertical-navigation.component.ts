import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { AppNavigationService } from '../navigation.service';
import {
    NavigationItem,
    VerticalNavigationMode,
    VerticalNavigationPosition,
} from '../navigation.types';
import { AppVerticalNavBasicItemComponent } from './components/basic/basic.component';
import { AppVerticalNavCollapsableItemComponent } from './components/collapsable/collapsable.component';
import { AppVerticalNavDividerItemComponent } from './components/divider/divider.component';
import { AppVerticalNavGroupItemComponent } from './components/group/group.component';
import { AppVerticalNavSpacerItemComponent } from './components/spacer/spacer.component';

@Component({
    selector: 'app-vertical-navigation',
    templateUrl: './vertical-navigation.component.html',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'appVerticalNavigation',
    imports: [
        AppVerticalNavBasicItemComponent,
        AppVerticalNavCollapsableItemComponent,
        AppVerticalNavDividerItemComponent,
        AppVerticalNavGroupItemComponent,
        AppVerticalNavSpacerItemComponent,
    ],
    host: {
        '[class.fuse-vertical-navigation-animations-enabled]': 'true',
        '[class.fuse-vertical-navigation-appearance-default]': 'true',
        '[class.fuse-vertical-navigation-mode-over]': 'mode === "over"',
        '[class.fuse-vertical-navigation-mode-side]': 'mode === "side"',
        '[class.fuse-vertical-navigation-opened]': 'opened',
        '[class.fuse-vertical-navigation-position-left]': 'position === "left"',
        '[class.fuse-vertical-navigation-position-right]':
            'position === "right"',
    },
})
export class AppVerticalNavigationComponent
    implements OnInit, OnChanges, OnDestroy
{
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _document = inject(DOCUMENT);
    private _router = inject(Router);
    private _navigationService = inject(AppNavigationService);

    @Input({ required: true }) name!: string;
    @Input() appearance: string = 'default';
    @Input() mode: VerticalNavigationMode = 'side';
    @Input() navigation: NavigationItem[] = [];
    @Input() opened: boolean = true;
    @Input() position: VerticalNavigationPosition = 'left';

    @Output() readonly openedChanged = new EventEmitter<boolean>();

    private _unsubscribeAll = new Subject<void>();

    ngOnInit(): void {
        this._navigationService.registerComponent(this.name, this);

        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                if (this.mode === 'over' && this.opened) {
                    this.close();
                }
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['mode'] || changes['opened']) {
            this._syncBodyScrollLock();
        }
    }

    ngOnDestroy(): void {
        this._document.body.style.overflow = '';
        this._navigationService.deregisterComponent(this.name);
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    open(): void {
        if (this.opened) return;
        this._toggleOpened(true);
    }

    close(): void {
        if (!this.opened) return;
        this._toggleOpened(false);
    }

    toggle(): void {
        if (this.opened) {
            this.close();
        } else {
            this.open();
        }
    }

    refresh(): void {
        this._changeDetectorRef.markForCheck();
    }

    private _toggleOpened(open: boolean): void {
        this.opened = open;
        this._syncBodyScrollLock();
        this.openedChanged.emit(open);
        this._changeDetectorRef.markForCheck();
    }

    private _syncBodyScrollLock(): void {
        this._document.body.style.overflow =
            this.mode === 'over' && this.opened ? 'hidden' : '';
    }
}
