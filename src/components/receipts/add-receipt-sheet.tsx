'use client';

import React, { useState, useMemo } from 'react';
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
import type { SalesReceipt } from '@/lib/types';
import { ProgressiveForm, StepContent } from '@/components/ui/progressive-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, DollarSign, CreditCard, MessageSquare } from 'lucide-react';

const formSchema = z.object({
  receiptNumber: z.string().min(1, 'Receipt number is required'),
  clientId: z.string().min(1, 'Client is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'check', 'card', 'bank_transfer', 'mobile_money', 'other']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  invoiceId: z.string().optional(),
  quoteId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddReceiptSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkedQuoteId?: string; // For creating receipt from a quote/invoice
  linkedInvoiceId?: string;
  prefilledAmount?: number;
}

const STEPS = [
  { id: 1, name: 'Basic Info', icon: FileText, description: 'Receipt details' },
  { id: 2, name: 'Payment', icon: DollarSign, description: 'Amount & method' },
  { id: 3, name: 'Details', icon: MessageSquare, description: 'Reference & notes' },
];

export function AddReceiptSheet({ 
  open, 
  onOpenChange, 
  linkedQuoteId, 
  linkedInvoiceId,
  prefilledAmount 
}: AddReceiptSheetProps) {
  const { clients, quotes, addSalesReceipt } = useAppStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiptNumber: `RC-${Date.now()}`,
      clientId: '',
      amount: prefilledAmount || 0,
      paymentMethod: 'cash',
      referenceNumber: '',
      notes: '',
      invoiceId: linkedInvoiceId || '',
      quoteId: linkedQuoteId || '',
    },
  });

  // Get client from linked quote/invoice if available
  const linkedQuote = linkedQuoteId ? quotes.find(q => q.id === linkedQuoteId) : null;
  const linkedInvoice = linkedInvoiceId ? quotes.find(q => q.id === linkedInvoiceId && q.status === 'accepted') : null;
  const linkedClient = linkedQuote?.clientId || linkedInvoice?.clientId;

  // Set client if linked
  if (linkedClient && !form.getValues('clientId')) {
    form.setValue('clientId', linkedClient);
  }

  const watchedValues = form.watch();

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!watchedValues.receiptNumber && !!watchedValues.clientId;
      case 2:
        return watchedValues.amount > 0 && !!watchedValues.paymentMethod;
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, watchedValues]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const receipt: SalesReceipt = {
        id: `receipt_${Date.now()}`,
        receiptNumber: data.receiptNumber,
        clientId: data.clientId,
        date: new Date().toISOString().split('T')[0],
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber || undefined,
        notes: data.notes || undefined,
        status: 'confirmed',
        invoiceId: data.invoiceId || undefined,
        quoteId: data.quoteId || undefined,
      };

      addSalesReceipt(receipt);
      
      // Also create a business revenue entry
      const { addBusinessRevenue } = useAppStore.getState();
      const businessRevenue = {
        id: `revenue_${Date.now()}`,
        source: 'receipt' as const,
        sourceId: receipt.id,
        clientId: receipt.clientId,
        amount: receipt.amount,
        date: receipt.date,
        description: `Payment received - Receipt ${receipt.receiptNumber}`,
        category: 'client_payments',
        status: 'received' as const,
        paymentMethod: receipt.paymentMethod,
      };
      addBusinessRevenue(businessRevenue);
      
      toast({
        title: 'Sales Receipt Created',
        description: `Receipt ${receipt.receiptNumber} has been created successfully.`,
      });
      
      form.reset();
      setCurrentStep(1);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create sales receipt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setCurrentStep(1);
        form.reset();
      }
    }}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-slate-200">
          <SheetTitle>Create Sales Receipt</SheetTitle>
          <SheetDescription>
            Add a new sales receipt to track payments received.
          </SheetDescription>
        </SheetHeader>

        <ProgressiveForm
          steps={STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          canProceed={canProceed}
          isSubmitting={isLoading}
          onSubmit={() => form.handleSubmit(onSubmit)()}
          submitText="Create Receipt"
        >
          <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 px-4 sm:px-6">
                <div className="py-6">
                  {/* Step 1: Basic Info */}
                  <StepContent step={1} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Basic Information</h3>
                      <p className="text-sm text-slate-600 mb-4">Enter receipt number and select client</p>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="receiptNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Receipt Number *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="RC-001" />
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
                            <FormLabel>Client *</FormLabel>
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
                    </div>
                  </StepContent>

                  {/* Step 2: Payment */}
                  <StepContent step={2} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Payment Information</h3>
                      <p className="text-sm text-slate-600 mb-4">Enter amount and payment method</p>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="check">Check</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </StepContent>

                  {/* Step 3: Details */}
                  <StepContent step={3} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Additional Details</h3>
                      <p className="text-sm text-slate-600 mb-4">Add reference number and notes (optional)</p>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="referenceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reference Number (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Transaction reference" />
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
                                placeholder="Additional notes about this receipt..."
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </StepContent>
                </div>
              </ScrollArea>
            </form>
          </Form>
        </ProgressiveForm>
      </SheetContent>
    </Sheet>
  );
}