import { create } from 'zustand';

export type NotificationType = 'success' | 'rejected';
export type NotificationStatus = 'read' | 'unread';

export interface Notification {
  id: number;
  status: NotificationType;
  title: string;
  description: string;
  date: string;
  readStatus: NotificationStatus;
}

interface NotificationStore {
  notifications: Notification[];
  count: number;
  filter: NotificationType | 'all';
  page: number;
  hasMore: boolean;
  setFilter: (filter: NotificationType | 'all') => void;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  loadMore: () => void;
}

// Dummy data for demonstration
const initialNotifications: Notification[] = [
  {
    id: 1,
    status: 'success',
    title: 'Top-Up Successful',
    description: '$50 has been added to your balance.',
    date: '2025-03-14 18:37:07',
    readStatus: 'unread',
  },
  {
    id: 2,
    status: 'rejected',
    title: 'Top-Up Rejected',
    description: `We're sorry, your top-up of $50 could not be processed. Please try again later or contact support.`,
    date: '2025-03-14 18:37:07',
    readStatus: 'unread',
  },
  {
    id: 3,
    status: 'success',
    title: 'Top-Up Successful',
    description: '$50 has been added to your balance.',
    date: '2025-03-14 18:37:07',
    readStatus: 'unread',
  },
  {
    id: 4,
    status: 'rejected',
    title: 'Top-Up Rejected',
    description: `We're sorry, your top-up of $50 could not be processed. Please try again later or contact support.`,
    date: '2025-03-14 18:37:07',
    readStatus: 'unread',
  },
  {
    id: 5,
    status: 'success',
    title: 'Top-Up Successful',
    description: '$50 has been added to your balance.',
    date: '2025-03-14 18:37:07',
    readStatus: 'unread',
  },
  {
    id: 6,
    status: 'rejected',
    title: 'Top-Up Rejected',
    description: `We're sorry, your top-up of $50 could not be processed. Please try again later or contact support.`,
    date: '2025-03-14 18:37:07',
    readStatus: 'unread',
  },
  {
    id: 7,
    status: 'success',
    title: 'Top-Up Successful',
    description: '$50 has been added to your balance.',
    date: '2025-03-14 18:37:07',
    readStatus: 'unread',
  },
];

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: initialNotifications,
  count: initialNotifications.length,
  filter: 'all',
  page: 1,
  hasMore: false,
  
  setFilter: (filter) => set({ filter, page: 1 }),
  
  setNotifications: (notifications) => set({ 
    notifications,
    count: notifications.filter(n => n.readStatus === 'unread').length
  }),
  
  markAsRead: (id) => set((state) => {
    const updatedNotifications = state.notifications.map(notification =>
      notification.id === id ? { ...notification, readStatus: 'read' as NotificationStatus } : notification
    );
    return {
      notifications: updatedNotifications,
      count: updatedNotifications.filter(n => n.readStatus === 'unread').length
    };
  }),
  
  markAllAsRead: () => set((state) => {
    const updatedNotifications = state.notifications.map(notification => ({
      ...notification,
      readStatus: 'read' as NotificationStatus
    }));
    return {
      notifications: updatedNotifications,
      count: 0
    };
  }),
  
  clearAll: () => set({
    notifications: [],
    count: 0,
    page: 1,
    hasMore: false
  }),
  
  loadMore: () => {
    const { page, notifications } = get();
    // Simulate loading more notifications
    const newPage = page + 1;
    if (newPage <= 3) { // Limit to 3 pages for demo
      const newNotifications = [...notifications, ...initialNotifications.map(n => ({
        ...n,
        id: n.id + (page * initialNotifications.length),
        readStatus: 'unread' as NotificationStatus
      }))];
      set({
        notifications: newNotifications,
        page: newPage,
        hasMore: newPage < 3,
        count: newNotifications.filter(n => n.readStatus === 'unread').length
      });
    }
  }
}));