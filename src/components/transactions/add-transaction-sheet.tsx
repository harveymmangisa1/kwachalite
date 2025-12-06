'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { AnalyticsService } from '@/lib/analytics';
import type { Transaction } from '@/lib/types';
// Example: In addTransaction method
import { StreakService, ACTIVITY_TYPES } from '@/lib/streak-service';

const formSchema = z.object({
  date: z.date(),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category_id: z.string().min(1, 'Category is required'),
  workspace: z.enum(['personal', 'business']),
});

export function AddTransactionSheet() {
  const { toast } = useToast();
  const { categories, addTransaction } = useAppStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      description: '',
      type: 'expense',
      workspace: 'personal',
    },
  });

  const transactionType = form.watch('type');

  const groupedCategories = useMemo(() => {
    return categories.reduce((acc, cat) => {
      if (cat.type) {
        acc[cat.type].push(cat);
      }
      return acc;
    }, { income: [], expense: [] } as Record<'income' | 'expense', typeof categories>);
  }, [categories]);

  useEffect(() => {
    // If the selected category doesn't match the transaction type, reset it
    const selectedCategoryId = form.getValues('category_id');
    if (selectedCategoryId) {
      const selectedCategory = categories.find(c => c.id === selectedCategoryId);
      if (selectedCategory && selectedCategory.type !== transactionType) {
        form.setValue('category_id', '');
      }
    }
  }, [transactionType, categories, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    const newTransaction: Transaction = {
      id: new Date().toISOString(), // Temporary ID
      ...values,
      date: values.date.toISOString().split('T')[0],
      category: categories.find(c => c.id === values.category_id)?.name || 'General',
    };

addTransaction(newTransaction);

    // Record streak activity if user is authenticated
    if (user?.id) {
      try {
        StreakService.recordActivity(user.id, ACTIVITY_TYPES.TRANSACTION_ADDED);
        
        // Track analytics event
        AnalyticsService.trackEvent({
          event_type: 'transaction',
          user_id: user.id,
          properties: {
            amount: newTransaction.amount,
            type: newTransaction.type,
            category: newTransaction.category,
            workspace: newTransaction.workspace,
          },
        });
      } catch (error) {
        console.error('Failed to record activity:', error);
      }
    }

    toast({
      title: 'Transaction Added',
      description: 'The new transaction has been successfully recorded.',
    });
    form.reset();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Transaction
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Transaction</SheetTitle>
          <SheetDescription>
            Record a new income or expense transaction.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Groceries, Salary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
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
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groupedCategories[transactionType].length > 0 ? (
                        groupedCategories[transactionType].map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="-" disabled>
                          No {transactionType} categories found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workspace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a workspace" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Transaction</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
