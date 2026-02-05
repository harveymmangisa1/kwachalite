'use client';

import { BusinessOverviewCards } from './business-overview-cards';
import { RecentQuotes } from './recent-quotes';
import type { Transaction } from '@/lib/types';
import { RecentTransactions } from './recent-transactions';
import { IncomeExpenseChart } from '../analytics/income-expense-chart';
import { useBusinessProfile } from '@/hooks/use-business-profile-v2';
import React from 'react';
import { LoadingState, ErrorState } from '@/components/ui/loading';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export function BusinessDashboard({ transactions }: { transactions: Transaction[] }) {
  const { user } = useAuth();
  const { 
    businessProfile, 
    isLoading: profileLoading, 
    error: profileError, 
    getDisplayName,
    refreshProfile 
  } = useBusinessProfile();
  
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    if (profileLoading) {
      const timeout = setTimeout(() => setShowFallback(true), 3000);
      return () => clearTimeout(timeout);
    }
  }, [profileLoading]);

  const displayName = React.useMemo(() => getDisplayName(), [getDisplayName]);
  const heroName = businessProfile?.name || displayName;
  
  if (!user) return null;

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
      <DashboardHero 
        userName={heroName}
        userId={user.id}
        transactions={transactions}
      />

      <BusinessOverviewCards transactions={transactions} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={transactions} />
        <RecentQuotes />
      </div>

      <IncomeExpenseChart transactions={transactions} />
    </div>
  );
}
