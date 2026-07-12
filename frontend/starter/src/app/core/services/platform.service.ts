import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class PlatformService {
    isBrowser: boolean;
    osName: string = '';

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
        if (this.isBrowser) {
            this.osName = this._detectOS();
        }
    }

    private _detectOS(): string {
        const ua = window.navigator.userAgent;
        if (ua.includes('Win')) return 'windows';
        if (ua.includes('Mac')) return 'mac';
        if (ua.includes('Linux')) return 'linux';
        if (ua.includes('Android')) return 'android';
        if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'ios';
        return 'unknown';
    }
}
