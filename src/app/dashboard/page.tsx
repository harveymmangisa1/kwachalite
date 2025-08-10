
'use client';

import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
import { IncomeExpenseChart } from '@/components/analytics/income-expense-chart';
import { CategoryPieChart } from '@/components/dashboard/category-pie-chart';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { BusinessDashboard } from '@/components/dashboard/business-dashboard';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

export default function Dashboard() {
  const { activeWorkspace } = useActiveWorkspace();

  if (activeWorkspace === 'business') {
    return <BusinessDashboard />;
  }

  return (
    <div className="flex-1 space-y-4">
      <DashboardHeader />
      <div className="space-y-6 px-4 sm:px-6">
        <OverviewCards />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <RecentTransactions />
            <CategoryPieChart />
        </div>
        <IncomeExpenseChart />
      </div>
    </div>
  );
}
