

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRightLeft,
  BarChart2,
  Settings,
  Wallet,
  ReceiptText,
  LayoutDashboard,
  Briefcase,
  Target,
  Landmark
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { UserNav } from './user-nav';
import React from 'react';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', workspace: ['personal', 'business'] },
  { href: '/dashboard/transactions', icon: ArrowRightLeft, label: 'Transactions', workspace: ['personal'] },
  { href: '/dashboard/budgets', icon: Landmark, label: 'Budgets', workspace: ['personal'] },
  { href: '/dashboard/goals', icon: Target, label: 'Goals', workspace: ['personal'] },
  { href: '/dashboard/bills', icon: ReceiptText, label: 'Bills', workspace: ['personal'] },
  { href: '/dashboard/business', icon: Briefcase, label: 'Business', workspace: ['business']},
];

const secondaryNavItems = [
    { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics', workspace: ['personal', 'business'] },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings', workspace: ['personal', 'business'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { activeWorkspace } = useActiveWorkspace();

  const filteredMainNav = mainNavItems.filter(item => item.workspace.includes(activeWorkspace));
  const filteredSecondaryNav = secondaryNavItems.filter(item => item.workspace.includes(activeWorkspace));

  return (
    <aside className="hidden w-14 flex-col border-r bg-card sm:flex fixed h-full z-40">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
              href="/dashboard"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
            <Wallet className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">KwachaLite</span>
        </Link>
        <TooltipProvider>
          {filteredMainNav.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8',
                    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
       <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            {filteredSecondaryNav.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8',
                      pathname.startsWith(item.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
          <UserNav />
        </nav>
    </aside>
  );
}

export function MobileNav() {
    const pathname = usePathname();
    const { activeWorkspace } = useActiveWorkspace();
    
    let navItemsToShow = mainNavItems.filter(item => item.workspace.includes(activeWorkspace));

    if (activeWorkspace === 'business') {
        const businessHubIndex = navItemsToShow.findIndex(item => item.href.includes('business'));
        if (businessHubIndex !== -1) {
            navItemsToShow[businessHubIndex] = { href: '/dashboard/business', icon: Briefcase, label: 'Business', workspace: ['business']};
        }
    }
    
    const settingsItem = secondaryNavItems.find(item => item.href.includes('settings'));
    if (settingsItem) {
        navItemsToShow.push(settingsItem);
    }
    
    const uniqueNavItems = Array.from(new Map(navItemsToShow.map(item => [item.href, item])).values()).slice(0, 5);
    const gridColsClass = `grid-cols-${uniqueNavItems.length}`;

    return (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
            <nav className={cn('grid h-full items-center justify-items-center text-sm font-medium', gridColsClass)}>
                {uniqueNavItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex flex-col items-center gap-1 w-full pt-2 pb-1 transition-colors',
                            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                             ? 'text-primary' 
                             : 'text-gray-500 hover:text-primary'
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-xs text-center">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}
