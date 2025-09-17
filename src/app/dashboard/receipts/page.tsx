'use client';

import { PageHeader } from '@/components/page-header';
import { ReceiptsDataTable } from '@/components/receipts/data-table';

export default function ReceiptsPage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Sales Receipts"
        description="Track and manage payment receipts from your clients."
      />
      <div className="px-4 sm:px-6">
        <ReceiptsDataTable />
      </div>
    </div>
  );
}