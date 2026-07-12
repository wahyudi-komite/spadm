import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-paginate',
    imports: [CommonModule],
    templateUrl: './paginate.component.html',
    styleUrl: './paginate.component.scss'
})
export class PaginateComponent implements OnInit {
    @Input() last_page!: number;
    @Output() pageChanged = new EventEmitter<number>();
    page = 1;

    constructor() {}

    ngOnInit(): void {}
    get pages(): any[] {
        const pages: any[] = [];
        let startPage: number, endPage: number;
        if (this.last_page <= 5) {
            startPage = 1;
            endPage = this.last_page;
        } else {
            if (this.page <= 3) {
                startPage = 1;
                endPage = 5;
            } else if (this.page + 1 >= this.last_page) {
                startPage = this.last_page - 4;
                endPage = this.last_page;
            } else {
                startPage = this.page - 2;
                endPage = this.page + 2;
            }
        }

        if (startPage != 1) {
            pages.push(1, '...');
        }
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        if (endPage != this.last_page) {
            pages.push('...', this.last_page);
        }

        return pages;
    }
    next(): void {
        if (this.page === this.last_page) {
            return;
        }

        this.page++;
        this.pageChanged.emit(this.page);
    }

    prev(): void {
        if (this.page === 1) {
            return;
        }

        this.page--;
        this.pageChanged.emit(this.page);
    }

    goToPage(n: number): void {
        this.page = n;
        this.pageChanged.emit(this.page);
    }

    isPageEnabled(n: number): boolean {
        return n > 0 && n <= this.last_page;
    }

    isPageClickable(page: number): boolean {
        return page !== this.page && page > 0 && page <= this.last_page;
    }

    setPage(page: number) {
        if (page >= 1 && page <= this.last_page) {
            this.page = page;
            this.pageChanged.emit(this.page);
        }
    }
}
