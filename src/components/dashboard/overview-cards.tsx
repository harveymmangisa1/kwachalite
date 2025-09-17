
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import React from 'react';
import type { Transaction } from '@/lib/types';

interface OverviewCardsProps {
  transactions: Transaction[];
}

export function OverviewCards({ transactions }: OverviewCardsProps) {
  
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const isPositiveBalance = balance >= 0;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="modern-card group hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(totalIncome)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpRight className="h-3 w-3 text-emerald-500" />
            <span>Last 30 days</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="modern-card group hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          <div className="p-2 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-colors">
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-rose-600">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowDownRight className="h-3 w-3 text-rose-500" />
            <span>Last 30 days</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="modern-card group hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          <div className={`p-2 rounded-xl transition-colors ${
            isPositiveBalance 
              ? 'bg-blue-500/10 group-hover:bg-blue-500/20' 
              : 'bg-orange-500/10 group-hover:bg-orange-500/20'
          }`}>
            <Wallet className={`h-4 w-4 ${
              isPositiveBalance ? 'text-blue-600' : 'text-orange-600'
            }`} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className={`text-2xl font-bold ${
            isPositiveBalance ? 'text-blue-600' : 'text-orange-600'
          }`}>
            {formatCurrency(balance)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Available balance</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
