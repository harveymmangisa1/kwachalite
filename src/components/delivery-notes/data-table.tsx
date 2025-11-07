'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Edit, Trash2, Plus, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddDeliveryNoteSheet } from './add-delivery-note-sheet';
import { useToast } from '@/hooks/use-toast';
import type { DeliveryNote } from '@/lib/types';

export function DeliveryNotesDataTable() {
  const { deliveryNotes, clients, deleteDeliveryNote } = useAppStore();
  const { toast } = useToast();
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  const getStatusVariant = (status: DeliveryNote['status']) => {
    switch (status) {
      case 'delivered':
        return 'secondary';
      case 'in_transit':
        return 'default';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getDeliveryMethodDisplay = (method: DeliveryNote['deliveryMethod']) => {
    switch (method) {
      case 'pickup':
        return 'Pickup';
      case 'delivery':
        return 'Delivery';
      case 'courier':
        return 'Courier';
      case 'shipping':
        return 'Shipping';
      default:
        return method;
    }
  };

  const handleDelete = (deliveryNote: DeliveryNote) => {
    if (window.confirm(`Are you sure you want to delete delivery note ${deliveryNote.deliveryNoteNumber}?`)) {
      deleteDeliveryNote(deliveryNote.id);
      toast({
        title: 'Delivery Note Deleted',
        description: `Delivery note ${deliveryNote.deliveryNoteNumber} has been deleted.`,
      });
    }
  };

  // Filter delivery notes based on search term
  const filteredDeliveryNotes = deliveryNotes.filter(note =>
    note.deliveryNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(note.clientId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Delivery Notes</h3>
        <Button onClick={() => setIsAddSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Delivery Note
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search delivery notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Delivery Notes Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Delivery Note #</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>Delivery Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tracking #</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDeliveryNotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                {searchTerm ? 'No delivery notes found matching your search.' : 'No delivery notes created yet.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredDeliveryNotes.map((deliveryNote) => (
              <TableRow key={deliveryNote.id} className="row-hover-minimal">
                <TableCell className="font-medium">
                  {deliveryNote.deliveryNoteNumber}
                </TableCell>
                <TableCell>
                  {new Date(deliveryNote.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(deliveryNote.deliveryDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {getClientName(deliveryNote.clientId)}
                </TableCell>
                <TableCell>
                  {getDeliveryMethodDisplay(deliveryNote.deliveryMethod)}
                </TableCell>
                <TableCell>
                  <span className={`capitalize px-2 py-0.5 rounded-md text-xs inline-flex items-center justify-center ${
                    deliveryNote.status === 'delivered' ? 'badge-success' :
                    deliveryNote.status === 'in_transit' ? 'badge-info' :
                    deliveryNote.status === 'cancelled' ? 'badge-error' : ''
                  }`}>
                    {deliveryNote.status.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {deliveryNote.trackingNumber || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {/* TODO: Navigate to delivery note details */}}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {/* TODO: Open edit sheet */}}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(deliveryNote)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AddDeliveryNoteSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
      />
    </div>
  );
}