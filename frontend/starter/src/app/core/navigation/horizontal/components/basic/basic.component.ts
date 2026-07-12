import { Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { NavigationItem } from '../../../navigation.types';

@Component({
    selector: 'app-horizontal-nav-basic-item',
    templateUrl: './basic.component.html',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, MatIconModule, NgClass, NgTemplateOutlet],
    encapsulation: ViewEncapsulation.None,
})
export class AppHorizontalNavBasicItemComponent {
    @Input({ required: true }) item!: NavigationItem;
    @Input({ required: true }) name!: string;
}
