import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NgClass } from '@angular/common';
import { NavigationItem } from '../../../navigation.types';

@Component({
    selector: 'app-horizontal-nav-spacer-item',
    templateUrl: './spacer.component.html',
    standalone: true,
    imports: [NgClass],
    encapsulation: ViewEncapsulation.None,
})
export class AppHorizontalNavSpacerItemComponent {
    @Input({ required: true }) item!: NavigationItem;
    @Input({ required: true }) name!: string;
}
