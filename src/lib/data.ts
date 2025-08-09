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
  PiggyBank,
  TrendingUp,
  CreditCard,
  Truck,
  Users,
  Computer
} from 'lucide-react';
import type { Transaction, Category, Bill, SavingsGoal } from './types';

export const categories: Category[] = [
  // Personal Expense Categories
  { id: 'groceries', name: 'Groceries', icon: ShoppingBasket, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'personal' },
  { id: 'transport', name: 'Transport', icon: Car, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'personal' },
  { id: 'housing', name: 'Housing', icon: Home, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'personal' },
  { id: 'food', name: 'Food & Dining', icon: Utensils, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'personal' },
  { id: 'health', name: 'Health', icon: Heart, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'personal' },
  { id: 'entertainment', name: 'Entertainment', icon: Film, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'personal' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'personal' },
  { id: 'gifts', name: 'Gifts', icon: Gift, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'personal' },
  
  // Personal Income Categories
  { id: 'salary', name: 'Salary', icon: Landmark, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'freelance_personal', name: 'Freelance', icon: Briefcase, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'investment', name: 'Investment', icon: TrendingUp, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'side_hustle', name: 'Side Hustle', icon: PiggyBank, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },

  // Business Expense Categories
  { id: 'office_supplies', name: 'Office Supplies', icon: Briefcase, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business' },
  { id: 'software', name: 'Software & Subscriptions', icon: Computer, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'business' },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'business' },
  { id: 'travel', name: 'Business Travel', icon: Car, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'business' },
  { id: 'client_expenses', name: 'Client Expenses', icon: Users, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'business' },
  { id: 'shipping', name: 'Shipping & Delivery', icon: Truck, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business' },

  // Business Income Categories
  { id: 'client_payments', name: 'Client Payments', icon: CreditCard, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
  { id: 'product_sales', name: 'Product Sales', icon: ShoppingBasket, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
];

export const transactions: Transaction[] = [
  {
    id: '1',
    date: '2024-07-25',
    description: 'Chipiku Store',
    amount: 25000,
    type: 'expense',
    category: 'Groceries',
    workspace: 'personal',
  },
  {
    id: '2',
    date: '2024-07-25',
    description: 'Monthly Salary',
    amount: 500000,
    type: 'income',
    category: 'Salary',
    workspace: 'personal',
  },
  {
    id: '3',
    date: '2024-07-24',
    description: 'Minibus fare',
    amount: 1000,
    type: 'expense',
    category: 'Transport',
    workspace: 'personal',
  },
  {
    id: '4',
    date: '2024-07-23',
    description: 'Lunch at Crossroads',
    amount: 8500,
    type: 'expense',
    category: 'Food & Dining',
    workspace: 'personal',
  },
  {
    id: '5',
    date: '2024-07-22',
    description: 'Rent for August',
    amount: 150000,
    type: 'expense',
    category: 'Housing',
    workspace: 'personal',
  },
  {
    id: '6',
    date: '2024-07-21',
    description: 'Movie tickets',
    amount: 12000,
    type: 'expense',
    category: 'Entertainment',
    workspace: 'personal',
  },
  {
    id: '7',
    date: '2024-07-26',
    description: 'Payment from Client X',
    amount: 120000,
    type: 'income',
    category: 'Client Payments',
    workspace: 'business',
  },
  {
    id: '8',
    date: '2024-07-26',
    description: 'Canva Subscription',
    amount: 12500,
    type: 'expense',
    category: 'Software & Subscriptions',
    workspace: 'business',
  }
];

export const bills: Bill[] = [
    { id: '1', name: 'Netflix Subscription', amount: 15000, dueDate: '2024-08-15', status: 'unpaid', isRecurring: true, recurringFrequency: 'monthly', workspace: 'personal' },
    { id: '2', name: 'Water Bill', amount: 20000, dueDate: '2024-08-20', status: 'unpaid', isRecurring: true, recurringFrequency: 'monthly', workspace: 'personal' },
    { id: '3', name: 'Electricity', amount: 35000, dueDate: '2024-08-25', status: 'paid', isRecurring: false, workspace: 'personal' },
    { id: '4', name: 'Internet Bill', amount: 45000, dueDate: '2024-09-01', status: 'unpaid', isRecurring: true, recurringFrequency: 'monthly', workspace: 'personal' },
    { id: '5', name: 'Office Rent', amount: 100000, dueDate: '2024-09-01', status: 'unpaid', isRecurring: true, recurringFrequency: 'monthly', workspace: 'business' },
];

export const savingsGoals: SavingsGoal[] = [
    { id: '1', name: 'New Laptop', targetAmount: 800000, currentAmount: 250000, deadline: '2024-12-31', type: 'individual', workspace: 'personal' },
    { id: '2', name: 'Group Vacation', targetAmount: 1200000, currentAmount: 600000, deadline: '2025-06-30', type: 'group', members: ['John', 'Jane', 'Pete'], workspace: 'personal' },
    { id: '3', name: 'Emergency Fund', targetAmount: 500000, currentAmount: 500000, deadline: '2024-10-01', type: 'individual', workspace: 'personal' },
    { id: '4', name: 'Business Expansion', targetAmount: 2000000, currentAmount: 450000, deadline: '2025-12-31', type: 'individual', workspace: 'business' },
];
