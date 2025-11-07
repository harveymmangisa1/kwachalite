'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DollarSign, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useBusinessProfile } from '@/hooks/use-business-profile-v2';
import { formatCurrency } from '@/lib/utils';
import React from 'react';
import type { Transaction } from '@/lib/types';

export function BusinessDashboardDebug({ transactions }: { transactions: Transaction[] }) {
  console.log('BusinessDashboardDebug rendered with:', { transactionsCount: transactions?.length || 0 });
  
  const { user } = useAuth();
  const { 
    businessProfile, 
    isLoading: profileLoading, 
    error: profileError,
    getDisplayName 
  } = useBusinessProfile();
  
  console.log('Debug dashboard state:', { 
    profileLoading, 
    profileError, 
    hasBusinessProfile: !!businessProfile,
    user: !!user 
  });

  // Calculate basic metrics
  const totalRevenue = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  // Get display name safely
  let displayName = 'Business User';
  try {
    displayName = getDisplayName();
  } catch (error) {
    console.error('Error getting display name:', error);
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-padding space-y-6 pb-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading business profile...</p>
            <p className="text-xs text-slate-500 mt-2">Debug: Business Dashboard Loading</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-padding space-y-6 pb-8">
        {/* Debug Information */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm text-gray-700">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600 space-y-1">
            <p>Profile Loading: {profileLoading ? 'Yes' : 'No'}</p>
            <p>Profile Error: {profileError || 'None'}</p>
            <p>Has Business Profile: {businessProfile ? 'Yes' : 'No'}</p>
            <p>User: {user ? user.email : 'None'}</p>
            <p>Display Name: {displayName}</p>
            <p>Transactions: {transactions?.length || 0}</p>
          </CardContent>
        </Card>

        {/* Simple Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Header Card */}
          <Card className="md:col-span-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-2">
                Welcome, {displayName}!
              </h1>
              <p className="text-blue-100">
                Business Dashboard (Debug Mode)
              </p>
            </CardContent>
          </Card>

          {/* Financial Metrics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">All-time income</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">All spending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(netProfit))}
              </div>
              <p className="text-xs text-muted-foreground">
                {netProfit >= 0 ? 'Profit' : 'Loss'}
              </p>
            </CardContent>
          </Card>

          {/* Simple Transactions List */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{transaction.description || 'Transaction'}</p>
                        <p className="text-sm text-gray-500">{transaction.category}</p>
                      </div>
                      <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No transactions found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}