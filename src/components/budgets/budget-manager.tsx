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
import { Pen, Trash2, Check, X, Briefcase, Plus, Target, Wallet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatCurrency } from '@/lib/utils';

export function BudgetManager() {
  const { activeWorkspace } = useActiveWorkspace();
  const { categories, updateCategory, deleteCategory, addCategory, transactions } = useAppStore();
  const { toast } = useToast();
  
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null);
  const [editedCategory, setEditedCategory] = React.useState<Partial<Category>>({});
  
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryType, setNewCategoryType] = React.useState<'income' | 'expense'>('expense');


  const handleAddCategory = () => {
    if (newCategoryName.trim() !== '') {
      const newCategory: Omit<Category, 'id'> = {
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
    setEditedCategory({ 
      name: category.name, 
      budget: category.budget, 
      budgetFrequency: category.budgetFrequency || 'monthly' 
    });
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

  // Calculate budget progress from actual transactions
  const calculateBudgetProgress = (category: Category) => {
    if (!category.budget || category.budget <= 0) return 0;
    
    // Get transactions for this category within the budget period
    const now = new Date();
    const categoryTransactions = transactions.filter(t => {
      if (t.category !== category.name || t.workspace !== activeWorkspace) return false;
      
      const transactionDate = new Date(t.date);
      
      // Filter by budget frequency
      if (category.budgetFrequency === 'weekly') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);
        return transactionDate >= weekStart;
      } else {
        // Monthly (default)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactionDate >= monthStart;
      }
    });

    // Calculate total spent (for expense categories) or earned (for income categories)
    const totalAmount = categoryTransactions
      .filter(t => t.type === category.type)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate percentage
    const percentage = (totalAmount / category.budget) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  // Progress circle component
  const ProgressCircle = ({ percentage, size = 40, strokeWidth = 3, color = '#10B981' }: { percentage: number, size?: number, strokeWidth?: number, color?: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] font-semibold" style={{ color }}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  const renderCategory = (category: Category) => {
    const isEditing = editingCategoryId === category.id;

    if (isEditing) {
      return (
        <div key={category.id} className="flex items-center justify-between rounded-md border p-3 gap-2 bg-white shadow-sm">
           <Input 
            value={editedCategory.name || ''}
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
              value={editedCategory.budgetFrequency || 'monthly'} 
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
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUpdateCategory(category.id)}><Check className="h-4 w-4 text-green-600" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}><X className="h-4 w-4 text-gray-600" /></Button>
        </div>
      )
    }

    // Render the icon component properly
    const IconComponent = category.icon;

    // Calculate budget progress from actual transactions
    const budgetProgress = calculateBudgetProgress(category);

    return (
       <div key={category.id} className="flex items-center justify-between rounded-md border p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
         <div className="flex items-center gap-3">
           <div className="relative">
             <IconComponent className="h-5 w-5 text-muted-foreground" />
             {category.type === 'expense' && category.budget && (
               <div className="absolute -top-1 -right-1">
                  <ProgressCircle 
                    percentage={budgetProgress} 
                    size={16} 
                    strokeWidth={2}
                    color={budgetProgress > 90 ? '#EF4444' : budgetProgress > 75 ? '#F59E0B' : '#10B981'} 
                  />
               </div>
             )}
           </div>
           <span className="font-medium text-sm">{category.name}</span>
         </div>
          <div className="flex flex-col items-end gap-1">
             {category.type === 'expense' && category.budget && (
                <>
                <span className="text-sm text-muted-foreground w-32 text-right pr-2">
                    {formatCurrency(category.budget || 0)} / {category.budgetFrequency === 'weekly' ? 'wk' : 'mo'}
                </span>
                <span className="text-xs text-muted-foreground w-32 text-right pr-2">
                    Spent: {formatCurrency((category.budget || 0) * (budgetProgress / 100))}
                </span>
                </>
             )}
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(category)}>
                <Pen className="h-4 w-4 text-blue-600" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                <Trash2 className="h-4 w-4" />
            </Button>
         </div>
       </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Budget Manager
          </CardTitle>
          <CardDescription className="text-blue-100">
            Add, edit, or delete categories and set weekly/monthly budgets for your expenses.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Add New Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="New category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-grow"
            />
            <Select value={newCategoryType} onValueChange={(v) => setNewCategoryType(v as 'income' | 'expense')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddCategory} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-green-600" />
              Income Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomeCategories.length > 0 ? (
              incomeCategories.map(renderCategory)
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center bg-gray-50 rounded-lg">
                No income categories found. Add your first income category!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-red-600" />
              Expense Categories & Budgets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenseCategories.length > 0 ? (
              expenseCategories.map(renderCategory)
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center bg-gray-50 rounded-lg">
                No expense categories found. Add your first expense category!
              </p>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  );
}