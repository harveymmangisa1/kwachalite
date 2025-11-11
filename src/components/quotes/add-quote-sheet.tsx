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
import { cn, getCurrentCurrencySymbol } from '@/lib/utils';

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
  { id: 4, name: 'Review', icon: FileText, description: 'Confirm' },
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
    
    const client = clients.find(c => c.id === values.clientId);
    toast({
      title: 'Quote created',
      description: `Quote for ${client?.name} has been saved as draft.`,
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
        <Button size="sm" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Create Quote</span>
          <span className="sm:hidden">New</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 space-y-2">
          <SheetTitle className="text-xl">Create Quote</SheetTitle>
          <SheetDescription className="text-sm">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}
          </SheetDescription>
        </SheetHeader>

        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                      currentStep > step.id
                        ? "bg-foreground text-background"
                        : currentStep === step.id
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="text-xs font-medium hidden md:block">
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "h-0.5 flex-1 transition-colors",
                    currentStep > step.id ? "bg-foreground" : "bg-border"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col min-h-0"
          >
            <ScrollArea className="flex-1">
              <div className="px-6 py-6 space-y-6">
                {/* Step 1: Client */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <h3 className="text-base font-medium">Client Information</h3>
                      <p className="text-sm text-muted-foreground">
                        Who is this quote for?
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
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
                                    {client.email && (
                                      <span className="text-xs text-muted-foreground">{client.email}</span>
                                    )}
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
                      <div className="rounded-lg bg-muted p-4 space-y-1">
                        <p className="text-xs text-muted-foreground">Selected client</p>
                        <p className="font-medium">{getSelectedClient()?.name}</p>
                        {getSelectedClient()?.email && (
                          <p className="text-sm text-muted-foreground">{getSelectedClient()?.email}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Dates */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <h3 className="text-base font-medium">Quote Dates</h3>
                      <p className="text-sm text-muted-foreground">
                        Set the quote and expiry dates
                      </p>
                    </div>
                    
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quote Date</FormLabel>
                            <FormControl>
                              <Input type="date" className="h-11" {...field} />
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
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input type="date" className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {watchedValues.date && watchedValues.expiryDate && (
                      <div className="rounded-lg bg-muted p-3 text-sm">
                        <p className="text-muted-foreground">
                          Valid for {Math.ceil((new Date(watchedValues.expiryDate).getTime() - new Date(watchedValues.date).getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Items */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <h3 className="text-base font-medium">Quote Items</h3>
                      <p className="text-sm text-muted-foreground">
                        Add products or services
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="rounded-lg border p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Item {index + 1}</span>
                            {fields.length > 1 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => remove(index)}
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
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
                                <FormLabel>Product/Service</FormLabel>
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
                                      <SelectValue placeholder="Select item" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {products.map(product => (
                                      <SelectItem key={product.id} value={product.id}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{product.name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {getCurrentCurrencySymbol()} {product.price.toFixed(2)}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Quantity</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" className="h-11" {...field} />
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
                                  <FormLabel>Price</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
{getCurrentCurrencySymbol()}
                                      </span>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="h-11 pl-12"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {watchedValues.items[index]?.productId && watchedValues.items[index]?.quantity > 0 && (
                            <div className="pt-3 border-t">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">
                                  {getCurrentCurrencySymbol()} {(watchedValues.items[index].price * watchedValues.items[index].quantity).toFixed(2)}
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
                      Add Item
                    </Button>

                    {totalAmount > 0 && (
                      <div className="rounded-lg bg-muted p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Total</span>
                          <span className="text-xl font-semibold">
                            {getCurrentCurrencySymbol()} {totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <h3 className="text-base font-medium">Review Quote</h3>
                      <p className="text-sm text-muted-foreground">
                        Confirm all details before creating
                      </p>
                    </div>
                    
                    {/* Client */}
                    <div className="rounded-lg bg-muted p-4 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Client</p>
                      <p className="font-medium">{getSelectedClient()?.name}</p>
                      {getSelectedClient()?.email && (
                        <p className="text-sm text-muted-foreground">{getSelectedClient()?.email}</p>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted p-3 space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Quote Date</p>
                        <p className="font-medium text-sm">
                          {new Date(watchedValues.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted p-3 space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Expiry Date</p>
                        <p className="font-medium text-sm">
                          {new Date(watchedValues.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="rounded-lg border overflow-hidden">
                      <div className="bg-muted px-4 py-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Items</p>
                      </div>
                      <div className="divide-y">
                        {watchedValues.items.map((item, index) => {
                          const product = getSelectedProduct(item.productId);
                          return (
                            <div key={index} className="p-4 flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{product?.name}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {item.quantity} × {getCurrentCurrencySymbol()} {item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-medium whitespace-nowrap">
                                {getCurrentCurrencySymbol()} {(item.quantity * item.price).toFixed(2)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="bg-muted px-4 py-4 border-t-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Total</span>
                          <span className="text-xl font-semibold">
                            {getCurrentCurrencySymbol()} {totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                )}
                <SheetClose asChild>
                  <Button type="button" variant="ghost" size="sm">
                    Cancel
                  </Button>
                </SheetClose>
              </div>
              
              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="gap-1"
                >supabase.ts:48 Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.
                pc @ GoTrueClient.js:71
                gc @ SupabaseAuthClient.js:4
                _initSupabaseAuthClient @ SupabaseClient.js:187
                vc @ SupabaseClient.js:64
                xc @ index.js:11
                (anonymous) @ supabase.ts:48
                use-auth.ts:109 Auth state change: INITIAL_SESSION de2d9356-2085-4790-826f-c86f3e9fd65f
                fetch.js:23  POST https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/rpc/user_exists 404 (Not Found)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                use-auth.ts:77 Error checking user profile: {code: 'PGRST202', details: 'Searched for the function public.user_exists with …r, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.user_exists(user_id) in the schema cache'}
                n @ use-auth.ts:77
                await in n
                (anonymous) @ use-auth.ts:56
                await in (anonymous)
                (anonymous) @ use-auth.ts:103
                iA @ react-dom.production.min.js:243
                Bl @ react-dom.production.min.js:285
                ll @ react-dom.production.min.js:272
                Ki @ react-dom.production.min.js:127
                (anonymous) @ react-dom.production.min.js:282
                wl @ react-dom.production.min.js:280
                sl @ react-dom.production.min.js:269
                b @ scheduler.production.min.js:13
                E @ scheduler.production.min.js:14
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-auth.ts:109 Auth state change: INITIAL_SESSION de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-auth.ts:109 Auth state change: INITIAL_SESSION de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-auth.ts:109 Auth state change: INITIAL_SESSION de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-auth.ts:109 Auth state change: INITIAL_SESSION de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-auth.ts:109 Auth state change: INITIAL_SESSION de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-auth.ts:109 Auth state change: INITIAL_SESSION de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-auth.ts:109 Auth state change: INITIAL_SESSION de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-auth.ts:109 Auth state change: INITIAL_SESSION de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-auth.ts:109 Auth state change: INITIAL_SESSION de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-auth.ts:109 Auth state change: INITIAL_SESSION de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                use-business-profile-v2.ts:89 Loading business profile for user: de2d9356-2085-4790-826f-c86f3e9fd65f
                use-business-profile-v2.ts:111 Attempting to load from Supabase business_profiles table...
                fetch.js:23  POST https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/rpc/user_exists 404 (Not Found)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  POST https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/rpc/user_exists 404 (Not Found)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  POST https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/rpc/user_exists 404 (Not Found)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                use-auth.ts:77 Error checking user profile: {code: 'PGRST202', details: 'Searched for the function public.user_exists with …r, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.user_exists(user_id) in the schema cache'}
                n @ use-auth.ts:77
                fetch.js:23  POST https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/rpc/user_exists 404 (Not Found)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                use-auth.ts:77 Error checking user profile: {code: 'PGRST202', details: 'Searched for the function public.user_exists with …r, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.user_exists(user_id) in the schema cache'}
                n @ use-auth.ts:77
                use-auth.ts:77 Error checking user profile: {code: 'PGRST202', details: 'Searched for the function public.user_exists with …r, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.user_exists(user_id) in the schema cache'}
                n @ use-auth.ts:77
                use-auth.ts:77 Error checking user profile: {code: 'PGRST202', details: 'Searched for the function public.user_exists with …r, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.user_exists(user_id) in the schema cache'}
                n @ use-auth.ts:77
                fetch.js:23  POST https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/rpc/user_exists 404 (Not Found)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                use-auth.ts:77 Error checking user profile: {code: 'PGRST202', details: 'Searched for the function public.user_exists with …r, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.user_exists(user_id) in the schema cache'}
                n @ use-auth.ts:77
                fetch.js:23  POST https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/rpc/user_exists 404 (Not Found)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                use-auth.ts:77 Error checking user profile: {code: 'PGRST202', details: 'Searched for the function public.user_exists with …r, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.user_exists(user_id) in the schema cache'}
                n @ use-auth.ts:77
                await in n
                (anonymous) @ use-auth.ts:56
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  POST https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/rpc/user_exists 404 (Not Found)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                use-auth.ts:77 Error checking user profile: {code: 'PGRST202', details: 'Searched for the function public.user_exists with …r, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.user_exists(user_id) in the schema cache'}
                n @ use-auth.ts:77
                fetch.js:23  POST https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/rpc/user_exists 404 (Not Found)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                use-auth.ts:77 Error checking user profile: {code: 'PGRST202', details: 'Searched for the function public.user_exists with …r, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.user_exists(user_id) in the schema cache'}
                n @ use-auth.ts:77
                fetch.js:23  POST https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/rpc/user_exists 404 (Not Found)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                use-auth.ts:77 Error checking user profile: {code: 'PGRST202', details: 'Searched for the function public.user_exists with …r, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.user_exists(user_id) in the schema cache'}
                n @ use-auth.ts:77
                fetch.js:23  POST https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/rpc/user_exists 404 (Not Found)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                use-auth.ts:77 Error checking user profile: {code: 'PGRST202', details: 'Searched for the function public.user_exists with …r, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.user_exists(user_id) in the schema cache'}
                n @ use-auth.ts:77
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                use-business-profile-v2.ts:127 No business profile found in Supabase business_profiles table
                use-business-profile-v2.ts:175 No business profile found in any storage
                fetch.js:23  GET https://qdxodcdgogcdwvwjkhqj.supabase.co/rest/v1/business_profiles?select=*&user_id=eq.de2d9356-2085-4790-826f-c86f3e9fd65f 406 (Not Acceptable)
                (anonymous) @ fetch.js:23
                (anonymous) @ fetch.js:44
                a @ fetch.js:4
                Promise.then
                A @ fetch.js:6
                (anonymous) @ fetch.js:7
                JA @ fetch.js:3
                (anonymous) @ fetch.js:34
                then @ PostgrestBuilder.js:65
                use-business-profile-v2.ts:127 No business profile found in Supabase business_profiles table
                use-business-profile-v2.ts:175 No business profile found in any storage
                
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit"
                  size="sm"
                  className="gap-1"
                >
                  <Check className="h-4 w-4" />
                  Create Quote
                </Button>
              )}
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}