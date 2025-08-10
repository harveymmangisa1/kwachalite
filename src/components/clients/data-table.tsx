
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, View, Edit, Trash2 } from 'lucide-react';
import type { Client } from '@/lib/types';
import Link from 'next/link';
import { EditClientSheet } from './edit-client-sheet';

export function ClientsDataTable({ data }: { data: Client[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="text-right">Actions</TableHead>
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
               <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                           <Link href={`/dashboard/clients/${client.id}`}>
                             <View className="mr-2 h-4 w-4" />
                             View Details
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <EditClientSheet client={client} />
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                           <Trash2 className="mr-2 h-4 w-4" />
                           Delete Client
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
