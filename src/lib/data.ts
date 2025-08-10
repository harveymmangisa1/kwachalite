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
  Computer,
  FileText,
  Package
} from 'lucide-react';
import type { Transaction, Category, Bill, SavingsGoal, Client, Product, Quote, Loan } from './types';

export const categories: Category[] = [
  // Personal Expense Categories
  { id: 'groceries', name: 'Groceries', icon: ShoppingBasket, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'personal', budget: 75000, budgetFrequency: 'monthly' },
  { id: 'transport', name: 'Transport', icon: Car, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'personal', budget: 30000, budgetFrequency: 'monthly' },
  { id: 'housing', name: 'Housing', icon: Home, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'personal', budget: 150000, budgetFrequency: 'monthly' },
  { id: 'food', name: 'Food & Dining', icon: Utensils, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'personal', budget: 100000, budgetFrequency: 'monthly' },
  { id: 'health', name: 'Health', icon: Heart, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'personal' },
  { id: 'entertainment', name: 'Entertainment', icon: Film, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'personal', budget: 50000, budgetFrequency: 'monthly' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'personal' },
  { id: 'gifts', name: 'Gifts', icon: Gift, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'personal' },
  
  // Personal Income Categories
  { id: 'salary', name: 'Salary', icon: Landmark, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'freelance_personal', name: 'Freelance', icon: Briefcase, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'investment', name: 'Investment', icon: TrendingUp, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'side_hustle', name: 'Side Hustle', icon: PiggyBank, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },

  // Business Expense Categories
  { id: 'office_supplies', name: 'Office Supplies', icon: Briefcase, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business', budget: 50000, budgetFrequency: 'monthly' },
  { id: 'software', name: 'Software & Subscriptions', icon: Computer, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'business', budget: 25000, budgetFrequency: 'monthly' },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'business' },
  { id: 'travel', name: 'Business Travel', icon: Car, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'business' },
  { id: 'client_expenses', name: 'Client Expenses', icon: Users, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'business' },
  { id: 'shipping', name: 'Shipping & Delivery', icon: Truck, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business' },

  // Business Income Categories
  { id: 'client_payments', name: 'Client Payments', icon: CreditCard, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
  { id: 'product_sales', name: 'Product Sales', icon: ShoppingBasket, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'business' },
];

export let transactions: Transaction[] = [];

export let bills: Bill[] = [];

export let savingsGoals: SavingsGoal[] = [];

export let clients: Client[] = [];

export let products: Product[] = [];

export let quotes: Quote[] = [];

export let loans: Loan[] = [];
