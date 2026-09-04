import React from 'react';
import { Button } from './primitives/Button';

interface Props {
  children: React.ReactNode;
  locale?: string;
}

interface State {
  hasError: boolean;
}

/**
 * The only React error boundary in the app was local to the notifications
 * page (its own class, `NotificationErrorBoundary`) — a throw anywhere else
 * blanked the whole page with no shell, no way back, and (via Next's default
 * error overlay in production) no localization. This wraps every page in
 * _app.tsx.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isArabic = this.props.locale === 'ar';
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 py-12 text-center bg-background-light dark:bg-background-dark text-app-black dark:text-white">
          <h1 className="text-2xl font-bold">
            {isArabic ? 'حدث خطأ غير متوقع' : 'Something went wrong'}
          </h1>
          <p className="text-neutral-400 dark:text-gray-400 max-w-sm">
            {isArabic
              ? 'نواجه مشكلة في عرض هذه الصفحة. حاول تحديث الصفحة.'
              : "We're having trouble showing this page. Try refreshing."}
          </p>
          <Button onClick={() => window.location.reload()}>
            {isArabic ? 'تحديث الصفحة' : 'Refresh'}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
