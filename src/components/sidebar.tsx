

'use client';

import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightLeft,
  BarChart2,
  Settings,
  Wallet,
  ReceiptText,
  LayoutDashboard,
  Briefcase,
  Target,
  Landmark,
  HandCoins,
  TrendingUp,
  Receipt,
  Truck,
  X
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { UserNav } from './user-nav';
import React, { useState, useEffect } from 'react';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';

// Mobile sidebar state context
interface MobileSidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MobileSidebarContext = React.createContext<MobileSidebarContextType | null>(null);

export function useMobileSidebar() {
  const context = React.useContext(MobileSidebarContext);
  if (!context) {
    throw new Error('useMobileSidebar must be used within MobileSidebarProvider');
  }
  return context;
}

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Close sidebar on route change
  const location = useLocation();
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  return (
    <MobileSidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', workspace: ['personal', 'business'] },
  { href: '/dashboard/transactions', icon: ArrowRightLeft, label: 'Transactions', workspace: ['personal'] },
  { href: '/dashboard/budgets', icon: Landmark, label: 'Budgets', workspace: ['personal'] },
  { href: '/dashboard/goals', icon: Target, label: 'Goals', workspace: ['personal'] },
  { href: '/dashboard/bills', icon: ReceiptText, label: 'Bills', workspace: ['personal'] },
  { href: '/dashboard/loans', icon: HandCoins, label: 'Loans', workspace: ['personal', 'business'] },
  { href: '/dashboard/business', icon: Briefcase, label: 'Business', workspace: ['business']},
  { href: '/dashboard/business-financials', icon: TrendingUp, label: 'Financials', workspace: ['business']},
  { href: '/dashboard/business-budgets', icon: Target, label: 'Budgets', workspace: ['business']},
  { href: '/dashboard/receipts', icon: Receipt, label: 'Receipts', workspace: ['business']},
  { href: '/dashboard/delivery-notes', icon: Truck, label: 'Delivery Notes', workspace: ['business']},
];

const secondaryNavItems = [
    { href: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics', workspace: ['personal', 'business'] },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings', workspace: ['personal', 'business'] },
];

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { activeWorkspace } = useActiveWorkspace();

  const filteredMainNav = mainNavItems.filter(item => item.workspace.includes(activeWorkspace));
  const filteredSecondaryNav = secondaryNavItems.filter(item => item.workspace.includes(activeWorkspace));

  return (
    <aside className="hidden w-16 flex-col border-r bg-card/50 backdrop-blur-sm sm:flex fixed h-full z-40 shadow-lg">
      <nav className="flex flex-col items-center gap-3 px-3 py-6">
        <Link
              to="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-lg font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
            <Wallet className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">KwachaLite</span>
        </Link>
        <div className="w-8 h-px bg-border/50 my-2" />
        <TooltipProvider>
          {filteredMainNav.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  to={item.href}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105',
                    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                      ? 'bg-primary/10 text-primary shadow-md border border-primary/20'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent/50 hover:shadow-sm'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
       <nav className="mt-auto flex flex-col items-center gap-3 px-3 py-6">
          <TooltipProvider>
            {filteredSecondaryNav.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105',
                      pathname.startsWith(item.href)
                        ? 'bg-primary/10 text-primary shadow-md border border-primary/20'
                        : 'text-muted-foreground hover:text-primary hover:bg-accent/50 hover:shadow-sm'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
          <div className="w-8 h-px bg-border/50 my-2" />
          <UserNav />
        </nav>
    </aside>
  );
}

export function MobileNav() {
    const location = useLocation();
    const pathname = location.pathname;
    const { activeWorkspace } = useActiveWorkspace();
    
    let navItemsToShow = mainNavItems.filter(item => item.workspace.includes(activeWorkspace));

    if (activeWorkspace === 'business') {
        const businessHubIndex = navItemsToShow.findIndex(item => item.href.includes('business'));
        if (businessHubIndex !== -1) {
            navItemsToShow[businessHubIndex] = { href: '/dashboard/business', icon: Briefcase, label: 'Business', workspace: ['business']};
        }
    }
    
    const analyticsItem = secondaryNavItems.find(item => item.href.includes('analytics'));
    if (analyticsItem) {
        navItemsToShow.push(analyticsItem);
    }
    
    // Limit to 5 items for optimal mobile experience
    const uniqueNavItems = Array.from(new Map(navItemsToShow.map(item => [item.href, item])).values()).slice(0, 5);

    return (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
            {/* Modern glass effect background */}
            <div className="glass border-t backdrop-blur-xl bg-background/95 shadow-2xl">
                <nav className="flex items-center justify-around h-16 px-2">
                    {uniqueNavItems.map((item, index) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-1 rounded-xl transition-all duration-200 group relative',
                                    isActive
                                        ? 'text-primary' 
                                        : 'text-muted-foreground hover:text-primary'
                                )}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-lg" />
                                )}
                                
                                {/* Icon container with modern animation */}
                                <div className={cn(
                                    'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
                                    isActive 
                                        ? 'bg-primary/10 shadow-sm transform scale-105' 
                                        : 'group-hover:bg-accent/30 group-hover:scale-105'
                                )}>
                                    <item.icon className={cn(
                                        'w-5 h-5 transition-all duration-200',
                                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                                    )} />
                                </div>
                                
                                {/* Label with truncation */}
                                <span className={cn(
                                    'text-xs font-medium mt-0.5 truncate max-w-full transition-all duration-200',
                                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

export function MobileSidebar() {
  const { isOpen, setIsOpen } = useMobileSidebar();
  const location = useLocation();
  const pathname = location.pathname;
  const { activeWorkspace } = useActiveWorkspace();

  const filteredMainNav = mainNavItems.filter(item => item.workspace.includes(activeWorkspace));
  const filteredSecondaryNav = secondaryNavItems.filter(item => item.workspace.includes(activeWorkspace));

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 sm:hidden" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-background border-r z-50 sm:hidden transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">KwachaLite</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation */}
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4 space-y-2">
            {filteredMainNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Bottom Navigation */}
          <div className="p-4 border-t">
            <div className="space-y-2 mb-4">
              {filteredSecondaryNav.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 border-t">
              <UserNav />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function MobileSidebarTrigger() {
  const { setIsOpen } = useMobileSidebar();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsOpen(true)}
      className="h-9 w-9 sm:hidden"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </Button>
  );
}
