
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import React from 'react';

interface IncomeExpenseChartProps {
    transactions: Transaction[];
}

export function IncomeExpenseChart({ transactions }: IncomeExpenseChartProps) {
    const data = React.useMemo(() => {
        const monthData: { [month: string]: { income: number; expenses: number } } = {};
        
        transactions.forEach(t => {
            const month = new Date(t.date).toLocaleString('default', { month: 'short' });
            if (!monthData[month]) {
                monthData[month] = { income: 0, expenses: 0 };
            }
            if (t.type === 'income') {
                monthData[month].income += t.amount;
            } else {
                monthData[month].expenses += t.amount;
            }
        });
        
        const chartData = Object.entries(monthData).map(([month, values]) => ({
            month,
            ...values
        }));

        return chartData;

    }, [transactions]);


  return (
    <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value as number).replace('MK ', '')} />
            <Tooltip 
                formatter={(value) => formatCurrency(value as number)}
                cursor={{fill: 'hsl(var(--muted))'}}
            />
            <Legend />
            <Bar dataKey="income" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
