
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { PlusCircle, Trash2 } from 'lucide-react';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { formatCurrency } from '@/lib/utils';
import { useAppStore } from '@/lib/data';
import type { SavingsGoal } from '@/lib/types';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';

const goalItemSchema = z.object({
  id: z.string().default(() => `item-${new Date().toISOString()}`),
  name: z.string().min(1, "Item name is required"),
  price: z.coerce.number().min(0, "Price can't be negative"),
  purchased: z.boolean().default(false),
});

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  targetAmount: z.coerce.number(),
  deadline: z.string().min(1, 'Deadline is required'),
  items: z.array(goalItemSchema).optional(),
});

export function AddGoalSheet() {
  const { toast } = useToast();
  const { activeWorkspace } = useActiveWorkspace();
  const { addSavingsGoal } = useAppStore();
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      deadline: new Date().toISOString().split('T')[0],
      items: [{ name: '', price: 0, purchased: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const items = form.watch('items');
  const targetAmount = React.useMemo(() => {
    return items?.reduce((total, item) => total + item.price, 0) || 0;
  }, [items]);

  React.useEffect(() => {
    form.setValue('targetAmount', targetAmount);
  }, [targetAmount, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    const newGoal: SavingsGoal = {
        id: new Date().toISOString(),
        currentAmount: 0,
        type: 'individual',
        workspace: activeWorkspace,
        ...values
    };
    addSavingsGoal(newGoal);

    toast({
      title: 'Financial Goal Added',
      description: 'Your new goal has been created.',
    });
    form.reset();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Goal
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col">
        <SheetHeader>
          <SheetTitle>Create a New Financial Goal</SheetTitle>
          <SheetDescription>
            What are you planning for? Set your goal and shopping list below.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col gap-4 overflow-hidden"
          >
             <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="grid gap-4 py-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Goal Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Saturday Market Run" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Date / Deadline</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <div>
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="text-sm font-medium">Shopping List / Items</h4>
                           <div className="text-sm font-medium">
                                Total: {formatCurrency(targetAmount)}
                           </div>
                        </div>
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-end p-2 border rounded-md">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                            <FormLabel className="text-xs">Item Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Tomatoes" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.price`}
                                        render={({ field }) => (
                                            <FormItem className="w-32">
                                            <FormLabel className="text-xs">Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="1000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => append({ id: `item-${new Date().toISOString()}`, name: '', price: 0, purchased: false })}
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Item
                        </Button>
                    </div>
                 </div>
            </ScrollArea>
            <SheetFooter className="pt-4 border-t">
                <SheetClose asChild>
                    <Button type="button" variant="ghost">Cancel</Button>
                </SheetClose>
                <Button type="submit">Create Goal</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
