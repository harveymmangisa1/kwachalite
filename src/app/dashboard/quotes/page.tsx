
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/data';
import { AddQuoteSheet } from '@/components/quotes/add-quote-sheet';
import { QuotesDataTable } from '@/components/quotes/data-table';
import { FileText } from 'lucide-react';

export default function QuotesPage() {
    const { quotes } = useAppStore();
    return (
        <div className="flex-1 space-y-4">
            <PageHeader title="Quotations" description="Create and manage your quotations.">
                <AddQuoteSheet />
            </PageHeader>
            <div className="px-4 sm:px-6">
                <Card className="card-minimal">
                    <CardHeader>
                        <CardTitle>All Quotations</CardTitle>
                        <CardDescription>
                            Here is a list of all your quotations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {quotes.length > 0 ? (
                           <QuotesDataTable data={quotes} />
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No Quotations Found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                   You haven't created any quotations yet.
                                </p>
                                <div className="mt-6">
                                    <AddQuoteSheet />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
