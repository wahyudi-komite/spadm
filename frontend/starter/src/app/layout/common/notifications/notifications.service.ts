import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { environment } from 'environments/environment';
import { forkJoin, map, Observable, ReplaySubject, switchMap, take, tap } from 'rxjs';

interface ApiNotification {
    id: number;
    title: string;
    message: string;
    deepLink: string | null;
    isRead: boolean;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
    private _notifications = new ReplaySubject<Notification[]>(1);
    private _unreadCount = new ReplaySubject<number>(1);

    constructor(private _httpClient: HttpClient) {}

    get notifications$(): Observable<Notification[]> {
        return this._notifications.asObservable();
    }

    get unreadCount$(): Observable<number> {
        return this._unreadCount.asObservable();
    }

    setUnreadCount(count: number): void {
        this._unreadCount.next(count);
    }

    getAll(): Observable<Notification[]> {
        return forkJoin({
            page: this._httpClient.get<{ data: ApiNotification[] }>(
                `${environment.apiUrl}/notifications`
            ),
            unread: this._httpClient.get<{ count: number }>(
                `${environment.apiUrl}/notifications/unread-count`
            ),
        }).pipe(
            map(({ page, unread }) => {
                this._unreadCount.next(unread.count);
                return page.data.map((item) => this._map(item));
            }),
            tap((notifications) => this._notifications.next(notifications))
        );
    }

    create(notification: Notification): Observable<Notification> {
        return this.notifications$.pipe(
            take(1),
            map((notifications) => {
                const withoutDuplicate = notifications.filter(
                    (item) => item.id !== notification.id
                );
                this._notifications.next([notification, ...withoutDuplicate]);
                return notification;
            })
        );
    }

    update(id: string, notification: Notification): Observable<Notification> {
        return this._httpClient
            .patch<ApiNotification>(
                `${environment.apiUrl}/notifications/${id}/read`,
                {}
            )
            .pipe(
                map((updated) => this._map(updated)),
                tap((updated) => this._replace(updated))
            );
    }

    markAllAsRead(): Observable<boolean> {
        return this.notifications$.pipe(
            take(1),
            switchMap((notifications) =>
                this._httpClient
                    .patch<{ updated: number }>(
                        `${environment.apiUrl}/notifications/read-all`,
                        {}
                    )
                    .pipe(
                        map(() => {
                            const updated = notifications.map((notification) => ({
                                ...notification,
                                read: true,
                            }));
                            this._notifications.next(updated);
                            return true;
                        })
                    )
            )
        );
    }

    private _replace(updated: Notification): void {
        this.notifications$.pipe(take(1)).subscribe((notifications) => {
            this._notifications.next(
                notifications.map((item) =>
                    item.id === updated.id ? updated : item
                )
            );
        });
    }

    private _map(item: ApiNotification): Notification {
        return {
            id: String(item.id),
            icon: 'heroicons_outline:bell',
            title: item.title,
            description: item.message,
            time: item.createdAt,
            link: item.deepLink || undefined,
            useRouter: Boolean(item.deepLink),
            read: item.isRead,
        };
    }
}
