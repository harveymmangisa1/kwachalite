'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
} from '@/components/ui/sheet';
import { PlusCircle, Package, DollarSign, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { useAppStore } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { SyncStatus } from '@/components/sync-status';
import type { Product } from '@/lib/types';
import React from 'react';
import { getCurrentCurrencySymbol } from '@/lib/utils';
import { ProgressiveForm, StepContent } from '@/components/ui/progressive-form';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().positive('Price must be a positive number'),
  costPrice: z.coerce.number().min(0, 'Cost price must be a non-negative number'),
  description: z.string().optional(),
});

const STEPS = [
  { id: 1, name: 'Basic', icon: Package, description: 'Product name' },
  { id: 2, name: 'Pricing', icon: DollarSign, description: 'Cost & price' },
  { id: 3, name: 'Details', icon: FileText, description: 'Description' },
];

export function AddProductSheet() {
  const { toast } = useToast();
  const { addProduct } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
      costPrice: 0,
      description: '',
    },
  });

  const watchedValues = form.watch();

  const canProceed = React.useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!watchedValues.name && watchedValues.name.trim().length > 0;
      case 2:
        return watchedValues.costPrice >= 0 && watchedValues.price > 0;
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, watchedValues]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to add a product',
          variant: 'destructive',
        });
        return;
      }

      // Prepare product data for database
      const productData = {
        name: values.name,
        price: values.price,
        cost_price: values.costPrice || 0,
        description: values.description || null,
        user_id: user.id,
      };

      console.log('Submitting product data:', productData);

      // Insert into database
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('Product creation error:', error);
        let errorMessage = error.message;
        
        if (error.code === '23514') {
          errorMessage = 'Invalid data provided. Please check all fields.';
        }
        
        toast({
          title: 'Error creating product',
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        console.log('Product created successfully:', data);
        
        // Add to local store for immediate UI update
        const newProduct: Product = {
          id: data.id,
          name: data.name,
          price: data.price,
          cost_price: data.cost_price,
          description: data.description || undefined,
        };
        
        addProduct(newProduct);

        toast({
          title: 'Product added',
          description: `${values.name} has been saved successfully.`,
        });
        
        form.reset();
        setOpen(false);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Unexpected error in product submission:', error);
      toast({
        title: 'Unexpected error',
        description: error instanceof Error ? error.message : 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setCurrentStep(1);
          form.reset();
        }
      }}
    >
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3 w-3" />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 gap-0 overflow-y-auto">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">Add Product</SheetTitle>
              <SheetDescription className="text-sm">
                Fill in the details for your new product or service
              </SheetDescription>
            </div>
            <SyncStatus />
          </div>
        </SheetHeader>

        {/* Divider */}
        <div className="h-px bg-border" />

        <ProgressiveForm
          steps={STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          canProceed={canProceed}
          onSubmit={() => form.handleSubmit(onSubmit)()}
          submitText="Save Product"
        >
          <Form {...form}>
            <form className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1">
                <div className="px-6 py-6 space-y-8">
                  {/* Step 1: Basic Info */}
                  <StepContent step={1} currentStep={currentStep}>
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-base font-medium">Basic Information</h3>
                        <p className="text-sm text-muted-foreground">
                          What are you selling?
                        </p>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product or Service Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Website Design"
                                className="h-11"
                                autoFocus
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </StepContent>

                  {/* Step 2: Pricing */}
                  <StepContent step={2} currentStep={currentStep}>
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-base font-medium">Pricing</h3>
                        <p className="text-sm text-muted-foreground">
                          Set your cost and selling price
                        </p>
                      </div>

                      <div className="grid gap-4">
                         <FormField
                           control={form.control}
                           name="costPrice"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Cost Price</FormLabel>
                               <FormControl>
                                 <div className="relative">
                                   <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                     {getCurrentCurrencySymbol()}
                                   </span>
                                   <Input
                                     type="number"
                                     placeholder="0"
                                     className="h-9 pl-8"
                                     step="0.01"
                                     {...field}
                                   />
                                 </div>
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />

                         <FormField
                           control={form.control}
                           name="price"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Selling Price</FormLabel>
                               <FormControl>
                                 <div className="relative">
                                   <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                     {getCurrentCurrencySymbol()}
                                   </span>
                                   <Input
                                     type="number"
                                     placeholder="0"
                                     className="h-9 pl-8"
                                     step="0.01"
                                     {...field}
                                   />
                                 </div>
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />

                        {/* Profit Indicator */}
                        {watchedValues.price > 0 && watchedValues.costPrice >= 0 && (
                          <div className="rounded-lg bg-muted p-3 space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Profit Margin</span>
                              <span className="font-medium">
                                {getCurrentCurrencySymbol()} {(watchedValues.price - watchedValues.costPrice).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Percentage</span>
                              <span className="font-medium">
                                {watchedValues.price > 0
                                  ? (((watchedValues.price - watchedValues.costPrice) / watchedValues.price) * 100).toFixed(1)
                                  : '0'}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </StepContent>

                  {/* Step 3: Details */}
                  <StepContent step={3} currentStep={currentStep}>
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-base font-medium">Additional Details</h3>
                        <p className="text-sm text-muted-foreground">
                          Add notes or description (optional)
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add any additional details about this product or service..."
                                className="min-h-[120px] resize-none"
                                {...field}
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