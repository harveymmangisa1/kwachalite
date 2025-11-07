
'use client';

import { StatCard } from '@/components/ui/stat-card';
import { formatCurrency } from '@/lib/utils';
import { Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import type { Transaction } from '@/lib/types';

interface OverviewCardsProps {
  transactions: Transaction[];
}

export function OverviewCards({ transactions }: OverviewCardsProps) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Calculate percentage changes (mock data for now)
  const incomeChange = { value: 12.5, label: 'from last month', trend: 'up' as const };
  const expenseChange = { value: 8.2, label: 'from last month', trend: 'down' as const };
  const balanceChange = { value: 15.3, label: 'from last month', trend: 'up' as const };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Income"
        value={formatCurrency(totalIncome)}
        change={incomeChange}
        icon={<ArrowUpCircle className="h-5 w-5 text-success" />}
        variant="success"
        description="Money coming in"
      />
      
      <StatCard
        title="Total Expenses"
        value={formatCurrency(totalExpenses)}
        change={expenseChange}
        icon={<ArrowDownCircle className="h-5 w-5 text-error" />}
        variant="error"
        description="Money going out"
      />
      
      <StatCard
        title="Current Balance"
        value={formatCurrency(balance)}
        change={balanceChange}
        icon={<Wallet className="h-5 w-5 text-primary" />}
        variant="gradient"
        description="Available funds"
      />
    </div>
  );
}
