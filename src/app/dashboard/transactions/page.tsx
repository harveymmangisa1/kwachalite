'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
import { TransactionsDataTable } from '@/components/transactions/data-table';
import { ExportTransactions } from '@/components/export-data';
import { useAppStore } from '@/lib/data';
import { ArrowRightLeft, BarChart3 } from 'lucide-react';

export default function TransactionsPage() {
    const { transactions } = useAppStore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
            <div className="container-padding space-y-6 pb-8">
                <PageHeader 
                    title="Transactions" 
                    description="A complete history of your financial activity."
                    icon={<ArrowRightLeft className="h-6 w-6 text-blue-600" />}
                >
                    <div className="flex gap-2">
                        <ExportTransactions showDropdown />
                        <AddTransactionSheet />
                    </div>
                </PageHeader>
                <div className="grid grid-cols-1 gap-6">
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                                All Transactions
                            </CardTitle>
                            <CardDescription>
                                Here is a list of all your recorded transactions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TransactionsDataTable data={transactions} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}