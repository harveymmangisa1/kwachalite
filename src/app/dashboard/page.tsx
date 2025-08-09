import { PageHeader } from '@/components/page-header';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
import { IncomeExpenseChart } from '@/components/analytics/income-expense-chart';

export default function Dashboard() {
  return (
    <>
      <PageHeader title="Dashboard" description="Here’s a summary of your financial activity.">
          <AddTransactionSheet />
      </PageHeader>
      <div className="space-y-6">
        <OverviewCards />
        <div className="grid gap-6 lg:grid-cols-2">
          <IncomeExpenseChart />
          <RecentTransactions />
        </div>
      </div>
    </>
  );
}
