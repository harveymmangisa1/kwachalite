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
import type { Transaction, Category, Bill, SavingsGoal, Client, Product, Quote } from './types';

export const categories: Category[] = [
  // Personal Expense Categories
  { id: 'groceries', name: 'Groceries', icon: ShoppingBasket, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'personal', budget: 75000 },
  { id: 'transport', name: 'Transport', icon: Car, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'personal', budget: 30000 },
  { id: 'housing', name: 'Housing', icon: Home, color: 'hsl(var(--chart-3))', type: 'expense', workspace: 'personal', budget: 150000 },
  { id: 'food', name: 'Food & Dining', icon: Utensils, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'personal', budget: 100000 },
  { id: 'health', name: 'Health', icon: Heart, color: 'hsl(var(--chart-5))', type: 'expense', workspace: 'personal' },
  { id: 'entertainment', name: 'Entertainment', icon: Film, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'personal', budget: 50000 },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'personal' },
  { id: 'gifts', name: 'Gifts', icon: Gift, color: 'hsl(var(--chart-4))', type: 'expense', workspace: 'personal' },
  
  // Personal Income Categories
  { id: 'salary', name: 'Salary', icon: Landmark, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'freelance_personal', name: 'Freelance', icon: Briefcase, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'investment', name: 'Investment', icon: TrendingUp, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },
  { id: 'side_hustle', name: 'Side Hustle', icon: PiggyBank, color: 'hsl(var(--chart-2))', type: 'income', workspace: 'personal' },

  // Business Expense Categories
  { id: 'office_supplies', name: 'Office Supplies', icon: Briefcase, color: 'hsl(var(--chart-1))', type: 'expense', workspace: 'business', budget: 50000 },
  { id: 'software', name: 'Software & Subscriptions', icon: Computer, color: 'hsl(var(--chart-2))', type: 'expense', workspace: 'business', budget: 25000 },
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
    { 
        id: '1', 
        name: 'Weekend Market Run', 
        targetAmount: 28500, 
        currentAmount: 15000, 
        deadline: '2024-08-03', 
        type: 'individual', 
        workspace: 'personal',
        items: [
            { id: 'i1', name: 'Tomatoes', price: 2000, purchased: true },
            { id: 'i2', name: 'Onions', price: 1500, purchased: true },
            { id: 'i3', name: 'Chicken', price: 15000, purchased: false },
            { id: 'i4', name: 'Bread', price: 3000, purchased: false },
            { id: 'i5', name: 'Milk', price: 7000, purchased: false },
        ]
    },
    { 
        id: '2', 
        name: 'New Laptop', 
        targetAmount: 800000, 
        currentAmount: 250000, 
        deadline: '2024-12-31', 
        type: 'individual', 
        workspace: 'personal' 
    },
    { 
        id: '3', 
        name: 'Business Expansion', 
        targetAmount: 2000000, 
        currentAmount: 450000, 
        deadline: '2025-12-31', 
        type: 'individual', 
        workspace: 'business' 
    },
];

export const clients: Client[] = [
    { id: '1', name: 'Innovate Inc.', email: 'contact@innovate.com', phone: '123-456-7890', address: '123 Tech Park, Silicon Valley' },
    { id: '2', name: 'Creative Solutions', email: 'hello@creative.com', phone: '098-765-4321', address: '456 Design Ave, Arts District' },
    { id: '3', name: 'Data Driven LLC', email: 'info@datadriven.com', phone: '555-555-5555', address: '789 Analytics Blvd, Downtown' },
];

export const products: Product[] = [
    { id: '1', name: 'Web Design Package', description: 'Complete website design and development.', price: 2500000, costPrice: 1800000 },
    { id: '2', name: 'Logo Design', description: 'Custom logo and brand identity.', price: 500000, costPrice: 200000 },
    { id: '3', name: 'Social Media Management (Monthly)', description: 'Monthly management of social media channels.', price: 300000, costPrice: 150000 },
    { id: '4', name: 'Consulting Hour', description: 'One hour of business consulting.', price: 75000, costPrice: 10000 },
];

export const quotes: Quote[] = [
    {
        id: '1',
        quoteNumber: 'Q-2024-001',
        clientId: '1',
        date: '2024-07-28',
        expiryDate: '2024-08-28',
        items: [
            { productId: '1', quantity: 1, price: 2500000 },
            { productId: '2', quantity: 1, price: 500000 },
        ],
        status: 'sent',
    },
    {
        id: '2',
        quoteNumber: 'Q-2024-002',
        clientId: '2',
        date: '2024-07-29',
        expiryDate: '2024-08-29',
        items: [
            { productId: '3', quantity: 3, price: 300000 },
        ],
        status: 'accepted',
    },
    {
        id: '3',
        quoteNumber: 'Q-2024-003',
        clientId: '3',
        date: '2024-07-30',
        expiryDate: '2024-08-30',
        items: [
            { productId: '4', quantity: 10, price: 75000 },
        ],
        status: 'draft',
    }
]
