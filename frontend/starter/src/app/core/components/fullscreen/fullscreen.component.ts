import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-fullscreen',
    standalone: true,
    imports: [MatIconModule, MatButtonModule],
    template: `
        <button mat-icon-button (click)="toggle()">
            <mat-icon [svgIcon]="isFullscreen() ? 'heroicons_outline:arrows-pointing-in' : 'heroicons_outline:arrows-pointing-out'"></mat-icon>
        </button>
    `,
})
export class FullscreenComponent {
    isFullscreen = signal(false);

    constructor() {
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen.set(!!document.fullscreenElement);
        });
    }

    toggle(): void {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }
}
