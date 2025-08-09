import {
  ShoppingBasket,
  Car,
  Home,
  Utensils,
  Heart,
  Film,
  GraduationCap,
  Briefcase,
  Gift,
  Landmark,
} from 'lucide-react';
import type { Transaction, Category, Bill, SavingsGoal } from './types';

export const categories: Category[] = [
  { id: 'groceries', name: 'Groceries', icon: ShoppingBasket, color: 'hsl(var(--chart-1))' },
  { id: 'transport', name: 'Transport', icon: Car, color: 'hsl(var(--chart-2))' },
  { id: 'housing', name: 'Housing', icon: Home, color: 'hsl(var(--chart-3))' },
  { id: 'food', name: 'Food & Dining', icon: Utensils, color: 'hsl(var(--chart-4))' },
  { id: 'health', name: 'Health', icon: Heart, color: 'hsl(var(--chart-5))' },
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

export const bills: Bill[] = [
    { id: '1', name: 'Netflix Subscription', amount: 15000, dueDate: '2024-08-15', status: 'unpaid' },
    { id: '2', name: 'Water Bill', amount: 20000, dueDate: '2024-08-20', status: 'unpaid' },
    { id: '3', name: 'Electricity', amount: 35000, dueDate: '2024-08-25', status: 'paid' },
    { id: '4', name: 'Internet Bill', amount: 45000, dueDate: '2024-09-01', status: 'unpaid' },
];

export const savingsGoals: SavingsGoal[] = [
    { id: '1', name: 'New Laptop', targetAmount: 800000, currentAmount: 250000, deadline: '2024-12-31', type: 'individual' },
    { id: '2', name: 'Group Vacation', targetAmount: 1200000, currentAmount: 600000, deadline: '2025-06-30', type: 'group', members: ['John', 'Jane', 'Pete'] },
    { id: '3', name: 'Emergency Fund', targetAmount: 500000, currentAmount: 500000, deadline: '2024-10-01', type: 'individual' },
];
