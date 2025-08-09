
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
