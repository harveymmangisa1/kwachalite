'use client';

import React, { useState } from 'react';
import { 
  Plus, Briefcase, ShoppingCart, Home, 
  Car, Coffee, Utensils, Zap, ShieldCheck, Heart 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/data';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface AddCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Common financial icons to choose from
const ICON_OPTIONS = [
  { id: 'briefcase', icon: Briefcase, label: 'Work' },
  { id: 'shopping', icon: ShoppingCart, label: 'Shopping' },
  { id: 'home', icon: Home, label: 'Housing' },
  { id: 'car', icon: Car, label: 'Transport' },
  { id: 'coffee', icon: Coffee, label: 'Dining' },
  { id: 'utensils', icon: Utensils, label: 'Food' },
  { id: 'zap', icon: Zap, label: 'Utilities' },
  { id: 'shield', icon: ShieldCheck, label: 'Insurance' },
  { id: 'heart', icon: Heart, label: 'Health' },
];

export function AddCategorySheet({ open, onOpenChange }: AddCategorySheetProps) {
  const { activeWorkspace } = useActiveWorkspace();
  const { addCategory } = useAppStore();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [frequency, setFrequency] = useState<'monthly' | 'weekly'>('monthly');
  const [selectedIcon, setSelectedIcon] = useState('briefcase');

  const handleAddCategory = () => {
    if (!name.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }

    if (type === 'expense' && (!budget || budget <= 0)) {
      toast({ title: 'Invalid budget', description: 'Please set a budget for expenses.', variant: 'destructive' });
      return;
    }

    const IconComponent = ICON_OPTIONS.find(i => i.id === selectedIcon)?.icon || Briefcase;

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      type,
      workspace: activeWorkspace,
      icon: IconComponent,
      color: type === 'expense' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
      budgetFrequency: frequency,
      ...(type === 'expense' && { budget }),
    };

    addCategory(newCategory);
    resetForm();
    onOpenChange(false);
    toast({ title: 'Category created', description: `Successfully added ${name}.` });
  };

  const resetForm = () => {
    setName('');
    setBudget(undefined);
    setFrequency('monthly');
    setType('expense');
    setSelectedIcon('briefcase');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary" />
            New Category
          </SheetTitle>
          <SheetDescription>
            Organize your {activeWorkspace} workspace finances.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-8">
          {/* Live Preview Section */}
          <div className="rounded-2xl bg-slate-50 border p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg ${type === 'expense' ? 'bg-rose-500 shadow-rose-100' : 'bg-emerald-500 shadow-emerald-100'}`}>
              {React.createElement(ICON_OPTIONS.find(i => i.id === selectedIcon)?.icon || Briefcase, { className: 'h-6 w-6' })}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{name || 'Category Name'}</p>
              <p className="text-xs text-slate-500">
                {type === 'expense' && budget 
                  ? `${formatCurrency(budget)} ${frequency === 'monthly' ? '/ month' : '/ week'}`
                  : `Incoming stream`}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">Identity</Label>
              <Input
                placeholder="e.g., Household, Freelance..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Icon</Label>
                <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="h-4 w-4" />
                          <span>{opt.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {type === 'expense' && (
              <div className="pt-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Limit</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={budget === undefined ? '' : budget}
                      onChange={(e) => setBudget(parseFloat(e.target.value) || undefined)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Cycle</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as any)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="pt-4 border-t gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleAddCategory} className="rounded-xl px-8 shadow-lg shadow-primary/20">
            Create Category
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}