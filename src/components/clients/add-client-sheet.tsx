'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PlusCircle, User, Phone, Building, FileText, ChevronRight, ChevronLeft } from 'lucide-react';

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
import { supabase } from '@/lib/supabase';
import { SyncStatus } from '@/components/sync-status';
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

const StepHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export function AddClientSheet() {
  const { toast } = useToast();
  const { addClient } = useAppStore();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // Validate as user types for better UX
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

  // Improved validation with better user feedback
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return form.formState.isValid && !!watchedValues.name && !!watchedValues.email;
      case 2:
      case 3:
        return true; // Optional steps
      case 4:
        return true; // Notes are optional
      default:
        return false;
    }
  }, [currentStep, watchedValues, form.formState.isValid]);

  // Auto-focus first input when step changes
  useEffect(() => {
    if (open && formRef.current) {
      const firstInput = formRef.current.querySelector('input, textarea') as HTMLElement;
      firstInput?.focus();
    }
  }, [currentStep, open]);

  async function onSubmit(values: ClientFormValues) {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to add a client',
          variant: 'destructive',
        });
        return;
      }

      // Prepare client data for database
      const clientData = {
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        address: values.address || null,
        user_id: user.id,
      };

      console.log('Submitting client data:', clientData);

      // Insert into database
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (error) {
        console.error('Client creation error:', error);
        let errorMessage = error.message;
        
        if (error.code === '23505') {
          errorMessage = 'A client with this email already exists.';
        } else if (error.code === '23514') {
          errorMessage = 'Invalid data provided. Please check all fields.';
        }
        
        toast({
          title: 'Error creating client',
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        console.log('Client created successfully:', data);
        
        // Add to local store for immediate UI update
        const newClient: Client = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          address: data.address || undefined,
        };
        
        addClient(newClient);
        
        toast({ 
          title: 'Client Added', 
          description: `${values.name} has been successfully saved.`,
          duration: 3000 
        });
        form.reset();
        setOpen(false);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Unexpected error in client submission:', error);
      toast({
        title: 'Unexpected error',
        description: error instanceof Error ? error.message : 'Failed to create client. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setCurrentStep(1);
      form.reset();
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    // Scroll to top when changing steps
    const formContainer = document.querySelector('.form-scroll-container');
    formContainer?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-3 w-3" /> 
          Add Client
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 h-screen sm:h-[85vh] rounded-t-lg sm:rounded-lg">
        <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">Add a New Client</SheetTitle>
              <SheetDescription>
                Enter the details of your new client below. Fields marked with * are required.
              </SheetDescription>
            </div>
            <SyncStatus />
          </div>
        </SheetHeader>

        <ProgressiveForm
          steps={STEPS}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          canProceed={canProceed}
          onSubmit={form.handleSubmit(onSubmit)}
          submitText="Save Client"
          className="flex-1 flex flex-col min-h-0"
        >
          <Form {...form}>
            <form 
              ref={formRef}
              className="flex-1 overflow-y-auto form-scroll-container p-6 pb-20"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="space-y-8 max-w-md mx-auto w-full">
                <StepContent step={1} currentStep={currentStep}>
                  <StepHeader 
                    title="Basic Information" 
                    description="Enter the client's name and email address." 
                  />
                  <div className="space-y-5">
                    <FormField 
                      control={form.control} 
                      name="name" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Full Name / Company Name *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. John Doe or Acme Corporation" 
                              {...field} 
                              autoComplete="name"
                              className="h-11 text-base"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} 
                    />
                    <FormField 
                      control={form.control} 
                      name="email" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Email Address *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="client@example.com" 
                              {...field} 
                              autoComplete="email"
                              className="h-11 text-base"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} 
                    />
                  </div>
                </StepContent>

                <StepContent step={2} currentStep={currentStep}>
                  <StepHeader 
                    title="Contact Information" 
                    description="Add phone number and address details." 
                  />
                  <div className="space-y-5">
                    <FormField 
                      control={form.control} 
                      name="phone" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="+265 123 456 789" 
                              {...field} 
                              autoComplete="tel"
                              className="h-11 text-base"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} 
                    />
                    <FormField 
                      control={form.control} 
                      name="address" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Address
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Client's physical or mailing address"
                              className="min-h-[100px] resize-vertical text-base"
                              {...field} 
                              autoComplete="street-address"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} 
                    />
                  </div>
                </StepContent>

                <StepContent step={3} currentStep={currentStep}>
                  <StepHeader 
                    title="Business Information" 
                    description="Add company and website details." 
                  />
                  <div className="space-y-5">
                    <FormField 
                      control={form.control} 
                      name="company" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Company Name
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Acme Corporation" 
                              {...field} 
                              autoComplete="organization"
                              className="h-11 text-base"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} 
                    />
                    <FormField 
                      control={form.control} 
                      name="website" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Website
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com" 
                              {...field} 
                              autoComplete="url"
                              className="h-11 text-base"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} 
                    />
                  </div>
                </StepContent>

                <StepContent step={4} currentStep={currentStep}>
                  <StepHeader 
                    title="Additional Notes" 
                    description="Add any other important information about the client." 
                  />
                  <FormField 
                    control={form.control} 
                    name="notes" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Notes
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Important details, preferences, project history, etc."
                            className="min-h-[140px] resize-vertical text-base"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} 
                  />
                </StepContent>
              </div>
            </form>
          </Form>
        </ProgressiveForm>
      </SheetContent>
    </Sheet>
  );
}