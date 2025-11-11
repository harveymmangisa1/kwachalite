'use client';

import { ClientsDataTable } from '@/components/clients/data-table';
import { AddClientSheet } from '@/components/clients/add-client-sheet';
import { useAppStore } from '@/lib/data';

export default function ClientsPage() {
  const { clients } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <AddClientSheet />
      </div>
      <ClientsDataTable data={clients} />
    </div>
  );
}
