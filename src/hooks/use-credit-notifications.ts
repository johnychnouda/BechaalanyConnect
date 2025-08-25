import { useEffect, useRef } from 'react';
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
  
  // Track processed notifications to prevent infinite loops
  const processedNotifications = useRef<Set<string>>(new Set());
  const isPolling = useRef<boolean>(false);
  const consecutiveErrors = useRef<number>(0);
  const maxErrors = 5; // Stop polling after 5 consecutive errors

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Clear processed notifications when user logs out
      processedNotifications.current.clear();
      creditsService.clearProcessedRequests();
      consecutiveErrors.current = 0;
      return;
    }

    // Option 1: Long Polling approach - Works with your Laravel backend
    const pollForNotifications = async () => {
      // Prevent concurrent polling
      if (isPolling.current) {
        console.log('Skipping poll - already in progress');
        return;
      }
      
      // Stop polling if too many consecutive errors
      if (consecutiveErrors.current >= maxErrors) {
        console.error('Too many consecutive errors, stopping credit notification polling');
        return;
      }
      
      isPolling.current = true;
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/notifications/credits`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const notifications: CreditNotification[] = await response.json();
          
          if (!Array.isArray(notifications)) {
            console.error('Expected notifications array but got:', notifications);
            return;
          }
          
          // Filter out already processed notifications to prevent infinite loops
          const newNotifications = notifications.filter(notification => {
            if (!notification || !notification.request_id) {
              return false;
            }
            
            // Create unique identifier for this notification
            const notificationId = `${notification.request_id}-${notification.type}`;
            
            // Check if already processed
            if (processedNotifications.current.has(notificationId)) {
              return false;
            }
            
            return true;
          });

          if (newNotifications.length === 0) {
            console.log('No new credit notifications to process');
          } else {
            console.log(`Processing ${newNotifications.length} new credit notifications`);
          }

          newNotifications.forEach((notification) => {
            try {
              console.log('Processing credit notification:', notification);
              
              // Create unique identifier for this notification
              const notificationId = `${notification.request_id}-${notification.type}`;
              
              // Mark as processed BEFORE processing to prevent race conditions
              processedNotifications.current.add(notificationId);
              
              switch (notification.type) {
                case 'credit_approved':
                  if (notification.amount && notification.amount > 0) {
                    creditsService.approveCreditRequest(notification.request_id, notification.amount);
                    console.log(`✅ Credit approved: $${notification.amount} for request ${notification.request_id}`);
                  } else {
                    console.error('Invalid amount for credit approval:', notification);
                  }
                  break;
                case 'credit_rejected':
                  creditsService.rejectCreditRequest(notification.request_id);
                  console.log(`❌ Credit rejected for request ${notification.request_id}`);
                  break;
                default:
                  console.log(`ℹ️ Credit status update: ${notification.type} for request ${notification.request_id}`);
              }
            } catch (notificationError) {
              console.error('Error processing individual notification:', notificationError, notification);
              // Remove from processed set if processing failed, so it can be retried
              const notificationId = `${notification.request_id}-${notification.type}`;
              processedNotifications.current.delete(notificationId);
            }
          });

          if (newNotifications.length > 0) {
            console.log(`Processed ${newNotifications.length} new credit notification(s)`);
          }
          
          // Reset error counter on successful processing
          consecutiveErrors.current = 0;
        }
      } catch (error) {
        console.error('Failed to fetch credit notifications:', error);
        consecutiveErrors.current += 1;
        
        // If too many errors, log warning
        if (consecutiveErrors.current >= maxErrors) {
          console.error(`Credit notification polling disabled after ${maxErrors} consecutive errors. Please refresh the page.`);
        }
      } finally {
        isPolling.current = false;
      }
    };

    // Poll every 30 seconds for credit notifications
    const interval = setInterval(pollForNotifications, 30 * 1000);

    // Initial poll
    pollForNotifications();

    // Cleanup old processed notifications every 10 minutes to prevent memory leaks
    const cleanupInterval = setInterval(() => {
      // Keep only the last 100 processed notifications
      if (processedNotifications.current.size > 100) {
        const array = Array.from(processedNotifications.current);
        const keep = array.slice(-50); // Keep last 50
        processedNotifications.current = new Set(keep);
        console.log('Cleaned up old processed notifications');
      }
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
      // Reset error counter on cleanup
      consecutiveErrors.current = 0;
    };
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
