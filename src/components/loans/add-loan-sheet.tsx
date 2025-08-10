
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
import { PlusCircle } from 'lucide-react';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { useAppStore } from '@/lib/data';
import type { Loan } from '@/lib/types';

const formSchema = z.object({
  lender: z.string().min(1, 'Lender name is required'),
  principal: z.coerce.number().positive('Principal must be a positive number'),
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative'),
  term: z.coerce.number().int().positive('Term must be a positive number of months'),
  startDate: z.string().min(1, 'Start date is required'),
});

export function AddLoanSheet() {
  const { toast } = useToast();
  const { activeWorkspace } = useActiveWorkspace();
  const { addLoan } = useAppStore();
  const [open, setOpen] = React.useState(false);

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
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Loan
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a New Loan</SheetTitle>
          <SheetDescription>
            Enter the details of your loan below.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="lender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lender Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Vision Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="MK 5,000,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Interest Rate (%)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="15" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Term (Months)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="36" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="ghost">Cancel</Button>
                </SheetClose>
                <Button type="submit">Save Loan</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
