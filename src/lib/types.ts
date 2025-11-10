
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
  budgetFrequency?: 'weekly' | 'monthly';
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

export interface GoalItem {
    id: string;
    name: string;
    price: number;
    purchased: boolean;
}

export interface GroupMember {
    id: string;
    name: string;
    contribution: number;
    joinedAt: string;
}

export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    type: 'individual' | 'group';
    items?: GoalItem[];
    members?: GroupMember[];
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

export interface Loan {
    id: string;
    lender: string;
    principal: number;
    remainingAmount: number;
    interestRate: number; // Annual interest rate in percentage
    term: number; // Loan term in months
    startDate: string;
    status: 'active' | 'paid';
    workspace: Workspace;
}

export interface SalesReceipt {
    id: string;
    receiptNumber: string;
    invoiceId?: string; // Optional link to invoice
    quoteId?: string; // Optional link to quote
    clientId: string;
    date: string;
    amount: number;
    paymentMethod: 'cash' | 'check' | 'card' | 'bank_transfer' | 'mobile_money' | 'other';
    referenceNumber?: string; // Transaction reference
    notes?: string;
    status: 'confirmed' | 'pending' | 'cancelled';
}

export interface DeliveryNote {
    id: string;
    deliveryNoteNumber: string;
    invoiceId?: string; // Optional link to invoice
    quoteId?: string; // Optional link to quote
    clientId: string;
    date: string;
    deliveryDate: string;
    deliveryAddress: string;
    items: QuoteItem[]; // Same structure as quote items
    deliveryMethod: 'pickup' | 'delivery' | 'courier' | 'shipping';
    trackingNumber?: string;
    notes?: string;
    status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
    receivedBy?: string; // Person who received the goods
    receivedAt?: string; // Date/time received
}

// Business-specific financial types
export interface BusinessBudget {
    id: string;
    name: string;
    category: string;
    budgetAmount: number;
    period: 'monthly' | 'quarterly' | 'yearly';
    startDate: string;
    endDate: string;
    currentSpent: number;
    workspace: 'business';
}

export interface BusinessRevenue {
    id: string;
    source: 'quote' | 'invoice' | 'receipt' | 'direct';
    sourceId?: string; // Link to quote, invoice, or receipt
    clientId?: string;
    amount: number;
    date: string;
    description: string;
    category: string;
    status: 'pending' | 'received';
    paymentMethod?: string;
}

export interface BusinessExpense {
    id: string;
    vendor?: string;
    amount: number;
    date: string;
    description: string;
    category: string;
    receiptUrl?: string;
    taxDeductible: boolean;
    status: 'pending' | 'paid';
    paymentMethod?: string;
}

// Group Savings Types
export interface SavingsGroup {
    id: string;
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    status: 'active' | 'completed' | 'paused';
    currency?: string;
    contributionRules?: {
        minAmount?: number;
        frequency?: 'daily' | 'weekly' | 'monthly' | 'one_time';
        deadlineDay?: number; // For monthly contributions
    };
}

export interface GroupMember {
    id: string;
    groupId: string;
    userId: string;
    name: string;
    email: string;
    role: 'admin' | 'member';
    joinedAt: string;
    totalContributed: number;
    lastContributionAt?: string;
    status: 'active' | 'inactive';
}

export interface GroupInvitation {
    id: string;
    groupId: string;
    invitedBy: string;
    invitedEmail: string;
    token: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    createdAt: string;
    expiresAt: string;
    acceptedAt?: string;
    message?: string;
}

export interface GroupContribution {
    id: string;
    groupId: string;
    memberId: string;
    amount: number;
    description?: string;
    contributedAt: string;
    method: 'cash' | 'bank_transfer' | 'mobile_money' | 'other';
    status: 'confirmed' | 'pending';
    confirmedBy?: string;
    confirmedAt?: string;
}

export interface GroupActivity {
    id: string;
    groupId: string;
    type: 'member_joined' | 'member_left' | 'contribution_made' | 'goal_updated' | 'group_created';
    userId: string;
    description: string;
    metadata?: Record<string, any>;
    createdAt: string;
}
