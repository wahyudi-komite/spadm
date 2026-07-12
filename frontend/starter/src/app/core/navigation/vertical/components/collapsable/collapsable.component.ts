import { Component, inject, Input, signal, ViewEncapsulation, effect } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { NavigationItem } from '../../../navigation.types';
import { AppVerticalNavBasicItemComponent } from '../basic/basic.component';
import { AppVerticalNavGroupItemComponent } from '../group/group.component';
import { AppVerticalNavDividerItemComponent } from '../divider/divider.component';
import { AppVerticalNavSpacerItemComponent } from '../spacer/spacer.component';

@Component({
    selector: 'app-vertical-nav-collapsable-item',
    templateUrl: './collapsable.component.html',
    standalone: true,
    imports: [MatIconModule, NgClass, AppVerticalNavBasicItemComponent, AppVerticalNavGroupItemComponent, AppVerticalNavDividerItemComponent, AppVerticalNavSpacerItemComponent],
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.fuse-vertical-navigation-item-collapsed]': '!isExpanded()',
        '[class.fuse-vertical-navigation-item-expanded]': 'isExpanded()',
    },
})
export class AppVerticalNavCollapsableItemComponent {
    private _router = inject(Router);
    isExpanded = signal(false);
    @Input({ required: true }) item!: NavigationItem;
    @Input({ required: true }) name!: string;
    @Input() autoCollapse = true;

    constructor() {
        effect(() => {
            if (this._hasActiveChild(this.item, this._router.url)) {
                this.isExpanded.set(true);
            }
        });
    }

    toggle(): void {
        this.isExpanded.update(v => !v);
    }

    private _hasActiveChild(item: NavigationItem, currentUrl: string): boolean {
        for (const child of item.children ?? []) {
            if (child.link && this._router.isActive(child.link, child.exactMatch ?? false)) {
                return true;
            }
            if (child.children?.length && this._hasActiveChild(child, currentUrl)) {
                return true;
            }
        }
        return false;
    }
}
