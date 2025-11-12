'use client';

import React, { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/data';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';

interface AddCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCategorySheet({ open, onOpenChange }: AddCategorySheetProps) {
  const { activeWorkspace } = useActiveWorkspace();
  const { addCategory } = useAppStore();
  const { toast } = useToast();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');
  const [newCategoryBudget, setNewCategoryBudget] = useState<number | undefined>(undefined);
  const [newCategoryBudgetFrequency, setNewCategoryBudgetFrequency] = useState<'monthly' | 'weekly'>('monthly');

  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Category name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    if (newCategoryType === 'expense' && (newCategoryBudget === undefined || newCategoryBudget <= 0)) {
      toast({
        title: 'Validation Error',
        description: 'Expense categories require a budget greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    const newCategory: Category = {
      id: `cat-${Date.now()}`, // Unique ID for the new category
      name: newCategoryName,
      type: newCategoryType,
      workspace: activeWorkspace,
      icon: Briefcase, // Default icon
      color: 'hsl(var(--primary))', // Default color
      budgetFrequency: newCategoryBudgetFrequency, // Default budget frequency
      ...(newCategoryType === 'expense' && newCategoryBudget !== undefined && { budget: newCategoryBudget }),
    };

    addCategory(newCategory);
    setNewCategoryName('');
    setNewCategoryBudget(undefined);
    setNewCategoryBudgetFrequency('monthly');
    onOpenChange(false); // Close the sheet
    toast({
      title: 'Category Added',
      description: `The category "${newCategoryName}" has been added.`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Category
          </SheetTitle>
          <SheetDescription>
            Create a new income or expense category for your budget.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              placeholder="e.g., Groceries, Salary"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="categoryType">Category Type</Label>
            <Select value={newCategoryType} onValueChange={(v) => setNewCategoryType(v as 'income' | 'expense')}>
              <SelectTrigger id="categoryType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newCategoryType === 'expense' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="categoryBudget">Budget Amount</Label>
                <Input
                  id="categoryBudget"
                  type="number"
                  placeholder="e.g., 500.00"
                  value={newCategoryBudget === undefined ? '' : newCategoryBudget}
                  onChange={(e) => setNewCategoryBudget(parseFloat(e.target.value) || undefined)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budgetFrequency">Budget Frequency</Label>
                <Select value={newCategoryBudgetFrequency} onValueChange={(v) => setNewCategoryBudgetFrequency(v as 'monthly' | 'weekly')}>
                  <SelectTrigger id="budgetFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        <div className="mt-auto flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
