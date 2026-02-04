'use client';

import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, AlertCircle, CheckCircle2, Target, 
  Plus, Bell, DollarSign, Calendar, Star, ArrowUp
} from 'lucide-react';
import { useAppStore } from '@/lib/data';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BudgetAdjustModal } from '@/components/budgets/budget-adjust-modal';
import { AddCategorySheet } from '@/components/budgets/add-category-sheet';

// --- Sub-components ---

const SelectTimeframe = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-[140px] rounded-xl bg-white dark:bg-slate-900 shadow-sm border-border">
      <SelectValue placeholder="Select period" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="week">This Week</SelectItem>
      <SelectItem value="month">This Month</SelectItem>
      <SelectItem value="quarter">This Quarter</SelectItem>
      <SelectItem value="year">This Year</SelectItem>
    </SelectContent>
  </Select>
);

const CategoryCard = ({ category, onClick }: { category: any, onClick: () => void }) => {
  const ratio = category.spentAmount / category.budgetAmount;
  const IconComponent = category.icon || Target;

  return (
    <Card className="hover:ring-2 ring-primary transition-all cursor-pointer border-none shadow-md overflow-hidden group bg-card" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-primary group-hover:scale-110 transition-transform">
            <IconComponent className="h-6 w-6" />
          </div>
          <Badge variant={ratio > 1 ? 'destructive' : 'secondary'} className="rounded-md">
            {ratio > 1 ? <TrendingUp className="h-3 w-3 mr-1" /> : <ArrowUp className="h-3 w-3 mr-1" />}
            {Math.round(ratio * 100)}%
          </Badge>
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-100">{category.name}</h4>
        <div className="mt-4 flex justify-between text-xs mb-1">
          <span className="text-muted-foreground font-medium">Used {formatCurrency(category.spentAmount)}</span>
          <span className="font-bold">{formatCurrency(category.budgetAmount)}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${ratio > 1 ? 'bg-destructive' : ratio > 0.8 ? 'bg-amber-500' : 'bg-primary'}`} 
            style={{ width: `${Math.min(100, ratio * 100)}%` }} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 p-3 border rounded-xl shadow-xl border-border">
        <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{payload[0].payload.name}</p>
        <p className="text-sm font-black text-primary">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

// --- Main Dashboard Component ---

const BudgetDashboard = () => {
  const { activeWorkspace } = useActiveWorkspace();
  const { transactions, categories } = useAppStore();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddCategorySheetOpen, setIsAddCategorySheetOpen] = useState(false);

  // 1. Process Data
  const { budgetData, totalBudget, totalSpent } = useMemo(() => {
    const workspaceCats = categories.filter(c => c.workspace === activeWorkspace);
    const workspaceTrans = transactions.filter(t => t.workspace === activeWorkspace);

    const data = workspaceCats
      .filter(c => c.type === 'expense' && c.budget)
      .map(cat => {
        const spent = workspaceTrans
          .filter(t => t.category === cat.id || t.category === cat.name)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return {
          ...cat,
          spentAmount: spent,
          budgetAmount: cat.budget || 0,
        };
      });

    return {
      budgetData: data,
      totalBudget: data.reduce((sum, c) => sum + c.budgetAmount, 0),
      totalSpent: data.reduce((sum, c) => sum + c.spentAmount, 0)
    };
  }, [transactions, categories, activeWorkspace]);

  const totalRemaining = totalBudget - totalSpent;
  const burnRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // 2. Mock Chart Data (In prod, derive this from transaction dates)
  const chartData = [
    { name: 'Week 1', spent: totalSpent * 0.2, budget: totalBudget },
    { name: 'Week 2', spent: totalSpent * 0.45, budget: totalBudget },
    { name: 'Week 3', spent: totalSpent * 0.7, budget: totalBudget },
    { name: 'Week 4', spent: totalSpent, budget: totalBudget },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="capitalize bg-background font-bold tracking-tight">
                {activeWorkspace} Workspace
              </Badge>
              {burnRate > 90 && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 animate-pulse">
                  Attention Required
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Budget Overview</h1>
          </div>

          <div className="flex items-center gap-3">
            <SelectTimeframe value={selectedTimeframe} onChange={setSelectedTimeframe} />
            <Button onClick={() => setIsAddCategorySheetOpen(true)} className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </div>
        </div>

        {/* Hero Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 border-none shadow-2xl bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <DollarSign className="h-40 w-40" />
            </div>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Budgeted</p>
                  <p className="text-3xl font-bold tracking-tighter">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Spent</p>
                  <p className="text-3xl font-bold tracking-tighter">{formatCurrency(totalSpent)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Remaining</p>
                  <p className={`text-3xl font-bold tracking-tighter ${totalRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
              </div>
              
              <div className="mt-10 space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Spending Progress</span>
                  <span>{Math.round(burnRate)}% utilized</span>
                </div>
                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${burnRate > 100 ? 'bg-rose-500' : 'bg-primary'}`} 
                    style={{ width: `${Math.min(100, burnRate)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center justify-center p-6 text-center shadow-xl border-none bg-card">
            <Target className="h-10 w-10 text-primary mb-3" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Health Score</h3>
            <div className="text-5xl font-black my-2 text-foreground">
              {Math.max(0, Math.round(100 - (burnRate > 100 ? 100 : burnRate / 1.5)))}%
            </div>
            <p className="text-[10px] text-muted-foreground uppercase leading-tight font-medium">Efficiency based on limits</p>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-xl bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Consumption Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="spent" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSpent)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" /> Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="spentAmount"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || 'hsl(var(--primary))'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="hidden md:flex flex-col gap-3 ml-4 w-48">
                {budgetData.slice(0, 4).map((cat) => (
                  <div key={cat.id} className="flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground">
                      <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold pl-4">{Math.round((cat.spentAmount / totalSpent) * 100 || 0)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-black tracking-tight px-1 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Active Budgets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetData.map(cat => (
              <CategoryCard 
                key={cat.id} 
                category={cat} 
                onClick={() => { setSelectedCategory(cat); setIsModalOpen(true); }} 
              />
            ))}
            {budgetData.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed">
                <p className="text-muted-foreground font-medium">No expense categories with budgets found.</p>
                <Button variant="link" onClick={() => setIsAddCategorySheetOpen(true)}>Create your first budget</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BudgetAdjustModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        category={selectedCategory} 
        transactions={transactions}
      />
      <AddCategorySheet 
        open={isAddCategorySheetOpen} 
        onOpenChange={setIsAddCategorySheetOpen} 
      />
    </div>
  );
};

export default BudgetDashboard;