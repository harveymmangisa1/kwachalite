
'use client';

import { PageHeader } from '@/components/page-header';
import { AddQuoteSheet } from '@/components/quotes/add-quote-sheet';
import { AddClientSheet } from '@/components/clients/add-client-sheet';
import { BusinessOverviewCards } from './business-overview-cards';
import { RecentQuotes } from './recent-quotes';

export function BusinessDashboard() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader title="Business Dashboard" description="An overview of your business performance.">
        <AddClientSheet />
        <AddQuoteSheet />
      </PageHeader>
      <div className="space-y-6 px-4 sm:px-6">
        <BusinessOverviewCards />
        <div className="grid gap-6">
            <RecentQuotes />
        </div>
      </div>
    </div>
  );
}
