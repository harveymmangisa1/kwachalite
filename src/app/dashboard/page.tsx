'use client';

import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { IncomeExpenseChart } from '@/components/analytics/income-expense-chart';
import { CategoryPieChart } from '@/components/dashboard/category-pie-chart';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { BusinessDashboard } from '@/components/dashboard/business-dashboard';
import { GettingStarted } from '@/components/onboarding/getting-started';
import { useOnboarding } from '@/hooks/use-onboarding';
import { MobileSidebarTrigger } from '@/components/sidebar';
import { useAppStore } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, CreditCard, FileText, PiggyBank, Landmark, TrendingUp, ArrowUp, ArrowDown, Calendar, Filter, Wallet, Bell, Settings, Search, Menu, DollarSign, Users, Plus, BarChart3, PieChart, Activity } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Dashboard() {
  const { activeWorkspace } = useActiveWorkspace();
  const { user } = useAuth();
  const { transactions, bills, savingsGoals, loans } = useAppStore();
  const { isOnboardingCompleted, completeOnboarding, skipOnboarding } = useOnboarding();
  const [isVisible, setIsVisible] = useState(false);
  const [greeting, setGreeting] = React.useState('');
  const [currentTime, setCurrentTime] = React.useState(new Date());

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

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const personalTransactions = React.useMemo(() =>
    transactions.filter(t => t.workspace === 'personal'),
    [transactions]
  );
  
  const businessTransactions = React.useMemo(() =>
    transactions.filter(t => t.workspace === 'business'),
    [transactions]
  );

  const activeBills = bills.filter(bill => bill.status === 'unpaid' && bill.workspace === activeWorkspace);
  const activeGoals = savingsGoals.filter(goal => goal.workspace === activeWorkspace);
  const activeLoans = loans.filter(loan => loan.status === 'active' && loan.workspace === activeWorkspace);

  const hasAnyData = transactions.length > 0 || bills.length > 0 || savingsGoals.length > 0 || loans.length > 0;
  
  // Show dashboard if user has data OR onboarding is completed
  const shouldShowDashboard = hasAnyData || isOnboardingCompleted;

  // Calculate financial summary
  const totalIncome = personalTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = personalTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netFlow = totalIncome - totalExpenses;
  
  const savingsRate = totalIncome > 0 ? (activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0) / totalIncome) * 100 : 0;

  // Get user display name
  const displayName = React.useMemo(() => {
    return user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  }, [user]);

  if (activeWorkspace === 'business') {
    return <BusinessDashboard transactions={businessTransactions} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
      {/* Modern Header with Profile - Applying the budget page card style */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
        <div className="container-padding">
          <Card className="border-0 bg-gradient-to-r from-white/60 via-white/80 to-blue-50/60 backdrop-blur-xl shadow-none my-3 rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                      KwachaLite
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div>
                        Live
                      </Badge>
                      <span className="text-xs text-slate-500 hidden sm:inline">Personal Workspace</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="hidden sm:flex h-9 gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/60">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 relative">
                    <Bell className="h-4 w-4" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  </Button>
                  <MobileSidebarTrigger />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className={`container-padding space-y-6 pb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {shouldShowDashboard ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Greeting Card - Updated to match budget page hero style */}
            <Card className="md:col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Financial Overview</h2>
                  <p className="text-blue-100">Track your financial progress</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-200" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                {/* User Profile Section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src={user?.user_metadata?.avatar_url || `https://placehold.co/100x100.png?text=${displayName.charAt(0)}`} 
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
                  <div className="text-blue-100 text-sm mb-1">Total Income</div>
                  <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-blue-100 text-sm mb-1">Total Expenses</div>
                  <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-blue-100 text-sm mb-1">Net Flow</div>
                  <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {formatCurrency(Math.abs(netFlow))}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-blue-100 mb-2">
                  <span>Financial Health</span>
                  <span>{totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      totalIncome > 0 && (totalExpenses / totalIncome) > 1 ? 'bg-red-400' : 
                      totalIncome > 0 && (totalExpenses / totalIncome) > 0.9 ? 'bg-yellow-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${totalIncome > 0 ? Math.min(100, (totalExpenses / totalIncome) * 100) : 0}%` }}
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
                  <Link to="/dashboard/bills">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span>Manage Bills</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start gap-3 bg-white/60 hover:bg-white/80 border-slate-200/50 shadow-sm">
                  <Link to="/dashboard/goals">
                    <Target className="h-4 w-4 text-emerald-500" />
                    <span>View Goals</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start gap-3 bg-white/60 hover:bg-white/80 border-slate-200/50 shadow-sm">
                  <Link to="/dashboard/loans">
                    <Landmark className="h-4 w-4 text-purple-500" />
                    <span>Manage Loans</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start gap-3 bg-white/60 hover:bg-white/80 border-slate-200/50 shadow-sm">
                  <Link to="/dashboard/budgets">
                    <PiggyBank className="h-4 w-4 text-amber-500" />
                    <span>Budget Manager</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Overview Cards */}
            <Card className="md:col-span-3 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OverviewCards transactions={personalTransactions} />
              </CardContent>
            </Card>
            
            {/* Recent Activity and Analytics - Split into two cards */}
            <Card className="md:col-span-2 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentTransactions transactions={personalTransactions} />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-1 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-500" />
                  Spending by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart transactions={personalTransactions} />
              </CardContent>
            </Card>
            
            {/* Financial Analytics Card */}
            <Card className="md:col-span-3 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Financial Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeExpenseChart transactions={personalTransactions} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="container-padding space-y-6 pb-8">
            <GettingStarted 
              onSkip={skipOnboarding}
              onComplete={completeOnboarding}
            />
          </div>
        )}
      </div>
    </div>
  );
}
