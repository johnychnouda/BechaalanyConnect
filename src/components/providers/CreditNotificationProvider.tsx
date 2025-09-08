import React from 'react';
import { useCreditNotifications } from '@/hooks/use-credit-notifications';

interface CreditNotificationProviderProps {
  children: React.ReactNode;
}

/**
 * Error Boundary for Credit Notifications
 */
class CreditNotificationErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Credit Notification Provider Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // If credit notifications fail, still render the app without them
      console.warn('Credit notifications disabled due to error');
      return this.props.children;
    }

    return this.props.children;
  }
}

function CreditNotificationLogic() {
  try {
    // Initialize credit notifications with error handling
    // Temporarily disabled for testing
    // useCreditNotifications();
  } catch (error) {
    console.error('Error initializing credit notifications:', error);
  }
  return null;
}

/**
 * Provider component that handles credit notifications
 * This should be placed inside AuthProvider but outside specific pages
 */
export default function CreditNotificationProvider({ children }: CreditNotificationProviderProps) {
  return (
    <CreditNotificationErrorBoundary>
      <CreditNotificationLogic />
      {children}
    </CreditNotificationErrorBoundary>
  );
}
