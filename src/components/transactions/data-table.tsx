
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
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useAppStore } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { EditTransactionSheet } from './edit-transaction-sheet';

export function TransactionsDataTable({ data }: { data: Transaction[] }) {
  const { deleteTransaction } = useAppStore();
  const { toast } = useToast();

  const handleDelete = (transaction: Transaction) => {
    deleteTransaction(transaction.id);
    toast({
        title: "Transaction Deleted",
        description: `The transaction "${transaction.description}" has been deleted.`,
        variant: "destructive"
    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction) => {
          return (
            <TableRow key={transaction.id} className="row-hover-minimal">
              <TableCell>
                <div className="font-medium">{transaction.description}</div>
              </TableCell>
              <TableCell>
                <span className="px-2 py-0.5 rounded-md text-xs bg-accent text-secondary-foreground">
                  {transaction.category}
                </span>
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
                  transaction.type === 'income' ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'
                )}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={e => e.preventDefault()}>
                            <EditTransactionSheet transaction={transaction} />
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(transaction)}>
                           <Trash2 className="mr-2 h-4 w-4" />
                           Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
