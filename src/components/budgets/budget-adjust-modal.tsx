'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAppStore } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import type { Category } from '@/lib/types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface BudgetAdjustModalProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: any[];
}

export function BudgetAdjustModal({ 
  category, 
  open, 
  onOpenChange,
  transactions 
}: BudgetAdjustModalProps) {
  const { updateCategory } = useAppStore();
  const { toast } = useToast();
  const [budget, setBudget] = useState<string>('');
  const [budgetFrequency, setBudgetFrequency] = useState<'weekly' | 'monthly'>('monthly');
  
  // Calculate spending data for the category
  const categoryTransactions = transactions.filter(t => t.category === category?.id);
  
  const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Group transactions by month for chart
  const monthlySpending: Record<string, number> = {};
  categoryTransactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const monthYear = `${month} ${year}`;
    
    if (!monthlySpending[monthYear]) {
      monthlySpending[monthYear] = 0;
    }
    monthlySpending[monthYear] += transaction.amount;
  });
  
  const chartData = Object.entries(monthlySpending).map(([month, amount]) => ({
    month,
    amount
  }));

  useEffect(() => {
    if (category) {
      setBudget(category.budget?.toString() || '');
      setBudgetFrequency(category.budgetFrequency || 'monthly');
    }
  }, [category]);

  const handleSave = () => {
    if (!category) return;
    
    const budgetValue = parseFloat(budget);
    if (budget !== '' && isNaN(budgetValue)) {
      toast({
        title: 'Invalid Budget',
        description: 'Please enter a valid number for the budget.',
        variant: 'destructive'
      });
      return;
    }
    
    const updatedCategory = {
      ...category,
      budget: budgetValue || undefined,
      budgetFrequency
    };
    
    updateCategory(updatedCategory);
    
    toast({
      title: 'Budget Updated',
      description: `Budget for ${category.name} has been updated.`
    });
    
    onOpenChange(false);
  };

  if (!category) return null;

  const budgetAmount = category.budget || 0;
  const remaining = budgetAmount - totalSpent;
  const percentage = budgetAmount > 0 ? Math.min(100, (totalSpent / budgetAmount) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            {category.name} Budget
          </DialogTitle>
          <DialogDescription>
            Adjust your budget settings and view spending details
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget Settings */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Budget Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budget">Budget Amount</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Enter budget amount"
                  />
                </div>
                
                <div>
                  <Label htmlFor="frequency">Budget Frequency</Label>
                  <Select value={budgetFrequency} onValueChange={(v) => setBudgetFrequency(v as 'weekly' | 'monthly')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleSave} className="w-full">
                  Save Budget
                </Button>
              </div>
            </div>
            
            {/* Budget Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Budget Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">{formatCurrency(budgetAmount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spent:</span>
                  <span className="font-medium">{formatCurrency(totalSpent)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(remaining))}
                    {remaining < 0 ? ' over' : ''}
                  </span>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        percentage > 100 ? 'bg-red-500' : 
                        percentage > 90 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Spending Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Spending Details</h3>
            
            {categoryTransactions.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                        labelStyle={{ color: '#333' }}
                      />
                      <Legend />
                      <Bar dataKey="amount" name="Spent" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Recent Transactions</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {categoryTransactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((transaction) => (
                        <div key={transaction.id} className="flex justify-between text-sm p-2 bg-white rounded border">
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-muted-foreground text-xs">
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="font-medium">
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions found for this category</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}