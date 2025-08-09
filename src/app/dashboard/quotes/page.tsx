
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { quotes } from '@/lib/data';
import { AddQuoteSheet } from '@/components/quotes/add-quote-sheet';
import { QuotesDataTable } from '@/components/quotes/data-table';

export default function QuotesPage() {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="Quotations" description="Create and manage your quotations.">
                <AddQuoteSheet />
            </PageHeader>
            <div className="px-4 sm:px-6">
                <Card>
                    <CardHeader>
                        <CardTitle>All Quotations</CardTitle>
                        <CardDescription>
                            Here is a list of all your quotations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <QuotesDataTable data={quotes} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
