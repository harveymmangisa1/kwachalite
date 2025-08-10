
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
import { PlusCircle, Loader2 } from 'lucide-react';
import React from 'react';
import { suggestTransactionCategory } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  receipt: z.any().optional(),
});

export function AddTransactionSheet() {
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { activeWorkspace } = useActiveWorkspace();
  const { categories, transactions, addTransaction } = useAppStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const transactionType = form.watch('type');

  React.useEffect(() => {
    form.setValue('category', '');
  }, [transactionType, form]);

  const filteredCategories = React.useMemo(() => {
    return categories.filter((c) => c.type === transactionType && c.workspace === activeWorkspace);
  }, [transactionType, activeWorkspace, categories]);


  async function handleReceiptUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSuggesting(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const receiptDataUri = reader.result as string;
        const userCategories = categories.filter(c => c.type === 'expense').map((c) => c.name);

        const result = await suggestTransactionCategory({
          receiptDataUri,
          userCategories,
        });

        if (result.suggestedCategory) {
          const matchedCategory = categories.find(c => c.name === result.suggestedCategory);
          if (matchedCategory) {
            form.setValue('category', matchedCategory.name);
            toast({
              title: 'AI Suggestion',
              description: `We've suggested the "${matchedCategory.name}" category for you.`,
            });
          }
        } else {
            toast({
                title: 'AI Suggestion',
                description: "Couldn't determine a category from the receipt.",
                variant: 'destructive'
            })
        }
      };
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to analyze receipt.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggesting(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
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

        const newTotalSpending = currentSpending + values.amount;
        const budgetThreshold = category.budget * 0.85;

        if (newTotalSpending > category.budget) {
            // This could be a different toast type
        } else if (newTotalSpending > budgetThreshold) {
          toast({
            title: 'Budget Warning',
            description: `You are about to exceed your budget for ${category.name}. You've spent ${formatCurrency(newTotalSpending)} of ${formatCurrency(category.budget)}.`,
            variant: 'destructive'
          });
        }
      }
    }
    
    const newTransaction: Transaction = {
        id: new Date().toISOString(),
        workspace: activeWorkspace,
        ...values
    }
    addTransaction(newTransaction);

    toast({
      title: 'Transaction Added',
      description: 'Your transaction has been successfully saved.',
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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Transaction</SheetTitle>
          <SheetDescription>
            Enter the details of your transaction below. This will be added to your <span className="font-semibold">{activeWorkspace}</span> workspace.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
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
                    <Input type="number" placeholder="MK 10,000" {...field} />
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
            {transactionType === 'expense' && (
              <FormField
                control={form.control}
                name="receipt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSuggesting}
                    >
                      {isSuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Upload and Analyze with AI
                    </Button>
                    <FormControl>
                      <Input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleReceiptUpload}
                        accept="image/*"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </SheetClose>
              <Button type="submit">Save transaction</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
