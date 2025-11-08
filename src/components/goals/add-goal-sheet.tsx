
'use client';

import { useState, useMemo, useEffect } from 'react';
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
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';
import { PlusCircle, Trash2, Target, DollarSign, Calendar, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { formatCurrency } from '@/lib/utils';
import { useAppStore } from '@/lib/data';
import type { SavingsGoal } from '@/lib/types';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { ProgressiveForm, StepContent } from '@/components/ui/progressive-form';

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

const STEPS = [
  { id: 1, name: 'Goal Info', icon: Target, description: 'Goal details' },
  { id: 2, name: 'Items', icon: Package, description: 'Shopping list' },
  { id: 3, name: 'Timeline', icon: Calendar, description: 'Deadline & total' },
];

export function AddGoalSheet() {
  const { toast } = useToast();
  const { activeWorkspace } = useActiveWorkspace();
  const { addSavingsGoal } = useAppStore();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  const watchedValues = form.watch();
  const items = form.watch('items');
  const targetAmount = useMemo(() => {
    return items?.reduce((total, item) => total + item.price, 0) || 0;
  }, [items]);

  useEffect(() => {
    form.setValue('targetAmount', targetAmount);
  }, [targetAmount, form]);

  const canProceed = useMemo((): boolean => {
    const values = watchedValues || {};
    switch (currentStep) {
      case 1:
        return !!values.name;
      case 2:
        return !!(items && items.length > 0 && items.every(item => item.name && item.price > 0));
      case 3:
        return !!values.deadline && targetAmount > 0;
      default:
        return false;
    }
  }, [currentStep, watchedValues, items, targetAmount]);

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
          <PlusCircle className="h-4 w-4" />
          Add Goal
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-slate-200">
          <SheetTitle>Create a New Financial Goal</SheetTitle>
          <SheetDescription>
            What are you planning for? Set your goal and shopping list below.
          </SheetDescription>
        </SheetHeader>

        <ProgressiveForm
          steps={STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          canProceed={canProceed}
          onSubmit={() => form.handleSubmit(onSubmit)()}
          submitText="Create Goal"
        >
          <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 px-4 sm:px-6">
                <div className="py-6">
                  {/* Step 1: Goal Info */}
                  <StepContent step={1} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Goal Information</h3>
                      <p className="text-sm text-slate-600 mb-4">Enter your goal name</p>
                    </div>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Saturday Market Run" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </StepContent>

                  {/* Step 2: Items */}
                  <StepContent step={2} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Shopping List / Items</h3>
                      <p className="text-sm text-slate-600 mb-4">Add items you need to purchase</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-medium">Items</h4>
                        <div className="text-sm font-medium">
                          Total: {formatCurrency(targetAmount)}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex gap-4 items-end p-3 border rounded-md">
                            <FormField
                              control={form.control}
                              name={`items.${index}.name`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-xs">Item Name *</FormLabel>
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
                                  <FormLabel className="text-xs">Price *</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="1000" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {fields.length > 1 && (
                              <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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
                  </StepContent>

                  {/* Step 3: Timeline */}
                  <StepContent step={3} currentStep={currentStep}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Timeline & Summary</h3>
                      <p className="text-sm text-slate-600 mb-4">Set deadline and review your goal</p>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-2">Goal Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Goal:</span>
                            <span className="font-medium">{watchedValues.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Target Amount:</span>
                            <span className="font-medium">{formatCurrency(targetAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Items:</span>
                            <span className="font-medium">{items?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Deadline:</span>
                            <span className="font-medium">
                              {watchedValues.deadline ? new Date(watchedValues.deadline).toLocaleDateString() : 'Not set'}
                            </span>
                          </div>
                        </div>
                      </div>
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
