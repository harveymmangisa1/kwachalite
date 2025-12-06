import { useEffect, useState } from 'react';
import { Cloud, AlertCircle, X } from 'lucide-react';
import { useUnsavedChangesCount, useSyncStatus } from '@/hooks/use-unsaved-changes';
import { Button } from '@/components/ui/button';

export function UnsavedChangesNotification() {
    const { unsavedCount, isOnline } = useSyncStatus();
    const [isDismissed, setIsDismissed] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        // Show notification if there are unsaved changes and not dismissed
        if (unsavedCount > 0 && !isDismissed) {
            // Delay showing to avoid flashing on quick saves
            const timer = setTimeout(() => {
                setShowNotification(true);
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            setShowNotification(false);
            setIsDismissed(false); // Reset dismiss when all synced
        }
    }, [unsavedCount, isDismissed]);

    if (!showNotification) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className="bg-white rounded-xl shadow-2xl border border-border p-4 max-w-sm">
                <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${isOnline ? 'bg-warning-100' : 'bg-neutral-100'
                        }`}>
                        {isOnline ? (
                            <Cloud className="w-5 h-5 text-warning-600" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-neutral-600" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-neutral-900">
                            {isOnline ? 'Syncing Changes' : 'Offline Mode'}
                        </h4>
                        <p className="text-sm text-neutral-600 mt-1">
                            {isOnline ? (
                                <>
                                    {unsavedCount} change{unsavedCount !== 1 ? 's' : ''} waiting to sync.
                                    <span className="block text-xs text-neutral-500 mt-1">
                                        Please wait before closing the app.
                                    </span>
                                </>
                            ) : (
                                <>
                                    {unsavedCount} change{unsavedCount !== 1 ? 's' : ''} saved locally.
                                    <span className="block text-xs text-neutral-500 mt-1">
                                        Will sync when you're back online.
                                    </span>
                                </>
                            )}
                        </p>
                    </div>

                    <button
                        onClick={() => setIsDismissed(true)}
                        className="flex-shrink-0 p-1 hover:bg-neutral-100 rounded transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4 text-neutral-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Persistent banner version for critical warnings
export function UnsavedChangesBanner() {
    const { unsavedCount, isOnline } = useSyncStatus();

    // Only show if offline with unsaved changes
    if (isOnline || unsavedCount === 0) return null;

    return (
        <div className="bg-warning-50 border-b border-warning-200">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-warning-900">
                                You're offline with {unsavedCount} unsaved change{unsavedCount !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-warning-700 mt-0.5">
                                Your changes are saved locally and will sync when you reconnect.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
