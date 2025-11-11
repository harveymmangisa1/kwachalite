'use client';

import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { IncomeExpenseChart } from '@/components/analytics/income-expense-chart';
import { CategoryPieChart } from '@/components/dashboard/category-pie-chart';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { BusinessDashboard } from '@/components/dashboard/business-dashboard';
import { GettingStarted } from '@/components/onboarding/getting-started';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAppStore } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, FileText, PiggyBank, Landmark, TrendingUp, ArrowUp, ArrowDown, Calendar, Filter, Wallet, Bell, Search, DollarSign } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';

export default function Dashboard() {
  const { activeWorkspace } = useActiveWorkspace();
  const { user } = useAuth();
  const { transactions, bills, savingsGoals, loans } = useAppStore();
  const { isOnboardingCompleted, completeOnboarding, skipOnboarding } = useOnboarding();

  const personalTransactions = React.useMemo(() =>
    transactions.filter(t => t.workspace === 'personal'),
    [transactions]
  );
  
  const businessTransactions = React.useMemo(() =>
    transactions.filter(t => t.workspace === 'business'),
    [transactions]
  );

  const hasAnyData = transactions.length > 0 || bills.length > 0 || savingsGoals.length > 0 || loans.length > 0;
  const shouldShowDashboard = hasAnyData || isOnboardingCompleted;

  if (activeWorkspace === 'business') {
    return <BusinessDashboard transactions={businessTransactions} />;
  }

  return (
    <div className="container-padding py-4 sm:py-8 space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
      {shouldShowDashboard ? (
          <OverviewCards transactions={personalTransactions} />
      ) : (
        <GettingStarted 
          onSkip={skipOnboarding}
          onComplete={completeOnboarding}
        />
      )}
    </div>
  );
}
