import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
import { TransactionsDataTable } from '@/components/transactions/data-table';
import { transactions } from '@/lib/data';

export default function TransactionsPage() {
    return (
        <>
            <PageHeader title="Transactions" description="A complete history of your financial activity.">
                <AddTransactionSheet />
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>
                        Here is a list of all your recorded transactions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TransactionsDataTable data={transactions} />
                </CardContent>
            </Card>
        </>
    )
}
