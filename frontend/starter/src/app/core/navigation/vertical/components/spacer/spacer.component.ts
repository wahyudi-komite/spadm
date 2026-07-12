import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NgClass } from '@angular/common';
import { NavigationItem } from '../../../navigation.types';

@Component({
    selector: 'app-vertical-nav-spacer-item',
    templateUrl: './spacer.component.html',
    standalone: true,
    imports: [NgClass],
    encapsulation: ViewEncapsulation.None,
})
export class AppVerticalNavSpacerItemComponent {
    @Input({ required: true }) item!: NavigationItem;
    @Input({ required: true }) name!: string;
}
