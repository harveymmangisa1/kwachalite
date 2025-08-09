
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import type { SavingsGoal } from '@/lib/types';

const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
});

export function UpdateSavingsGoal({ goal }: { goal: SavingsGoal }) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({ goalId: goal.id, newContribution: values.amount });
    toast({
      title: 'Progress Updated',
      description: `You've added ${values.amount} to your "${goal.name}" goal.`,
    });
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update "{goal.name}"</DialogTitle>
          <DialogDescription>
            Add to your savings for this goal. Your current progress is {goal.currentAmount}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Add</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="MK 50,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Contribution</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
