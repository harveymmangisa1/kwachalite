'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppStore } from '@/lib/data';
import { formatCurrency, cn } from '@/lib/utils';
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
import { Landmark, MoreHorizontal, CreditCard, Trash2 } from 'lucide-react';
import { AddLoanSheet } from '@/components/loans/add-loan-sheet';
import { useToast } from '@/hooks/use-toast';
import type { Loan } from '@/lib/types';

export default function LoansPage() {
    const { loans, updateLoan, deleteLoan } = useAppStore();
    const { toast } = useToast();

    const handleMakePayment = (loan: Loan) => {
        // For simplicity, let's mark it as paid
        const updatedLoan: Loan = {
            ...loan,
            status: 'paid',
            remainingAmount: 0,
        };
        updateLoan(updatedLoan);
        toast({
            title: 'Payment Processed',
            description: `Loan from ${loan.lender} has been marked as paid off.`,
        });
    };

    const handleDelete = (loan: Loan) => {
        deleteLoan(loan.id);
        toast({
            title: 'Loan Deleted',
            description: `Loan from ${loan.lender} has been removed.`,
            variant: 'destructive',
        });
    };
    
    // Sort loans by status (active first) and then by start date
    const sortedLoans = [...loans].sort((a, b) => {
        // Active loans come first
        if (a.status === 'active' && b.status === 'paid') return -1;
        if (a.status === 'paid' && b.status === 'active') return 1;
        
        // Then sort by start date
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
            <div className="container-padding space-y-6 pb-8">
                <PageHeader 
                    title="Loans" 
                    description="Manage your loans and repayments."
                    icon={<Landmark className="h-6 w-6 text-blue-600" />}
                >
                    <AddLoanSheet />
                </PageHeader>
                <div className="grid grid-cols-1 gap-6">
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader>
                            <CardTitle>Your Loans</CardTitle>
                            <CardDescription>
                                A list of your active and paid off loans.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {sortedLoans.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Lender</TableHead>
                                            <TableHead>Principal</TableHead>
                                            <TableHead>Remaining</TableHead>
                                            <TableHead>Interest Rate</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedLoans.map((loan) => (
                                            <TableRow key={loan.id}>
                                                <TableCell className="font-medium">{loan.lender}</TableCell>
                                                <TableCell>{formatCurrency(loan.principal)}</TableCell>
                                                <TableCell>{formatCurrency(loan.remainingAmount)}</TableCell>
                                                <TableCell>{loan.interestRate}%</TableCell>
                                                <TableCell>
                                                    <Badge variant={loan.status === 'paid' ? 'secondary' : 'default'}>
                                                        {loan.status}
                                                    </Badge>
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
                                                            {loan.status === 'active' && (
                                                                <DropdownMenuItem onClick={() => handleMakePayment(loan)}>
                                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                                    Pay Off Loan
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(loan)}>
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Loan
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12">
                                    <Landmark className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">No Loans Found</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        You haven't added any loans yet.
                                    </p>
                                    <div className="mt-6">
                                         <AddLoanSheet />
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