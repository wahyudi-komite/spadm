import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GlobalVariable } from '../../../node/common/global-variable';

@Component({
    selector: 'app-paginate-take',
    imports: [],
    templateUrl: './paginate-take.component.html',
    styleUrl: './paginate-take.component.scss'
})
export class PaginateTakeComponent implements OnInit {
    @Output() limitChanged = new EventEmitter<number>();
    limit = GlobalVariable.pageTake;

    ngOnInit(): void {}

    changedLimit(event: Event): void {
        this.limit = parseInt((event.target as HTMLInputElement).value);
        this.limitChanged.emit(this.limit);
    }
}
