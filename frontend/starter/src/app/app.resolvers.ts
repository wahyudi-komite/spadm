import { inject } from '@angular/core';
import { AppNavigationService } from 'app/core/navigation/navigation.service';
import { defaultNavigation, compactNavigation, futuristicNavigation, horizontalNavigation } from 'app/mock-api/common/navigation/data';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { forkJoin } from 'rxjs';
import { NavigationGroup, NavigationItem } from './core/navigation/navigation.types';

export const initialDataResolver = () => {
    const appNavigationService = inject(AppNavigationService);
    const messagesService = inject(MessagesService);
    const notificationsService = inject(NotificationsService);
    const quickChatService = inject(QuickChatService);
    const shortcutsService = inject(ShortcutsService);

    appNavigationService.navigation = {
        compact: compactNavigation as NavigationItem[],
        default: defaultNavigation as NavigationItem[],
        futuristic: futuristicNavigation as NavigationItem[],
        horizontal: horizontalNavigation as NavigationItem[],
    };

    return forkJoin([
        messagesService.getAll(),
        notificationsService.getAll(),
        quickChatService.getChats(),
        shortcutsService.getAll(),
    ]);
};
