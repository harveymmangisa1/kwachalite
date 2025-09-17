'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/data';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';
import { 
  Target, 
  Plus, 
  Edit3, 
  Wallet,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function BudgetDashboard() {
  const { activeWorkspace } = useActiveWorkspace();
  const { transactions, categories, updateCategory } = useAppStore();
  const { toast } = useToast();
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [newFrequency, setNewFrequency] = useState<'weekly' | 'monthly'>('monthly');

  // Filter data for active workspace
  const workspaceTransactions = useMemo(() => 
    transactions.filter(t => t.workspace === activeWorkspace), 
    [transactions, activeWorkspace]
  );
  
  const workspaceCategories = useMemo(() => 
    categories.filter(c => c.workspace === activeWorkspace), 
    [categories, activeWorkspace]
  );

  // Calculate budget data
  const budgetData = useMemo(() => {
    // Group transactions by category
    const categoryTransactions: Record<string, any[]> = {};
    workspaceTransactions.forEach(transaction => {
      if (!categoryTransactions[transaction.category]) {
        categoryTransactions[transaction.category] = [];
      }
      categoryTransactions[transaction.category].push(transaction);
    });

    // Create budget data for each category with a budget
    return workspaceCategories
      .filter(category => category.budget && category.type === 'expense')
      .map(category => {
        const categorySpent = categoryTransactions[category.id]?.reduce((sum, t) => sum + t.amount, 0) || 0;
        
        return {
          ...category,
          spentAmount: categorySpent,
          remainingAmount: (category.budget || 0) - categorySpent,
          percentage: category.budget ? Math.min(100, (categorySpent / category.budget) * 100) : 0
        };
      });
  }, [workspaceTransactions, workspaceCategories]);

  // Calculate totals
  const totalBudget = useMemo(() => 
    budgetData.reduce((sum, category) => sum + (category.budget || 0), 0), 
    [budgetData]
  );
  
  const totalSpent = useMemo(() => 
    budgetData.reduce((sum, category) => sum + category.spentAmount, 0), 
    [budgetData]
  );
  
  const totalRemaining = totalBudget - totalSpent;

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setNewBudget(category.budget?.toString() || '');
    setNewFrequency(category.budgetFrequency || 'monthly');
    setIsEditModalOpen(true);
  };

  const handleSaveBudget = () => {
    if (!editingCategory) return;
    
    const budgetValue = parseFloat(newBudget);
    if (newBudget !== '' && isNaN(budgetValue)) {
      toast({
        title: 'Invalid Budget',
        description: 'Please enter a valid number for the budget.',
        variant: 'destructive'
      });
      return;
    }
    
    const updatedCategory = {
      ...editingCategory,
      budget: budgetValue || undefined,
      budgetFrequency: newFrequency
    };
    
    updateCategory(updatedCategory);
    
    toast({
      title: 'Budget Updated',
      description: `Budget for ${editingCategory.name} has been updated.`
    });
    
    setIsEditModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Budget Dashboard</h1>
            <p className="text-gray-600">Track, analyze, and optimize your spending</p>
          </div>
        </div>

        {/* Hero Section - Budget Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Budget Overview */}
          <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Monthly Budget Overview</h2>
                <p className="text-blue-100">Track your financial progress</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-200" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-blue-100 text-sm mb-1">Total Budget</div>
                <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-blue-100 text-sm mb-1">Total Spent</div>
                <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-blue-100 text-sm mb-1">Remaining</div>
                <div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {formatCurrency(Math.abs(totalRemaining))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-blue-100 mb-2">
                <span>Budget Progress</span>
                <span>{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    totalBudget > 0 && (totalSpent / totalBudget) > 1 ? 'bg-red-400' : 
                    totalBudget > 0 && (totalSpent / totalBudget) > 0.9 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Budget Health Score */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Budget Health</h3>
              <Target className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800 mb-2">
                  {totalBudget > 0 ? Math.round((totalRemaining / totalBudget) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Management */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Budget Categories</h3>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetData.map((category) => (
              <div
                key={category.id}
                className="bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{category.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatCurrency(category.spentAmount)} of {formatCurrency(category.budget || 0)}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditClick(category)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-semibold">{formatCurrency(category.spentAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-semibold">{formatCurrency(category.budget || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className={`font-semibold ${
                      category.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(category.remainingAmount))}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, category.percentage)}%`,
                      backgroundColor: category.percentage > 90 ? '#EF4444' : 
                                      category.percentage > 75 ? '#F59E0B' : '#10B981'
                    }}
                  />
                </div>
              </div>
            ))}
            
            {budgetData.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Budget Categories Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Set budgets for your expense categories to track your spending.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Budget Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? `Edit ${editingCategory.name} Budget` : 'Edit Budget'}
            </DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget" className="text-right">
                  Budget
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter budget amount"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">
                  Frequency
                </Label>
                <Select value={newFrequency} onValueChange={(v) => setNewFrequency(v as 'weekly' | 'monthly')}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveBudget}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}