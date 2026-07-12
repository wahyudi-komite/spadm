import { Component, Inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
    /**
     * Constructor
     */
    constructor(@Inject(DOCUMENT) private _document: Document) {}

    ngOnInit(): void {
        const splashScreen = this._document.getElementById('app-splash-screen');
        if (splashScreen) {
            splashScreen.remove();
        }
    }
}
