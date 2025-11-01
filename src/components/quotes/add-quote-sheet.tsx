'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2, ChevronLeft, ChevronRight, Check, FileText, User, ShoppingCart, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/data';
import { ScrollArea } from '../ui/scroll-area';
import type { Quote } from '@/lib/types';
import React from 'react';
import { cn } from '@/lib/utils';

const quoteItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  price: z.coerce.number(),
});

const formSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  date: z.string().min(1, 'Date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  items: z.array(quoteItemSchema).min(1, 'At least one item is required'),
});

const STEPS = [
  { id: 1, name: 'Client', icon: User, description: 'Select client' },
  { id: 2, name: 'Dates', icon: Calendar, description: 'Set dates' },
  { id: 3, name: 'Items', icon: ShoppingCart, description: 'Add items' },
  { id: 4, name: 'Review', icon: FileText, description: 'Review quote' },
];

export function AddQuoteSheet() {
  const { toast } = useToast();
  const { clients, products, addQuote } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      items: [{ productId: '', quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchedValues = form.watch();

  const canProceed = React.useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!watchedValues.clientId;
      case 2:
        return !!watchedValues.date && !!watchedValues.expiryDate;
      case 3:
        return watchedValues.items.length > 0 && watchedValues.items.every(item => item.productId && item.quantity > 0);
      default:
        return true;
    }
  }, [currentStep, watchedValues]);

  const totalAmount = React.useMemo(() => {
    return watchedValues.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }, [watchedValues.items]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newQuote: Quote = {
      id: new Date().toISOString(),
      quoteNumber: `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      status: 'draft',
      ...values
    };
    addQuote(newQuote);
    
    toast({
      title: 'Quotation Created',
      description: 'The new quotation has been successfully saved as a draft.',
    });
    form.reset();
    setOpen(false);
    setCurrentStep(1);
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getSelectedClient = () => {
    return clients.find(c => c.id === watchedValues.clientId);
  };

  const getSelectedProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setCurrentStep(1);
        form.reset();
      }
    }}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Create Quote</span>
          <span className="sm:hidden">New</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-slate-200">
          <SheetTitle className="text-xl font-semibold text-slate-900">Create New Quotation</SheetTitle>
          <SheetDescription className="text-slate-600">
            Follow the steps to create a professional quotation
          </SheetDescription>
        </SheetHeader>

        {/* Progress Steps */}
        <div className="px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      currentStep > step.id
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : currentStep === step.id
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-300 text-slate-400"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <p className={cn(
                      "text-xs font-medium",
                      currentStep >= step.id ? "text-slate-900" : "text-slate-400"
                    )}>
                      {step.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                  </div>
                  {currentStep === step.id && (
                    <p className="text-xs font-medium text-slate-900 mt-2 sm:hidden">
                      {step.name}
                    </p>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "h-0.5 flex-1 mx-2 transition-all duration-300",
                    currentStep > step.id ? "bg-emerald-500" : "bg-slate-200"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <ScrollArea className="flex-1 px-4 sm:px-6">
              <div className="py-6">
                {/* Step 1: Client Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Select Client</h3>
                      <p className="text-sm text-slate-600 mb-4">Choose the client for this quotation</p>
                    </div>
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Client *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select a client" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{client.name}</span>
                                    <span className="text-xs text-slate-500">{client.email}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {watchedValues.clientId && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-medium text-slate-500 mb-2">Selected Client</p>
                        <p className="font-medium text-slate-900">{getSelectedClient()?.name}</p>
                        <p className="text-sm text-slate-600">{getSelectedClient()?.email}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Dates */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Set Dates</h3>
                      <p className="text-sm text-slate-600 mb-4">Define the quote and expiry dates</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700">Quote Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700">Expiry Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Items */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Add Items</h3>
                      <p className="text-sm text-slate-600 mb-4">Add products or services to the quotation</p>
                    </div>
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border border-slate-200 rounded-lg bg-white space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-900">Item {index + 1}</span>
                            {fields.length > 1 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => remove(index)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormField
                            control={form.control}
                            name={`items.${index}.productId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700">Product/Service *</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    const product = products.find(p => p.id === value);
                                    form.setValue(`items.${index}.price`, product?.price || 0);
                                  }} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-11">
                                      <SelectValue placeholder="Select an item" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {products.map(product => (
                                      <SelectItem key={product.id} value={product.id}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{product.name}</span>
                                          <span className="text-xs text-slate-500">${product.price.toFixed(2)}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700">Quantity *</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" {...field} className="h-11" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`items.${index}.price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700">Price *</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="0" step="0.01" {...field} className="h-11" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {watchedValues.items[index]?.productId && watchedValues.items[index]?.quantity > 0 && (
                            <div className="pt-2 border-t border-slate-100">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Subtotal:</span>
                                <span className="font-semibold text-slate-900">
                                  ${(watchedValues.items[index].price * watchedValues.items[index].quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 border-dashed"
                      onClick={() => append({ productId: '', quantity: 1, price: 0 })}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Another Item
                    </Button>
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Review Quotation</h3>
                      <p className="text-sm text-slate-600 mb-4">Please review all details before submitting</p>
                    </div>
                    
                    {/* Client Info */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-500 mb-2">CLIENT</p>
                      <p className="font-semibold text-slate-900">{getSelectedClient()?.name}</p>
                      <p className="text-sm text-slate-600">{getSelectedClient()?.email}</p>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-medium text-slate-500 mb-1">QUOTE DATE</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(watchedValues.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-medium text-slate-500 mb-1">EXPIRY DATE</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(watchedValues.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <p className="text-xs font-medium text-slate-500">ITEMS</p>
                      </div>
                      <div className="divide-y divide-slate-200">
                        {watchedValues.items.map((item, index) => {
                          const product = getSelectedProduct(item.productId);
                          return (
                            <div key={index} className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">{product?.name}</p>
                                  <p className="text-sm text-slate-600 mt-1">
                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                  </p>
                                </div>
                                <p className="font-semibold text-slate-900">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="bg-slate-50 px-4 py-4 border-t-2 border-slate-300">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-slate-900">TOTAL</span>
                          <span className="text-xl font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Navigation Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Back</span>
                    </Button>
                  )}
                  <SheetClose asChild>
                    <Button type="button" variant="ghost" className="text-slate-600">
                      Cancel
                    </Button>
                  </SheetClose>
                </div>
                
                <div className="flex gap-2">
                  {currentStep < STEPS.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceed}
                      className="gap-2 bg-slate-900 hover:bg-slate-800"
                    >
                      <span className="hidden sm:inline">Continue</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="h-4 w-4" />
                      Create Quote
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}