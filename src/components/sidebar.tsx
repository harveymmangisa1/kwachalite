
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRightLeft,
  BarChart2,
  Settings,
  Wallet,
  ReceiptText,
  PiggyBank,
  LayoutDashboard,
  Users,
  Package,
  FileText,
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
  { href: '/dashboard/transactions', icon: ArrowRightLeft, label: 'Transactions', workspace: ['personal', 'business'] },
  { href: '/dashboard/bills', icon: ReceiptText, label: 'Bills', workspace: ['personal'] },
  { href: '/dashboard/savings', icon: PiggyBank, label: 'Savings', workspace: ['personal', 'business'] },
  { href: '/dashboard/clients', icon: Users, label: 'Clients', workspace: ['business'] },
  { href: '/dashboard/products', icon: Package, label: 'Products', workspace: ['business'] },
  { href: '/dashboard/quotes', icon: FileText, label: 'Quotations', workspace: ['business'] },
];

const secondaryNavItems = [
    { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics', workspace: ['personal', 'business'] },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings', workspace: ['personal', 'business'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const activeWorkspace = useActiveWorkspace();

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
                    pathname === item.href
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
                      pathname === item.href
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
    const activeWorkspace = useActiveWorkspace();
    const filteredMainNav = mainNavItems.filter(item => item.workspace.includes(activeWorkspace));
    const allNavItems = [...filteredMainNav, ...secondaryNavItems.filter(item => item.workspace.includes(activeWorkspace))];


    return (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-50">
            <nav className={`grid h-full ${'grid-cols-' + allNavItems.length} items-center justify-items-center text-sm font-medium`}>
                {allNavItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex flex-col items-center gap-1 w-full pt-2 pb-1',
                            pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}
