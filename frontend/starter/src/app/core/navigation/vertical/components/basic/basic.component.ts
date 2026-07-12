import { Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { NavigationItem } from '../../../navigation.types';

@Component({
    selector: 'app-vertical-nav-basic-item',
    templateUrl: './basic.component.html',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, MatIconModule, NgClass],
    encapsulation: ViewEncapsulation.None,
})
export class AppVerticalNavBasicItemComponent {
    @Input({ required: true }) item!: NavigationItem;
    @Input({ required: true }) name!: string;
}
