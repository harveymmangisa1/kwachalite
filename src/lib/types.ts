
import type { LucideIcon } from 'lucide-react';

export type Workspace = 'personal' | 'business';

// ============================================
// STREAK FEATURE TYPES
// ============================================
export interface UserStreak {
    id: string;
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string;
    last_activity_type: string;
    total_active_days: number;
    streak_freeze_count: number;
    created_at: string;
    updated_at: string;
}

export interface DailyActivity {
    id: string;
    user_id: string;
    activity_date: string;
    activities: Array<{
        type: string;
        timestamp: string;
    }>;
    transactions_count: number;
    savings_count: number;
    bills_paid_count: number;
    goals_updated_count: number;
    points_earned: number;
    created_at: string;
    updated_at: string;
}

export interface StreakMilestone {
    id: string;
    user_id: string;
    milestone_type: 'first_day' | 'week_streak' | 'month_streak' | 'quarter_streak' | 'year_streak' | 'hundred_days' | 'custom';
    milestone_value: number;
    achieved_at: string;
    reward_type?: 'badge' | 'points' | 'feature_unlock';
    reward_data?: any;
    created_at: string;
}

export interface StreakFreezeHistory {
    id: string;
    user_id: string;
    freeze_date: string;
    reason?: 'manual' | 'auto' | 'reward';
    created_at: string;
}

export interface StreakUpdateResult {
    current_streak: number;
    longest_streak: number;
    is_new_milestone: boolean;
    milestone_type: string | null;
}


export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category_id: string;
    category?: string;
    workspace: Workspace;
}

export interface Category {
    id: string;
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
    company?: string;
    website?: string;
    notes?: string;
    status?: string;
    total_revenue?: number;
    created_source?: string;
    created_at?: string;
    updated_at?: string;
    user_id?: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    client_id: string;
    status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
    start_date?: string;
    end_date?: string;
    budget?: number;
    actual_cost?: number;
    priority?: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectMilestone {
    id: string;
    project_id: string;
    name: string;
    description?: string;
    due_date: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    completed_date?: string;
    deliverables?: string[];
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface ClientPayment {
    id: string;
    client_id: string;
    project_id?: string;
    amount: number;
    payment_date: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    payment_method?: string;
    reference_number?: string;
    description?: string;
    invoice_id?: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface ClientExpense {
    id: string;
    client_id: string;
    project_id?: string;
    amount: number;
    expense_date: string;
    category: string;
    description: string;
    vendor?: string;
    receipt_url?: string;
    is_billable?: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface Invoice {
    id: string;
    invoice_number: string;
    client_id: string;
    project_id?: string;
    issue_date: string;
    due_date: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    subtotal: number;
    tax_rate?: number;
    tax_amount?: number;
    total_amount: number;
    paid_amount?: number;
    notes?: string;
    items: InvoiceItem[];
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface InvoiceItem {
    id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface CommunicationLog {
    id: string;
    client_id: string;
    project_id?: string;
    type: 'email' | 'phone' | 'meeting' | 'note' | 'other';
    subject?: string;
    content: string;
    communication_date: string;
    direction?: string;
    duration_minutes?: number;
    next_follow_up?: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface TaskNote {
    id: string;
    client_id: string;
    project_id?: string;
    title: string;
    description?: string;
    priority?: string;
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    due_date?: string;
    completed_date?: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    cost_price?: number;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
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
    status: 'confirmed' | 'pending' | 'rejected';
    confirmedBy?: string;
    confirmedAt?: string;
    proofFile?: string;
    proofUrl?: string;
    rejectionReason?: string;
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
