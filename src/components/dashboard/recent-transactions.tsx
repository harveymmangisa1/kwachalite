
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { Link } from 'react-router-dom';

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
  maxItems?: number;
}

// Memoized transaction item for better performance
const TransactionItem = React.memo(({ transaction }: { transaction: Transaction }) => {
  const isIncome = transaction.type === 'income';
  
  return (
    <div className="flex items-center justify-between group row-hover-minimal -mx-3 px-3 py-3 rounded-xl border border-transparent hover:border-border/50">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div
          className={cn(
            'p-2.5 rounded-xl flex-shrink-0',
            isIncome
              ? 'bg-[rgb(var(--success-light))]'
              : 'bg-[rgb(var(--error-light))]'
          )}
        >
          {isIncome ? (
            <ArrowUp className="h-4 w-4" style={{ color: `rgb(var(--success))` }} />
          ) : (
            <ArrowDown className="h-4 w-4" style={{ color: `rgb(var(--error))` }} />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="font-medium text-sm truncate" title={transaction.description}>
            {transaction.description}
          </div>
          <div className="text-xs text-muted-foreground truncate" title={transaction.category || 'Uncategorized'}>
            {transaction.category || 'Uncategorized'}
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {new Date(transaction.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>
      <div
        className={cn(
          'font-medium text-sm flex-shrink-0 px-2 py-1 rounded-lg',
          isIncome ? 'badge-success' : 'badge-error'
        )}
      >
        {isIncome ? '+' : '-'}
        {formatCurrency(transaction.amount)}
      </div>
    </div>
  );
});

TransactionItem.displayName = 'TransactionItem';

// Loading skeleton component
const TransactionSkeleton = React.memo(() => (
  <div className="flex items-center justify-between p-2">
    <div className="flex items-center gap-3 flex-1">
      <Skeleton className="h-9 w-9 rounded-md" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="h-4 w-20" />
  </div>
));

TransactionSkeleton.displayName = 'TransactionSkeleton';

function RecentTransactionsInner({ 
  transactions, 
  isLoading = false, 
  maxItems = 5 
}: RecentTransactionsProps) {
  const recentTransactions = React.useMemo(() => {
    if (isLoading) return [];
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, maxItems);
  }, [transactions, isLoading, maxItems]);

  if (isLoading) {
    return (
      <Card className="card-minimal">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-20" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: maxItems }).map((_, i) => (
            <TransactionSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (recentTransactions.length === 0) {
    return (
      <Card className="card-minimal">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Your latest financial activity
            </CardDescription>
          </div>
          <Link to="/dashboard/transactions">
            <Button variant="outline" size="sm" className="hover:bg-primary/5 hover:border-primary/30 transition-colors">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-2xl bg-muted/50 p-4 mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">
            No transactions yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Start by adding your first transaction to see your financial activity here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-minimal">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Your latest {recentTransactions.length} transaction{recentTransactions.length !== 1 ? 's' : ''}
          </CardDescription>
        </div>
        <Link to="/dashboard/transactions">
          <Button variant="outline" size="sm" className="hover:bg-primary/5 hover:border-primary/30 transition-colors">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentTransactions.map((transaction) => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction} 
          />
        ))}
      </CardContent>
    </Card>
  );
}

// Memoized component with custom comparison
export const RecentTransactions = React.memo(RecentTransactionsInner, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.maxItems !== nextProps.maxItems) return false;
  if (prevProps.transactions.length !== nextProps.transactions.length) return false;
  
  // Only compare the first maxItems transactions since that's what we display
  const prevRecentTransactions = prevProps.transactions.slice(0, prevProps.maxItems || 5);
  const nextRecentTransactions = nextProps.transactions.slice(0, nextProps.maxItems || 5);
  
  return prevRecentTransactions.every((transaction, index) => {
    const nextTransaction = nextRecentTransactions[index];
    return (
      transaction.id === nextTransaction.id &&
      transaction.amount === nextTransaction.amount &&
      transaction.description === nextTransaction.description &&
      transaction.type === nextTransaction.type &&
      transaction.category === nextTransaction.category &&
      transaction.date === nextTransaction.date
    );
  });
});
