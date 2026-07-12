import { Injectable } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MediaWatcherService {
    constructor(private _breakpointObserver: BreakpointObserver) {}

    onMediaChange$(query: string | string[]): Observable<string[]> {
        return this._breakpointObserver.observe(query).pipe(
            map((state: BreakpointState) => {
                const matchingAliases: string[] = [];
                if (state.breakpoints) {
                    for (const [key, value] of Object.entries(state.breakpoints)) {
                        if (value) matchingAliases.push(key);
                    }
                }
                return matchingAliases;
            })
        );
    }

    onMediaQueryChange$(query: string | string[]): Observable<{ breakpoints: Record<string, boolean> }> {
        return this._breakpointObserver.observe(query).pipe(
            map((state: BreakpointState) => ({
                breakpoints: state.breakpoints,
            }))
        );
    }

    isActive(query: string): boolean {
        return this._breakpointObserver.isMatched(query);
    }
}
