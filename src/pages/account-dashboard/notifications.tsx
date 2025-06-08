import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNotificationStore } from '@/store/notification.store';

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    filter,
    hasMore,
    setFilter,
    markAsRead,
    markAllAsRead,
    clearAll,
    loadMore
  } = useNotificationStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
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
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => 
      filter === 'all' || notification.status === filter
    );
  }, [notifications, filter]);

  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: typeof notifications } = {};
    filteredNotifications.forEach(notification => {
      const date = new Date(notification.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    return groups;
  }, [filteredNotifications]);

  const hasNotifications = notifications.length > 0;

  return (
    <PageWrapper>
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
        </FilterContainer>

        <ListArea>
          {hasNotifications ? (
            <>
              {Object.entries(groupedNotifications).map(([date, notifications]) => (
                <NotificationGroup key={date}>
                  <DateHeader>{formatDateHeader(date)}</DateHeader>
                  <NotificationList>
                    {notifications.map((notif) => (
                      <NotificationCard 
                        key={notif.id}
                        read={notif.readStatus === 'read'}
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
                          </NotifTexts>
                        </NotifLeft>
                        <NotifDate>{formatDate(notif.date)}</NotifDate>
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
  background: #fff;
  font-family: 'Roboto', Arial, sans-serif;
  padding: 0 16px;

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
  background: #F8F8F8;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #E73828;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ActionContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionTitle = styled.span`
  font-family: 'Roboto';
  font-size: 13px;
  font-weight: 500;
  color: #333;
  transition: color 0.2s ease;

  ${ActionButton}:hover & {
    color: white;
  }
`;

const ActionBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #E73828;
  border-radius: 10px;
  font-size: 11px;
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

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const FilterButton = styled.button<{ active: boolean }>`
  position: relative;
  padding: 8px 0;
  font-family: 'Roboto';
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: none;
  color: ${props => props.active ? '#E73828' : '#666'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s ease;

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
  color: #070707;
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 16px 20px;

  @media (max-width: 768px) {
    font-size: 18px;
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
  padding: 12px 16px;
  gap: 10px;
  width: 100%;
  min-height: 61px;
  background: ${props => props.read ? '#F8F8F8' : '#F3F3F3'};
  border-radius: 50.5px;
  transition: all 0.2s;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
    border-radius: 20px;
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

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
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
  font-size: 20px;
  line-height: 24px;
  color: #E73828;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 20px;
  }
`;

const NotifDesc = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  color: #070707;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 18px;
  }
`;

const NotifDate = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #070707;
  text-align: right;

  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 18px;
    text-align: left;
    margin-top: 8px;
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
  color: #070707;
  border: 1px solid #070707;

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
    color: #888;
    font-size: 1.1rem;
    font-weight: 500;
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

export default NotificationsPage;