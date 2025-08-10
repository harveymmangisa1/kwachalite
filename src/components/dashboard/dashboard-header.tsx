
'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/user-nav';
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
import { AddClientSheet } from '@/components/clients/add-client-sheet';
import { AddQuoteSheet } from '@/components/quotes/add-quote-sheet';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import React from 'react';

export function DashboardHeader() {
    const { activeWorkspace } = useActiveWorkspace();
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

    return (
        <div className="flex flex-col gap-4 mb-6 px-4 pt-4 sm:px-6 sm:pt-0">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent">
                <div className="relative flex-1 md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                    />
                </div>
                <div className='sm:hidden'>
                    <UserNav />
                </div>
            </header>
            <div className="flex items-center justify-between">
                <div className="grid gap-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {greeting}, John!
                    </h1>
                    <p className="text-muted-foreground">
                        {activeWorkspace === 'personal' 
                            ? "Here's a summary of your financial activity."
                            : "An overview of your business performance."
                        }
                    </p>
                </div>
                <div className="flex items-center gap-2">
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
