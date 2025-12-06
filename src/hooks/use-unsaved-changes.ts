import { useEffect, useState } from 'react';

/**
 * Hook to warn users before leaving the page with unsaved changes
 * Monitors the offline sync queue and shows browser warning
 */
export function useUnsavedChangesWarning() {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const checkUnsavedChanges = () => {
            if (typeof window === 'undefined') return false;

            const saved = localStorage.getItem('db-sync-queue');
            if (saved) {
                try {
                    const queue = JSON.parse(saved);
                    const hasChanges = queue.length > 0;
                    setHasUnsavedChanges(hasChanges);
                    return hasChanges;
                } catch (error) {
                    setHasUnsavedChanges(false);
                    return false;
                }
            }
            setHasUnsavedChanges(false);
            return false;
        };

        // Check immediately
        checkUnsavedChanges();

        // Check periodically
        const interval = setInterval(checkUnsavedChanges, 1000);

        // Warn before leaving
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (checkUnsavedChanges()) {
                e.preventDefault();
                // Modern browsers require returnValue to be set
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return hasUnsavedChanges;
}

/**
 * Hook to get the count of unsaved changes
 */
export function useUnsavedChangesCount() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const checkCount = () => {
            if (typeof window === 'undefined') return;

            const saved = localStorage.getItem('db-sync-queue');
            if (saved) {
                try {
                    const queue = JSON.parse(saved);
                    setCount(queue.length || 0);
                } catch (error) {
                    setCount(0);
                }
            } else {
                setCount(0);
            }
        };

        checkCount();
        const interval = setInterval(checkCount, 1000);

        return () => clearInterval(interval);
    }, []);

    return count;
}

/**
 * Hook to monitor sync status
 */
export function useSyncStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const unsavedCount = useUnsavedChangesCount();

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return {
        isOnline,
        isSyncing,
        unsavedCount,
        hasUnsavedChanges: unsavedCount > 0,
    };
}
