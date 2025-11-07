
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import React from 'react';
import type { Transaction } from '@/lib/types';

interface BusinessOverviewCardsProps {
  transactions: Transaction[];
}

export function BusinessOverviewCards({ transactions }: BusinessOverviewCardsProps) {
  const { clients } = useAppStore();

  const totalRevenue = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  
  const totalClients = clients.length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="card-interactive">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            All-time income
          </p>
        </CardContent>
      </Card>
      <Card className="card-interactive">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(netProfit)}
          </div>
          <p className="text-xs text-muted-foreground">
            Revenue minus expenses
          </p>
        </CardContent>
      </Card>
      <Card className="card-interactive">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{totalClients}</div>
          <p className="text-xs text-muted-foreground">
            Total number of clients
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
