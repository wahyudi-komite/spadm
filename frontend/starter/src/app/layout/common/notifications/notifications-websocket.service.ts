import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationsWebSocketService implements OnDestroy {
    private socket: Socket | null = null;
    private currentToken: string | null = null;
    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _notificationsService: NotificationsService,
        private _authService: AuthService,
    ) {
        this._authService.accessToken$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((token) => {
                if (token && token !== this.currentToken) {
                    this.connect(token);
                } else if (!token) {
                    this.disconnect();
                }
            });
    }

    private connect(token: string): void {
        this.disconnect();
        this.currentToken = token;
        const socketOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

        this.socket = io(`${socketOrigin}/notifications`, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 3000,
        });

        this.socket.on('connect', () => {});

        this.socket.on('notification', (data: any) => {
            const mapped: Notification = {
                id: String(data.id),
                icon: 'heroicons_outline:bell',
                title: data.title,
                description: data.message,
                time: data.createdAt,
                link: data.deepLink || undefined,
                useRouter: Boolean(data.deepLink),
                read: data.isRead,
            };
            this._notificationsService.create(mapped).subscribe();
        });

        this.socket.on('unread_count', (count: number) => {
            this._notificationsService.setUnreadCount(count);
        });

        this.socket.on('disconnect', () => {});

        this.socket.on('connect_error', () => {});
    }

    disconnect(): void {
        this.socket?.disconnect();
        this.socket = null;
        this.currentToken = null;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.disconnect();
    }
}
