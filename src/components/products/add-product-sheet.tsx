
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
  SheetClose,
  SheetFooter,
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
  { id: 1, name: 'Basic Info', icon: Package, description: 'Product name' },
  { id: 2, name: 'Pricing', icon: DollarSign, description: 'Cost & selling price' },
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
        return !!watchedValues.name;
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
        ...values
    };
    addProduct(newProduct);
    
    toast({
      title: 'Product Added',
      description: 'The new product/service has been successfully saved.',
    });
    form.reset();
    setOpen(false);
    setCurrentStep(1);
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setCurrentStep(1);
        form.reset();
      }
    }}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-slate-200">
          <SheetTitle>Add a New Product or Service</SheetTitle>
          <SheetDescription>
            Enter the details of your product or service below.
          </SheetDescription>
        </SheetHeader>

        <ProgressiveForm
          steps={STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          canProceed={canProceed}
          onSubmit={() => form.handleSubmit(onSubmit)()}
          submitText="Save Product"
        >
          <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 px-4 sm:px-6">
                <div className="py-6">
                  {/* Step 1: Basic Info */}
                  <StepContent step={1} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Basic Information</h3>
                      <p className="text-sm text-slate-600 mb-4">Enter the product or service name</p>
                    </div>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product/Service Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Website Design Package" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </StepContent>

                  {/* Step 2: Pricing */}
                  <StepContent step={2} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Pricing Information</h3>
                      <p className="text-sm text-slate-600 mb-4">Set the cost and selling prices</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="costPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Price *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="MK 150,000" {...field} />
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
                            <FormLabel>Selling Price *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="MK 250,000" {...field} />
                            </FormControl>
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
                      <p className="text-sm text-slate-600 mb-4">Add a description (optional)</p>
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe the product or service" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
