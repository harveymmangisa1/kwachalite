'use client';

import { formatCurrency } from '@/lib/utils';
import { 
  Wallet, Target, Calendar, Zap, DollarSign, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, CircleDollarSign, Sparkles, PieChart
} from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { useAppStore } from '@/lib/data';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

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
      return sum + (category.budget || 0);
    }, 0);

    const totalSpent = expenseCategories.reduce((sum, category) => {
      const categoryTransactions = transactions.filter(t => {
        if (t.category !== category.name || t.workspace !== activeWorkspace) return false;
        
        const transactionDate = new Date(t.date);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactionDate >= monthStart;
      });

      const spent = categoryTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return sum + spent;
    }, 0);

    const percentage = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

    return { totalBudget, totalSpent, percentage };
  };

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
      value: Math.abs(Math.round(changePercent * 10) / 10),
      label: 'vs last month',
      trend: (changePercent >= 0 ? 'up' : 'down') as 'up' | 'down' | 'neutral'
    };
  };

  const budgetStatus = getBudgetStatus();
  const incomeChange = calculateMonthlyChange(transactions, 'income');
  const expenseChange = calculateMonthlyChange(transactions, 'expense');
  
  const currentBalance = totalIncome - totalExpenses;
  const balanceChange = incomeChange && expenseChange ? {
    value: Math.abs(incomeChange.value - expenseChange.value),
    label: 'from last month',
    trend: (currentBalance >= 0 ? 'up' : 'down') as 'up' | 'down' | 'neutral'
  } : undefined;

  const renderChangeIndicator = (change: any) => {
    if (!change) return null;
    
    return (
      <div className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold",
        change.trend === 'up' 
          ? "bg-emerald-500/20 text-emerald-700"
          : change.trend === 'down'
          ? "bg-rose-500/20 text-rose-700"
          : "bg-slate-500/20 text-slate-600"
      )}>
        {change.trend === 'up' && <TrendingUp className="w-3 h-3" />}
        {change.trend === 'down' && <TrendingDown className="w-3 h-3" />}
        <span>{change.value}%</span>
      </div>
    );
  };

  return (
    <div className="relative -mx-4 md:mx-0">
      {/* Horizontal scroll container for mobile */}
      <div className="overflow-x-auto md:overflow-visible scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0 pb-2">
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-max md:min-w-0 snap-x snap-mandatory">
          {/* Income Card */}
          <Card className="group relative flex-shrink-0 w-[260px] md:w-auto overflow-hidden border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl p-5 sm:p-6 snap-start">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-transparent opacity-60" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                    <ArrowUpCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                {renderChangeIndicator(incomeChange)}
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Income</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(totalIncome)}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">This month</span>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-700">
                    {transactions.filter(t => t.type === 'income').length} entries
                  </span>
                </div>
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </Card>

          {/* Expenses Card */}
          <Card className="group relative flex-shrink-0 w-[260px] md:w-auto overflow-hidden border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl p-5 sm:p-6 snap-start">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50/30 to-transparent opacity-60" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between">
                <div className="relative">
                  <div className="absolute inset-0 bg-rose-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg">
                    <ArrowDownCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                {renderChangeIndicator(expenseChange)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expenses</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(totalExpenses)}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <PieChart className="w-4 h-4 text-rose-500" />
                  <span className="font-medium">This month</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-700">
                    {transactions.filter(t => t.type === 'expense').length} entries
                  </span>
                </div>
                <DollarSign className="w-4 h-4 text-rose-500" />
              </div>
            </div>
          </Card>

          {/* Balance Card */}
          <Card className="group relative flex-shrink-0 w-[260px] md:w-auto overflow-hidden border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl p-5 sm:p-6 snap-start">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50/30 to-transparent opacity-60" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                    <Wallet className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                {renderChangeIndicator(balanceChange)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Balance</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
                </div>
                <p className={cn(
                  "text-3xl sm:text-4xl font-black tracking-tight",
                  balance >= 0 ? "text-slate-900" : "text-rose-600"
                )}>
                  {formatCurrency(balance)}
                </p>
                <div className="flex items-center gap-1.5 text-sm">
                  {balance >= 0 ? (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-slate-600">Looking good!</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-slate-600">💡 Optimize spending</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    balance >= 0 ? "bg-emerald-500" : "bg-rose-500"
                  )} />
                  <span className="text-sm font-semibold text-slate-700">
                    {balance >= 0 ? "Positive flow" : "Needs attention"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Budget Status Card */}
          <Card className="group relative flex-shrink-0 w-[260px] md:w-auto overflow-hidden border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl p-5 sm:p-6 snap-start">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/30 to-transparent opacity-60" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                    <Target className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold",
                  budgetStatus.percentage > 80 
                    ? "bg-rose-500/20 text-rose-700"
                    : budgetStatus.percentage > 60
                    ? "bg-amber-500/20 text-amber-700"
                    : "bg-emerald-500/20 text-emerald-700"
                )}>
                  <span>{budgetStatus.percentage.toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Budget</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
                </div>
                
                {/* Progress Ring */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-slate-100"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - budgetStatus.percentage / 100)}`}
                        className={cn(
                          "transition-all duration-1000",
                          budgetStatus.percentage > 80 ? "text-rose-500" :
                          budgetStatus.percentage > 60 ? "text-amber-500" :
                          "text-emerald-500"
                        )}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-black text-slate-900">
                        {Math.round(budgetStatus.percentage)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-500">Spent</span>
                      <span className="font-bold text-slate-700">{formatCurrency(budgetStatus.totalSpent)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-500">Budget</span>
                      <span className="font-bold text-slate-700">{formatCurrency(budgetStatus.totalBudget)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {budgetStatus.percentage <= 60 && (
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="text-sm font-semibold text-slate-700">
                    {budgetStatus.percentage <= 60 ? "Great control!" : 
                     budgetStatus.percentage <= 80 ? "On track" : 
                     "Over budget"}
                  </span>
                </div>
                <CircleDollarSign className="w-4 h-4 text-amber-500" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Scroll indicator for mobile */}
      <div className="md:hidden flex justify-center gap-1 mt-4">
        <div className="w-2 h-2 rounded-full bg-slate-300" />
        <div className="w-2 h-2 rounded-full bg-slate-300" />
        <div className="w-2 h-2 rounded-full bg-slate-300" />
        <div className="w-2 h-2 rounded-full bg-slate-300" />
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
