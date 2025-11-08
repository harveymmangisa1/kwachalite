
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createTransactionSchema, validateData } from '@/lib/validations';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { AsyncButton } from '@/components/ui/async-button';
import { LoadingState, ErrorState } from '@/components/ui/loading';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/data';
import { PlusCircle, DollarSign, FileText, Calendar } from 'lucide-react';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { useFormSubmission } from '@/hooks/use-async-operation';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { ProgressiveForm, StepContent } from '@/components/ui/progressive-form';

// Custom form data type that allows string for amount
type TransactionFormInput = {
  type: 'income' | 'expense';
  amount: string;
  category: string;
  description: string;
  date: string;
};

const STEPS = [
  { id: 1, name: 'Type & Amount', icon: DollarSign, description: 'Transaction basics' },
  { id: 2, name: 'Details', icon: FileText, description: 'Description & category' },
  { id: 3, name: 'Date', icon: Calendar, description: 'Transaction date' },
];

export function AddTransactionSheet() {
  const [open, setOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const { toast } = useToast();
  const { activeWorkspace } = useActiveWorkspace();
  const { categories, transactions, addTransaction } = useAppStore();

  const form = useForm<TransactionFormInput>({
    defaultValues: {
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchedValues = form.watch();

  const canProceed = React.useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!watchedValues.type && parseFloat(watchedValues.amount) > 0;
      case 2:
        return !!watchedValues.description.trim() && !!watchedValues.category;
      case 3:
        return !!watchedValues.date;
      default:
        return false;
    }
  }, [currentStep, watchedValues]);

  // Create async operation for form submission
  const { execute: submitTransaction, isLoading, error } = useFormSubmission(
    async (values: TransactionFormInput) => {
      console.log('Form submitted with values:', values);
      console.log('Active workspace:', activeWorkspace);
      
      // Validate amount
      const numericAmount = typeof values.amount === 'string' ? parseFloat(values.amount) : values.amount;
      if (!numericAmount || numericAmount <= 0) {
        throw new Error('Amount is required and must be positive');
      }
      
      if (!values.category) {
        throw new Error('Please select a category');
      }
      
      if (!values.description.trim()) {
        throw new Error('Description is required');
      }
      
      // Validate the data schema
      const validation = validateData(createTransactionSchema, {
        ...values,
        workspace: activeWorkspace,
      });

      if (!validation.success) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Budget checking logic
      if (values.type === 'expense') {
        const category = categories.find(c => c.name === values.category && c.workspace === activeWorkspace);
        
        if (category && category.budget) {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          const currentSpending = transactions
            .filter(t => 
              t.category === category.name && 
              t.workspace === activeWorkspace &&
              new Date(t.date) >= startOfMonth &&
              new Date(t.date) <= endOfMonth
            )
            .reduce((sum, t) => sum + t.amount, 0);

          const newTotalSpending = currentSpending + numericAmount;
          const budgetThreshold = category.budget * 0.85;

          if (newTotalSpending > category.budget) {
            throw new Error(`This transaction would exceed your budget for ${category.name}. Current spending: ${formatCurrency(newTotalSpending)} of ${formatCurrency(category.budget)}.`);
          } else if (newTotalSpending > budgetThreshold) {
            toast({
              title: 'Budget Warning',
              description: `You are about to exceed your budget for ${category.name}. You've spent ${formatCurrency(newTotalSpending)} of ${formatCurrency(category.budget)}.`,
              variant: 'destructive'
            });
          }
        }
      }
      
      // Create and add transaction
      const newTransaction: Transaction = {
          id: new Date().toISOString(),
          ...values,
          amount: numericAmount,
          workspace: activeWorkspace,
      };
      
      addTransaction(newTransaction);
      
      // Reset form and close sheet on success
      form.reset();
      setCurrentStep(1);
      setOpen(false);
    },
    {
      successMessage: 'Transaction added successfully',
      showErrorToast: false, // We'll handle errors in the UI
    }
  );

  const transactionType = form.watch('type');

  React.useEffect(() => {
    form.setValue('category', '');
  }, [transactionType, form]);

  const filteredCategories = React.useMemo(() => {
    return categories.filter((c) => c.type === transactionType && c.workspace === activeWorkspace);
  }, [transactionType, activeWorkspace, categories]);

  // Form submission handler that uses our async operation
  const handleSubmit = form.handleSubmit((values) => {
    submitTransaction(values);
  });

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setCurrentStep(1);
        form.reset();
      }
    }}>
      <SheetTrigger asChild>
        <AsyncButton size="sm" className="gap-1" loading={isLoading}>
          <PlusCircle className="h-4 w-4" />
          Add Transaction
        </AsyncButton>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-slate-200">
          <SheetTitle>Add New Transaction</SheetTitle>
          <SheetDescription>
            Enter the details of your transaction below. This will be added to your <span className="font-semibold">{activeWorkspace}</span> workspace.
          </SheetDescription>
        </SheetHeader>

        <ProgressiveForm
          steps={STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          canProceed={canProceed}
          isSubmitting={isLoading}
          onSubmit={() => handleSubmit()}
          submitText="Save Transaction"
        >
          <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden">
              {error && (
                <div className="px-4 sm:px-6 mb-4">
                  <ErrorState error={error} />
                </div>
              )}
              <ScrollArea className="flex-1 px-4 sm:px-6">
                <div className="py-6">
                  {/* Step 1: Type & Amount */}
                  <StepContent step={1} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Transaction Basics</h3>
                      <p className="text-sm text-slate-600 mb-4">Select type and enter amount</p>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a transaction type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="MK 10,000" 
                                {...field}
                                step="0.01"
                                min="0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </StepContent>

                  {/* Step 2: Details */}
                  <StepContent step={2} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Transaction Details</h3>
                      <p className="text-sm text-slate-600 mb-4">Add description and category</p>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Groceries at Shoprite" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredCategories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.name}>
                                    {cat.name}
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

                  {/* Step 3: Date */}
                  <StepContent step={3} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Transaction Date</h3>
                      <p className="text-sm text-slate-600 mb-4">Select the transaction date</p>
                    </div>
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
