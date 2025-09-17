'use client';

import { BusinessOverviewCards } from './business-overview-cards';
import { RecentQuotes } from './recent-quotes';
import { useAppStore } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { RecentTransactions } from './recent-transactions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { IncomeExpenseChart } from '../analytics/income-expense-chart';
import { Button } from '../ui/button';
import { FileText, Receipt, TrendingUp, Users, DollarSign, TrendingDown, Activity, BarChart3, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useBusinessProfile } from '@/hooks/use-business-profile-v2';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import React from 'react';
import { LoadingState, ErrorState } from '@/components/ui/loading';
import ErrorBoundary from '@/components/error-boundary';

export function BusinessDashboard({ transactions }: { transactions: Transaction[] }) {
  console.log('BusinessDashboard rendered with:', { transactionsCount: transactions?.length || 0 });
  
  const { quotes, clients } = useAppStore();
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
  
  console.log('Business profile state:', { 
    profileLoading, 
    profileError, 
    hasBusinessProfile: !!businessProfile,
    showFallback,
    transactionsCount: transactions?.length || 0
  });

  // Fallback timeout if business profile loading takes too long
  React.useEffect(() => {
    if (profileLoading) {
      const timeout = setTimeout(() => {
        console.warn('Business profile loading timeout - showing fallback');
        setShowFallback(true);
      }, 3000); // 3 second timeout (reduced)
      
      return () => clearTimeout(timeout);
    }
  }, [profileLoading]);
  
  // Force fallback after initial mount to prevent blank screen
  React.useEffect(() => {
    const initialTimeout = setTimeout(() => {
      if (profileLoading && !showFallback) {
        console.warn('Initial loading timeout - forcing fallback');
        setShowFallback(true);
      }
    }, 2000); // 2 second initial timeout
    
    return () => clearTimeout(initialTimeout);
  }, []);

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  // Use the display name from the hook
  const displayName = React.useMemo(() => {
    try {
      return getDisplayName();
    } catch (error) {
      console.error('Error getting display name:', error);
      return 'Business User';
    }
  }, [getDisplayName]);

  // Filter quotes that are accepted (these can be converted to invoices)
  const acceptedQuotes = React.useMemo(() => {
    try {
      return quotes.filter(quote => quote.status === 'accepted');
    } catch (error) {
      console.error('Error filtering quotes:', error);
      return [];
    }
  }, [quotes]);
  
  // Calculate business metrics
  const totalRevenue = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  console.log('Render decision:', {
    profileLoading,
    showFallback,
    profileError,
    shouldShowLoading: profileLoading && !showFallback,
    shouldShowError: profileError && !showFallback
  });

  // Show loading state while business profile is loading (unless timeout reached)
  if (profileLoading && !showFallback) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
        <div className="container-padding space-y-6 pb-8">
          <LoadingState message="Loading business profile..." />
          <div className="text-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('Skip loading clicked');
                setShowFallback(true);
              }}
              className="gap-2"
            >
              Skip loading
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error loading the profile (but allow fallback)
  if (profileError && !showFallback) {
    console.log('Showing error state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
        <div className="container-padding space-y-6 pb-8">
          <ErrorState error={profileError} onRetry={refreshProfile} />
          <div className="text-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowFallback(true)}
              className="gap-2"
            >
              Continue without business profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering main dashboard content');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
      <div className="container-padding space-y-6 pb-8">
        {/* Warning banner for fallback mode */}
        {(showFallback || profileError) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Business profile not available</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              {profileError ? 'There was an error loading your business profile. ' : 'Business profile loading timed out. '}
              Some features may be limited. You can try refreshing the page or check your network connection.
            </p>
            {profileError && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshProfile}
                className="mt-2 text-yellow-800 border-yellow-300 hover:bg-yellow-100"
              >
                Try Again
              </Button>
            )}
          </div>
        )}
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Greeting Card - Updated to match budget page hero style */}
          <Card className="md:col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Business Financial Overview</h2>
                <p className="text-blue-100">Track your business financial progress</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              {/* User Profile Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={businessProfile?.logo_url || (user?.user_metadata?.avatar_url as string) || `https://placehold.co/100x100.png?text=${displayName.charAt(0)}`} 
                      alt={displayName} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl">
                      {displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">
                      {greeting}, {displayName}!
                    </h1>
                    <span className="text-2xl">👋</span>
                  </div>
                  <p className="text-sm text-blue-100">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-blue-100 text-sm mb-1">Total Revenue</div>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-blue-100 text-sm mb-1">Total Expenses</div>
                <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-blue-100 text-sm mb-1">Net Profit</div>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {formatCurrency(Math.abs(netProfit))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-blue-100 mb-2">
                <span>Profit Margin</span>
                <span>{profitMargin.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    profitMargin < 0 ? 'bg-red-400' : 
                    profitMargin < 10 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.abs(profitMargin) + 10)}%` }}
                />
              </div>
            </div>
          </Card>
          
          {/* Quick Actions Card */}
          <Card className="bg-gradient-to-br from-white via-rose-50/50 to-red-50/60 border border-rose-100/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-rose-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start gap-3 bg-white/60 hover:bg-white/80 border-slate-200/50 shadow-sm">
                <Link to="/dashboard/quotes">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Create New Quote</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start gap-3 bg-white/60 hover:bg-white/80 border-slate-200/50 shadow-sm">
                <Link to="/dashboard/clients">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span>Add New Client</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start gap-3 bg-white/60 hover:bg-white/80 border-slate-200/50 shadow-sm">
                <Link to="/dashboard/products">
                  <Receipt className="h-4 w-4 text-purple-500" />
                  <span>Add New Product</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start gap-3 bg-white/60 hover:bg-white/80 border-slate-200/50 shadow-sm">
                <Link to="/dashboard/analytics">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <span>View Analytics</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Overview Cards */}
          <Card className="md:col-span-3 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Business Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <BusinessOverviewCards transactions={transactions} />
              </ErrorBoundary>
            </CardContent>
          </Card>
          
          {/* Recent Activity and Quotes - Split into two cards */}
          <Card className="md:col-span-2 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Recent Business Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <RecentTransactions transactions={transactions} />
              </ErrorBoundary>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-1 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-500" />
                Recent Quotations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <RecentQuotes />
              </ErrorBoundary>
            </CardContent>
          </Card>
          
          {/* Invoices Card */}
          <Card className="md:col-span-1 bg-gradient-to-br from-white via-emerald-50/50 to-green-50/60 border border-emerald-100/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-500" />
                Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">{acceptedQuotes.length}</div>
              <p className="text-xs text-muted-foreground">Ready to invoice</p>
              <div className="mt-4">
                <Link to="/dashboard/invoices">
                  <Button variant="outline" size="sm" className="w-full bg-white/60 hover:bg-white/80 border-slate-200/50 shadow-sm">
                    Create Invoices
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Analytics Chart Card */}
          <Card className="md:col-span-2 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Financial Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <IncomeExpenseChart transactions={transactions} />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}