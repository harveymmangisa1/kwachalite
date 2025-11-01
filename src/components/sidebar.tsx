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
    <aside className="hidden w-16 flex-col border-r border-slate-200 bg-white sm:flex fixed h-full z-40">
      <nav className="flex flex-col items-center gap-2 px-3 py-4">
        <Link
          to="/dashboard"
          className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          <Wallet className="h-5 w-5" />
          <span className="sr-only">KwachaLite</span>
        </Link>
        <div className="w-8 h-px bg-slate-200 my-2" />
        <TooltipProvider>
          {filteredMainNav.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  to={item.href}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium bg-slate-900 text-white border-slate-800">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-2 px-3 py-4 border-t border-slate-200">
        <TooltipProvider>
          {filteredSecondaryNav.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  to={item.href}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    pathname.startsWith(item.href)
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium bg-slate-900 text-white border-slate-800">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
        <div className="w-8 h-px bg-slate-200 my-2" />
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
  
  const uniqueNavItems = Array.from(new Map(navItemsToShow.map(item => [item.href, item])).values()).slice(0, 5);

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white border-t border-slate-200">
        <nav className="flex items-center justify-around h-16 px-2">
          {uniqueNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-colors',
                  isActive ? 'text-slate-900' : 'text-slate-600'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                  isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  'text-xs font-medium mt-1 truncate max-w-full',
                  isActive ? 'text-slate-900' : 'text-slate-600'
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden animate-in fade-in duration-200" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-50 sm:hidden animate-in slide-in-from-left duration-300 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-slate-900">KwachaLite</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-10 w-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation */}
        <div className="flex flex-col h-[calc(100%-73px)]">
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-xs font-medium text-slate-500 px-3 mb-2">MAIN MENU</p>
            {filteredMainNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm',
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Bottom Navigation */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="space-y-1 mb-4">
              <p className="text-xs font-medium text-slate-500 px-3 mb-2">SETTINGS</p>
              {filteredSecondaryNav.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm',
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 border-t border-slate-200">
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
      className="h-9 w-9 sm:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}