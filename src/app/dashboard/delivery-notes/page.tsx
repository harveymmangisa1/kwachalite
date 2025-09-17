'use client';

import { PageHeader } from '@/components/page-header';
import { DeliveryNotesDataTable } from '@/components/delivery-notes/data-table';

export default function DeliveryNotesPage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Delivery Notes"
        description="Track and manage deliveries of goods to your clients."
      />
      <div className="px-4 sm:px-6">
        <DeliveryNotesDataTable />
      </div>
    </div>
  );
}