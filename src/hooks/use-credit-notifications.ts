import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { creditsService } from '@/services/credits.service';

interface CreditNotification {
  id: number;
  type: 'credit_approved' | 'credit_rejected' | 'credit_pending';
  request_id: string;
  amount: number;
  message?: string;
  created_at: string;
}

/**
 * Hook to handle credit-related notifications from the backend
 * This would typically connect to WebSocket, SSE, or polling mechanism
 */
export const useCreditNotifications = () => {
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Option 1: Long Polling approach - Works with your Laravel backend
    const pollForNotifications = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/notifications/credits`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const notifications: CreditNotification[] = await response.json();
          
          notifications.forEach((notification) => {
            console.log('Processing credit notification:', notification);
            
            switch (notification.type) {
              case 'credit_approved':
                creditsService.approveCreditRequest(notification.request_id, notification.amount);
                console.log(`✅ Credit approved: $${notification.amount} for request ${notification.request_id}`);
                break;
              case 'credit_rejected':
                creditsService.rejectCreditRequest(notification.request_id);
                console.log(`❌ Credit rejected for request ${notification.request_id}`);
                break;
              default:
                console.log(`ℹ️ Credit status update: ${notification.type} for request ${notification.request_id}`);
            }
          });

          if (notifications.length > 0) {
            console.log(`Processed ${notifications.length} credit notification(s)`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch credit notifications:', error);
      }
    };

    // Poll every 30 seconds for credit notifications
    const interval = setInterval(pollForNotifications, 30 * 1000);

    // Initial poll
    pollForNotifications();

    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  // Option 2: Server-Sent Events (SSE) - Uncomment and adapt if your backend supports SSE
  /*
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/notifications/stream?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const notification: CreditNotification = JSON.parse(event.data);
        
        switch (notification.type) {
          case 'credit_approved':
            creditsService.approveCreditRequest(notification.request_id);
            break;
          case 'credit_rejected':
            creditsService.rejectCreditRequest(notification.request_id);
            break;
        }
      } catch (error) {
        console.error('Failed to parse SSE notification:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated, token]);
  */

  // Option 3: WebSocket - Uncomment and adapt if your backend supports WebSocket
  /*
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/notifications?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const notification: CreditNotification = JSON.parse(event.data);
        
        switch (notification.type) {
          case 'credit_approved':
            creditsService.approveCreditRequest(notification.request_id);
            break;
          case 'credit_rejected':
            creditsService.rejectCreditRequest(notification.request_id);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket notification:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
    };

    return () => {
      ws.close();
    };
  }, [isAuthenticated, token]);
  */
};

// Export types for backend implementation reference
export type { CreditNotification };
