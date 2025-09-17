'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppStore } from '@/lib/data';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { DeliveryNote, QuoteItem } from '@/lib/types';

const formSchema = z.object({
  deliveryNoteNumber: z.string().min(1, 'Delivery note number is required'),
  clientId: z.string().min(1, 'Client is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  deliveryMethod: z.enum(['pickup', 'delivery', 'courier', 'shipping']),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  invoiceId: z.string().optional(),
  quoteId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddDeliveryNoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkedQuoteId?: string; // For creating delivery note from a quote/invoice
  linkedInvoiceId?: string;
}

export function AddDeliveryNoteSheet({ 
  open, 
  onOpenChange, 
  linkedQuoteId, 
  linkedInvoiceId 
}: AddDeliveryNoteSheetProps) {
  const { clients, quotes, addDeliveryNote } = useAppStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryNoteNumber: `DN-${Date.now()}`,
      clientId: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryAddress: '',
      deliveryMethod: 'delivery',
      trackingNumber: '',
      notes: '',
      invoiceId: linkedInvoiceId || '',
      quoteId: linkedQuoteId || '',
    },
  });

  // Get client and items from linked quote/invoice if available
  const linkedQuote = linkedQuoteId ? quotes.find(q => q.id === linkedQuoteId) : null;
  const linkedInvoice = linkedInvoiceId ? quotes.find(q => q.id === linkedInvoiceId && q.status === 'accepted') : null;
  const linkedData = linkedQuote || linkedInvoice;
  const linkedClient = linkedData?.clientId;

  // Set client and address if linked
  if (linkedClient && !form.getValues('clientId')) {
    form.setValue('clientId', linkedClient);
    const client = clients.find(c => c.id === linkedClient);
    if (client?.address && !form.getValues('deliveryAddress')) {
      form.setValue('deliveryAddress', client.address);
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Get items from linked quote/invoice or create empty items
      const items: QuoteItem[] = linkedData?.items || [];

      const deliveryNote: DeliveryNote = {
        id: `delivery_note_${Date.now()}`,
        deliveryNoteNumber: data.deliveryNoteNumber,
        clientId: data.clientId,
        date: new Date().toISOString().split('T')[0],
        deliveryDate: data.deliveryDate,
        deliveryAddress: data.deliveryAddress,
        items: items,
        deliveryMethod: data.deliveryMethod,
        trackingNumber: data.trackingNumber || undefined,
        notes: data.notes || undefined,
        status: 'pending',
        invoiceId: data.invoiceId || undefined,
        quoteId: data.quoteId || undefined,
      };

      addDeliveryNote(deliveryNote);
      
      toast({
        title: 'Delivery Note Created',
        description: `Delivery note ${deliveryNote.deliveryNoteNumber} has been created successfully.`,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create delivery note. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Delivery Note</SheetTitle>
          <SheetDescription>
            Add a new delivery note to track goods delivery.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="deliveryNoteNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Note Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="DN-001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter the delivery address..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pickup">Pickup</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="courier">Courier</SelectItem>
                      <SelectItem value="shipping">Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trackingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracking Number (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tracking or reference number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Additional notes about this delivery..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {linkedData && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Linked Items</h4>
                <p className="text-sm text-muted-foreground">
                  This delivery note will include {linkedData.items.length} item(s) from {linkedQuote ? 'quote' : 'invoice'} {linkedData.quoteNumber}.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Creating...' : 'Create Delivery Note'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}