import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/hooks/use-language';
import api from '@/utils/api';
import { useNotificationStore } from '@/store/notification.store';

/**
 * Hydrates the notification bell's unread badge on mount.
 *
 * Before this, `useNotificationStore`'s `count` only became non-zero after the
 * user visited /account-dashboard/notifications at least once in the session —
 * nothing else ever called `setNotifications`. Since the bell itself was also
 * commented out in the header, this was moot; now that it's back, the badge
 * needs a real number as soon as the header mounts, on every page.
 *
 * Uses `GET /{locale}/user/notifications/poll` — already built for exactly
 * this ("doesn't mark as read") and unused by any caller — rather than
 * `getAllNotifications`, which paginates to 20 items and would under-count
 * unread notifications past the first page. One fetch on mount / on auth
 * change, not a continuous poll; opening the full notifications page still
 * does its own fetch for the actual list.
 */
export function useNotificationCount() {
  const { isAuthenticated, token } = useAuth();
  const { locale } = useLanguage();
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let cancelled = false;

    api
      .get(`/${locale}/user/notifications/poll`)
      .then(({ data }) => {
        if (cancelled || !Array.isArray(data)) return;
        const unread = data.filter((n: { read_at: string | null }) => !n.read_at).length;
        setUnreadCount(unread);
      })
      .catch(() => {
        // Non-critical: the badge just stays at its previous value.
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, locale, setUnreadCount]);
}
