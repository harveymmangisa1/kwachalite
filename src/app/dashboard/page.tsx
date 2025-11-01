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
import { Target, FileText, PiggyBank, Landmark, TrendingUp, ArrowUp, ArrowDown, Calendar, Filter, Wallet, Bell, Search, DollarSign, BarChart3, PieChart, Activity } from 'lucide-react';
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
  const shouldShowDashboard = hasAnyData || isOnboardingCompleted;

  const totalIncome = personalTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = personalTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0) / totalIncome) * 100 : 0;

  const displayName = React.useMemo(() => {
    return user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  }, [user]);

  if (activeWorkspace === 'business') {
    return <BusinessDashboard transactions={businessTransactions} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimalist Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="container-padding">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-slate-900">KwachaLite</h1>
                  <p className="text-xs text-slate-500">Personal</p>
                </div>
              </div>
              
              {/* Navigation Tabs - Desktop */}
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
            
            {/* Right Section */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden md:flex text-slate-600 hover:text-slate-900">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </Button>
              <div className="hidden md:block w-px h-6 bg-slate-200 mx-2"></div>
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.user_metadata?.avatar_url || `https://placehold.co/100x100.png?text=${displayName.charAt(0)}`} 
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

      <div className={`container-padding py-8 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {shouldShowDashboard ? (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 mb-1">
                    {greeting}, {displayName}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="hidden md:flex items-center gap-3 mt-4 md:mt-0">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    This Month
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <ArrowDown className="h-5 w-5 text-emerald-600" />
                      </div>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        12%
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Total Income</p>
                    <p className="text-2xl font-semibold text-slate-900">{formatCurrency(totalIncome)}</p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                        <ArrowUp className="h-5 w-5 text-rose-600" />
                      </div>
                      <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        8%
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Total Expenses</p>
                    <p className="text-2xl font-semibold text-slate-900">{formatCurrency(totalExpenses)}</p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <Badge variant="outline" className={`${netFlow >= 0 ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-rose-600 border-rose-200 bg-rose-50'}`}>
                        {netFlow >= 0 ? 'Positive' : 'Negative'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Net Cash Flow</p>
                    <p className={`text-2xl font-semibold ${netFlow >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                      {formatCurrency(Math.abs(netFlow))}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                        <PiggyBank className="h-5 w-5 text-violet-600" />
                      </div>
                      <Badge variant="outline" className="text-violet-600 border-violet-200 bg-violet-50">
                        {Math.round(savingsRate)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Savings Rate</p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {formatCurrency(activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0))}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Financial Analytics */}
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-slate-900">
                        Financial Analytics
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 text-xs">
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <IncomeExpenseChart transactions={personalTransactions} />
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-slate-900">
                        Recent Transactions
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 text-xs">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <RecentTransactions transactions={personalTransactions} />
                  </CardContent>
                </Card>

                {/* Overview Cards */}
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Financial Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <OverviewCards transactions={personalTransactions} />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    <Button asChild variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-50">
                      <Link to="/dashboard/bills">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-slate-700">Manage Bills</span>
                      </Link>
                    </Button>
                    
                    <Button asChild variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-50">
                      <Link to="/dashboard/goals">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <Target className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-sm text-slate-700">Savings Goals</span>
                      </Link>
                    </Button>
                    
                    <Button asChild variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-50">
                      <Link to="/dashboard/loans">
                        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                          <Landmark className="h-4 w-4 text-violet-600" />
                        </div>
                        <span className="text-sm text-slate-700">Track Loans</span>
                      </Link>
                    </Button>
                    
                    <Button asChild variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-50">
                      <Link to="/dashboard/budgets">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                          <PiggyBank className="h-4 w-4 text-amber-600" />
                        </div>
                        <span className="text-sm text-slate-700">Budget Planner</span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Spending by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <CategoryPieChart transactions={personalTransactions} />
                  </CardContent>
                </Card>

                {/* Financial Health Score */}
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Financial Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-500">Expense Ratio</span>
                          <span className="font-medium text-slate-900">
                            {totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              totalIncome > 0 && (totalExpenses / totalIncome) > 1 ? 'bg-rose-500' : 
                              totalIncome > 0 && (totalExpenses / totalIncome) > 0.9 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${totalIncome > 0 ? Math.min(100, (totalExpenses / totalIncome) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500 mb-3">Recommendations</p>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-slate-400 rounded-full mt-1.5"></div>
                            <p className="text-xs text-slate-600">Review discretionary spending</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-slate-400 rounded-full mt-1.5"></div>
                            <p className="text-xs text-slate-600">Set up automatic savings</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-slate-400 rounded-full mt-1.5"></div>
                            <p className="text-xs text-slate-600">Consider investment options</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <GettingStarted 
            onSkip={skipOnboarding}
            onComplete={completeOnboarding}
          />
        )}
      </div>
    </div>
  );
}