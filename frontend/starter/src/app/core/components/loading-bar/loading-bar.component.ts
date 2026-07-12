import { Component } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
    selector: 'app-loading-bar',
    standalone: true,
    imports: [ProgressBarModule],
    template: `<p-progressbar mode="indeterminate" [style]="{ height: '3px', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 999 }"></p-progressbar>`,
})
export class LoadingBarComponent {}
