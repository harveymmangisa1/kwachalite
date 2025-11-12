
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
import { PlusCircle, Building, DollarSign, Calendar } from 'lucide-react';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { useAppStore } from '@/lib/data';
import type { Loan } from '@/lib/types';
import { ProgressiveForm, StepContent } from '@/components/ui/progressive-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCurrentCurrencySymbol } from '@/lib/utils';

const formSchema = z.object({
  lender: z.string().min(1, 'Lender name is required'),
  principal: z.coerce.number().positive('Principal must be a positive number'),
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative'),
  term: z.coerce.number().int().positive('Term must be a positive number of months'),
  startDate: z.string().min(1, 'Start date is required'),
});

const STEPS = [
  { id: 1, name: 'Lender', icon: Building, description: 'Lender details' },
  { id: 2, name: 'Amount', icon: DollarSign, description: 'Principal & interest' },
  { id: 3, name: 'Terms', icon: Calendar, description: 'Duration & start date' },
];

export function AddLoanSheet() {
  const { toast } = useToast();
  const { activeWorkspace } = useActiveWorkspace();
  const { addLoan } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lender: '',
      principal: 0,
      interestRate: 0,
      term: 12,
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const watchedValues = form.watch();

  const canProceed = React.useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!watchedValues.lender;
      case 2:
        return watchedValues.principal > 0 && watchedValues.interestRate >= 0;
      case 3:
        return watchedValues.term > 0 && !!watchedValues.startDate;
      default:
        return false;
    }
  }, [currentStep, watchedValues]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newLoan: Loan = {
      id: new Date().toISOString(),
      workspace: activeWorkspace,
      remainingAmount: values.principal,
      status: 'active',
      ...values,
    };
    addLoan(newLoan);
    
    toast({
      title: 'Loan Added',
      description: 'Your new loan has been successfully saved.',
    });
    form.reset();
    setCurrentStep(1);
    setOpen(false);
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
          <PlusCircle className="h-3 w-3" />
          Add Loan
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 overflow-y-auto">
        <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-slate-200">
          <SheetTitle>Add a New Loan</SheetTitle>
          <SheetDescription>
            Enter the details of your loan below.
          </SheetDescription>
        </SheetHeader>

        <ProgressiveForm
          steps={STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          canProceed={canProceed}
          onSubmit={() => form.handleSubmit(onSubmit)()}
          submitText="Save Loan"
        >
          <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 px-4 sm:px-6">
                <div className="py-6">
                  {/* Step 1: Lender */}
                  <StepContent step={1} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Lender Information</h3>
                      <p className="text-sm text-slate-600 mb-4">Enter the lender details</p>
                    </div>
                    <FormField
                      control={form.control}
                      name="lender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lender Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Vision Bank" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </StepContent>

                  {/* Step 2: Amount */}
                  <StepContent step={2} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Loan Amount</h3>
                      <p className="text-sm text-slate-600 mb-4">Enter principal and interest rate</p>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="principal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Principal Amount *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder={`${getCurrentCurrencySymbol()} 5,000,000`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="interestRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interest Rate (%) *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="15" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </StepContent>

                  {/* Step 3: Terms */}
                  <StepContent step={3} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Loan Terms</h3>
                      <p className="text-sm text-slate-600 mb-4">Set the duration and start date</p>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="term"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Term (Months) *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="36" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
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
