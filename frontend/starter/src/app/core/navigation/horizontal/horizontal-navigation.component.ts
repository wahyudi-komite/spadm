import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { AppNavigationService } from '../navigation.service';
import { NavigationItem } from '../navigation.types';
import { AppHorizontalNavBasicItemComponent } from './components/basic/basic.component';
import { AppHorizontalNavBranchItemComponent } from './components/branch/branch.component';
import { AppHorizontalNavSpacerItemComponent } from './components/spacer/spacer.component';

@Component({
    selector: 'app-horizontal-navigation',
    templateUrl: './horizontal-navigation.component.html',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        AppHorizontalNavBasicItemComponent,
        AppHorizontalNavBranchItemComponent,
        AppHorizontalNavSpacerItemComponent,
    ],
})
export class AppHorizontalNavigationComponent implements OnInit, OnDestroy {
    private _cdr = inject(ChangeDetectorRef);
    private _navService = inject(AppNavigationService);

    @Input({ required: true }) navigation!: NavigationItem[];
    @Input() name: string = 'horizontalNavigation';

    onRefreshed = new ReplaySubject<boolean>(1);

    ngOnInit(): void {
        this._navService.registerComponent(this.name, this);
    }

    ngOnDestroy(): void {
        this._navService.deregisterComponent(this.name);
    }

    refresh(): void {
        this._cdr.markForCheck();
        this.onRefreshed.next(true);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
