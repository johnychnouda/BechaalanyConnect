import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { useNotificationStore, type NotificationStatus } from '@/store/notification.store';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/hooks/use-language';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/primitives/Button';
import api from '@/utils/api';
import { formatDateTime, formatDateHeading } from '@/utils/date';

/**
 * The single source of truth for how a notification's `type` (from
 * NotificationController::present() on the backend) renders: which of the
 * two visual states it gets, and the bilingual title/description.
 *
 * Covers every type the backend's create*Notification factories actually
 * emit — credit_approved/rejected/pending, order_approved/rejected,
 * order_cancelled (a supplier auto-refund, same negative outcome as a
 * rejection), kyc_approved/kyc_rejected — plus 'kyc' and 'general' as an
 * honest fallback. ('kyc' is what rows written before createKycNotification
 * started setting the `type` column present as; it cannot tell approval from
 * rejection, so it stays neutral rather than guessing.)
 *
 * `notification.message` is the backend's own translated sentence, resolved
 * from data.message_key under the request locale — it wins. The literals
 * below are the fallback for legacy rows written before message_key existed,
 * which hold a frozen English string.
 */
function deriveNotificationDisplay(
  notification: { type?: string; amount?: number | string; message?: string },
  isArabic: boolean
): { status: 'success' | 'rejected'; title: string; description: string } {
  const amount = notification.amount;

  switch (notification.type) {
    case 'credit_approved':
      return {
        status: 'success',
        title: isArabic ? 'تمت الموافقة على طلب الرصيد' : 'Credit Request Approved',
        description: notification.message ||
          (isArabic ? `تمت الموافقة على طلب الرصيد الخاص بك وتمت إضافة $${amount} إلى رصيدك.` : `Your credit request has been approved and $${amount} has been added to your balance.`),
      };
    case 'credit_rejected':
      return {
        status: 'rejected',
        title: isArabic ? 'تم رفض طلب الرصيد' : 'Credit Request Rejected',
        description: notification.message ||
          (isArabic ? `تم رفض طلب الرصيد الخاص بك بقيمة $${amount}.` : `Your credit request for $${amount} has been rejected.`),
      };
    case 'credit_pending':
      return {
        status: 'success',
        title: isArabic ? 'طلب الرصيد قيد المراجعة' : 'Credit Request Pending',
        description: notification.message ||
          (isArabic ? `طلب الرصيد الخاص بك بقيمة $${amount} قيد المراجعة.` : `Your credit request for $${amount} is pending review.`),
      };
    case 'order_approved':
      return {
        status: 'success',
        title: isArabic ? 'تمت الموافقة على الطلب' : 'Order Approved',
        description: notification.message ||
          (isArabic ? 'تمت الموافقة على طلبك. افتح "طلباتي" لعرض الرمز أو تفاصيل التسليم.' : 'Your order has been approved. Open My Orders to see your code or delivery details.'),
      };
    case 'order_rejected':
      return {
        status: 'rejected',
        title: isArabic ? 'تم رفض الطلب' : 'Order Rejected',
        description: notification.message ||
          (isArabic ? 'تم رفض طلبك وتمت إعادة المبلغ إلى رصيدك.' : 'Your order was rejected and the credits have been returned to your balance.'),
      };
    case 'order_cancelled':
      return {
        status: 'rejected',
        title: isArabic ? 'تم إلغاء الطلب' : 'Order Cancelled',
        description: notification.message ||
          (isArabic ? 'تم إلغاء طلبك من قبل المورد وتمت إعادة رصيدك.' : 'Your order was cancelled by the supplier and your credits have been refunded.'),
      };
    case 'kyc_approved':
      return {
        status: 'success',
        title: isArabic ? 'تم توثيق الحساب' : 'Account Verified',
        description: notification.message ||
          (isArabic ? 'تم توثيق حسابك. يمكنك الآن استخدام جميع ميزات المنصة.' : 'Your account has been verified. You can now use all platform features.'),
      };
    case 'kyc_rejected':
      return {
        status: 'rejected',
        title: isArabic ? 'تم رفض التوثيق' : 'Verification Rejected',
        description: notification.message ||
          (isArabic ? 'تم رفض مستندات التوثيق الخاصة بك. يرجى إعادة إرسالها.' : 'Your verification documents were rejected. Please resubmit your documents.'),
      };
    case 'kyc':
      return {
        status: 'success',
        title: isArabic ? 'تحديث حالة التحقق' : 'Verification Update',
        description: notification.message || (isArabic ? 'هناك تحديث على حالة توثيق حسابك.' : 'There is an update on your account verification.'),
      };
    default:
      return {
        status: 'success',
        title: isArabic ? 'إشعار' : 'Notification',
        description: notification.message || (isArabic ? 'لديك إشعار جديد.' : 'You have a new notification.'),
      };
  }
}

// Error Boundary Component for notifications. Class components can't call
// hooks, so `locale` is passed in as a prop by the functional wrapper below
// rather than read via useLanguage() here — this page used to be 100%
// hardcoded English (the only page in the app that was) including this
// fallback, unlike every other error path in the codebase which is bilingual.
class NotificationErrorBoundary extends React.Component<
  { children: React.ReactNode; locale?: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; locale?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Notification Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isArabic = this.props.locale === 'ar';
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>{isArabic ? 'حدث خطأ أثناء تحميل الإشعارات' : 'Something went wrong with notifications'}</h2>
          <p>{isArabic ? 'نواجه مشكلة في تحميل إشعاراتك. يرجى تحديث الصفحة.' : "We're having trouble loading your notifications. Please refresh the page."}</p>
          <Button onClick={() => this.setState({ hasError: false })} className="mt-3">
            {isArabic ? 'حاول مرة أخرى' : 'Try Again'}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

const NotificationsPageContent: React.FC = () => {
  const {
    notifications,
    filter,
    hasMore,
    setFilter,
    markAsRead,
    markAllAsRead,
    clearAll,
    loadMore,
    setNotifications,
    deleteNotification,
    deleteAllRead
  } = useNotificationStore();

  const { theme } = useAppTheme();
  const { isAuthenticated, token } = useAuth();
  const { locale } = useLanguage();
  const isArabic = locale === 'ar';

  /*
   * Keyed on `locale`, so switching language refetches in the new language and
   * re-derives every title.
   *
   * This was a useEffect + raw fetch guarded by a `hasLoaded` state latch. `locale`
   * was already in its dependency array, but the latch returned early on every run
   * after the first — and because switching language is a client-side navigation the
   * Zustand store is never torn down, so the list kept the PREVIOUS locale's titles
   * and descriptions until a hard refresh.
   *
   * networkMode/retry are deliberate (see CLAUDE.md): the QueryClient default is
   * `retry: 1` with networkMode 'online', which can leave a query permanently
   * unsettled — isLoading false, isError false, data undefined — and this page has to
   * be able to tell "loaded, empty" from "still loading".
   */
  const {
    data: fetchedNotifications,
    isLoading,
  } = useQuery({
    queryKey: ['notifications', locale],
    enabled: Boolean(isAuthenticated && token),
    networkMode: 'always',
    retry: false,
    queryFn: async () => {
      // api (src/utils/api.ts) attaches the bearer token and Accept-Language; the
      // mutation handlers on this page already use it, the GET was the odd one out.
      const { data: payload } = await api.get(`/${locale}/user/notifications`);

      // `getAllNotifications` returns a paginated envelope
      // ({ notifications, unread_count, total, ... }), not a bare array —
      // this used to call `.map()` directly on that object, which throws,
      // so the whole fetch silently failed and the page never showed
      // anything but "No notifications yet".
      const backendNotifications = Array.isArray(payload) ? payload : payload.notifications ?? [];

      // Map backend notifications to frontend format.
      //
      // This used to check ONLY 'credit_approved' / 'credit_rejected' and fall
      // everything else — including 'order_rejected' and 'order_cancelled', which
      // the backend has always sent — to the 'success' branch. A customer whose
      // order was rejected and refunded saw a green checkmark, the same signal as
      // an approval. `deriveNotificationDisplay` below is keyed off the full set of
      // types the backend actually emits (NotificationController.php's
      // create*Notification factories), so a rejection can never present as one.
      return backendNotifications.map((notification: any) => {
        const { status, title, description } = deriveNotificationDisplay(notification, isArabic);
        return {
          id: notification.id,
          status,
          title,
          description,
          date: notification.created_at,
          readStatus: (notification.read_at ? 'read' : 'unread') as NotificationStatus,
          type: (notification.type?.includes('credit') ? 'credit' : 'system') as 'credit' | 'system',
          amount: notification.amount,
          request_id: notification.request_id,
        };
      });
    },
  });

  // The store stays the single source of truth for the list (markAsRead, delete and
  // the header badge all read from it); the query owns fetching.
  useEffect(() => {
    if (fetchedNotifications) {
      setNotifications(fetchedNotifications);
    }
  }, [fetchedNotifications, setNotifications]);

  // Handle deleting a single notification
  const handleDeleteNotification = async (notificationId: number) => {
    if (!isAuthenticated || !token) return;

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/notifications/${notificationId}`;
      console.log('Delete single URL:', url);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // Call backend delete endpoint
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete single response status:', response.status);
      console.log('Delete single response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const responseData = await response.json();
        console.log('Delete single success:', responseData);
        // Remove from local store
        deleteNotification(notificationId);
      } else {
        const errorData = await response.text();
        console.error('Failed to delete notification:', response.status, response.statusText, errorData);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle deleting all read notifications
  const handleDeleteAllRead = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/notifications/delete-read`;
      console.log('Delete all read URL:', url);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // Call backend delete all read endpoint
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete all read response status:', response.status);
      console.log('Delete all read response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const responseData = await response.json();
        console.log('Delete all read success:', responseData);
        // Remove all read notifications from local store
        deleteAllRead();
      } else {
        const errorData = await response.text();
        console.error('Failed to delete read notifications:', response.status, response.statusText, errorData);
      }
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  // `POST /user/notifications/{id}/read` and `/read-all` both already existed
  // on the backend and were never called — markAsRead/markAllAsRead only ever
  // updated the local Zustand store, so a notification marked read here came
  // back unread on the next real fetch (or on another device).
  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
    if (!token) return;
    api.post(`/user/notifications/${id}/read`).catch((error) => {
      console.error('Error marking notification as read:', error);
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    if (!token) return;
    api.post('/user/notifications/read-all').catch((error) => {
      console.error('Error marking all notifications as read:', error);
    });
  };

  // Both formatters used to be private copies here that hardcoded 'en-US' and
  // returned the literal English strings 'Invalid Date' / 'Unknown Date' / 'Today' /
  // 'Yesterday' in BOTH locales — the shared helpers in utils/date.ts take the app
  // locale and are used by the rest of the dashboard.
  const formatDate = (dateString: string) => formatDateTime(dateString, locale);

  const formatDateHeader = (dateString: string) => {
    if (!dateString) return formatDateHeading(dateString, locale);

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return formatDateHeading(dateString, locale);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return isArabic ? 'اليوم' : 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return isArabic ? 'أمس' : 'Yesterday';
    }
    return formatDateHeading(dateString, locale);
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (filter === 'all') return true;
      if (filter === 'credits') return notification.type === 'credit';
      return notification.status === filter;
    });
  }, [notifications, filter]);

  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: typeof notifications } = {};
    filteredNotifications.forEach(notification => {
      try {
        if (!notification || !notification.date) {
          console.warn('Invalid notification or missing date:', notification);
          return;
        }
        const date = new Date(notification.date);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date in notification:', notification.date);
          return;
        }
        const dateKey = date.toDateString();
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(notification);
      } catch (error) {
        console.error('Error grouping notification:', error, notification);
      }
    });
    return groups;
  }, [filteredNotifications]);

  const hasNotifications = notifications.length > 0;

  return (
    <PageWrapper className={theme === 'dark' ? 'dark' : 'light'}>
      <MainContent>
        <HeaderContainer>
          <Header>{isArabic ? 'الإشعارات' : 'NOTIFICATIONS'}</Header>
          {hasNotifications && (
            <ButtonGroup>
              <ActionButton onClick={handleMarkAllAsRead}>
                <ActionContent>
                  <ActionTitle>{isArabic ? 'تعليم الكل كمقروء' : 'Mark All as Read'}</ActionTitle>
                  <ActionBadge>{notifications.filter(n => n.readStatus !== 'read').length}</ActionBadge>
                </ActionContent>
              </ActionButton>
              <ActionButton onClick={handleDeleteAllRead}>
                <ActionContent>
                  <ActionTitle>{isArabic ? 'حذف المقروء' : 'Delete Read'}</ActionTitle>
                  <ActionBadge>{notifications.filter(n => n.readStatus === 'read').length}</ActionBadge>
                </ActionContent>
              </ActionButton>
              <ActionButton onClick={clearAll}>
                <ActionContent>
                  <ActionTitle>{isArabic ? 'حذف الكل' : 'Clear All'}</ActionTitle>
                  <ActionBadge>{notifications.length}</ActionBadge>
                </ActionContent>
              </ActionButton>
            </ButtonGroup>
          )}
        </HeaderContainer>

        <FilterContainer>
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            <StatusDot status="all" />
            <span>{isArabic ? 'الكل' : 'All'}</span>
          </FilterButton>
          <FilterButton
            active={filter === 'success'}
            onClick={() => setFilter('success')}
          >
            <StatusDot status="success" />
            <span>{isArabic ? 'ناجح' : 'Success'}</span>
          </FilterButton>
          <FilterButton
            active={filter === 'rejected'}
            onClick={() => setFilter('rejected')}
          >
            <StatusDot status="rejected" />
            <span>{isArabic ? 'مرفوض' : 'Rejected'}</span>
          </FilterButton>
          <FilterButton
            active={filter === 'credits'}
            onClick={() => setFilter('credits')}
          >
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#3B82F6',
              borderRadius: '50%'
            }} />
            <span>{isArabic ? 'الرصيد' : 'Credits'}</span>
          </FilterButton>
        </FilterContainer>

        <ListArea>
          {isLoading ? (
            <EmptyState>
              <span className="empty-icon">⏳</span>
              <span className="empty-text">{isArabic ? 'جارٍ تحميل الإشعارات...' : 'Loading notifications...'}</span>
            </EmptyState>
          ) : hasNotifications ? (
            <>
              {Object.entries(groupedNotifications).map(([date, notifications]) => (
                <NotificationGroup key={date}>
                  <DateHeader>{formatDateHeader(date)}</DateHeader>
                  <NotificationList>
                    {notifications.map((notif) => (
                      <NotificationCard
                        key={notif.id}
                        read={notif.readStatus === 'read'}
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        <NotifLeft>
                          <StatusIconContainer>
                            <StatusEllipse status={notif.status} />
                            {notif.status === 'success' ? (
                              <StatusSvgCheck viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="12" fill="none" />
                                <StatusCheckVector d="M7 13l3 3 7-7" />
                              </StatusSvgCheck>
                            ) : (
                              <StatusSvgClose viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="12" fill="none" />
                                <StatusCloseVector d="M8 8l8 8M16 8l-8 8" />
                              </StatusSvgClose>
                            )}
                          </StatusIconContainer>
                          <NotifTexts>
                            <NotifTitle>{notif.title}</NotifTitle>
                            <NotifDesc>{notif.description}</NotifDesc>
                            {/* Credit-specific information */}
                            {/* {notif.type === 'credit' && notif.amount && (
                              <CreditInfo status={notif.status}>
                                <CreditAmount>
                                  ${notif.amount}
                                </CreditAmount>
                                {notif.request_id && (
                                  <RequestId>
                                    Request #{notif.request_id.toString().slice(-6)}
                                  </RequestId>
                                )}
                              </CreditInfo>
                            )} */}
                          </NotifTexts>
                        </NotifLeft>
                        <NotifRight>
                          <NotifDate>{formatDate(notif.date)}</NotifDate>
                          <DeleteButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notif.id);
                            }}
                            title={isArabic ? 'حذف الإشعار' : 'Delete notification'}
                            aria-label={isArabic ? 'حذف الإشعار' : 'Delete notification'}
                          >
                            ×
                          </DeleteButton>
                        </NotifRight>
                      </NotificationCard>
                    ))}
                  </NotificationList>
                </NotificationGroup>
              ))}
              {hasMore && (
                <LoadMoreButton onClick={loadMore}>
                  {isArabic ? 'تحميل المزيد' : 'Load More'}
                </LoadMoreButton>
              )}
            </>
          ) : (
            <EmptyState>
              <span className="empty-icon">🔔</span>
              <span className="empty-text">{isArabic ? 'لا توجد إشعارات بعد' : 'No notifications yet'}</span>
            </EmptyState>
          )}
        </ListArea>
      </MainContent>
    </PageWrapper>
  );
};

/*
 * This page used to render standalone (no DashboardLayout — see the page
 * component below), so PageWrapper supplied its own full-viewport background,
 * padding and font. Now that it sits inside DashboardLayout's card, all three
 * are supplied by the parent; keeping them here as well would have meant
 * double padding and a min-height:100vh child inside an already-sized card,
 * pushing the footer far below the content on every page shorter than a full
 * screen. font-family: inherit picks up the real font-sans/font-arabic set on
 * <body> (src/lib/fonts.ts) — the 'Roboto' this declared was never loaded to
 * begin with.
 */
const PageWrapper = styled.div`
  font-family: inherit;
`;

const MainContent = styled.div`
  width: 100%;
`;

const HeaderContainer = styled.div`
  width: 100%;
  margin: 0 auto 30px auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const Header = styled.h1`
  color: #E73828;
  font-size: 36px;
  font-weight: 600;
  line-height: 42px;
  text-transform: uppercase;
  letter-spacing: 1px;
  /* "start"/"end", not left/right: this file is styled-components, so the rtl:
     Tailwind variant cannot reach it and these never flipped in Arabic. */
  text-align: start;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 28px;
    line-height: 34px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--color-app-off-white);
  border: 1px solid #E73828;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  .dark & {
    background: var(--color-app-black);
    border: 1px solid #E73828;
  }

  &:hover {
    background: #E73828;
    color: #fff;
  }
`;

const ActionContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionTitle = styled.span`
  font-family: inherit;
  font-size: clamp(11px, 1.2vw, 13px);
  font-weight: 500;
  color: var(--color-app-black);
  transition: color 0.2s ease;

  .dark & {
    color: var(--color-app-white);
  }

  ${ActionButton}:hover & {
    color: white;
  }
`;

const ActionBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: clamp(16px, 1.5vw, 20px);
  height: clamp(16px, 1.5vw, 20px);
  padding: 0 6px;
  background: #E73828;
  border-radius: 10px;
  font-size: clamp(9px, 1vw, 11px);
  font-weight: 500;
  color: white;
  transition: all 0.2s ease;

  ${ActionButton}:hover & {
    background: white;
    color: #E73828;
  }
`;

const FilterContainer = styled.div`
  width: 100%;
  margin: 0 auto 20px auto;
  display: flex;
  gap: 24px;
  padding: 4px;
  flex-wrap: wrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    gap: 16px;
    padding: 4px 0;
    margin-bottom: 16px;
  }
`;

const FilterButton = styled.button<{ active: boolean }>`
  position: relative;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: none;
  color: ${props => props.active ? '#E73828' : 'var(--color-app-black)'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s ease;
  white-space: nowrap;

  .dark & {
    color: ${props => props.active ? '#E73828' : 'var(--color-app-white)'};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${props => props.active ? '#E73828' : 'transparent'};
    transition: background 0.2s ease;
  }

  &:hover {
    color: #E73828;
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px 12px;
  }
`;

const StatusDot = styled.div<{ status: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch(props.status) {
      case 'success': return '#5FD568';
      case 'rejected': return '#E73828';
      default: return '#666';
    }
  }};
  flex-shrink: 0;
`;

const ListArea = styled.div`
  width: 100%;
  min-height: 523px;
  margin: 0 auto;

  @media (max-width: 768px) {
    min-height: auto;
  }
`;

const NotificationGroup = styled.div`
  margin-bottom: 24px;
`;

const DateHeader = styled.h2`
  color: var(--color-app-black);
  font-size: clamp(16px, 2vw, 20px);
  font-weight: 500;
  margin: 0 0 16px 20px;

  .dark & {
    color: var(--color-app-white);
  }

  @media (max-width: 768px) {
    margin: 0 0 12px 12px;
  }
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const NotificationCard = styled.div<{ read: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  gap: 10px;
  width: 100%;
  min-height: 72px;
  background: ${props => props.read ? 'var(--color-app-off-white)' : '#F3F3F3'};
  border-radius: 50.5px;
  transition: all 0.2s;
  box-sizing: border-box;
  cursor: pointer;

  .dark & {
    background: ${props => props.read ? 'var(--color-app-black)' : '#1a1a1a'};
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: ${props => props.read ? 'var(--color-app-off-white)' : '#E8E8E8'};

    .dark & {
      background: ${props => props.read ? 'var(--color-app-black)' : '#2a2a2a'};
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.05);
    }
  }

  @media (max-width: 768px) {
    padding: 14px 10px;
    border-radius: 50.5px;
    min-height: 64px;
    max-height: 64px;
  }
`;

const NotifLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 420px;
  min-height: 37px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const StatusIconContainer = styled.div`
  width: 36px;
  height: 36px;
  position: relative;
  flex: none;
  order: 0;
  flex-grow: 0;
`;

const StatusEllipse = styled.div<{ status: string }>`
  position: absolute;
  width: 36px;
  height: 36px;
  inset-inline-start: 0px;
  top: 0px;
  border-radius: 50%;
  background: ${({ status }) => status === 'success' ? '#5FD568' : '#E73828'};

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

const StatusSvgCheck = styled.svg`
  position: absolute;
  width: 24px;
  height: 24px;
  inset-inline-start: 6px;
  top: 6px;

  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    inset-inline-start: 5px;
    top: 5px;
  }
`;

const StatusCheckVector = styled.path`
  stroke: #fff;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  background: #fff;
  filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.25));
`;

const StatusSvgClose = styled.svg`
  position: absolute;
  width: 24px;
  height: 24px;
  inset-inline-start: 6px;
  top: 6px;

  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    inset-inline-start: 5px;
    top: 5px;
  }
`;

const StatusCloseVector = styled.path`
  stroke: #fff;
  stroke-width: 2.5;
  stroke-linecap: round;
  fill: none;
`;

const NotifTexts = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  max-width: 350px;
  min-height: 37px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const NotifTitle = styled.div`
  font-family: inherit;
  font-style: normal;
  font-weight: 700;
  font-size: clamp(14px, 2vw, 20px);
  line-height: 1.2;
  color: #E73828;
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const NotifDesc = styled.div`
  font-family: inherit;
  font-style: normal;
  font-weight: 400;
  font-size: clamp(12px, 1.5vw, 16px);
  line-height: 1.2;
  color: var(--color-app-black);
  width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;

  .dark & {
    color: var(--color-app-white);
  }
`;

const NotifRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
`;

const NotifDate = styled.div`
  font-family: inherit;
  font-style: normal;
  font-weight: 500;
  font-size: clamp(12px, 1.5vw, 16px);
  line-height: 1.2;
  color: var(--color-app-black);
  text-align: end;
  white-space: nowrap;

  .dark & {
    color: var(--color-app-white);
  }
`;

const DeleteButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #E73828;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;
  opacity: 0.7;

  &:hover {
    opacity: 1;
    background: #d32f2f;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  max-width: 1180px;
  padding: 12px;
  margin: 20px auto;
  border-radius: 50.5px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  color: var(--color-app-black);
  border: 1px solid var(--color-app-black);

  .dark & {
    color: var(--color-app-white);
    border-color: var(--color-app-white);
  }

  &:hover {
    background: #E73828;
    color: #fff;
    border-color: #E73828;
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px;
    border-radius: 25px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin-top: 60px;
  .empty-icon {
    font-size: 3rem;
    color: #E73828;
    margin-bottom: 12px;
  }
  .empty-text {
    color: var(--color-app-black);
    font-size: 1.1rem;
    font-weight: 500;

    .dark & {
      color: var(--color-app-white);
    }
  }

  @media (max-width: 768px) {
    margin-top: 40px;
    .empty-icon {
      font-size: 2.5rem;
    }
    .empty-text {
      font-size: 1rem;
    }
  }
`;

// Credit-specific styled components
const CreditInfo = styled.div<{ status: 'success' | 'rejected' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: ${props => 
    props.status === 'success' 
      ? 'rgba(34, 197, 94, 0.1)' 
      : 'rgba(239, 68, 68, 0.1)'
  };
  border: 1px solid ${props => 
    props.status === 'success' 
      ? 'rgba(34, 197, 94, 0.2)' 
      : 'rgba(239, 68, 68, 0.2)'
  };
`;

const CreditAmount = styled.span`
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--color-app-black);
  
  .dark & {
    color: var(--color-app-white);
  }
`;

const RequestId = styled.span`
  font-size: 0.85rem;
  color: #666;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  
  .dark & {
    color: #ccc;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const NotificationsPage: React.FC = () => {
  const { locale } = useLanguage();
  return (
    <DashboardLayout>
      <NotificationErrorBoundary locale={locale}>
        <NotificationsPageContent />
      </NotificationErrorBoundary>
    </DashboardLayout>
  );
};

export default NotificationsPage;