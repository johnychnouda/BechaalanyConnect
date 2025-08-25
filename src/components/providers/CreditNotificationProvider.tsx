import { useCreditNotifications } from '@/hooks/use-credit-notifications';

interface CreditNotificationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that handles credit notifications
 * This should be placed inside AuthProvider but outside specific pages
 */
export default function CreditNotificationProvider({ children }: CreditNotificationProviderProps) {
  // Initialize credit notifications
  useCreditNotifications();

  return <>{children}</>;
}
