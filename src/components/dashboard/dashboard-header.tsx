'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/user-nav';
import { SyncStatus } from '@/components/sync-status';
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
import { AddClientSheet } from '@/components/clients/add-client-sheet';
import { AddQuoteSheet } from '@/components/quotes/add-quote-sheet';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useBusinessProfile } from '@/hooks/use-business-profile-v2';
import { useAppStore } from '@/lib/data';

export function DashboardHeader() {
    const { activeWorkspace } = useActiveWorkspace();
    const { user } = useAuth();
    const { getDisplayName } = useBusinessProfile();
    const [greeting, setGreeting] = React.useState('');

    React.useEffect(() => {
        const now = new Date();
        const hour = now.getHours();
        if (hour < 12) {
            setGreeting('Good morning');
        } else if (hour < 18) {
            setGreeting('Good afternoon');
        } else {
            setGreeting('Good evening');
        }
    }, []);

    // Get the display name based on the active workspace
    const displayName = React.useMemo(() => {
        if (activeWorkspace === 'business') {
            return getDisplayName();
        }
        return user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
    }, [activeWorkspace, getDisplayName, user]);

    return (
        <div className="container-padding pt-6 pb-4 sm:pt-8 sm:pb-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search transactions, bills..."
                            className="w-full pl-10 pr-4 h-11 bg-background/50 border-border/50 rounded-xl focus:bg-background transition-all duration-200 shadow-sm"
                        />
                    </div>
                </div>
                <div className='flex items-center gap-3'>
                    <div className="hidden sm:block">
                        <SyncStatus />
                    </div>
                    <UserNav />
                </div>
            </header>
            
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        {greeting}, {displayName}!
                    </h1>
                    <div className="hidden sm:block text-2xl">👋</div>
                </div>
                <p className="text-muted-foreground text-lg font-medium">
                    {activeWorkspace === 'personal' 
                        ? "Here's a summary of your financial activity."
                        : `Here's an overview of your business performance.`
                    }
                </p>
                
                {/* Quick actions for mobile */}
                <div className="flex sm:hidden items-center gap-2 pt-4">
                    <div className="flex-1">
                        <SyncStatus />
                    </div>
                    {activeWorkspace === 'personal' ? (
                        <AddTransactionSheet />
                    ) : (
                        <div className="flex gap-2">
                            <AddClientSheet />
                            <AddQuoteSheet />
                        </div>
                    )}
                </div>
                
                {/* Quick actions for desktop */}
                <div className="hidden sm:flex items-center gap-3 pt-2">
                    {activeWorkspace === 'personal' ? (
                        <AddTransactionSheet />
                    ) : (
                        <>
                           <AddClientSheet />
                           <AddQuoteSheet />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}