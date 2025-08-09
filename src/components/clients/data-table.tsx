
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Client } from '@/lib/types';

export function ClientsDataTable({ data }: { data: Client[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((client) => {
          return (
            <TableRow key={client.id}>
              <TableCell>
                <div className="font-medium">{client.name}</div>
              </TableCell>
              <TableCell>
                {client.email}
              </TableCell>
              <TableCell>
                {client.phone}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
