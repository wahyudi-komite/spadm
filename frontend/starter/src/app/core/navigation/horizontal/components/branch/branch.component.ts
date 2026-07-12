import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input,
    OnDestroy, OnInit, ViewChild, ViewEncapsulation, forwardRef, inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { NavigationItem } from '../../../navigation.types';
import { AppNavigationService } from '../../../navigation.service';
import { AppHorizontalNavBasicItemComponent } from '../basic/basic.component';
import { AppHorizontalNavDividerItemComponent } from '../divider/divider.component';

@Component({
    selector: 'app-horizontal-nav-branch-item',
    templateUrl: './branch.component.html',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgClass,
        MatMenuModule,
        NgTemplateOutlet,
        AppHorizontalNavBasicItemComponent,
        forwardRef(() => AppHorizontalNavBranchItemComponent),
        AppHorizontalNavDividerItemComponent,
        MatTooltipModule,
        MatIconModule,
    ],
})
export class AppHorizontalNavBranchItemComponent implements OnInit, OnDestroy {
    static ngAcceptInputType_child: BooleanInput;

    private _cdr = inject(ChangeDetectorRef);
    private _navService = inject(AppNavigationService);

    @Input({ required: true }) item!: NavigationItem;
    @Input({ required: true }) name!: string;
    @Input() child: boolean = false;
    @ViewChild('matMenu', { static: true }) matMenu!: MatMenu;

    private _unsubscribeAll = new Subject<void>();

    ngOnInit(): void {
        const component = this._navService.getComponent<any>(this.name);
        if (component?.onRefreshed) {
            component.onRefreshed
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => this._cdr.markForCheck());
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    triggerChangeDetection(): void {
        this._cdr.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
