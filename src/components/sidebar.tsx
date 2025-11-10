import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightLeft,
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
  X,
  Menu
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
    <aside className="hidden w-20 flex-col border-r border-border bg-card/50 backdrop-blur-sm sm:flex fixed h-full z-40">
      <nav className="flex flex-col items-center gap-3 px-4 py-6">
        <Link
          to="/dashboard"
          className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <Wallet className="h-6 w-6" />
          <span className="sr-only">KwachaLite</span>
        </Link>
        
        {/* Workspace indicator */}
        <div className="mt-3 mb-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
            {activeWorkspace === 'business' ? 'B' : 'P'}
          </span>
        </div>
        
        <div className="w-10 h-px bg-border/60 my-3" />
        
        <TooltipProvider>
          {filteredMainNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium bg-popover text-popover-foreground border-border shadow-lg">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>
      
      <nav className="mt-auto flex flex-col items-center gap-3 px-4 py-6 border-t border-border/60">
        <TooltipProvider>
          {filteredSecondaryNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105',
                      isActive
                        ? 'bg-muted text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium bg-popover text-popover-foreground border-border shadow-lg">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
        
        <div className="w-10 h-px bg-border/60 my-3" />
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
  
  const uniqueNavItems = Array.from(new Map(navItemsToShow.map(item => [item.href, item])).values());

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-card/95 backdrop-blur-md border-t border-border/60 safe-area-bottom">
        <nav className="flex items-center justify-around h-18 px-2 overflow-x-auto">
          {uniqueNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={cn(
                  'flex flex-col items-center justify-center min-w-0 flex-1 py-3 px-2 rounded-xl transition-all duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200',
                  isActive ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted/50'
                )}>
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className={cn(
                  'text-[11px] font-semibold mt-2 truncate max-w-full',
                  isActive ? 'text-primary' : 'text-muted-foreground'
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sm:hidden animate-in fade-in duration-200" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-card/95 backdrop-blur-md border-r border-border/60 z-50 sm:hidden animate-in slide-in-from-left duration-300 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/60">
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">KwachaLite</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation */}
        <div className="flex flex-col h-[calc(100%-88px)]">
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground px-4 mb-3 uppercase tracking-wider">Main Menu</p>
            {filteredMainNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Bottom Navigation */}
          <div className="p-4 border-t border-border/60 bg-muted/20">
            <div className="space-y-2 mb-4">
              <p className="text-xs font-semibold text-muted-foreground px-4 mb-3 uppercase tracking-wider">Settings</p>
              {filteredSecondaryNav.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm',
                      isActive
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 border-t border-border/60">
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
      className="h-9 w-9 sm:hidden text-muted-foreground hover:text-foreground hover:bg-muted"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}