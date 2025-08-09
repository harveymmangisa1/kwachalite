
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
import { clients, products } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Quote } from '@/lib/types';

export function QuotesDataTable({ data }: { data: Quote[] }) {
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
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
