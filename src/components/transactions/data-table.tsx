'use client';

import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, ReceiptText } from 'lucide-react';
import { useAppStore } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { EditTransactionSheet } from './edit-transaction-sheet';
import { format, parseISO } from 'date-fns';

export function TransactionsDataTable({ data }: { data: Transaction[] }) {
  const { deleteTransaction } = useAppStore();
  const { toast } = useToast();

  const handleDelete = (transaction: Transaction) => {
    deleteTransaction(transaction.id);
    toast({
        title: "Transaction Deleted",
        description: `"${transaction.description}" removed successfully.`,
        variant: "destructive"
    });
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-card/50 border-dashed">
        <ReceiptText className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground font-medium">No transactions found for this period.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">Description</TableHead>
              <TableHead className="hidden md:table-cell font-bold">Category</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="text-right font-bold">Amount</TableHead>
              <TableHead className="text-right w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((transaction) => {
              // Parse date safely to avoid timezone shifting
              const transactionDate = parseISO(transaction.date);
              
              return (
                <TableRow key={transaction.id} className="group transition-colors hover:bg-muted/30">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[140px] sm:max-w-none">
                        {transaction.description}
                      </span>
                      <span className="md:hidden text-[10px] mt-1">
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 uppercase font-bold tracking-tighter">
                          {transaction.category}
                        </Badge>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="font-medium">
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
                    {format(transactionDate, 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-bold text-sm sm:text-base whitespace-nowrap',
                      transaction.type === 'income' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-rose-600 dark:text-rose-400'
                    )}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel className="text-xs">Transaction Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {/* Wrapper for Edit to prevent Menu from closing prematurely */}
                        <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground">
                          <Edit className="mr-2 h-4 w-4" />
                          <EditTransactionSheet transaction={transaction} triggerText="Edit Details" />
                        </div>

                        <DropdownMenuItem 
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive" 
                          onClick={() => handleDelete(transaction)}
                        >
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
      </div>
    </div>
  );
}