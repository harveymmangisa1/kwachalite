'use client';

import { useState, useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PlusCircle, User, Phone, Building, FileText } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import { ProgressiveForm, StepContent } from '@/components/ui/progressive-form';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/data';
import type { Client } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof formSchema>;

const STEPS = [
  { id: 1, name: 'Basic Info', icon: User, description: 'Name & email' },
  { id: 2, name: 'Contact', icon: Phone, description: 'Phone & address' },
  { id: 3, name: 'Business', icon: Building, description: 'Company & website' },
  { id: 4, name: 'Notes', icon: FileText, description: 'Additional information' },
];

const StepHeader = ({ title, description }: { title: string; description:string }) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export function AddClientSheet() {
  const { toast } = useToast();
  const { addClient } = useAppStore();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched', // Validate on blur
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      website: '',
      notes: '',
    },
  });

  const watchedValues = form.watch();

  const canProceed = useMemo(() => {
    if (currentStep === 1) {
      return !!watchedValues.name && !!watchedValues.email && !form.formState.errors.email;
    }
    return true;
  }, [currentStep, watchedValues, form.formState.errors.email]);

  useEffect(() => {
    if (currentStep === 1 && canProceed) {
      const timer = setTimeout(() => setCurrentStep(2), 300);
      return () => clearTimeout(timer);
    }
  }, [canProceed, currentStep]);

  function onSubmit(values: ClientFormValues) {
    addClient({ id: crypto.randomUUID(), ...values });
    toast({ title: 'Client Added', description: 'The new client has been successfully saved.' });
    form.reset();
    setOpen(false);
    setCurrentStep(1);
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setCurrentStep(1);
      form.reset();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1"><PlusCircle className="h-4 w-4" /> Add Client</Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 h-screen sm:h-[90vh]">
        <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b flex-shrink-0">
          <SheetTitle>Add a New Client</SheetTitle>
          <SheetDescription>Enter the details of your new client below.</SheetDescription>
        </SheetHeader>

        <ProgressiveForm
          steps={STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          canProceed={canProceed}
          onSubmit={form.handleSubmit(onSubmit)}
          submitText="Save Client"
          className="flex-1 flex flex-col min-h-0"
        >
          <Form {...form}>
            <form className="flex-1 overflow-y-auto form-scroll-container p-4 sm:p-6">
              <div className="space-y-6">
                <StepContent step={1} currentStep={currentStep}>
                  <StepHeader title="Basic Information" description="Enter the client's name and email." />
                  <div className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name / Company Name *</FormLabel>
                        <FormControl><Input placeholder="e.g. John Doe" {...field} autoComplete="name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl><Input type="email" placeholder="client@example.com" {...field} autoComplete="email" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </StepContent>

                <StepContent step={2} currentStep={currentStep}>
                  <StepHeader title="Contact Information" description="Add phone and address details." />
                  <div className="space-y-4">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl><Input type="tel" placeholder="+265 123 456 789" {...field} autoComplete="tel" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (Optional)</FormLabel>
                        <FormControl><Textarea placeholder="Client's physical or mailing address" className="min-h-[80px]" {...field} autoComplete="street-address" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </StepContent>

                <StepContent step={3} currentStep={currentStep}>
                  <StepHeader title="Business Information" description="Add company and website details." />
                  <div className="space-y-4">
                    <FormField control={form.control} name="company" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name (Optional)</FormLabel>
                        <FormControl><Input placeholder="e.g. Acme Corporation" {...field} autoComplete="organization" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="website" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl><Input placeholder="https://example.com" {...field} autoComplete="url" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </StepContent>

                <StepContent step={4} currentStep={currentStep}>
                  <StepHeader title="Additional Notes" description="Add any other important information." />
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl><Textarea placeholder="Important details, preferences, etc." className="min-h-[120px]" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </StepContent>
              </div>
            </form>
          </Form>
        </ProgressiveForm>
      </SheetContent>
    </Sheet>
  );
}
