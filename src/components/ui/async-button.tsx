import * as React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

interface AsyncButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const AsyncButton = React.forwardRef<HTMLButtonElement, AsyncButtonProps>(
  ({ className, loading = false, loadingText, children, disabled, ...props }, ref) => {
    return (
      <Button
        className={cn(className)}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <LoadingSpinner 
            size="sm" 
            className="mr-2" 
          />
        )}
        {loading ? (loadingText || 'Loading...') : children}
      </Button>
    );
  }
);

AsyncButton.displayName = 'AsyncButton';

export { AsyncButton };