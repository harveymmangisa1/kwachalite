'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ArrowDown, Star, DollarSign } from 'lucide-react';
import type { Transaction } from '@/lib/types';

const COLORS = [
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f43f5e', // Rose
  '#6366f1', // Indigo
];

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface CategoryPieChartProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const CustomActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))',
          transition: 'all 0.3s ease'
        }}
      />
    </g>
  );
};

function CategoryPieChartInner({ transactions, isLoading = false }: CategoryPieChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  const expenseData = React.useMemo((): CategoryData[] => {
    if (isLoading) return [];
    
    const categoryTotals: { [key: string]: number } = {};
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');
    
    for (const transaction of expenseTransactions) {
      const category = transaction.category || 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
    }

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ 
        name, 
        value,
        percentage: total > 0 ? (value / total) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions, isLoading]);

  const totalExpenses = React.useMemo(() => {
    return expenseData.reduce((sum, item) => sum + item.value, 0);
  }, [expenseData]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex justify-center py-8">
          <Skeleton className="h-64 w-64 rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (expenseData.length === 0) {
    return (
      <Card className="border-0 shadow-lg rounded-3xl p-12 bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
            <ArrowDown className="w-10 h-10 text-purple-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">No expenses yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Start tracking your spending to see a beautiful breakdown of where your money goes
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-500" />
            Spending Breakdown
          </h3>
          <p className="text-sm text-slate-500 mt-1">Where your money went this month</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 via-pink-100/20 to-transparent rounded-3xl blur-3xl" />
        <Card className="relative border-0 shadow-xl rounded-3xl p-6 bg-white/80 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={CustomActiveShape}
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={onPieEnter}
                animationDuration={800}
                animationBegin={0}
              >
                {expenseData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={COLORS[index % COLORS.length]}
                    style={{ outline: 'none' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {expenseData.length} Categories
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {expenseData.map((category, index) => (
          <Card
            key={category.name}
            className={`
              group border-0 rounded-2xl p-4 transition-all duration-300 cursor-pointer
              ${activeIndex === index 
                ? 'shadow-lg scale-[1.02] bg-gradient-to-r from-white to-purple-50/50' 
                : 'shadow-md hover:shadow-lg bg-white'
              }
            `}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <div className="flex items-center gap-4">
              {/* Color Indicator */}
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}, ${COLORS[index % COLORS.length]}dd)`
                  }}
                >
                  <span className="text-xl font-black text-white">
                    {index + 1}
                  </span>
                </div>
                {activeIndex === index && (
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 animate-pulse" />
                )}
              </div>

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-900 truncate">
                    {category.name}
                  </h4>
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {category.percentage.toFixed(1)}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${category.percentage}%`,
                      background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[index % COLORS.length]}cc)`
                    }}
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className="text-lg font-black text-slate-900">
                  {formatCurrency(category.value)}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  of {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Footer */}
      {expenseData.length > 0 && (
        <Card className="border-0 shadow-md rounded-2xl p-4 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-500" />
              <span className="font-semibold text-slate-700">
                Top expense: <span className="text-slate-900">{expenseData[0].name}</span>
              </span>
            </div>
            <span className="font-bold text-purple-600">
              {expenseData[0].percentage.toFixed(1)}% of total
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}

export const CategoryPieChart = React.memo(CategoryPieChartInner, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.transactions.length !== nextProps.transactions.length) return false;
  
  return prevProps.transactions.every((transaction, index) => {
    const nextTransaction = nextProps.transactions[index];
    return (
      transaction.id === nextTransaction.id &&
      transaction.amount === nextTransaction.amount &&
      transaction.category === nextTransaction.category &&
      transaction.type === nextTransaction.type
    );
  });
});