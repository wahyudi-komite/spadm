import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-search-input',
    imports: [],
    templateUrl: './search-input.component.html',
    styleUrl: './search-input.component.scss',
})
export class SearchInputComponent {
    @Input() placeholder: string = 'Search..';
    @Output() search = new EventEmitter<string>();

    onSearch(event: Event) {
        const target = event.target as HTMLInputElement;
        this.search.emit(target.value);
    }
}
