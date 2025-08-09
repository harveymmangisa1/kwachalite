'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';


const data = [
  { month: 'Jan', income: 400000, expenses: 240000 },
  { month: 'Feb', income: 300000, expenses: 139800 },
  { month: 'Mar', income: 500000, expenses: 380000 },
  { month: 'Apr', income: 478000, expenses: 390800 },
  { month: 'May', income: 689000, expenses: 480000 },
  { month: 'Jun', income: 539000, expenses: 380000 },
  { month: 'Jul', income: 549000, expenses: 430000 },
];

export function IncomeExpenseChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs. Expenses</CardTitle>
        <CardDescription>A summary of your income and expenses over the last 7 months.</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
