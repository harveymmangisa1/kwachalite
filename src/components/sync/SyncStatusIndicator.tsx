import { useEffect, useState } from 'react';
import { Cloud, CloudOff, AlertCircle, CheckCircle2, Loader2, WifiOff } from 'lucide-react';
import { supabaseSync } from '@/lib/supabase-sync';
import type { SyncState } from '@/lib/supabase-sync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function SyncStatusIndicator() {
    const [syncState, setSyncState] = useState<SyncState>({
        isOnline: navigator.onLine,
        isSyncing: false,
        lastSyncTime: null,
        syncError: null,
    });
    const [queueLength, setQueueLength] = useState(0);

    useEffect(() => {
        // Subscribe to sync state changes
        const unsubscribe = supabaseSync.onSyncStateChange((state) => {
            setSyncState(state);
        });

        // Check offline queue length
        const checkQueue = () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('db-sync-queue');
                if (saved) {
                    try {
                        const queue = JSON.parse(saved);
                        setQueueLength(queue.length || 0);
                    } catch (error) {
                        setQueueLength(0);
                    }
                } else {
                    setQueueLength(0);
                }
            }
        };

        checkQueue();
        const interval = setInterval(checkQueue, 2000); // Check every 2 seconds

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const getStatusInfo = () => {
        if (!syncState.isOnline) {
            return {
                icon: <WifiOff className="w-4 h-4" />,
                label: 'Offline',
                color: 'bg-neutral-500',
                description: `${queueLength} changes queued for sync`,
            };
        }

        if (syncState.isSyncing) {
            return {
                icon: <Loader2 className="w-4 h-4 animate-spin" />,
                label: 'Syncing',
                color: 'bg-primary-500',
                description: 'Syncing your data...',
            };
        }

        if (syncState.syncError) {
            return {
                icon: <AlertCircle className="w-4 h-4" />,
                label: 'Sync Error',
                color: 'bg-error-500',
                description: syncState.syncError,
            };
        }

        if (queueLength > 0) {
            return {
                icon: <CloudOff className="w-4 h-4" />,
                label: 'Pending',
                color: 'bg-warning-500',
                description: `${queueLength} changes waiting to sync`,
            };
        }

        return {
            icon: <CheckCircle2 className="w-4 h-4" />,
            label: 'Synced',
            color: 'bg-success-500',
            description: syncState.lastSyncTime
                ? `Last synced ${getTimeAgo(syncState.lastSyncTime)}`
                : 'All changes saved',
        };
    };

    const status = getStatusInfo();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        variant="secondary"
                        className={`${status.color} text-white border-0 cursor-help`}
                    >
                        {status.icon}
                        <span className="ml-1.5 hidden sm:inline">{status.label}</span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-sm">{status.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Compact version for mobile
export function SyncStatusBadge() {
    const [queueLength, setQueueLength] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const checkQueue = () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('db-sync-queue');
                if (saved) {
                    try {
                        const queue = JSON.parse(saved);
                        setQueueLength(queue.length || 0);
                    } catch (error) {
                        setQueueLength(0);
                    }
                } else {
                    setQueueLength(0);
                }
            }
        };

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        checkQueue();
        const interval = setInterval(checkQueue, 2000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    if (queueLength === 0 && isOnline) return null;

    return (
        <Badge variant="secondary" className="bg-warning-500 text-white border-0">
            <Cloud className="w-3 h-3 mr-1" />
            {queueLength} pending
        </Badge>
    );
}

// Full sync status panel for settings/dashboard
export function SyncStatusPanel() {
    const [syncState, setSyncState] = useState<SyncState>({
        isOnline: navigator.onLine,
        isSyncing: false,
        lastSyncTime: null,
        syncError: null,
    });
    const [queueLength, setQueueLength] = useState(0);
    const [queueDetails, setQueueDetails] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = supabaseSync.onSyncStateChange((state) => {
            setSyncState(state);
        });

        const checkQueue = () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('db-sync-queue');
                if (saved) {
                    try {
                        const queue = JSON.parse(saved);
                        setQueueLength(queue.length || 0);
                        setQueueDetails(queue || []);
                    } catch (error) {
                        setQueueLength(0);
                        setQueueDetails([]);
                    }
                } else {
                    setQueueLength(0);
                    setQueueDetails([]);
                }
            }
        };

        checkQueue();
        const interval = setInterval(checkQueue, 2000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const handleRetrySync = async () => {
        // Trigger manual sync
        window.location.reload();
    };

    return (
        <div className="space-y-4">
            {/* Status Overview */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {syncState.isOnline ? (
                        <Cloud className="w-5 h-5 text-success-500" />
                    ) : (
                        <CloudOff className="w-5 h-5 text-neutral-400" />
                    )}
                    <div>
                        <h3 className="font-semibold text-neutral-900">
                            {syncState.isOnline ? 'Connected' : 'Offline'}
                        </h3>
                        <p className="text-sm text-neutral-600">
                            {syncState.lastSyncTime
                                ? `Last synced ${getTimeAgo(syncState.lastSyncTime)}`
                                : 'Never synced'}
                        </p>
                    </div>
                </div>

                {syncState.isSyncing && (
                    <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                )}
            </div>

            {/* Error Alert */}
            {syncState.syncError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Sync Error</AlertTitle>
                    <AlertDescription>{syncState.syncError}</AlertDescription>
                </Alert>
            )}

            {/* Pending Changes */}
            {queueLength > 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Pending Changes</AlertTitle>
                    <AlertDescription>
                        You have {queueLength} unsaved change{queueLength !== 1 ? 's' : ''}{' '}
                        waiting to sync.
                        {!syncState.isOnline && (
                            <span className="block mt-2 text-warning-600">
                                Changes will sync automatically when you're back online.
                            </span>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* Queue Details */}
            {queueDetails.length > 0 && (
                <div className="bg-neutral-50 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-neutral-700 mb-3">
                        Pending Operations
                    </h4>
                    <div className="space-y-2">
                        {queueDetails.slice(0, 5).map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                            >
                                <span className="text-neutral-600">
                                    {item.operation} {item.collection}
                                </span>
                                <span className="text-neutral-400 text-xs">
                                    {getTimeAgo(new Date(item.timestamp))}
                                </span>
                            </div>
                        ))}
                        {queueDetails.length > 5 && (
                            <p className="text-xs text-neutral-500 mt-2">
                                +{queueDetails.length - 5} more
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Retry Button */}
            {syncState.syncError && (
                <Button onClick={handleRetrySync} className="w-full">
                    Retry Sync
                </Button>
            )}
        </div>
    );
}

// Helper function to get time ago
function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}
