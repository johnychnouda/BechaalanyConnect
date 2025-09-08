import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useNotificationStore } from '@/store/notification.store';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/hooks/use-language';

// Error Boundary Component for notifications
class NotificationErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
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
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong with notifications</h2>
          <p>We're having trouble loading your notifications. Please refresh the page.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{ 
              padding: '10px 20px', 
              background: '#E73828', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
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
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch notifications from backend on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated || !token || hasLoaded) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${locale}/user/notifications`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const backendNotifications = await response.json();
          
          // Map backend notifications to frontend format
          const mappedNotifications = backendNotifications.map((notification: any) => ({
            id: notification.id,
            status: notification.type === 'credit_approved' ? 'success' : 
                   notification.type === 'credit_rejected' ? 'rejected' : 'success',
            title: notification.type === 'credit_approved' ? 'Credit Request Approved' :
                   notification.type === 'credit_rejected' ? 'Credit Request Rejected' :
                   'Notification',
            description: notification.message || 
                        (notification.type === 'credit_approved' ? `Your credit request has been approved and $${notification.amount} has been added to your balance.` :
                         notification.type === 'credit_rejected' ? `Your credit request for $${notification.amount} has been rejected.` :
                         'You have a new notification.'),
            date: notification.created_at,
            readStatus: notification.read_at ? 'read' : 'unread',
            type: notification.type?.includes('credit') ? 'credit' : 'system',
            amount: notification.amount,
            request_id: notification.request_id,
          }));

          setNotifications(mappedNotifications);
          setHasLoaded(true);
        } else {
          console.error('Failed to fetch notifications:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, token, locale, hasLoaded, setNotifications]);

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

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Invalid Date';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'for dateString:', dateString);
      return 'Invalid Date';
    }
  };

  const formatDateHeader = (dateString: string) => {
    try {
      if (!dateString) return 'Unknown Date';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown Date';
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date header:', error, 'for dateString:', dateString);
      return 'Unknown Date';
    }
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
          <Header>NOTIFICATIONS</Header>
          {hasNotifications && (
            <ButtonGroup>
              <ActionButton onClick={markAllAsRead}>
                <ActionContent>
                  <ActionTitle>Mark All as Read</ActionTitle>
                  <ActionBadge>{notifications.filter(n => n.readStatus !== 'read').length}</ActionBadge>
                </ActionContent>
              </ActionButton>
              <ActionButton onClick={handleDeleteAllRead}>
                <ActionContent>
                  <ActionTitle>Delete Read</ActionTitle>
                  <ActionBadge>{notifications.filter(n => n.readStatus === 'read').length}</ActionBadge>
                </ActionContent>
              </ActionButton>
              <ActionButton onClick={clearAll}>
                <ActionContent>
                  <ActionTitle>Clear All</ActionTitle>
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
            <span>All</span>
          </FilterButton>
          <FilterButton 
            active={filter === 'success'} 
            onClick={() => setFilter('success')}
          >
            <StatusDot status="success" />
            <span>Success</span>
          </FilterButton>
          <FilterButton 
            active={filter === 'rejected'} 
            onClick={() => setFilter('rejected')}
          >
            <StatusDot status="rejected" />
            <span>Rejected</span>
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
            <span>Credits</span>
          </FilterButton>
        </FilterContainer>

        <ListArea>
          {isLoading ? (
            <EmptyState>
              <span className="empty-icon">⏳</span>
              <span className="empty-text">Loading notifications...</span>
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
                        onClick={() => markAsRead(notif.id)}
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
                            title="Delete notification"
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
                  Load More
                </LoadMoreButton>
              )}
            </>
          ) : (
            <EmptyState>
              <span className="empty-icon">🔔</span>
              <span className="empty-text">No notifications yet</span>
            </EmptyState>
          )}
        </ListArea>
      </MainContent>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  min-height: 100vh;
  background: var(--color-background-light);
  font-family: 'Roboto', Arial, sans-serif;
  padding: 0 16px;

  &.dark {
    background: var(--color-background-dark);
  }

  @media (max-width: 768px) {
    padding: 0 12px;
  }
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding-top: 50px;
  min-height: 867px;

  @media (max-width: 768px) {
    padding-top: 30px;
    min-height: auto;
  }
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
  text-align: left;
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
  font-family: 'Roboto';
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
  font-family: 'Roboto';
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
  left: 0px;
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
  left: 6px;
  top: 6px;

  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    left: 5px;
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
  left: 6px;
  top: 6px;

  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    left: 5px;
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
  font-family: 'Roboto';
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
  font-family: 'Roboto';
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
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: clamp(12px, 1.5vw, 16px);
  line-height: 1.2;
  color: var(--color-app-black);
  text-align: right;
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
  font-family: 'Roboto';
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
  return (
    <NotificationErrorBoundary>
      <NotificationsPageContent />
    </NotificationErrorBoundary>
  );
};

export default NotificationsPage;