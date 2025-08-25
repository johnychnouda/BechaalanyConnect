import { create } from 'zustand';

export type NotificationType = 'success' | 'rejected';
export type NotificationFilterType = NotificationType | 'all' | 'credits';
export type NotificationStatus = 'read' | 'unread';

export interface Notification {
  id: number;
  status: NotificationType;
  title: string;
  description: string;
  date: string;
  readStatus: NotificationStatus;
  type?: 'credit' | 'order' | 'system'; // Add notification category
  amount?: number; // For credit notifications
  request_id?: string; // For credit request tracking
}

interface NotificationStore {
  notifications: Notification[];
  count: number;
  filter: NotificationFilterType;
  page: number;
  hasMore: boolean;
  setFilter: (filter: NotificationFilterType) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void; // Add new notification
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  loadMore: () => void;
}

const initialNotifications: Notification[] = [];

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

  addNotification: (notification) => set((state) => {
    try {
      // Validate required notification fields
      if (!notification || typeof notification !== 'object') {
        console.error('Invalid notification object:', notification);
        return state;
      }

      // Ensure required fields exist with defaults
      const safeNotification = {
        status: notification.status || 'success',
        title: notification.title || 'Notification',
        description: notification.description || '',
        date: notification.date || new Date().toISOString(),
        readStatus: notification.readStatus || 'unread',
        type: notification.type || 'system',
        amount: notification.amount,
        request_id: notification.request_id,
        id: Date.now() + Math.random(), // Generate unique ID
      };

      // Validate the date field
      const testDate = new Date(safeNotification.date);
      if (isNaN(testDate.getTime())) {
        console.warn('Invalid date in notification, using current date:', safeNotification.date);
        safeNotification.date = new Date().toISOString();
      }

      const updatedNotifications = [safeNotification, ...state.notifications];
      return {
        notifications: updatedNotifications,
        count: updatedNotifications.filter(n => n.readStatus === 'unread').length
      };
    } catch (error) {
      console.error('Error adding notification:', error, notification);
      return state; // Return unchanged state if error occurs
    }
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