'use client';

import React from 'react';
import { Search, Briefcase, User, ChevronDown, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/user-nav';
import { SyncStatus } from '@/components/sync-status';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
import { AddClientSheet } from '@/components/clients/add-client-sheet';
import { AddQuoteSheet } from '@/components/quotes/add-quote-sheet';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';

export function DashboardHeader() {
  const { activeWorkspace, setActiveWorkspace } = useActiveWorkspace();

  return (
    <div className="sticky top-0 z-40 w-full border-b border-slate-100/80 bg-white/85 backdrop-blur-xl">
      <div className="container-padding h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Workspace Switcher */}
        <div className="flex items-center gap-3 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-11 sm:h-12 px-2.5 sm:px-3 gap-3 rounded-2xl hover:bg-slate-50 transition-all group"
              >
                <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                  {activeWorkspace === 'business' ? <Briefcase className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Workspace</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                    {activeWorkspace === 'business' ? 'Business' : 'Personal'}
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-data-[state=open]:rotate-180 transition-transform" />
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl border-slate-100 shadow-xl">
              <DropdownMenuItem 
                onClick={() => setActiveWorkspace('personal')}
                className="rounded-xl gap-3 py-3 cursor-pointer"
              >
                <User className="h-4 w-4 text-slate-500" />
                <span className="font-medium">Personal Workspace</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setActiveWorkspace('business')}
                className="rounded-xl gap-3 py-3 cursor-pointer"
              >
                <Briefcase className="h-4 w-4 text-slate-500" />
                <span className="font-medium">Business Workspace</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: Search Bar (The Command Center) */}
        <div className="flex-1 max-w-xl relative group hidden md:block">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <Input
            type="search"
            placeholder="Press ⌘K to search everything..."
            className="w-full pl-11 h-12 bg-slate-50/50 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all text-sm"
          />
          <div className="absolute inset-y-0 right-4 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-sans text-[10px] font-medium text-slate-400">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* SyncStatus hidden for cleaner UX */}

          <div className="flex items-center gap-2 border-l border-slate-100 pl-3 sm:pl-4">
            {activeWorkspace === 'personal' ? (
              <AddTransactionSheet>
                <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm h-10 px-3 sm:px-4">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">New Entry</span>
                </Button>
              </AddTransactionSheet>
            ) : (
              <div className="flex gap-2">
                <AddQuoteSheet>
                  <Button variant="outline" className="hidden sm:inline-flex rounded-xl h-10 border-slate-200">
                    Quote
                  </Button>
                </AddQuoteSheet>
                <AddClientSheet>
                  <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-10 shadow-indigo-100 px-3 sm:px-4">
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Client</span>
                  </Button>
                </AddClientSheet>
              </div>
            )}
            
            <div className="ml-2 h-10 w-10 flex items-center justify-center">
               <UserNav />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
