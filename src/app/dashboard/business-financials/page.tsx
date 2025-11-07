'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BusinessRevenue, BusinessExpense } from '@/lib/types';

export default function BusinessFinancialsPage() {
  const { 
    businessRevenues, 
    businessExpenses, 
    addBusinessRevenue, 
    addBusinessExpense, 
    categories,
    clients 
  } = useAppStore();
  
  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  
  // Filter categories for business
  const businessCategories = categories.filter(c => c.workspace === 'business');
  const revenueCategories = businessCategories.filter(c => c.type === 'income');
  const expenseCategories = businessCategories.filter(c => c.type === 'expense');

  // Calculate totals
  const totalRevenue = businessRevenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  const totalExpenses = businessExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Get current month data
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyRevenue = businessRevenues
    .filter(r => r.date.startsWith(currentMonth))
    .reduce((sum, revenue) => sum + revenue.amount, 0);
  const monthlyExpenses = businessExpenses
    .filter(e => e.date.startsWith(currentMonth))
    .reduce((sum, expense) => sum + expense.amount, 0);

  const handleAddRevenue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const revenue: BusinessRevenue = {
      id: `revenue_${Date.now()}`,
      source: 'direct',
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      status: formData.get('status') as 'pending' | 'received',
      clientId: formData.get('clientId') as string || undefined,
      paymentMethod: formData.get('paymentMethod') as string || undefined,
    };
    
    addBusinessRevenue(revenue);
    setIsRevenueDialogOpen(false);
  };

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const expense: BusinessExpense = {
      id: `expense_${Date.now()}`,
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      status: formData.get('status') as 'pending' | 'paid',
      vendor: formData.get('vendor') as string || undefined,
      taxDeductible: (formData.get('taxDeductible') as string) === 'true',
      paymentMethod: formData.get('paymentMethod') as string || undefined,
    };
    
    addBusinessExpense(expense);
    setIsExpenseDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Business Financials"
        description="Track your business revenue, expenses, and profitability."
      />
      
      <div className="px-4 sm:px-6">
        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="card-minimal">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(monthlyRevenue)} this month
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-minimal">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(monthlyExpenses)} this month
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-minimal">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(monthlyRevenue - monthlyExpenses)} this month
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-minimal">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                {monthlyRevenue > 0 ? `${(((monthlyRevenue - monthlyExpenses) / monthlyRevenue) * 100).toFixed(1)}%` : '0%'} this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue and Expenses Tabs */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <Link to="/dashboard/business-budgets">
                <Button variant="secondary">
                  <Target className="mr-2 h-4 w-4" />
                  Manage Budgets
                </Button>
              </Link>
              <Dialog open={isRevenueDialogOpen} onOpenChange={setIsRevenueDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Revenue
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleAddRevenue}>
                    <DialogHeader>
                      <DialogTitle>Add Business Revenue</DialogTitle>
                      <DialogDescription>
                        Record a new revenue entry for your business.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Input
                          id="description"
                          name="description"
                          placeholder="Revenue description"
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                          Amount
                        </Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          Date
                        </Label>
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          defaultValue={new Date().toISOString().split('T')[0]}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                          Category
                        </Label>
                        <Select name="category" required>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {revenueCategories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                          Status
                        </Label>
                        <Select name="status" defaultValue="received">
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="received">Received</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Revenue</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleAddExpense}>
                    <DialogHeader>
                      <DialogTitle>Add Business Expense</DialogTitle>
                      <DialogDescription>
                        Record a new expense for your business.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expense-description" className="text-right">
                          Description
                        </Label>
                        <Input
                          id="expense-description"
                          name="description"
                          placeholder="Expense description"
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expense-amount" className="text-right">
                          Amount
                        </Label>
                        <Input
                          id="expense-amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expense-date" className="text-right">
                          Date
                        </Label>
                        <Input
                          id="expense-date"
                          name="date"
                          type="date"
                          defaultValue={new Date().toISOString().split('T')[0]}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expense-category" className="text-right">
                          Category
                        </Label>
                        <Select name="category" required>
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
                        <Label htmlFor="expense-status" className="text-right">
                          Status
                        </Label>
                        <Select name="status" defaultValue="paid">
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Expense</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="card-minimal">
              <CardHeader>
                <CardTitle>Business Revenue</CardTitle>
                <CardDescription>
                  Track all income sources for your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businessRevenues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No revenue entries yet. Add your first revenue entry above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      businessRevenues.map((revenue) => (
                        <TableRow key={revenue.id} className="row-hover-minimal">
                          <TableCell>{new Date(revenue.date).toLocaleDateString()}</TableCell>
                          <TableCell>{revenue.description}</TableCell>
                          <TableCell>
                            {revenueCategories.find(c => c.id === revenue.category)?.name || revenue.category}
                          </TableCell>
                          <TableCell className="font-medium text-[rgb(var(--success))]">
                            {formatCurrency(revenue.amount)}
                          </TableCell>
                          <TableCell>
                            <span className={`${revenue.status === 'received' ? 'badge-success' : 'badge-info'} px-2 py-0.5 rounded-md text-xs capitalize`}>
                              {revenue.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card className="card-minimal">
              <CardHeader>
                <CardTitle>Business Expenses</CardTitle>
                <CardDescription>
                  Track all business expenditures and costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businessExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No expense entries yet. Add your first expense entry above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      businessExpenses.map((expense) => (
                        <TableRow key={expense.id} className="row-hover-minimal">
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>
                            {expenseCategories.find(c => c.id === expense.category)?.name || expense.category}
                          </TableCell>
                          <TableCell className="font-medium text-[rgb(var(--error))]">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell>
                            <span className={`${expense.status === 'paid' ? 'badge-success' : 'badge-info'} px-2 py-0.5 rounded-md text-xs capitalize`}>
                              {expense.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}