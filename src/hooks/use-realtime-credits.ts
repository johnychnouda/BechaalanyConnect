import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { creditsService } from '@/services/credits.service';

interface RealtimeMessage {
  type: 'credit_approved' | 'credit_rejected' | 'balance_update';
  data: {
    request_id?: string;
    new_balance?: number;
    amount?: number;
    message?: string;
  };
}

/**
 * Real-time credits updates using WebSocket or Server-Sent Events
 * Choose between WebSocket and SSE based on your backend implementation
 */
export const useRealtimeCredits = () => {
  const { isAuthenticated, token } = useAuth();
  const connectionRef = useRef<WebSocket | EventSource | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    // Option 1: WebSocket Implementation
    const initWebSocket = () => {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/credits?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected for credits updates');
      };

      ws.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          handleRealtimeMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        // Reconnect after 5 seconds
        if (event.code !== 1000) {
          setTimeout(() => {
            if (isAuthenticated) {
              initWebSocket();
            }
          }, 5000);
        }
      };

      connectionRef.current = ws;
    };

    // Option 2: Server-Sent Events Implementation
    const initSSE = () => {
      const sseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stream/credits?token=${token}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        console.log('SSE connected for credits updates');
      };

      eventSource.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          handleRealtimeMessage(message);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        // Reconnect after 5 seconds
        setTimeout(() => {
          if (isAuthenticated) {
            initSSE();
          }
        }, 5000);
      };

      connectionRef.current = eventSource;
    };

    // Choose your implementation based on backend support
    // Comment/uncomment the appropriate initialization
    
    // For WebSocket:
    // initWebSocket();
    
    // For Server-Sent Events:
    // initSSE();

    // Cleanup function
    return () => {
      if (connectionRef.current) {
        if (connectionRef.current instanceof WebSocket) {
          connectionRef.current.close(1000, 'Component unmounting');
        } else if (connectionRef.current instanceof EventSource) {
          connectionRef.current.close();
        }
        connectionRef.current = null;
      }
    };
  }, [isAuthenticated, token]);

  const handleRealtimeMessage = (message: RealtimeMessage) => {
    switch (message.type) {
      case 'credit_approved':
        if (message.data.request_id) {
          creditsService.approveCreditRequest(message.data.request_id);
        }
        break;

      case 'credit_rejected':
        if (message.data.request_id) {
          creditsService.rejectCreditRequest(message.data.request_id);
        }
        break;

      case 'balance_update':
        if (message.data.new_balance !== undefined) {
          creditsService.updateBalance(message.data.new_balance);
        }
        break;

      default:
        console.warn('Unknown realtime message type:', message.type);
    }
  };

  return {
    isConnected: connectionRef.current !== null,
    sendMessage: (data: any) => {
      if (connectionRef.current instanceof WebSocket && connectionRef.current.readyState === WebSocket.OPEN) {
        connectionRef.current.send(JSON.stringify(data));
      }
    },
  };
};

// Export types for backend implementation
export type { RealtimeMessage };
