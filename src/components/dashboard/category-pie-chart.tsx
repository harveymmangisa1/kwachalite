
'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppStore } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function CategoryPieChart() {
  const { transactions } = useAppStore();
  const { activeWorkspace } = useActiveWorkspace();

  const expenseData = React.useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === 'expense' && t.workspace === activeWorkspace)
      .forEach((t) => {
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += t.amount;
      });

    return Object.keys(categoryTotals).map((categoryName) => ({
      name: categoryName,
      value: categoryTotals[categoryName],
    }));
  }, [transactions, activeWorkspace]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          A breakdown of your expenses for the current period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    cursor={{fill: 'hsl(var(--muted))'}}
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
              >
                {expenseData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
