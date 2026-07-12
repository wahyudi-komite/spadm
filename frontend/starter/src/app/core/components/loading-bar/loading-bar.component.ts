import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { LoadingService } from '../../services/loading.service';

@Component({
    selector: 'app-loading-bar',
    standalone: true,
    imports: [ProgressBarModule, AsyncPipe],
    template: `
        @if (loadingService.loading$ | async) {
            <p-progressbar mode="indeterminate" [style]="{ height: '3px', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 999 }"></p-progressbar>
        }
    `,
})
export class LoadingBarComponent {
    loadingService = inject(LoadingService);
}
