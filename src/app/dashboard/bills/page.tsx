'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppStore } from '@/lib/data';
import { formatCurrency, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddBillSheet } from '@/components/bills/add-bill-sheet';
import { Repeat, ReceiptText } from 'lucide-react';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

export default function BillsPage() {
    const { bills, updateBill } = useAppStore();
    const { toast } = useToast();
    
    const handlePayBill = (billId: string) => {
        const bill = bills.find(b => b.id === billId);
        if (bill) {
            const updatedBill = { ...bill, status: 'paid' as const };
            updateBill(updatedBill);
            
            toast({
                title: 'Bill Paid',
                description: `${bill.name} has been marked as paid.`,
            });
        }
    };
    
    // Sort bills by due date (unpaid first, then paid)
    const sortedBills = [...bills].sort((a, b) => {
        // Unpaid bills come first
        if (a.status === 'unpaid' && b.status === 'paid') return -1;
        if (a.status === 'paid' && b.status === 'unpaid') return 1;
        
        // Then sort by due date
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
            <div className="container-padding space-y-6 pb-8">
                <PageHeader 
                    title="Bills" 
                    description="Manage your upcoming and paid bills."
                    icon={<ReceiptText className="h-6 w-6 text-blue-600" />}
                >
                    <AddBillSheet />
                </PageHeader>
                <div className="grid grid-cols-1 gap-6">
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader>
                            <CardTitle>Upcoming Bills</CardTitle>
                            <CardDescription>
                                Here is a list of your upcoming bills.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {sortedBills.length > 0 ? (
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
                                        {sortedBills.map((bill) => (
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
                                                                    <p>Recurring {bill.recurringFrequency || 'monthly'}</p>
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
                                                    {bill.status === 'unpaid' && (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handlePayBill(bill.id)}
                                                            className="bg-emerald-600 hover:bg-emerald-700"
                                                        >
                                                            Pay Bill
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12">
                                    <ReceiptText className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">No Bills Found</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        You haven't added any bills yet.
                                    </p>
                                    <div className="mt-6">
                                        <AddBillSheet />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}