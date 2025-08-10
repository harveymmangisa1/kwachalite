
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';
import type { Quote } from '@/lib/types';

export function RecentQuotes() {
  const { quotes, clients } = useAppStore();
  const recentQuotes = quotes.slice(0, 5);

   const getClientName = (clientId: string) => {
        return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
    }

    const getTotalAmount = (items: Quote['items']) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Quotations</CardTitle>
          <CardDescription>
            Your five most recent quotations.
          </CardDescription>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/quotes">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {recentQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                        <TableCell className="font-medium">
                            <Link href={`/dashboard/quotes/${quote.id}`} className="hover:underline text-primary">
                                {quote.quoteNumber}
                            </Link>
                        </TableCell>
                        <TableCell>{getClientName(quote.clientId)}</TableCell>
                        <TableCell>
                            <Badge variant={quote.status === 'accepted' ? 'secondary' : (quote.status === 'sent' ? 'default' : 'outline')}>
                                {quote.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(getTotalAmount(quote.items))}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
