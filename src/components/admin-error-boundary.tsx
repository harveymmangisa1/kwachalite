'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { trackError } from '@/lib/analytics';
import { useAuth } from '@/hooks/use-auth';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Track the error
    trackError(error, 'React Error Boundary');
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const { user } = useAuth();

  const handleReportError = () => {
    // Track the error with user context
    trackError(error, 'User Reported Error', user?.id);

    // You could also open a support ticket or send to a service like Sentry
    console.error('Error reported:', {
      error: error.message,
      stack: error.stack,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            We're sorry, but something unexpected happened. The error has been logged and our team will look into it.
          </p>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-mono text-gray-700 truncate">
              {error.message}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1" variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleReportError} variant="outline">
              Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for tracking errors in functional components
export const useErrorTracking = () => {
  const { user } = useAuth();

  const trackErrorWithContext = (error: Error, context?: string) => {
    trackError(error, context, user?.id);
  };

  return {
    trackError: trackErrorWithContext,
  };
};

// Default export for convenience
export default ErrorBoundary;