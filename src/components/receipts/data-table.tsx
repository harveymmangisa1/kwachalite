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
import { formatCurrency } from '@/lib/utils';
import { Eye, Edit, Trash2, Plus, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddReceiptSheet } from './add-receipt-sheet';
import { useToast } from '@/hooks/use-toast';
import type { SalesReceipt } from '@/lib/types';
export function ReceiptsDataTable() {
  const { salesReceipts, clients, deleteSalesReceipt } = useAppStore();
  const { toast } = useToast();
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  const getStatusVariant = (status: SalesReceipt['status']) => {
    switch (status) {
      case 'confirmed':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPaymentMethodDisplay = (method: SalesReceipt['paymentMethod']) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'check':
        return 'Check';
      case 'card':
        return 'Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'mobile_money':
        return 'Mobile Money';
      case 'other':
        return 'Other';
      default:
        return method;
    }
  };

  const handleDelete = (receipt: SalesReceipt) => {
    if (window.confirm(`Are you sure you want to delete receipt ${receipt.receiptNumber}?`)) {
      deleteSalesReceipt(receipt.id);
      toast({
        title: 'Receipt Deleted',
        description: `Receipt ${receipt.receiptNumber} has been deleted.`,
      });
    }
  };

  // Filter receipts based on search term
  const filteredReceipts = salesReceipts.filter(receipt =>
    receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(receipt.clientId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sales Receipts</h3>
        <Button onClick={() => setIsAddSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Receipt
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search receipts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Receipts Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receipt #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReceipts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                {searchTerm ? 'No receipts found matching your search.' : 'No receipts created yet.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredReceipts.map((receipt) => (
              <TableRow key={receipt.id} className="row-hover-minimal">
                <TableCell className="font-medium">
                  {receipt.receiptNumber}
                </TableCell>
                <TableCell>
                  {new Date(receipt.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {getClientName(receipt.clientId)}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(receipt.amount)}
                </TableCell>
                <TableCell>
                  {getPaymentMethodDisplay(receipt.paymentMethod)}
                </TableCell>
                <TableCell>
                  <span className="capitalize px-2 py-0.5 rounded-md text-xs inline-flex items-center justify-center \n                    "
                    style={{
                      backgroundColor: receipt.status === 'confirmed' ? `rgb(var(--info-light))` : (receipt.status === 'cancelled' ? `rgb(var(--error-light))` : `rgb(var(--muted))`),
                      color: receipt.status === 'cancelled' ? `rgb(var(--error))` : 'inherit',
                      border: '1px solid rgba(0,0,0,0.06)'
                    }}
                  >
                    {receipt.status}
                  </span>
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
                      <DropdownMenuItem onClick={() => {/* TODO: Navigate to receipt details */}}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {/* TODO: Open edit sheet */}}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(receipt)}
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

      <AddReceiptSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
      />
    </div>
  );
}