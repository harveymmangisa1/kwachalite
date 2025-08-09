import type { LucideIcon } from 'lucide-react';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}
