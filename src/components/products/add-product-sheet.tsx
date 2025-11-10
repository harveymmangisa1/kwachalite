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
import type { Product } from '@/lib/types';
import React from 'react';
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newProduct: Product = {
      id: new Date().toISOString(),
      ...values,
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
        <Button size="sm" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 space-y-2">
          <SheetTitle className="text-xl">Add Product</SheetTitle>
          <SheetDescription className="text-sm">
            Fill in the details for your new product or service
          </SheetDescription>
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
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                    MK
                                  </span>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    className="h-11 pl-12"
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
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                    MK
                                  </span>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    className="h-11 pl-12"
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
                                MK {(watchedValues.price - watchedValues.costPrice).toFixed(2)}
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