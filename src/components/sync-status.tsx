'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  WifiOff, 
  Cloud, 
  CloudOff, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { supabaseSync, type SyncState } from '@/lib/supabase-sync';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';

export function SyncStatus() {
  const [syncState, setSyncState] = React.useState<SyncState>(supabaseSync.getSyncState());
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) return;

    const unsubscribe = supabaseSync.onSyncStateChange(setSyncState);
    
    // Initialize sync
    supabaseSync.setUser(user);

    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleRetrySync = () => {
    if (user) {
      supabaseSync.setUser(user);
    }
  };

  const getSyncIcon = () => {
    if (!syncState.isOnline) {
      return <WifiOff className="h-3 w-3" />;
    }
    
    if (syncState.isSyncing) {
      return <Loader2 className="h-3 w-3 animate-spin" />;
    }
    
    if (syncState.syncError) {
      return <AlertCircle className="h-3 w-3" />;
    }
    
    return <CheckCircle2 className="h-3 w-3" />;
  };

  const getSyncVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (!syncState.isOnline) return 'secondary';
    if (syncState.syncError) return 'destructive';
    if (syncState.isSyncing) return 'outline';
    return 'default';
  };

  const getSyncText = () => {
    if (!syncState.isOnline) return 'Offline';
    if (syncState.isSyncing) return 'Syncing...';
    if (syncState.syncError) return 'Sync Error';
    return 'Supabase Synced';
  };

  const getSyncTooltip = () => {
    if (!syncState.isOnline) {
      return 'You are currently offline. Changes will sync with Supabase when connection is restored.';
    }
    
    if (syncState.isSyncing) {
      return 'Synchronizing your data with Supabase cloud...';
    }
    
    if (syncState.syncError) {
      return `Supabase sync error: ${syncState.syncError}. Click to retry.`;
    }
    
    if (syncState.lastSyncTime) {
      return `Last synced to Supabase ${formatDistanceToNow(syncState.lastSyncTime, { addSuffix: true })}`;
    }
    
    return 'Your data is synced with Supabase cloud storage';
  };

  if (!user) return null;

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Badge 
                variant={getSyncVariant()} 
                className="cursor-pointer gap-1 text-xs"
              >
                {getSyncIcon()}
                <span className="hidden sm:inline">{getSyncText()}</span>
              </Badge>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getSyncTooltip()}</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            {syncState.isOnline ? (
              <Cloud className="h-4 w-4 text-blue-500" />
            ) : (
              <CloudOff className="h-4 w-4 text-gray-500" />
            )}
            Supabase Sync Status
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <div className="px-2 py-2 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Connection:</span>
              <div className="flex items-center gap-1">
                {syncState.isOnline ? (
                  <>
                    <Cloud className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Online (Supabase)</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">Offline</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <div className="flex items-center gap-1">
                {getSyncIcon()}
                <span className={`
                  ${syncState.syncError ? 'text-red-600' : 
                    syncState.isSyncing ? 'text-blue-600' : 
                    'text-green-600'}
                `}>
                  {getSyncText()}
                </span>
              </div>
            </div>
            
            {syncState.lastSyncTime && (
              <div className="flex items-center justify-between">
                <span>Last Supabase sync:</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="h-3 w-3 bg-gray-400 rounded-full" />
                  {formatDistanceToNow(syncState.lastSyncTime, { addSuffix: true })}
                </div>
              </div>
            )}
            
            {syncState.syncError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                <strong>Supabase Error:</strong> {syncState.syncError}
              </div>
            )}
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleRetrySync}
            disabled={syncState.isSyncing}
          >
            <Loader2 className={`mr-2 h-4 w-4 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
            {syncState.isSyncing ? 'Syncing to Supabase...' : 'Retry Supabase Sync'}
          </DropdownMenuItem>
          
          {!syncState.isOnline && (
            <div className="px-2 py-2 text-xs text-muted-foreground">
              <p>You're working offline. Your changes will be saved locally and synced to Supabase when you're back online.</p>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}