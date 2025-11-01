'use client';

import { BusinessOverviewCards } from './business-overview-cards';
import { RecentQuotes } from './recent-quotes';
import { useAppStore } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { RecentTransactions } from './recent-transactions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { IncomeExpenseChart } from '../analytics/income-expense-chart';
import { Button } from '../ui/button';
import { FileText, Receipt, TrendingUp, Users, DollarSign, ArrowUp, ArrowDown, Activity, BarChart3, PieChart, Landmark, Search, Bell, Wallet, Calendar, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useBusinessProfile } from '@/hooks/use-business-profile-v2';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import React from 'react';
import { LoadingState, ErrorState } from '@/components/ui/loading';
import ErrorBoundary from '@/components/error-boundary';
import { MobileSidebarTrigger } from '@/components/sidebar';
import { Badge } from '@/components/ui/badge';

export function BusinessDashboard({ transactions }: { transactions: Transaction[] }) {
  const { quotes } = useAppStore();
  const { user } = useAuth();
  const { 
    businessProfile, 
    isLoading: profileLoading, 
    error: profileError, 
    getDisplayName,
    refreshProfile 
  } = useBusinessProfile();
  
  const [greeting, setGreeting] = React.useState('');
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    if (profileLoading) {
      const timeout = setTimeout(() => setShowFallback(true), 3000);
      return () => clearTimeout(timeout);
    }
  }, [profileLoading]);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const displayName = React.useMemo(() => getDisplayName(), [getDisplayName]);

  const acceptedQuotes = React.useMemo(() => quotes.filter(quote => quote.status === 'accepted'), [quotes]);
  
  const totalRevenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  if (profileLoading && !showFallback) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container-padding space-y-6 pb-8">
          <LoadingState message="Loading business profile..." />
        </div>
      </div>
    );
  }

  if (profileError && !showFallback) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container-padding space-y-6 pb-8">
          <ErrorState error={profileError} onRetry={refreshProfile} />
          <div className="text-center mt-4">
            <Button variant="outline" onClick={() => setShowFallback(true)}>
              Continue without business profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="container-padding">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-slate-900">{businessProfile?.name || 'Business'}</h1>
                  <p className="text-xs text-slate-500">Business</p>
                </div>
              </div>
              <nav className="hidden lg:flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-slate-900 bg-slate-100 hover:bg-slate-200">
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                  Analytics
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                  Reports
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden md:flex text-slate-600 hover:text-slate-900">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 relative">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="hidden md:block w-px h-6 bg-slate-200 mx-2"></div>
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={businessProfile?.logo_url || user?.user_metadata?.avatar_url || `https://placehold.co/100x100.png?text=${displayName.charAt(0)}`} 
                  alt={displayName} 
                />
                <AvatarFallback className="bg-slate-900 text-white text-xs">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <MobileSidebarTrigger />
            </div>
          </div>
        </div>
      </div>

      <div className="container-padding py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-1">
                {greeting}, {displayName}
              </h2>
              <p className="text-sm text-slate-500">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3 mt-4 md:mt-0">
              <Button variant="outline" size="sm" className="gap-2"><Calendar className="h-4 w-4" />This Month</Button>
              <Button variant="outline" size="sm" className="gap-2"><Filter className="h-4 w-4" />Filter</Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-semibold text-slate-900">{formatCurrency(totalRevenue)}</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                    <ArrowDown className="h-5 w-5 text-rose-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-1">Total Expenses</p>
                <p className="text-2xl font-semibold text-slate-900">{formatCurrency(totalExpenses)}</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-1">Net Profit</p>
                <p className={`text-2xl font-semibold ${netProfit >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>{formatCurrency(Math.abs(netProfit))}</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-violet-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-1">Profit Margin</p>
                <p className="text-2xl font-semibold text-slate-900">{profitMargin.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Financial Performance</CardTitle></CardHeader>
              <CardContent><IncomeExpenseChart transactions={transactions} /></CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Recent Business Transactions</CardTitle></CardHeader>
              <CardContent><RecentTransactions transactions={transactions} /></CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Business Overview</CardTitle></CardHeader>
              <CardContent><BusinessOverviewCards transactions={transactions} /></CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="ghost" className="w-full justify-start gap-3"><Link to="/dashboard/quotes"><FileText className="h-4 w-4" />Create New Quote</Link></Button>
                <Button asChild variant="ghost" className="w-full justify-start gap-3"><Link to="/dashboard/clients"><Users className="h-4 w-4" />Add New Client</Link></Button>
                <Button asChild variant="ghost" className="w-full justify-start gap-3"><Link to="/dashboard/products"><Receipt className="h-4 w-4" />Add New Product</Link></Button>
                <Button asChild variant="ghost" className="w-full justify-start gap-3"><Link to="/dashboard/invoices"><Landmark className="h-4 w-4" />Manage Invoices</Link></Button>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm">
               <CardHeader><CardTitle>Recent Quotations</CardTitle></CardHeader>
               <CardContent><RecentQuotes /></CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Invoices Ready</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{acceptedQuotes.length}</div>
                <p className="text-xs text-muted-foreground">Ready to be invoiced</p>
                <Link to="/dashboard/invoices"><Button className="mt-4 w-full">Create Invoices</Button></Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
