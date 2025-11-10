
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

  // Calculate percentage changes compared to previous month
  const calculateMonthlyChange = (currentData: Transaction[], type: 'income' | 'expense') => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthTotal = currentData
      .filter(t => t.type === type)
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthTotal = currentData
      .filter(t => t.type === type)
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    if (lastMonthTotal === 0) {
      return currentMonthTotal > 0 ? { value: 100, label: 'from last month', trend: 'up' as const } : undefined;
    }

    const changePercent = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    return {
      value: Math.abs(changePercent),
      label: 'from last month',
      trend: (changePercent >= 0 ? 'up' : 'down') as 'up' | 'down' | 'neutral'
    };
  };

  const incomeChange = calculateMonthlyChange(transactions, 'income');
  const expenseChange = calculateMonthlyChange(transactions, 'expense');
  
  // Calculate balance change
  const currentBalance = totalIncome - totalExpenses;
  const balanceChange = incomeChange && expenseChange ? {
    value: Math.abs(incomeChange.value - expenseChange.value),
    label: 'from last month',
    trend: (currentBalance >= 0 ? 'up' : 'down') as 'up' | 'down' | 'neutral'
  } : undefined;

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
