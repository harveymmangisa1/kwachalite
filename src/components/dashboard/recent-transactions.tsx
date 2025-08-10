
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppStore } from '@/lib/data';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';
import { TrendingDown, TrendingUp } from 'lucide-react';

export function RecentTransactions() {
  const { transactions } = useAppStore();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your five most recent transactions.
          </CardDescription>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/transactions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-md',
                    transaction.type === 'income'
                      ? 'bg-emerald-100 dark:bg-emerald-900'
                      : 'bg-rose-100 dark:bg-rose-900'
                  )}
                >
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.category}
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  'font-medium',
                  transaction.type === 'income'
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                )}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
