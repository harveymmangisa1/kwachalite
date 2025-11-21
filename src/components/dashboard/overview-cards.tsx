
'use client';

import { StatCard } from '@/components/ui/stat-card';
import { formatCurrency } from '@/lib/utils';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Target } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { useAppStore } from '@/lib/data';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';

interface OverviewCardsProps {
  transactions: Transaction[];
}

export function OverviewCards({ transactions }: OverviewCardsProps) {
  const { activeWorkspace } = useActiveWorkspace();
  const { categories } = useAppStore();
  
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Calculate budget status
  const getBudgetStatus = () => {
    const expenseCategories = categories.filter(c => 
      c.type === 'expense' && 
      c.workspace === activeWorkspace && 
      c.budget && 
      c.budget > 0
    );

    if (expenseCategories.length === 0) return { totalBudget: 0, totalSpent: 0, percentage: 0 };

    const now = new Date();
    const totalBudget = expenseCategories.reduce((sum, category) => {
      // Get transactions for this category within the current month
      const categoryTransactions = transactions.filter(t => {
        if (t.category !== category.name || t.workspace !== activeWorkspace) return false;
        
        const transactionDate = new Date(t.date);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactionDate >= monthStart;
      });

      // Calculate spent amount for this category
      const spent = categoryTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return sum + (category.budget || 0);
    }, 0);

    const totalSpent = expenseCategories.reduce((sum, category) => {
      // Get transactions for this category within the current month
      const categoryTransactions = transactions.filter(t => {
        if (t.category !== category.name || t.workspace !== activeWorkspace) return false;
        
        const transactionDate = new Date(t.date);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactionDate >= monthStart;
      });

      // Calculate spent amount for this category
      const spent = categoryTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return sum + spent;
    }, 0);

    const percentage = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

    return { totalBudget, totalSpent, percentage };
  };

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

  const budgetStatus = getBudgetStatus();
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard
        title="Total Income"
        value={formatCurrency(totalIncome)}
        change={incomeChange}
        icon={<ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success" />}
        variant="success"
        description="Money coming in"
      />
      
      <StatCard
        title="Total Expenses"
        value={formatCurrency(totalExpenses)}
        change={expenseChange}
        icon={<ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5 text-error" />}
        variant="error"
        description="Money going out"
      />
      
      <StatCard
        title="Current Balance"
        value={formatCurrency(balance)}
        change={balanceChange}
        icon={<Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
        variant="gradient"
        description="Available funds"
      />
      
      <StatCard
        title="Budget Status"
        value={`${Math.round(getBudgetStatus().percentage)}%`}
        change={getBudgetStatus().totalBudget > 0 ? {
          value: getBudgetStatus().percentage,
          label: 'of budget used',
          trend: getBudgetStatus().percentage > 80 ? 'up' as const : 'neutral' as const
        } : undefined}
        icon={<Target className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />}
        variant={getBudgetStatus().percentage > 80 ? 'error' : getBudgetStatus().percentage > 60 ? 'warning' : 'success'}
        description={`${formatCurrency(getBudgetStatus().totalSpent)} / ${formatCurrency(getBudgetStatus().totalBudget)}`}
      />
    </div>
  );
}
