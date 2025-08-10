
'use client';

import { PageHeader } from '@/components/page-header';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
import { IncomeExpenseChart } from '@/components/analytics/income-expense-chart';
import { CategoryPieChart } from '@/components/dashboard/category-pie-chart';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { BusinessDashboard } from '@/components/dashboard/business-dashboard';
import { AddQuoteSheet } from '@/components/quotes/add-quote-sheet';
import { AddClientSheet } from '@/components/clients/add-client-sheet';

export default function Dashboard() {
  const { activeWorkspace } = useActiveWorkspace();

  if (activeWorkspace === 'business') {
    return <BusinessDashboard />;
  }

  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="Dashboard" description="Here’s a summary of your financial activity.">
          <AddTransactionSheet />
      </PageHeader>
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
