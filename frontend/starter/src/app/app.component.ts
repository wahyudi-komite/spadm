import { Component, Inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';

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
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _swUpdate: SwUpdate,
        private _dialogFeedback: DialogFeedbackService
    ) {}

    ngOnInit(): void {
        const splashScreen = this._document.getElementById('app-splash-screen');
        if (splashScreen) {
            splashScreen.remove();
        }
        if (this._swUpdate.isEnabled) {
            this._swUpdate.versionUpdates.subscribe((event) => {
                if (event.type === 'VERSION_READY') {
                    this._dialogFeedback
                        .confirm({
                            title: 'Versi baru tersedia',
                            message:
                                'Versi baru SPADM tersedia. Muat ulang aplikasi sekarang?',
                            confirmText: 'Muat ulang',
                            cancelText: 'Nanti',
                        })
                        .subscribe((confirmed) => {
                            if (confirmed) {
                                void this._swUpdate.activateUpdate().then(() =>
                                    this._document.location.reload()
                                );
                            }
                        });
                }
            });
        }
    }
}
