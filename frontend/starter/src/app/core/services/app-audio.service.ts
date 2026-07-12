import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AppAudioService {
    private success = new Audio('./sound/success-notification-alert_A_major.wav');
    private failed = new Audio('./sound/windows-xp-error.wav');
    private info = new Audio('./sound/windows-logon.wav');

    playSuccess(): void {
        this.success.play().catch(() => {});
    }

    playFailed(): void {
        this.failed.play().catch(() => {});
    }

    playInfo(): void {
        this.info.play().catch(() => {});
    }
}
