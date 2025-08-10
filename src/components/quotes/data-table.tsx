
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import type { Quote } from '@/lib/types';
import { MoreHorizontal, View } from 'lucide-react';
import Link from 'next/link';

export function QuotesDataTable({ data }: { data: Quote[] }) {
    const { clients } = useAppStore();
    
    const getClientName = (clientId: string) => {
        return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
    }

    const getTotalAmount = (items: Quote['items']) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Quote #</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((quote) => {
          return (
            <TableRow key={quote.id}>
              <TableCell>
                <div className="font-medium">{quote.quoteNumber}</div>
              </TableCell>
              <TableCell>
                {getClientName(quote.clientId)}
              </TableCell>
              <TableCell>
                {new Date(quote.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </TableCell>
               <TableCell>
                <Badge variant={quote.status === 'accepted' ? 'secondary' : (quote.status === 'sent' ? 'default' : 'outline')}>
                    {quote.status}
                </Badge>
              </TableCell>
              <TableCell
                className="text-right font-medium"
              >
                {formatCurrency(getTotalAmount(quote.items))}
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
                        <DropdownMenuItem asChild>
                           <Link href={`/dashboard/quotes/${quote.id}`}>
                             <View className="mr-2 h-4 w-4" />
                             View Quote
                           </Link>
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
