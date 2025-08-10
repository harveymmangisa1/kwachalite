
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { loans } from '@/lib/data';
import { formatCurrency, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Landmark } from 'lucide-react';
import { PlusCircle } from 'lucide-react';

export default function LoansPage() {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="Loans" description="Manage your loans and repayments.">
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Add Loan
                </Button>
            </PageHeader>
            <div className="px-4 sm:px-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Loans</CardTitle>
                        <CardDescription>
                            A list of your active and paid off loans.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loans.length > 0 ? (
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
                                    {loans.map((loan) => (
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
                                                {loan.status === 'active' && <Button size="sm">Make Payment</Button>}
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
                                     <Button size="sm" className="gap-1">
                                        <PlusCircle className="h-4 w-4" />
                                        Add Loan
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
