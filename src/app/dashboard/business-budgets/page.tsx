'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppStore } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Plus, Target, AlertTriangle, CheckCircle, Calendar, BarChart3, Edit, Trash2 } from 'lucide-react';
import type { BusinessBudget } from '@/lib/types';

export default function BusinessBudgetsPage() {
  const { 
    businessBudgets, 
    businessExpenses, 
    addBusinessBudget, 
    updateBusinessBudget,
    deleteBusinessBudget,
    categories 
  } = useAppStore();
  
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BusinessBudget | null>(null);
  
  // Filter categories for business expenses
  const expenseCategories = categories.filter(c => c.workspace === 'business' && c.type === 'expense');

  // Calculate budget performance
  const getBudgetPerformance = (budget: BusinessBudget) => {
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    const currentDate = new Date();
    
    // Get expenses for this budget period and category
    const categoryExpenses = businessExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expense.category === budget.category &&
             expenseDate >= startDate &&
             expenseDate <= endDate;
    });
    
    const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = budget.budgetAmount > 0 ? (totalSpent / budget.budgetAmount) * 100 : 0;
    
    return {
      spent: totalSpent,
      remaining: budget.budgetAmount - totalSpent,
      percentage: Math.min(percentage, 100),
      isOverBudget: totalSpent > budget.budgetAmount,
      daysLeft: Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)))
    };
  };

  const handleAddBudget = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const budget: BusinessBudget = {
      id: `budget_${Date.now()}`,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      budgetAmount: parseFloat(formData.get('budgetAmount') as string),
      period: formData.get('period') as 'monthly' | 'quarterly' | 'yearly',
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      currentSpent: 0,
      workspace: 'business',
    };
    
    if (editingBudget) {
      updateBusinessBudget({ ...budget, id: editingBudget.id });
      setEditingBudget(null);
    } else {
      addBusinessBudget(budget);
    }
    
    setIsBudgetDialogOpen(false);
  };

  const handleEditBudget = (budget: BusinessBudget) => {
    setEditingBudget(budget);
    setIsBudgetDialogOpen(true);
  };

  const handleDeleteBudget = (budgetId: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBusinessBudget(budgetId);
    }
  };

  const generateDateRange = (period: string) => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    let endDate: Date;
    
    switch (period) {
      case 'monthly':
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate.setMonth(quarter * 3);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'yearly':
        startDate.setMonth(0);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Calculate overall budget summary
  const totalBudget = businessBudgets.reduce((sum, budget) => sum + budget.budgetAmount, 0);
  const totalSpent = businessBudgets.reduce((sum, budget) => {
    const performance = getBudgetPerformance(budget);
    return sum + performance.spent;
  }, 0);
  const budgetsOverLimit = businessBudgets.filter(budget => 
    getBudgetPerformance(budget).isOverBudget
  ).length;

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Business Budgets"
        description="Plan and track your business spending across different categories."
      />
      
      <div className="px-4 sm:px-6">
        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
              <p className="text-xs text-muted-foreground">
                Across {businessBudgets.length} budget{businessBudgets.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</div>
              <p className="text-xs text-muted-foreground">
                {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}%` : '0%'} of total budget
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(Math.max(0, totalBudget - totalSpent))}
              </div>
              <p className="text-xs text-muted-foreground">
                Available to spend
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${budgetsOverLimit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {budgetsOverLimit}
              </div>
              <p className="text-xs text-muted-foreground">
                Budget{budgetsOverLimit !== 1 ? 's' : ''} exceeding limit
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budgets Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Budget Management</CardTitle>
              <CardDescription>
                Create and manage budgets for different business categories
              </CardDescription>
            </div>
            <Dialog open={isBudgetDialogOpen} onOpenChange={(open) => {
              setIsBudgetDialogOpen(open);
              if (!open) setEditingBudget(null);
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleAddBudget}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingBudget ? 'Edit Budget' : 'Create Business Budget'}
                    </DialogTitle>
                    <DialogDescription>
                      Set spending limits for different business categories.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Budget Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingBudget?.name || ''}
                        placeholder="e.g., Monthly Marketing"
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <Select name="category" defaultValue={editingBudget?.category} required>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="budgetAmount" className="text-right">
                        Budget Amount
                      </Label>
                      <Input
                        id="budgetAmount"
                        name="budgetAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={editingBudget?.budgetAmount || ''}
                        placeholder="0.00"
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="period" className="text-right">
                        Period
                      </Label>
                      <Select 
                        name="period" 
                        defaultValue={editingBudget?.period || 'monthly'}
                        onValueChange={(value) => {
                          const dates = generateDateRange(value);
                          const startInput = document.querySelector('input[name="startDate"]') as HTMLInputElement;
                          const endInput = document.querySelector('input[name="endDate"]') as HTMLInputElement;
                          if (startInput && endInput) {
                            startInput.value = dates.startDate;
                            endInput.value = dates.endDate;
                          }
                        }}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startDate" className="text-right">
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        defaultValue={editingBudget?.startDate || generateDateRange('monthly').startDate}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="endDate" className="text-right">
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        defaultValue={editingBudget?.endDate || generateDateRange('monthly').endDate}
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingBudget ? 'Update Budget' : 'Create Budget'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {businessBudgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No budgets created yet.</p>
                <p className="text-sm">Create your first budget to start tracking spending.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Budget Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Budget Amount</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessBudgets.map((budget) => {
                    const performance = getBudgetPerformance(budget);
                    const category = expenseCategories.find(c => c.id === budget.category);
                    
                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.name}</TableCell>
                        <TableCell>{category?.name || budget.category}</TableCell>
                        <TableCell className="capitalize">{budget.period}</TableCell>
                        <TableCell>{formatCurrency(budget.budgetAmount)}</TableCell>
                        <TableCell className={performance.isOverBudget ? 'text-red-600' : ''}>
                          {formatCurrency(performance.spent)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress 
                              value={performance.percentage} 
                              className="h-2"
                              // Add red color for over budget
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{performance.percentage.toFixed(0)}%</span>
                              <span>{formatCurrency(performance.remaining)} left</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={performance.daysLeft <= 7 ? 'destructive' : 'outline'}>
                            {performance.daysLeft} days
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditBudget(budget)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBudget(budget.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}