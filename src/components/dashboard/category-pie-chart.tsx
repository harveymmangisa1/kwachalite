'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

interface CategoryData {
  name: string;
  value: number;
}

interface CategoryPieChartProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const CustomTooltip = React.memo(({ active, payload }: { active?: boolean, payload?: any[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Category
            </span>
            <span className="font-bold text-muted-foreground">
              {data.payload.name}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Amount
            </span>
            <span className="font-bold">
              {formatCurrency(data.value)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

function CategoryPieChartInner({ transactions, isLoading = false }: CategoryPieChartProps) {
  const expenseData = React.useMemo((): CategoryData[] => {
    if (isLoading) return [];
    
    const categoryTotals: { [key: string]: number } = {};
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');
    
    for (const transaction of expenseTransactions) {
      const category = transaction.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
    }

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort by value descending
      .slice(0, 10); // Limit to top 10 categories for performance
  }, [transactions, isLoading]);

  if (isLoading) {
    return (
      <div className="h-[400px] w-full space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex justify-center">
          <Skeleton className="h-[240px] w-[240px] rounded-full" />
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-sm" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (expenseData.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">No expense data available</p>
          <p className="text-xs text-muted-foreground">Start adding transactions to see your spending breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'hsl(var(--muted))' }}
          />
          <Pie
            data={expenseData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            animationDuration={800}
            animationBegin={0}
          >
            {expenseData.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const CategoryPieChart = React.memo(CategoryPieChartInner, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.transactions.length !== nextProps.transactions.length) return false;
  
  // Deep comparison for transactions array (only if lengths are the same)
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