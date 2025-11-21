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
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserNav } from './user-nav';
import React, { useState, useEffect } from 'react';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { useToast } from '@/hooks/use-toast';

// Mobile sidebar state
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

// Navigation groups with better hierarchy
const navigationGroups = [
  {
    title: 'Main',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', workspace: ['personal', 'business'] },
      { href: '/dashboard/transactions', icon: ArrowRightLeft, label: 'Transactions', workspace: ['personal'] },
      { href: '/dashboard/budgets', icon: Landmark, label: 'Budgets', workspace: ['personal'] },
      { href: '/dashboard/goals', icon: Target, label: 'Goals', workspace: ['personal'] },
    ]
  },
  {
    title: 'Savings',
    items: [
      { href: '/dashboard/savings/groups', icon: Users, label: 'Group Savings', workspace: ['personal', 'business'] },
    ]
  },
  {
    title: 'Personal',
    items: [
      { href: '/dashboard/bills', icon: ReceiptText, label: 'Bills', workspace: ['personal'] },
      { href: '/dashboard/loans', icon: HandCoins, label: 'Loans', workspace: ['personal', 'business'] },
    ]
  },
  {
    title: 'Business',
    items: [
      { href: '/dashboard/business', icon: Briefcase, label: 'Business', workspace: ['business'] },
      { href: '/dashboard/business-financials', icon: TrendingUp, label: 'Financials', workspace: ['business'] },
      { href: '/dashboard/business-budgets', icon: Target, label: 'Budgets', workspace: ['business'] },
      { href: '/dashboard/receipts', icon: Receipt, label: 'Receipts', workspace: ['business'] },
      { href: '/dashboard/delivery-notes', icon: Truck, label: 'Delivery Notes', workspace: ['business'] },
      { href: '/dashboard/clients', icon: Users, label: 'Clients', workspace: ['business'] },
      { href: '/dashboard/products', icon: ShoppingCart, label: 'Products', workspace: ['business'] },
      { href: '/dashboard/quotes', icon: FileText, label: 'Quotes', workspace: ['business'] },
      { href: '/dashboard/invoices', icon: FileText, label: 'Invoices', workspace: ['business'] },
    ]
  },
  {
    title: 'Tools',
    items: [
      { href: '#', icon: CreditCard, label: 'Bank Integration', workspace: ['personal', 'business'], isComingSoon: true },
      { href: '#', icon: ScanLine, label: 'Receipt Processing', workspace: ['personal', 'business'], isComingSoon: true },
      { href: '#', icon: LineChart, label: 'Investment Tracking', workspace: ['personal'], isComingSoon: true },
    ]
  },
];

const secondaryNavItems = [
  { href: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics', workspace: ['personal', 'business'] },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', workspace: ['personal', 'business'] },
];

// Minimal icon button with subtle animations
function NavIcon({ icon: Icon, isActive, isComingSoon, onClick, label }: {
  icon: React.ElementType;
  isActive?: boolean;
  isComingSoon?: boolean;
  onClick?: () => void;
  label: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
        isActive 
          ? "bg-primary text-primary-foreground shadow-lg scale-105" 
          : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/50 hover:scale-105",
        isComingSoon && "opacity-60 cursor-not-allowed"
      )}
    >
      <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
      {isComingSoon && (
        <div className="absolute -top-1 -right-1 flex h-3 w-3">
          <div className="relative inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-pulse" />
          <Plus className="absolute inset-0 h-2 w-2 text-amber-600" strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

// Collapsible section component
function NavSection({ title, items, workspaceFilter }: {
  title: string;
  items: any[];
  workspaceFilter: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-muted-foreground/60 hover:text-foreground transition-colors duration-200"
      >
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isExpanded && "rotate-180")} />
        <span>{title}</span>
      </button>
      
      {isExpanded && (
        <div className="space-y-1 px-2 pb-2 animate-in slide-in-from-top-2 duration-200">
          {items.map((item) => {
            const isActive = useLocation().pathname === item.href || 
              (item.href !== '/dashboard' && useLocation().pathname.startsWith(item.href));
            
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-muted/50"
                  >
                    <NavIcon
                      icon={item.icon}
                      isActive={isActive}
                      isComingSoon={item.isComingSoon}
                      onClick={item.isComingSoon ? () => {
                        // Handle coming soon clicks
                      } : undefined}
                      label={item.label}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                  {item.isComingSoon && (
                    <Badge variant="secondary" className="ml-2 text-xs">Coming Soon</Badge>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { activeWorkspace } = useActiveWorkspace();
  const { toast } = useToast();

  const handleComingSoonClick = (label: string) => {
    toast({
      title: 'Coming Soon!',
      description: `${label} is under development and will be available soon.`,
    });
  };

  // Filter navigation groups based on workspace
  const filteredGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.workspace.includes(activeWorkspace))
  }));

  return (
    <aside className="hidden w-16 flex-col border-r border-border/40 bg-background/95 backdrop-blur-sm fixed h-full z-40">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-border/40">
        <Link to="/dashboard" className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-all duration-200 hover:scale-105 shadow-lg">
          <Home className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Workspace indicator */}
      <div className="flex justify-center py-2">
        <span className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-md transition-colors duration-200",
          activeWorkspace === 'business' 
            ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30" 
            : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
        )}>
          {activeWorkspace === 'business' ? 'B' : 'P'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {filteredGroups.map((group, index) => (
          <NavSection
            key={group.title}
            title={group.title}
            items={group.items}
            workspaceFilter={[activeWorkspace]}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto border-t border-border/40 pt-4">
        <UserNav />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const { activeWorkspace } = useActiveWorkspace();
  
  // Core navigation items for mobile - minimal approach
  const coreNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
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
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
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

  const handleComingSoonClick = (label: string) => {
    toast({
      title: 'Coming Soon!',
      description: `${label} is under development and will be available soon.`,
    });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  // Filter navigation groups based on workspace
  const filteredGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.workspace.includes(activeWorkspace))
  }));

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-background/95 backdrop-blur-md border-r border-border/60 z-50 animate-in slide-in-from-left duration-300 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/60">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Home className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <span className="font-bold text-xl text-foreground">KwachaLite</span>
              <span className="text-sm text-muted-foreground">Financial Manager</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {filteredGroups.map((group) => (
            <NavSection
              key={group.title}
              title={group.title}
              items={group.items}
              workspaceFilter={[activeWorkspace]}
            />
          ))}
        </div>
        
        {/* Bottom section */}
        <div className="p-4 border-t border-border/60 bg-muted/20">
          <UserNav />
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
      className="h-9 w-9 sm:hidden text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
    >
      <Menu className="h-5 w-5" strokeWidth={1.5} />
    </Button>
  );
}