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
  const lastPollTime = useRef<number>(0);
  const mountTimeRef = useRef<number>(Date.now());
  const instanceId = useRef<string>(`poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // Production-specific settings
  const isProduction = process.env.NODE_ENV === 'production';
  const minPollInterval = isProduction ? 45000 : 30000; // Longer interval in production (45s vs 30s)
  const circuitBreakerRef = useRef<{ isOpen: boolean; lastFailTime: number; failCount: number }>({
    isOpen: false,
    lastFailTime: 0,
    failCount: 0
  });

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
      const currentTime = Date.now();
      const timeSinceLastPoll = currentTime - lastPollTime.current;
      
      // Enforce minimum interval between polls (production safety)
      if (timeSinceLastPoll < minPollInterval) {
        console.log(`[${instanceId.current}] Skipping poll - too soon (${timeSinceLastPoll}ms < ${minPollInterval}ms)`);
        return;
      }
      
      // Prevent concurrent polling
      if (isPolling.current) {
        console.log(`[${instanceId.current}] Skipping poll - already in progress`);
        return;
      }
      
      // Stop polling if too many consecutive errors
      if (consecutiveErrors.current >= maxErrors) {
        console.error(`[${instanceId.current}] Too many consecutive errors (${consecutiveErrors.current}), stopping credit notification polling`);
        return;
      }
      
      // Circuit breaker pattern - if we're in production and have had too many failures recently
      if (isProduction && circuitBreakerRef.current.isOpen) {
        const timeSinceLastFail = currentTime - circuitBreakerRef.current.lastFailTime;
        const recoveryTime = 5 * 60 * 1000; // 5 minutes
        
        if (timeSinceLastFail < recoveryTime) {
          console.warn(`[${instanceId.current}] Circuit breaker is open - skipping poll (${Math.round((recoveryTime - timeSinceLastFail) / 1000)}s until retry)`);
          return;
        } else {
          // Try to close circuit breaker
          console.log(`[${instanceId.current}] Attempting to close circuit breaker after ${Math.round(timeSinceLastFail / 1000)}s`);
          circuitBreakerRef.current.isOpen = false;
          circuitBreakerRef.current.failCount = 0;
        }
      }
      
      isPolling.current = true;
      lastPollTime.current = currentTime;
      
      // Production debugging
      if (isProduction) {
        console.log(`[${instanceId.current}] Starting poll #${Date.now()} - Processed: ${processedNotifications.current.size}, Errors: ${consecutiveErrors.current}`);
      }
      
      try {
        // Add cache-busting and request tracking for production
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/notifications/credits`;
        const requestHeaders = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Request-ID': `${instanceId.current}-${currentTime}`,
        };
        
        if (isProduction) {
          console.log(`[${instanceId.current}] Fetching: ${apiUrl}`);
        }
        
        const response = await fetch(apiUrl, {
          headers: requestHeaders,
          // Add timeout for production
          signal: AbortSignal.timeout(isProduction ? 15000 : 10000),
        });

        if (response.ok) {
          const notifications: CreditNotification[] = await response.json();
          
          if (!Array.isArray(notifications)) {
            console.error(`[${instanceId.current}] Expected notifications array but got:`, typeof notifications, notifications);
            consecutiveErrors.current += 1;
            return;
          }
          
          if (isProduction) {
            console.log(`[${instanceId.current}] Received ${notifications.length} notifications from API`);
          }
          
          // Filter out already processed notifications to prevent infinite loops
          const newNotifications = notifications.filter(notification => {
            if (!notification || !notification.request_id) {
              return false;
            }
            
            // Create unique identifier for this notification using both request_id and backend notification id
            const notificationId = `${notification.request_id}-${notification.type}-${notification.id}`;
            
            // Check if already processed
            if (processedNotifications.current.has(notificationId)) {
              return false;
            }
            
            return true;
          });

          if (newNotifications.length === 0) {
            if (isProduction) {
              console.log(`[${instanceId.current}] No new credit notifications to process (${notifications.length} total, ${processedNotifications.current.size} already processed)`);
            }
          } else {
            console.log(`[${instanceId.current}] Processing ${newNotifications.length} new credit notifications (${notifications.length} total received)`);
          }

          newNotifications.forEach(async (notification, index) => {
            try {
              console.log(`[${instanceId.current}] Processing credit notification ${index + 1}/${newNotifications.length}:`, {
                id: notification.id,
                type: notification.type,
                request_id: notification.request_id,
                amount: notification.amount,
                created_at: notification.created_at
              });
              
              // Create unique identifier for this notification using both request_id and backend notification id
              const notificationId = `${notification.request_id}-${notification.type}-${notification.id}`;
              
              // Mark as processed BEFORE processing to prevent race conditions
              processedNotifications.current.add(notificationId);
              
              if (isProduction) {
                console.log(`[${instanceId.current}] Marked notification as processed:`, notificationId);
              }
              
              switch (notification.type) {
                case 'credit_approved':
                  if (notification.amount && notification.amount > 0) {
                    console.log(`[${instanceId.current}] ✅ Processing credit approval: $${notification.amount} for request ${notification.request_id}`);
                    creditsService.approveCreditRequest(notification.request_id, notification.amount);
                    
                    // Send acknowledgment to backend (optional - helps ensure notification is truly marked as read)
                    try {
                      const ackResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/notifications/${notification.id}/acknowledge`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                          'X-Request-ID': `${instanceId.current}-ack-${Date.now()}`,
                        },
                      });
                      
                      if (isProduction) {
                        console.log(`[${instanceId.current}] Acknowledgment sent for notification ${notification.id}: ${ackResponse.status}`);
                      }
                    } catch (ackError) {
                      console.warn(`[${instanceId.current}] Error sending notification acknowledgment:`, ackError);
                    }
                  } else {
                    console.error(`[${instanceId.current}] Invalid amount for credit approval:`, notification);
                  }
                  break;
                case 'credit_rejected':
                  console.log(`[${instanceId.current}] ❌ Processing credit rejection for request ${notification.request_id}`);
                  creditsService.rejectCreditRequest(notification.request_id);
                  
                  // Send acknowledgment to backend (optional)
                  try {
                    const ackResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/notifications/${notification.id}/acknowledge`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'X-Request-ID': `${instanceId.current}-ack-${Date.now()}`,
                      },
                    });
                    
                    if (isProduction) {
                      console.log(`[${instanceId.current}] Acknowledgment sent for notification ${notification.id}: ${ackResponse.status}`);
                    }
                  } catch (ackError) {
                    console.warn(`[${instanceId.current}] Error sending notification acknowledgment:`, ackError);
                  }
                  break;
                default:
                  console.log(`[${instanceId.current}] ℹ️ Credit status update: ${notification.type} for request ${notification.request_id}`);
              }
            } catch (notificationError) {
              console.error(`[${instanceId.current}] Error processing individual notification:`, notificationError, notification);
              // Remove from processed set if processing failed, so it can be retried
              const notificationId = `${notification.request_id}-${notification.type}-${notification.id}`;
              processedNotifications.current.delete(notificationId);
              consecutiveErrors.current += 1;
            }
          });

          if (newNotifications.length > 0) {
            console.log(`[${instanceId.current}] ✅ Successfully processed ${newNotifications.length} new credit notification(s)`);
          }
          
          // Reset error counter on successful processing
          consecutiveErrors.current = 0;
          
          // Reset circuit breaker on success
          if (circuitBreakerRef.current.isOpen) {
            console.log(`[${instanceId.current}] Closing circuit breaker after successful poll`);
            circuitBreakerRef.current.isOpen = false;
            circuitBreakerRef.current.failCount = 0;
          }
        } else {
          console.warn(`[${instanceId.current}] API response not OK:`, response.status, response.statusText);
          consecutiveErrors.current += 1;
        }
      } catch (error) {
        console.error(`[${instanceId.current}] Failed to fetch credit notifications:`, error);
        consecutiveErrors.current += 1;
        
        // Update circuit breaker state
        if (isProduction) {
          circuitBreakerRef.current.failCount += 1;
          circuitBreakerRef.current.lastFailTime = currentTime;
          
          // Open circuit breaker if too many failures
          if (circuitBreakerRef.current.failCount >= 3) {
            circuitBreakerRef.current.isOpen = true;
            console.error(`[${instanceId.current}] Circuit breaker opened after ${circuitBreakerRef.current.failCount} failures`);
          }
        }
        
        // If too many errors, log warning
        if (consecutiveErrors.current >= maxErrors) {
          console.error(`[${instanceId.current}] Credit notification polling disabled after ${maxErrors} consecutive errors. Please refresh the page.`);
        }
      } finally {
        isPolling.current = false;
        
        if (isProduction) {
          console.log(`[${instanceId.current}] Poll completed - Next poll in ${minPollInterval}ms`);
        }
      }
    };

    // Poll for credit notifications with production-safe interval
    const interval = setInterval(pollForNotifications, minPollInterval);

    // Initial poll with slight delay to avoid race conditions on mount
    const initialDelay = isProduction ? 2000 : 1000;
    const initialTimeout = setTimeout(() => {
      console.log(`[${instanceId.current}] Starting initial poll (${Date.now() - mountTimeRef.current}ms after mount)`);
      pollForNotifications();
    }, initialDelay);

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
      console.log(`[${instanceId.current}] Cleaning up credit notifications polling`);
      clearTimeout(initialTimeout);
      clearInterval(interval);
      clearInterval(cleanupInterval);
      // Reset error counter on cleanup
      consecutiveErrors.current = 0;
      isPolling.current = false;
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
