
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
import { PlusCircle, User, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { useAppStore } from '@/lib/data';
import type { Client } from '@/lib/types';
import React from 'react';
import { ProgressiveForm, StepContent } from '@/components/ui/progressive-form';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const STEPS = [
  { id: 1, name: 'Basic Info', icon: User, description: 'Name & email' },
  { id: 2, name: 'Contact', icon: Phone, description: 'Phone & address' },
];

export function AddClientSheet() {
  const { toast } = useToast();
  const { addClient } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  const watchedValues = form.watch();

  const canProceed = React.useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!watchedValues.name && !!watchedValues.email;
      case 2:
        return true;
      default:
        return false;
    }
  }, [currentStep, watchedValues]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newClient: Client = {
        id: new Date().toISOString(),
        ...values
    };
    addClient(newClient);

    toast({
      title: 'Client Added',
      description: 'The new client has been successfully saved.',
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
          Add Client
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-slate-200">
          <SheetTitle>Add a New Client</SheetTitle>
          <SheetDescription>
            Enter the details of your new client below.
          </SheetDescription>
        </SheetHeader>

        <ProgressiveForm
          steps={STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          canProceed={canProceed}
          onSubmit={() => form.handleSubmit(onSubmit)()}
          submitText="Save Client"
        >
          <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 px-4 sm:px-6">
                <div className="py-6">
                  {/* Step 1: Basic Info */}
                  <StepContent step={1} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Basic Information</h3>
                      <p className="text-sm text-slate-600 mb-4">Enter the client's name and email</p>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name / Company Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="client@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </StepContent>

                  {/* Step 2: Contact */}
                  <StepContent step={2} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact Information</h3>
                      <p className="text-sm text-slate-600 mb-4">Add phone and address details (optional)</p>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+265 123 456 789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Client's physical or mailing address" {...field} />
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
