'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { categories } from '@/lib/data';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import React from 'react';
import type { Category } from '@/lib/types';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

export function CategoryManager() {
  const { activeWorkspace } = useActiveWorkspace();
  const { toast } = useToast();
  const [newCategory, setNewCategory] = React.useState('');
  
  const [budgets, setBudgets] = React.useState<Record<string, number | undefined>>(() => {
    const initialBudgets: Record<string, number | undefined> = {};
    categories.forEach(cat => {
      if (cat.type === 'expense') {
        initialBudgets[cat.id] = cat.budget;
      }
    });
    return initialBudgets;
  });

  const handleAddCategory = () => {
    if (newCategory.trim() !== '') {
      console.log('Adding category:', newCategory);
      // Here you would typically call an action to add the category
      setNewCategory('');
      toast({
        title: 'Category Added',
        description: `The category "${newCategory}" has been added.`,
      });
    }
  };

  const handleBudgetChange = (categoryId: string, value: string) => {
    const amount = value ? parseFloat(value) : undefined;
    setBudgets(prev => ({...prev, [categoryId]: amount}));
  };

  const handleSaveChanges = () => {
    console.log('Saving budgets:', budgets);
    toast({
      title: 'Budgets Saved',
      description: 'Your category budgets have been updated.',
    });
  }

  const filteredCategories = categories.filter(c => c.workspace === activeWorkspace);
  const expenseCategories = filteredCategories.filter(c => c.type === 'expense');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Categories</CardTitle>
        <CardDescription>
          Add new categories and set monthly budgets for your expenses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="font-semibold">Income Categories</Label>
          {filteredCategories.filter(c => c.type === 'income').map((category) => (
             <div key={category.id} className="flex items-center justify-between rounded-md border p-3">
               <div className="flex items-center gap-3">
                 <category.icon className="h-5 w-5 text-muted-foreground" />
                 <span className="font-medium text-sm">{category.name}</span>
               </div>
             </div>
          ))}
        </div>
         <div className="space-y-4">
          <Label className="font-semibold">Expense Categories & Budgets</Label>
           {expenseCategories.map((category) => (
             <div key={category.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <category.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                <div className="w-32">
                  <Input 
                    type="number" 
                    placeholder="Set budget..." 
                    className="text-sm h-8"
                    value={budgets[category.id] || ''}
                    onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                  />
                </div>
              </div>
           ))}
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex flex-col items-stretch gap-4">
        <div className="flex w-full items-center gap-2">
          <Input
            type="text"
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddCategory}>Add Category</Button>
        </div>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
