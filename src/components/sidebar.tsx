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
  Search,
  User,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { UserNav } from './user-nav';

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  { href: '/dashboard/bills', icon: ReceiptText, label: 'Bills' },
  { href: '/dashboard/savings', icon: PiggyBank, label: 'Savings' },
];

const secondaryNavItems = [
    { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

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
          {[...mainNavItems, ...secondaryNavItems].map((item) => (
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
            <UserNav />
        </nav>
    </aside>
  );
}

export function MobileNav() {
    const pathname = usePathname()
    return (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-50">
            <nav className="grid h-full grid-cols-4 items-center justify-items-center text-sm font-medium">
                {mainNavItems.map(item => (
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
