'use client';

import { Link, useLocation } from 'react-router-dom';
import {
  Home,
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
  FileText,
  Users,
  ShoppingCart,
  CreditCard,
  ScanLine,
  LineChart,
  ChevronDown,
  X,
  Menu,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { UserNav } from './user-nav';
import React, { useState, useEffect } from 'react';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

// Mobile sidebar context
interface MobileSidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MobileSidebarContext = React.createContext<MobileSidebarContextType | null>(null);

export function useMobileSidebar() {
  const context = React.useContext(MobileSidebarContext);
  if (!context) throw new Error('useMobileSidebar must be used within MobileSidebarProvider');
  return context;
}

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => { setIsOpen(false); }, [location.pathname]);
  
  return (
    <MobileSidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

// Navigation items
const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', workspace: ['personal', 'business'] },
  { href: '/dashboard/transactions', icon: ArrowRightLeft, label: 'Transactions', workspace: ['personal'] },
  { href: '/dashboard/budgets', icon: Landmark, label: 'Budgets', workspace: ['personal'] },
  { href: '/dashboard/goals', icon: Target, label: 'Goals', workspace: ['personal'] },
  { href: '/dashboard/savings/groups', icon: Users, label: 'Group Savings', workspace: ['personal', 'business'] },
  { href: '/dashboard/bills', icon: ReceiptText, label: 'Bills', workspace: ['personal'] },
  { href: '/dashboard/loans', icon: HandCoins, label: 'Loans', workspace: ['personal', 'business'] },
  { href: '/dashboard/business', icon: Briefcase, label: 'Business Home', workspace: ['business'] },
  { href: '/dashboard/business-financials', icon: TrendingUp, label: 'Financials', workspace: ['business'] },
  { href: '/dashboard/business-budgets', icon: Target, label: 'Budgets', workspace: ['business'] },
  { href: '/dashboard/receipts', icon: Receipt, label: 'Receipts', workspace: ['business'] },
  { href: '/dashboard/delivery-notes', icon: Truck, label: 'Delivery Notes', workspace: ['business'] },
  { href: '/dashboard/clients', icon: Users, label: 'Clients', workspace: ['business'] },
  { href: '/dashboard/products', icon: ShoppingCart, label: 'Products', workspace: ['business'] },
  { href: '/dashboard/quotes', icon: FileText, label: 'Quotes', workspace: ['business'] },
  { href: '/dashboard/invoices', icon: FileText, label: 'Invoices', workspace: ['business'] },
];

const secondaryNavItems = [
  { href: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics', workspace: ['personal', 'business'] },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', workspace: ['personal', 'business'] },
];

const NavLink = ({ item, pathname, handleComingSoonClick }: { item: any, pathname: string, handleComingSoonClick: (label: string) => void }) => {
  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

  if (item.isComingSoon) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={() => handleComingSoonClick(item.label)}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground/50 transition-colors"
          >
            <item.icon className="h-4 w-4" />
            <Badge variant="destructive" className="absolute -top-1 -right-2 text-[8px] p-0.5 h-auto leading-none">Soon</Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={item.href}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted/60"
          )}
        >
          <item.icon className="h-4 w-4" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
};

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { activeWorkspace } = useActiveWorkspace();
  const { toast } = useToast();

  const handleComingSoonClick = (label: string) => {
    toast({
      title: 'Coming Soon!',
      description: `${label} is under development and will be available soon.`,
    });
  };

  const filteredMainNav = mainNavItems.filter(item => item.workspace.includes(activeWorkspace));
  const filteredSecondaryNav = secondaryNavItems.filter(item => item.workspace.includes(activeWorkspace));

  return (
    <TooltipProvider>
      <aside className="hidden sm:flex w-16 flex-col border-r bg-background fixed h-full z-40">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b">
          <Link to="/dashboard" className="flex items-center justify-center">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col items-center gap-2 py-4">
          {filteredMainNav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} handleComingSoonClick={handleComingSoonClick} />
          ))}
        </nav>

        {/* Bottom section */}
        <nav className="mt-auto flex flex-col items-center gap-2 py-4">
          {filteredSecondaryNav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} handleComingSoonClick={handleComingSoonClick} />
          ))}
          <div className="border-t w-full my-2"></div>
          <UserNav />
        </nav>
      </aside>
    </TooltipProvider>
  );
}

// Add the missing MobileNav component
export function MobileNav() {
  const location = useLocation();
  const { activeWorkspace } = useActiveWorkspace();
  
  // Core navigation items for mobile
  const coreNavItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
  ];

  // Workspace-specific items
  if (activeWorkspace === 'personal') {
    coreNavItems.push(
      { href: '/dashboard/transactions', icon: ArrowRightLeft, label: 'Transactions' },
      { href: '/dashboard/budgets', icon: Landmark, label: 'Budgets' },
      { href: '/dashboard/goals', icon: Target, label: 'Goals' },
    );
  } else {
    coreNavItems.push(
      { href: '/dashboard/business', icon: Briefcase, label: 'Business' },
      { href: '/dashboard/clients', icon: Users, label: 'Clients' },
      { href: '/dashboard/invoices', icon: FileText, label: 'Invoices' },
    );
  }

  // Always include analytics
  coreNavItems.push({ href: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' });

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-background/95 backdrop-blur-md border-t border-border/60 safe-area-bottom">
        <nav className="flex items-center justify-around h-16 px-2">
          {coreNavItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground"
                )}>
                  <item.icon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
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
  const { toast } = useToast();

  const filteredMainNav = mainNavItems.filter(item => item.workspace.includes(activeWorkspace));
  const filteredSecondaryNav = secondaryNavItems.filter(item => item.workspace.includes(activeWorkspace));

  const handleComingSoonClick = (label: string) => {
    toast({ title: 'Coming Soon!', description: `${label} is under development.` });
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Wallet className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">KwachaLite</span>
            </Link>
          </div>

          {/* Workspace indicator */}
          <div className="px-4 py-3 border-b">
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
              activeWorkspace === 'business' 
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}>
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">
                {activeWorkspace === 'business' ? 'Business' : 'Personal'} Mode
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-1">
              {filteredMainNav.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                
                if (item.isComingSoon) {
                  return (
                    <div
                      key={item.href + item.label}
                      onClick={() => handleComingSoonClick(item.label)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground/50 cursor-not-allowed"
                    >
                      <item.icon className="h-5 w-5" strokeWidth={1.5} />
                      <span>{item.label}</span>
                      <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 border-dashed">Soon</Badge>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive 
                        ? "bg-accent text-accent-foreground font-medium" 
                        : "text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <item.icon className="h-5 w-5" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 space-y-1">
            {filteredSecondaryNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive 
                      ? "bg-muted text-foreground" 
                      : "text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
      </SheetContent>
    </Sheet>
  );
}

export function MobileSidebarTrigger() {
  const { setIsOpen } = useMobileSidebar();  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsOpen(true)}
      className="h-9 w-9 sm:hidden text-muted-foreground"
    >
      <Menu className="h-5 w-5" strokeWidth={1.5} />
    </Button>
  );
}