import {
  ShoppingBasket,
  Car,
  Home,
  Utensils,
  Heartbeat,
  Film,
  GraduationCap,
  Briefcase,
  Gift,
  Landmark,
} from 'lucide-react';
import type { Transaction, Category } from './types';

export const categories: Category[] = [
  { id: 'groceries', name: 'Groceries', icon: ShoppingBasket, color: 'hsl(var(--chart-1))' },
  { id: 'transport', name: 'Transport', icon: Car, color: 'hsl(var(--chart-2))' },
  { id: 'housing', name: 'Housing', icon: Home, color: 'hsl(var(--chart-3))' },
  { id: 'food', name: 'Food & Dining', icon: Utensils, color: 'hsl(var(--chart-4))' },
  { id: 'health', name: 'Health', icon: Heartbeat, color: 'hsl(var(--chart-5))' },
  { id: 'entertainment', name: 'Entertainment', icon: Film, color: 'hsl(var(--chart-1))' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'hsl(var(--chart-2))' },
  { id: 'work', name: 'Work', icon: Briefcase, color: 'hsl(var(--chart-3))' },
  { id: 'gifts', name: 'Gifts', icon: Gift, color: 'hsl(var(--chart-4))' },
  { id: 'salary', name: 'Salary', icon: Landmark, color: 'hsl(var(--chart-5))' },
];

export const transactions: Transaction[] = [
  {
    id: '1',
    date: '2024-07-25',
    description: 'Chipiku Store',
    amount: 25000,
    type: 'expense',
    category: 'Groceries',
  },
  {
    id: '2',
    date: '2024-07-25',
    description: 'Monthly Salary',
    amount: 500000,
    type: 'income',
    category: 'Salary',
  },
  {
    id: '3',
    date: '2024-07-24',
    description: 'Minibus fare',
    amount: 1000,
    type: 'expense',
    category: 'Transport',
  },
  {
    id: '4',
    date: '2024-07-23',
    description: 'Lunch at Crossroads',
    amount: 8500,
    type: 'expense',
    category: 'Food & Dining',
  },
  {
    id: '5',
    date: '2024-07-22',
    description: 'Rent for August',
    amount: 150000,
    type: 'expense',
    category: 'Housing',
  },
  {
    id: '6',
    date: '2024-07-21',
    description: 'Movie tickets',
    amount: 12000,
    type: 'expense',
    category: 'Entertainment',
  },
];
