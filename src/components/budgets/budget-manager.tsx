'use client';

import React, { useMemo, useState } from 'react';
import { 
  Pen, Trash2, Check, X, Briefcase, Plus, 
  Target, Wallet, TrendingUp, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/data';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import type { Category } from '@/lib/types';

export function BudgetManager() {
  const { activeWorkspace } = useActiveWorkspace();
  const { categories, updateCategory, deleteCategory, addCategory, transactions } = useAppStore();
  const { toast } = useToast();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');

  // Filtered categories with memoization for performance
  const { incomeCats, expenseCats } = useMemo(() => {
    const filtered = categories.filter(c => c.workspace === activeWorkspace);
    return {
      incomeCats: filtered.filter(c => c.type === 'income'),
      expenseCats: filtered.filter(c => c.type === 'expense')
    };
  }, [categories, activeWorkspace]);

  const calculateProgress = (category: Category) => {
    if (!category.budget || category.budget <= 0) return { percent: 0, spent: 0 };
    
    const now = new Date();
    const periodStart = category.budgetFrequency === 'weekly' 
      ? new Date(now.setDate(now.getDate() - now.getDay())) 
      : new Date(now.getFullYear(), now.getMonth(), 1);

    const spent = transactions
      .filter(t => t.category === category.name && t.workspace === activeWorkspace && new Date(t.date) >= periodStart)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      percent: Math.min(100, (spent / category.budget) * 100),
      spent
    };
  };

  const handleSaveEdit = (id: string) => {
    const original = categories.find(c => c.id === id);
    if (original) updateCategory({ ...original, ...editForm });
    setEditingId(null);
    toast({ title: 'Category updated successfully' });
  };

  const renderCategoryCard = (cat: Category) => {
    const isEditing = editingId === cat.id;
    const { percent, spent } = calculateProgress(cat);
    const Icon = cat.icon || Briefcase;

    if (isEditing) {
      return (
        <div key={cat.id} className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Name</Label>
              <Input 
                value={editForm.name || ''} 
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                className="h-9 bg-white"
              />
            </div>
            {cat.type === 'expense' && (
              <>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Budget</Label>
                  <Input 
                    type="number"
                    value={editForm.budget || ''} 
                    onChange={e => setEditForm({...editForm, budget: parseFloat(e.target.value)})}
                    className="h-9 bg-white"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Cycle</Label>
                  <Select 
                    value={editForm.budgetFrequency} 
                    onValueChange={v => setEditForm({...editForm, budgetFrequency: v as any})}
                  >
                    <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4 mr-1"/> Cancel</Button>
            <Button size="sm" onClick={() => handleSaveEdit(cat.id)}><Check className="h-4 w-4 mr-1"/> Save</Button>
          </div>
        </div>
      );
    }

    return (
      <div key={cat.id} className="group relative flex flex-col p-4 rounded-xl border bg-card hover:border-primary/40 transition-all hover:shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">{cat.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{cat.type}</p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(cat.id); setEditForm(cat); }}>
              <Pen className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteCategory(cat.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {cat.type === 'expense' && cat.budget ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {formatCurrency(spent)} <span className="text-[10px]">spent</span>
              </span>
              <span className="font-medium">
                {formatCurrency(cat.budget)} <span className="text-[10px] text-muted-foreground">/ {cat.budgetFrequency === 'weekly' ? 'wk' : 'mo'}</span>
              </span>
            </div>
            <Progress 
              value={percent} 
              className="h-1.5" 
              indicatorColor={percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}
            />
          </div>
        ) : (
          <div className="mt-auto pt-2 border-t border-dashed">
            <p className="text-[10px] text-muted-foreground italic text-center">No budget limit set</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-2">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge className="bg-primary/20 text-primary-foreground border-none hover:bg-primary/30 mb-2">
              {activeWorkspace === 'business' ? 'Business Mode' : 'Personal Mode'}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              Budget Controls
            </h1>
            <p className="text-slate-400 max-w-md">
              Define your financial boundaries. Set limits for expense categories and track real-time utilization.
            </p>
          </div>
          
          <Card className="bg-white/10 border-white/10 backdrop-blur-md text-white md:w-80">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="text-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Total Budgeted</p>
                <p className="text-xl font-bold">
                  {formatCurrency(expenseCats.reduce((acc, curr) => acc + (curr.budget || 0), 0))}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Decorative background element */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Quick Add Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-secondary/30 p-4 rounded-2xl border border-dashed">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-bold uppercase ml-1">Category Name</Label>
          <Input 
            placeholder="e.g., Marketing, Rent, Groceries..." 
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase ml-1">Type</Label>
          <Select value={newType} onValueChange={v => setNewType(v as any)}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { addCategory({ name: newName, type: newType, workspace: activeWorkspace, icon: Briefcase, color: 'primary', budgetFrequency: 'monthly' }); setNewName(''); }} className="shadow-lg">
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      {/* Main Categories Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Wallet className="h-5 w-5 text-emerald-500" />
            <h2 className="font-bold text-lg">Income Streams</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {incomeCats.length > 0 ? incomeCats.map(renderCategoryCard) : (
              <div className="col-span-full py-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
                <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No income categories defined.</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <TrendingUp className="h-5 w-5 text-rose-500" />
            <h2 className="font-bold text-lg">Expense & Budgets</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expenseCats.length > 0 ? expenseCats.map(renderCategoryCard) : (
              <div className="col-span-full py-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
                <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No expense categories defined.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}