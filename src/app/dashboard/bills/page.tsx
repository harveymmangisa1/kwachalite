import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { bills } from '@/lib/data';
import { formatCurrency, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddBillSheet } from '@/components/bills/add-bill-sheet';
import { Repeat } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export default function BillsPage() {
    return (
        <>
            <PageHeader title="Bills" description="Manage your upcoming and paid bills.">
                <AddBillSheet />
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Bills</CardTitle>
                    <CardDescription>
                        Here is a list of your upcoming bills.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.map((bill) => (
                                <TableRow key={bill.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        {bill.name}
                                        {bill.isRecurring && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Repeat className="h-4 w-4 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Recurring {bill.recurringFrequency}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={bill.status === 'paid' ? 'secondary' : 'destructive'}>
                                            {bill.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(bill.amount)}</TableCell>
                                    <TableCell className="text-right">
                                        {bill.status === 'unpaid' && <Button size="sm">Pay Bill</Button>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    )
}
