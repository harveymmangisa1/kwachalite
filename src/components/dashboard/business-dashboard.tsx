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
      <div className="min-h-screen container-padding py-8">
        <LoadingState message="Loading business profile..." />
      </div>
    );
  }

  if (profileError && !showFallback) {
    return (
      <div className="min-h-screen container-padding py-8">
        <ErrorState error={profileError} onRetry={refreshProfile} />
        <div className="text-center mt-4">
          <Button variant="outline" onClick={() => setShowFallback(true)}>
            Continue without business profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-tour="dashboard" className="container-padding py-4 sm:py-8 space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">{businessProfile?.name || 'Business Dashboard'}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {greeting}, {displayName}
        </p>
      </div>

      <BusinessOverviewCards transactions={transactions} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        <div className="xl:col-span-2 space-y-6 sm:space-y-8">
          <Card className="card-minimal">
            <CardHeader><CardTitle className="text-lg sm:text-xl">Financial Performance</CardTitle></CardHeader>
            <CardContent className="p-4 sm:p-6"><IncomeExpenseChart transactions={transactions} /></CardContent>
          </Card>
          <Card className="card-minimal">
            <CardHeader><CardTitle className="text-lg sm:text-xl">Recent Business Transactions</CardTitle></CardHeader>
            <CardContent className="p-4 sm:p-6"><RecentTransactions transactions={transactions} /></CardContent>
          </Card>
        </div>
        <div className="space-y-6 sm:space-y-8">
          <Card className="card-minimal">
            <CardHeader><CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2 p-4 sm:p-6">
              <Button asChild variant="outline" className="w-full justify-start gap-3 h-10 sm:h-11 text-sm"><Link to="/dashboard/quotes"><FileText className="h-4 w-4" />Create Quote</Link></Button>
              <Button asChild variant="outline" className="w-full justify-start gap-3 h-10 sm:h-11 text-sm"><Link to="/dashboard/clients"><Users className="h-4 w-4" />Add Client</Link></Button>
              <Button asChild variant="outline" className="w-full justify-start gap-3 h-10 sm:h-11 text-sm"><Link to="/dashboard/products"><Receipt className="h-4 w-4" />Add Product</Link></Button>
              <Button asChild variant="outline" className="w-full justify-start gap-3 h-10 sm:h-11 text-sm"><Link to="/dashboard/invoices"><Landmark className="h-4 w-4" />Manage Invoices</Link></Button>
            </CardContent>
          </Card>
          <Card className="card-minimal">
             <CardHeader><CardTitle className="text-lg sm:text-xl">Recent Quotations</CardTitle></CardHeader>
             <CardContent className="p-4 sm:p-6"><RecentQuotes /></CardContent>
          </Card>
          <Card className="card-minimal">
            <CardHeader><CardTitle className="text-lg sm:text-xl">Invoices Ready</CardTitle></CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold">{acceptedQuotes.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Ready to be invoiced</p>
              <Link to="/dashboard/invoices"><Button className="mt-3 sm:mt-4 w-full h-10 sm:h-11 text-sm">Create Invoices</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
