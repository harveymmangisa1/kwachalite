'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Loader2 } from 'lucide-react';

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
  Select,
  SelectContent,
  SelectItem,
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

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { AnalyticsService } from '@/lib/analytics';
import { StreakService, ACTIVITY_TYPES } from '@/lib/streak-service';
import type { Transaction, Category } from '@/lib/types';

// Moved outside to prevent re-initialization on every render
const formSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category_id: z.string().min(1, 'Category is required'),
  workspace: z.enum(['personal', 'business']),
});

type TransactionFormValues = z.infer<typeof formSchema>;

export function AddTransactionSheet() {
  const { toast } = useToast();
  const { categories, addTransaction } = useAppStore();
  const { user } = useAuth();
  const { activeWorkspace } = useActiveWorkspace(); // Get the current workspace context
  
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      description: '',
      type: 'expense',
      workspace: activeWorkspace || 'personal', // Default to current view
    },
  });

  const transactionType = form.watch('type');

  // Filter categories based on type AND current workspace for a better UX
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.type === transactionType);
  }, [categories, transactionType]);

  // Sync workspace if it changes in the background
  useEffect(() => {
    if (activeWorkspace) {
      form.setValue('workspace', activeWorkspace as 'personal' | 'business');
    }
  }, [activeWorkspace, form]);

  // Reset category if it doesn't match new type
  useEffect(() => {
    const currentCatId = form.getValues('category_id');
    if (currentCatId && !filteredCategories.find(c => c.id === currentCatId)) {
      form.setValue('category_id', '');
    }
  }, [transactionType, filteredCategories, form]);

  async function onSubmit(values: TransactionFormValues) {
    setIsSubmitting(true);
    try {
      const selectedCategory = categories.find(c => c.id === values.category_id);
      
      const newTransaction: Transaction = {
        id: crypto.randomUUID(), // Better than toISOString for unique IDs
        ...values,
        date: format(values.date, 'yyyy-MM-dd'),
        category: selectedCategory?.name || 'General',
      };

      addTransaction(newTransaction);

      // Record services
      if (user?.id) {
        StreakService.recordActivity(user.id, ACTIVITY_TYPES.TRANSACTION_ADDED);
        AnalyticsService.trackEvent({
          event_type: 'transaction',
          user_id: user.id,
          properties: { ...values, category_name: newTransaction.category },
        });
      }

      toast({
        title: 'Transaction Added',
        description: `${values.description} has been recorded.`,
      });
      
      form.reset({
        ...form.control._defaultValues,
        date: new Date(),
        workspace: values.workspace, // Keep workspace for consecutive entries
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save transaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1 shadow-sm">
          <PlusCircle className="h-4 w-4" />
          Add Transaction
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Add Transaction</SheetTitle>
          <SheetDescription>
            Recorded transactions will update your budget health in real-time.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-6 flex-1">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Rent, Coffee, Freelance..." {...field} />
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
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input type="number" step="0.01" className="pl-7" placeholder="0.00" {...field} />
                      </div>
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
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                               {cat.name}
                            </span>
                          </SelectItem>
                        ))
                      ) : (
                        <p className="p-2 text-xs text-muted-foreground text-center">No categories found</p>
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
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "MMM d, yyyy") : <span>Pick date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
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
                    <FormLabel>Workspace</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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

            <div className="flex justify-end space-x-2 pt-6">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Transaction
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}