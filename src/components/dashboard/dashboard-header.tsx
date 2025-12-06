'use client';

import { Search, Briefcase, User2, ChevronDown } from 'lucide-react';
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


export function DashboardHeader() {
    const { activeWorkspace, setActiveWorkspace } = useActiveWorkspace();
    const { user } = useAuth();
    const { getDisplayName } = useBusinessProfile();

return (
        <div className="container-padding pt-6 pb-4 sm:pt-8 sm:pb-6">
            <header className="flex flex-col gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Modern workspace switcher */}
                    <div className="relative">
                        <details className="group">
                            <summary className="list-none">
                                <button
                                  className="inline-flex items-center gap-2.5 h-11 px-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-border transition-all duration-200 text-sm font-semibold focus-ring shadow-sm"
                                  aria-haspopup="listbox"
                                  aria-expanded="false"
                                  aria-label="Select workspace"
                                >
                                  {activeWorkspace === 'business' ? (
                                    <>
                                      <Briefcase className="h-4 w-4 text-primary" aria-hidden="true" />
                                      <span>Business</span>
                                    </>
                                  ) : (
                                    <>
                                      <User2 className="h-4 w-4 text-primary" aria-hidden="true" />
                                      <span>Personal</span>
                                    </>
                                  )}
                                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                                </button>
                            </summary>
                            <div className="absolute mt-3 w-48 rounded-xl border border-border/60 bg-card/95 backdrop-blur-md shadow-lg z-10 overflow-hidden">
                                <ul role="listbox" aria-label="Workspaces" className="py-2">
                                    <li>
                                        <button
                                          role="option"
                                          aria-selected={activeWorkspace === 'personal'}
                                          onClick={() => setActiveWorkspace('personal')}
                                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors font-medium"
                                        >
                                          <User2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                          <span>Personal Workspace</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                          role="option"
                                          aria-selected={activeWorkspace === 'business'}
                                          onClick={() => setActiveWorkspace('business')}
                                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors font-medium"
                                        >
                                          <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                          <span>Business Workspace</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </details>
                    </div>

                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search transactions, bills, invoices..."
                            className="w-full pl-12 pr-4 h-11 bg-background/60 backdrop-blur-sm border-border/50 rounded-xl focus:bg-background focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
                        />
                    </div>
                    
                    <div className='flex items-center gap-3'>
                        <div className="hidden sm:block">
                            <SyncStatus />
                        </div>
                        <UserNav />
                    </div>
                </div>
                
                {/* Quick actions for mobile */}
                <div className="flex sm:hidden items-center gap-3">
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
                <div className="hidden sm:flex items-center gap-4">
                    {activeWorkspace === 'personal' ? (
                        <AddTransactionSheet />
                    ) : (
                        <>
                           <AddClientSheet />
                           <AddQuoteSheet />
                        </>
                    )}
                </div>
            </header>
        </div>
    );
}