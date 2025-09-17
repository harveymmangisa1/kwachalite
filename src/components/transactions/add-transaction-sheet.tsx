
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
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { useFormSubmission } from '@/hooks/use-async-operation';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

// Custom form data type that allows string for amount
type TransactionFormInput = {
  type: 'income' | 'expense';
  amount: string;
  category: string;
  description: string;
  date: string;
};

export function AddTransactionSheet() {
  const [open, setOpen] = React.useState(false);
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <AsyncButton size="sm" className="gap-1" loading={isLoading}>
          <PlusCircle className="h-4 w-4" />
          Add Transaction
        </AsyncButton>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Add New Transaction</SheetTitle>
          <SheetDescription>
            Enter the details of your transaction below. This will be added to your <span className="font-semibold">{activeWorkspace}</span> workspace.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col gap-4 overflow-hidden"
          >
            {error && (
              <div className="-mx-6 px-6 mb-4">
                <ErrorState error={error} />
              </div>
            )}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
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
                      <FormLabel>Amount</FormLabel>
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
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
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
                      <FormLabel>Category</FormLabel>
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
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <SheetFooter className="pt-4 border-t">
              <SheetClose asChild>
                <AsyncButton type="button" variant="ghost" disabled={isLoading}>Cancel</AsyncButton>
              </SheetClose>
              <AsyncButton 
                type="submit" 
                loading={isLoading}
                loadingText="Saving..."
              >
                Save transaction
              </AsyncButton>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
