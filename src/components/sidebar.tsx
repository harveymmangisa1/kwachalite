'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRightLeft,
  BarChart2,
  Settings,
  Wallet,
  ReceiptText,
  PiggyBank
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { LayoutDashboard } from 'lucide-react';

const navItems = [
  { href: '/dashboard/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  { href: '/dashboard/bills', icon: ReceiptText, label: 'Bills' },
  { href: '/dashboard/savings', icon: PiggyBank, label: 'Savings' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-14 flex-col border-r bg-card sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
              href="/dashboard"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
            <Wallet className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">KwachaLite</span>
        </Link>
        <TooltipProvider>
          {navItems.map((item) => (
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
      </nav>
    </aside>
  );
}

const mobileNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ...navItems
]

export function MobileNav() {
    const pathname = usePathname()
    return (
        <nav className="grid gap-6 text-lg font-medium">
            <Link
                href="/dashboard"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
                <Wallet className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">KwachaLite</span>
            </Link>
            {mobileNavItems.map(item => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'flex items-center gap-4 px-2.5',
                        pathname.startsWith(item.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            ))}
        </nav>
    )
}
