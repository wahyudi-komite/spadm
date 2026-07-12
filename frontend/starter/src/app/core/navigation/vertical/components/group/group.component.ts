import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { NavigationItem } from '../../../navigation.types';
import { AppVerticalNavBasicItemComponent } from '../basic/basic.component';
import { AppVerticalNavCollapsableItemComponent } from '../collapsable/collapsable.component';
import { AppVerticalNavDividerItemComponent } from '../divider/divider.component';
import { AppVerticalNavSpacerItemComponent } from '../spacer/spacer.component';

@Component({
    selector: 'app-vertical-nav-group-item',
    templateUrl: './group.component.html',
    standalone: true,
    imports: [MatIconModule, NgClass, AppVerticalNavBasicItemComponent, AppVerticalNavCollapsableItemComponent, AppVerticalNavDividerItemComponent, AppVerticalNavSpacerItemComponent],
    encapsulation: ViewEncapsulation.None,
})
export class AppVerticalNavGroupItemComponent {
    @Input({ required: true }) item!: NavigationItem;
    @Input({ required: true }) name!: string;
    @Input() autoCollapse = true;
}
