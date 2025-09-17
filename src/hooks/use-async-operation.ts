import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAsyncOperationOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAsyncOperation<T extends any[]>(
  operation: (...args: T) => Promise<any>,
  options: UseAsyncOperationOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    onSuccess,
    onError,
  } = options;

  const execute = useCallback(async (...args: T) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await operation(...args);
      
      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      
      onSuccess?.();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [operation, showSuccessToast, showErrorToast, successMessage, onSuccess, onError, toast]);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    execute,
    isLoading,
    error,
    reset,
  };
}

// Specialized hook for form submissions
export function useFormSubmission<T extends any[]>(
  submitOperation: (...args: T) => Promise<any>,
  options: UseAsyncOperationOptions = {}
) {
  return useAsyncOperation(submitOperation, {
    successMessage: 'Form submitted successfully',
    ...options,
  });
}

// Specialized hook for data fetching
export function useDataFetch<T extends any[]>(
  fetchOperation: (...args: T) => Promise<any>,
  options: UseAsyncOperationOptions = {}
) {
  return useAsyncOperation(fetchOperation, {
    showSuccessToast: false, // Don't show toast for successful fetches
    ...options,
  });
}