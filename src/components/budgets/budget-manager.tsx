
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
import { useAppStore } from '@/lib/data';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import React from 'react';
import type { Category } from '@/lib/types';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { Pen, Trash2, Check, X, Briefcase } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function BudgetManager() {
  const { activeWorkspace } = useActiveWorkspace();
  const { categories, updateCategory, deleteCategory, addCategory } = useAppStore();
  const { toast } = useToast();
  
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null);
  const [editedCategory, setEditedCategory] = React.useState<Partial<Category>>({});
  
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryType, setNewCategoryType] = React.useState<'income' | 'expense'>('expense');


  const handleAddCategory = () => {
    if (newCategoryName.trim() !== '') {
      const newCategory: Category = {
        id: `new-${Date.now()}`,
        name: newCategoryName,
        type: newCategoryType,
        workspace: activeWorkspace,
        icon: Briefcase, // A default icon
        color: 'hsl(var(--primary))',
        budgetFrequency: 'monthly',
      };
      addCategory(newCategory);
      setNewCategoryName('');
      toast({
        title: 'Category Added',
        description: `The category "${newCategoryName}" has been added.`,
      });
    }
  };
  
  const handleEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditedCategory({ name: category.name, budget: category.budget, budgetFrequency: category.budgetFrequency || 'monthly' });
  };
  
  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditedCategory({});
  }

  const handleUpdateCategory = (categoryId: string) => {
    const originalCategory = categories.find(c => c.id === categoryId);
    if (originalCategory) {
      updateCategory({ ...originalCategory, ...editedCategory });
    }
    setEditingCategoryId(null);
    setEditedCategory({});
    toast({ title: 'Category Updated' });
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory(categoryId);
    toast({ title: 'Category Deleted', variant: 'destructive' });
  };

  const filteredCategories = categories.filter(c => c.workspace === activeWorkspace);
  const incomeCategories = filteredCategories.filter(c => c.type === 'income');
  const expenseCategories = filteredCategories.filter(c => c.type === 'expense');

  const renderCategory = (category: Category) => {
    const isEditing = editingCategoryId === category.id;

    if (isEditing) {
      return (
        <div key={category.id} className="flex items-center justify-between rounded-md border p-3 gap-2">
           <Input 
            value={editedCategory.name}
            onChange={(e) => setEditedCategory(prev => ({...prev, name: e.target.value}))}
            className="text-sm h-8 flex-1"
          />
          {category.type === 'expense' && (
            <>
            <Input 
              type="number" 
              placeholder="Set budget..." 
              className="text-sm h-8 w-28"
              value={editedCategory.budget || ''}
              onChange={(e) => setEditedCategory(prev => ({...prev, budget: parseFloat(e.target.value) || undefined}))}
            />
            <Select 
              value={editedCategory.budgetFrequency} 
              onValueChange={(v) => setEditedCategory(prev => ({...prev, budgetFrequency: v as 'weekly' | 'monthly'}))}>
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
            </>
          )}
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUpdateCategory(category.id)}><Check className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
        </div>
      )
    }

    return (
       <div key={category.id} className="flex items-center justify-between rounded-md border p-3">
         <div className="flex items-center gap-3">
           <category.icon className="h-5 w-5 text-muted-foreground" />
           <span className="font-medium text-sm">{category.name}</span>
         </div>
         <div className="flex items-center gap-2">
            {category.type === 'expense' && category.budget && (
                <span className="text-sm text-muted-foreground w-48 text-right pr-2">
                    Budget: {new Intl.NumberFormat().format(category.budget)} / {category.budgetFrequency === 'weekly' ? 'wk' : 'mo'}
                </span>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(category)}>
                <Pen className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                <Trash2 className="h-4 w-4" />
            </Button>
         </div>
       </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Manager</CardTitle>
        <CardDescription>
          Add, edit, or delete categories and set weekly/monthly budgets for your expenses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="font-semibold">Income Categories</Label>
          {incomeCategories.map(renderCategory)}
        </div>
         <div className="space-y-4">
          <Label className="font-semibold">Expense Categories & Budgets</Label>
           {expenseCategories.map(renderCategory)}
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex flex-col items-stretch gap-4">
        <div>
            <Label className="text-sm font-medium">Add New Category</Label>
            <div className="flex w-full items-center gap-2 mt-2">
                <Input
                    type="text"
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1"
                />
                <Select value={newCategoryType} onValueChange={(v) => setNewCategoryType(v as any)}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleAddCategory}>Add</Button>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
