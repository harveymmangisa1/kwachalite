
import type { LucideIcon } from 'lucide-react';

export type Workspace = 'personal' | 'business';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  workspace: Workspace;
}

export interface Category {
  id:string;
  name: string;
  icon: LucideIcon;
  color: string;
  type: 'income' | 'expense';
  workspace: Workspace;
  budget?: number;
}

export interface Bill {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    status: 'paid' | 'unpaid';
    isRecurring: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';
    workspace: Workspace;
}

export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    type: 'individual' | 'group';
    members?: string[];
    workspace: Workspace;
}

export interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    costPrice: number;
}

export interface QuoteItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface Quote {
    id: string;
    quoteNumber: string;
    clientId: string;
    date: string;
    expiryDate: string;
    items: QuoteItem[];
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
}
