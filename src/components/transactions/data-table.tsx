'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { categories, transactions } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

export function TransactionsDataTable({ data }: { data: Transaction[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction) => {
          return (
            <TableRow key={transaction.id}>
              <TableCell>
                <div className="font-medium">{transaction.description}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{transaction.category}</Badge>
              </TableCell>
              <TableCell>
                {new Date(transaction.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-medium',
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
