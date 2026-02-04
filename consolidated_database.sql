-- Kwachalite Financial Tracker Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Create custom types
CREATE TYPE workspace_type AS ENUM ('personal', 'business');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE bill_status AS ENUM ('paid', 'unpaid');
CREATE TYPE loan_status AS ENUM ('active', 'paid_off', 'defaulted');
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected');
CREATE TYPE budget_frequency AS ENUM ('weekly', 'monthly');
CREATE TYPE recurring_frequency AS ENUM ('daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE goal_type AS ENUM ('individual', 'group');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    type transaction_type NOT NULL,
    workspace workspace_type NOT NULL,
    budget DECIMAL(12,2),
    budget_frequency budget_frequency,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(name, type, workspace, user_id)
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    type transaction_type NOT NULL,
    category TEXT NOT NULL,
    workspace workspace_type NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bills table
CREATE TABLE public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    status bill_status NOT NULL DEFAULT 'unpaid',
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurring_frequency recurring_frequency,
    workspace workspace_type NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Savings Goals table
CREATE TABLE public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE NOT NULL,
    type goal_type NOT NULL DEFAULT 'individual',
    members TEXT[], -- Array of member names for group goals
    workspace workspace_type NOT NULL,
    items JSONB, -- Shopping list items
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Loans table
CREATE TABLE public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    principal_amount DECIMAL(12,2) NOT NULL CHECK (principal_amount > 0),
    remaining_amount DECIMAL(12,2) NOT NULL CHECK (remaining_amount >= 0),
    interest_rate DECIMAL(5,4) NOT NULL CHECK (interest_rate >= 0),
    term_months INTEGER NOT NULL CHECK (term_months > 0),
    monthly_payment DECIMAL(12,2) NOT NULL CHECK (monthly_payment > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status loan_status NOT NULL DEFAULT 'active',
    workspace workspace_type NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clients table (Business workspace only)
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(email, user_id)
);

-- Products table (Business workspace only)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    cost_price DECIMAL(12,2) NOT NULL CHECK (cost_price >= 0),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quotes table (Business workspace only)
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    items JSONB NOT NULL, -- Quote line items
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    status quote_status NOT NULL DEFAULT 'draft',
    valid_until DATE NOT NULL,
    notes TEXT,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(quote_number, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_workspace ON public.transactions(user_id, workspace);
CREATE INDEX idx_transactions_category ON public.transactions(user_id, category);
CREATE INDEX idx_bills_user_due_date ON public.bills(user_id, due_date);
CREATE INDEX idx_bills_status ON public.bills(user_id, status);
CREATE INDEX idx_categories_user_workspace ON public.categories(user_id, workspace);
CREATE INDEX idx_goals_user_workspace ON public.savings_goals(user_id, workspace);
CREATE INDEX idx_loans_user_status ON public.loans(user_id, status);
CREATE INDEX idx_clients_user_email ON public.clients(user_id, email);
CREATE INDEX idx_quotes_user_status ON public.quotes(user_id, status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create functions for user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();-- Add user_metadata table for custom settings
CREATE TABLE IF NOT EXISTS public.user_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, key)
);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_metadata_updated_at
BEFORE UPDATE ON public.user_metadata
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE public.user_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own metadata"
ON public.user_metadata FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metadata"
ON public.user_metadata FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metadata"
ON public.user_metadata FOR UPDATE
USING (auth.uid() = user_id);-- Create sales_receipts table
CREATE TABLE IF NOT EXISTS sales_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT NOT NULL,
    invoice_id UUID REFERENCES quotes(id), -- Can link to quotes table (used as invoices when status='accepted')
    quote_id UUID REFERENCES quotes(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'check', 'card', 'bank_transfer', 'mobile_money', 'other')),
    reference_number TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, receipt_number)
);

-- Create delivery_notes table
CREATE TABLE IF NOT EXISTS delivery_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_note_number TEXT NOT NULL,
    invoice_id UUID REFERENCES quotes(id), -- Can link to quotes table (used as invoices when status='accepted')
    quote_id UUID REFERENCES quotes(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE NOT NULL,
    delivery_address TEXT NOT NULL,
    items JSONB NOT NULL, -- Store quote items as JSON
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('pickup', 'delivery', 'courier', 'shipping')),
    tracking_number TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
    received_by TEXT,
    received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, delivery_note_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_receipts_user_id ON sales_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipts_client_id ON sales_receipts(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipts_date ON sales_receipts(date);
CREATE INDEX IF NOT EXISTS idx_sales_receipts_invoice_id ON sales_receipts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipts_quote_id ON sales_receipts(quote_id);

CREATE INDEX IF NOT EXISTS idx_delivery_notes_user_id ON delivery_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_client_id ON delivery_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_date ON delivery_notes(date);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_delivery_date ON delivery_notes(delivery_date);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_invoice_id ON delivery_notes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_quote_id ON delivery_notes(quote_id);

-- Add RLS policies for sales_receipts
ALTER TABLE sales_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sales receipts" ON sales_receipts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales receipts" ON sales_receipts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales receipts" ON sales_receipts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales receipts" ON sales_receipts
    FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for delivery_notes
ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own delivery notes" ON delivery_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own delivery notes" ON delivery_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own delivery notes" ON delivery_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own delivery notes" ON delivery_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sales_receipts_updated_at 
    BEFORE UPDATE ON sales_receipts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_notes_updated_at 
    BEFORE UPDATE ON delivery_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();-- Row Level Security (RLS) Policies for Kwachalite
-- Execute this SQL in your Supabase SQL Editor AFTER running the initial schema

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories table policies
CREATE POLICY "Users can view own categories" ON public.categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id);

-- Transactions table policies
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Bills table policies
CREATE POLICY "Users can view own bills" ON public.bills
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bills" ON public.bills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bills" ON public.bills
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bills" ON public.bills
    FOR DELETE USING (auth.uid() = user_id);

-- Savings Goals table policies
CREATE POLICY "Users can view own savings goals" ON public.savings_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals" ON public.savings_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals" ON public.savings_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals" ON public.savings_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Loans table policies
CREATE POLICY "Users can view own loans" ON public.loans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loans" ON public.loans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans" ON public.loans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own loans" ON public.loans
    FOR DELETE USING (auth.uid() = user_id);

-- Clients table policies
CREATE POLICY "Users can view own clients" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON public.clients
    FOR DELETE USING (auth.uid() = user_id);

-- Products table policies
CREATE POLICY "Users can view own products" ON public.products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON public.products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON public.products
    FOR DELETE USING (auth.uid() = user_id);

-- Quotes table policies
CREATE POLICY "Users can view own quotes" ON public.quotes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes" ON public.quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes" ON public.quotes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes" ON public.quotes
    FOR DELETE USING (auth.uid() = user_id);

-- Additional policies for client-quote relationships
CREATE POLICY "Users can view quotes for their clients" ON public.quotes
    FOR SELECT USING (
        auth.uid() = user_id AND 
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );-- Add business_profiles table
CREATE TABLE public.business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    website TEXT,
    tax_id TEXT,
    registration_number TEXT,
    terms_and_conditions TEXT,
    payment_details TEXT,
    bank_name TEXT,
    account_name TEXT,
    account_number TEXT,
    routing_number TEXT,
    swift_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_business_profiles_user_id ON public.business_profiles(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own business profile
CREATE POLICY "Users can read own business profile" ON public.business_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own business profile
CREATE POLICY "Users can insert own business profile" ON public.business_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own business profile
CREATE POLICY "Users can update own business profile" ON public.business_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own business profile
CREATE POLICY "Users can delete own business profile" ON public.business_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_business_profiles_updated_at 
    BEFORE UPDATE ON public.business_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();-- Create a function to check if user exists
CREATE OR REPLACE FUNCTION public.user_exists(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id
        LIMIT 1
    );
END;
$$;-- CRM System Enhancement Migration
-- Adds project tracking, payments, communication logs, and enhanced client management

-- Create custom types for CRM
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE communication_type AS ENUM ('email', 'phone', 'meeting', 'note', 'other');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- Enhanced Clients table with additional CRM fields
ALTER TABLE public.clients 
ADD COLUMN company TEXT,
ADD COLUMN website TEXT,
ADD COLUMN notes TEXT,
ADD COLUMN status TEXT DEFAULT 'active',
ADD COLUMN total_revenue DECIMAL(12,2) DEFAULT 0,
ADD COLUMN created_source TEXT DEFAULT 'manual';

-- Projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    status project_status NOT NULL DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    actual_cost DECIMAL(12,2) DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Project Milestones table
CREATE TABLE public.project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status milestone_status NOT NULL DEFAULT 'pending',
    completed_date DATE,
    deliverables TEXT[], -- Array of deliverable descriptions
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices table (created before client_payments to avoid reference error)
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status invoice_status NOT NULL DEFAULT 'draft',
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    paid_amount DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    items JSONB NOT NULL, -- Invoice line items
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(invoice_number, user_id)
);

-- Client Payments table
CREATE TABLE public.client_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method TEXT, -- 'cash', 'check', 'bank_transfer', 'mobile_money', etc.
    reference_number TEXT,
    description TEXT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Client Expenses table (project-specific expenses)
CREATE TABLE public.client_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    vendor TEXT,
    receipt_url TEXT,
    is_billable BOOLEAN DEFAULT true,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Communication Logs table
CREATE TABLE public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    type communication_type NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    communication_date DATE NOT NULL DEFAULT CURRENT_DATE,
    direction TEXT, -- 'inbound', 'outbound'
    duration_minutes INTEGER, -- For calls/meetings
    next_follow_up DATE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Task Notes table (for general client-related tasks)
CREATE TABLE public.task_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'cancelled'
    due_date DATE,
    completed_date DATE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_client_status ON public.projects(client_id, status);
CREATE INDEX idx_projects_user_dates ON public.projects(user_id, start_date DESC);
CREATE INDEX idx_milestones_project_status ON public.project_milestones(project_id, status);
CREATE INDEX idx_milestones_due_date ON public.project_milestones(due_date);
CREATE INDEX idx_payments_client_status ON public.client_payments(client_id, status);
CREATE INDEX idx_payments_project ON public.client_payments(project_id);
CREATE INDEX idx_expenses_client_date ON public.client_expenses(client_id, expense_date DESC);
CREATE INDEX idx_expenses_project ON public.client_expenses(project_id);
CREATE INDEX idx_invoices_client_status ON public.invoices(client_id, status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_communication_client_date ON public.communication_logs(client_id, communication_date DESC);
CREATE INDEX idx_communication_project ON public.communication_logs(project_id);
CREATE INDEX idx_task_notes_client_status ON public.task_notes(client_id, status);
CREATE INDEX idx_task_notes_due_date ON public.task_notes(due_date);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON public.project_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_payments_updated_at BEFORE UPDATE ON public.client_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_expenses_updated_at BEFORE UPDATE ON public.client_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communication_logs_updated_at BEFORE UPDATE ON public.communication_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_notes_updated_at BEFORE UPDATE ON public.task_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    date_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    date_prefix := TO_CHAR(CURRENT_DATE, 'YYYYMM');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 9) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.invoices
    WHERE invoice_number LIKE 'INV-' || date_prefix || '-%';
    
    new_number := 'INV-' || date_prefix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update client total revenue
CREATE OR REPLACE FUNCTION update_client_total_revenue()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.clients 
    SET total_revenue = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.client_payments
        WHERE client_id = NEW.client_id AND status = 'paid'
    )
    WHERE id = NEW.client_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update client revenue when payment is made
CREATE TRIGGER update_client_revenue_on_payment
    AFTER INSERT OR UPDATE ON public.client_payments
    FOR EACH ROW
    WHEN (NEW.status = 'paid')
    EXECUTE FUNCTION update_client_total_revenue();

-- Create function to update project actual cost
CREATE OR REPLACE FUNCTION update_project_actual_cost()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.projects 
    SET actual_cost = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.client_expenses
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update project cost when expense is added
CREATE TRIGGER update_project_cost_on_expense
    AFTER INSERT OR UPDATE OR DELETE ON public.client_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_project_actual_cost();-- RLS Policies for CRM Enhancement Tables
-- Execute this SQL in your Supabase SQL Editor AFTER running 007_crm_enhancement.sql

-- Enable RLS on new CRM tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

-- Projects table policies
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Project Milestones table policies
CREATE POLICY "Users can view own project milestones" ON public.project_milestones
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project milestones" ON public.project_milestones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project milestones" ON public.project_milestones
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project milestones" ON public.project_milestones
    FOR DELETE USING (auth.uid() = user_id);

-- Client Payments table policies
CREATE POLICY "Users can view own client payments" ON public.client_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client payments" ON public.client_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client payments" ON public.client_payments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own client payments" ON public.client_payments
    FOR DELETE USING (auth.uid() = user_id);

-- Client Expenses table policies
CREATE POLICY "Users can view own client expenses" ON public.client_expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client expenses" ON public.client_expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client expenses" ON public.client_expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own client expenses" ON public.client_expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Invoices table policies
CREATE POLICY "Users can view own invoices" ON public.invoices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON public.invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON public.invoices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON public.invoices
    FOR DELETE USING (auth.uid() = user_id);

-- Communication Logs table policies
CREATE POLICY "Users can view own communication logs" ON public.communication_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own communication logs" ON public.communication_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own communication logs" ON public.communication_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own communication logs" ON public.communication_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Task Notes table policies
CREATE POLICY "Users can view own task notes" ON public.task_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task notes" ON public.task_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task notes" ON public.task_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own task notes" ON public.task_notes
    FOR DELETE USING (auth.uid() = user_id);-- Add quote_date field to quotes table for better tracking
ALTER TABLE public.quotes ADD COLUMN quote_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Add index for better performance
CREATE INDEX idx_quotes_date ON public.quotes(user_id, quote_date DESC);

-- Update existing quotes to have quote_date based on created_at
UPDATE public.quotes SET quote_date = created_at::DATE WHERE quote_date IS NULL;CREATE TABLE public.business_budgets (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    budget_amount numeric NOT NULL,
    period text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    current_spent numeric NOT NULL DEFAULT 0,
    workspace text NOT NULL DEFAULT 'business',
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT business_budgets_pkey PRIMARY KEY (id)
);

ALTER TABLE public.business_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for users based on user_id" ON public.business_budgets FOR ALL USING (auth.uid() = user_id);
-- Step 1: Create a SECURITY DEFINER function to check for group admin/owner status
CREATE OR REPLACE FUNCTION is_group_admin_or_owner(p_group_id uuid, p_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
      AND role IN ('owner', 'admin')
  );
END;
$$;

-- Step 2: Drop the old recursive SELECT policy
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN
        SELECT policyname FROM pg_policies WHERE tablename = 'group_members' AND cmd = 'SELECT'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.group_members';
    END LOOP;
END;
$$;

-- Step 3: Create new, non-recursive policies for group_members

-- Policy for SELECT:
-- Allows a user to see their own membership.
-- Allows an admin or owner to see all members of their group.
CREATE POLICY "Enable read access for group members"
ON public.group_members
FOR SELECT
USING (user_id = auth.uid() OR is_group_admin_or_owner(group_id, auth.uid()));

-- Policy for INSERT:
-- Allows a user to insert their own membership (join a group).
CREATE POLICY "Enable insert for group members"
ON public.group_members
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy for UPDATE:
-- Allows a user to update their own membership (e.g. change their role if they are admin).
-- Note: A more granular policy might be needed for role changes.
CREATE POLICY "Enable update for group members"
ON public.group_members
FOR UPDATE
USING (user_id = auth.uid());

-- Policy for DELETE:
-- Allows a user to delete their own membership (leave a group).
CREATE POLICY "Enable delete for group members"
ON public.group_members
FOR DELETE
USING (user_id = auth.uid());
-- This script drops all tables in the public schema.
-- It is a destructive operation and will result in data loss.
-- The auth.users table is not affected.

DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.bills CASCADE;
DROP TABLE IF EXISTS public.savings_goals CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.user_metadata CASCADE;
DROP TABLE IF EXISTS public.sales_receipts CASCADE;
DROP TABLE IF EXISTS public.delivery_notes CASCADE;
DROP TABLE IF EXISTS public.business_profiles CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.project_milestones CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.client_payments CASCADE;
DROP TABLE IF EXISTS public.client_expenses CASCADE;
DROP TABLE IF EXISTS public.communication_logs CASCADE;
DROP TABLE IF EXISTS public.task_notes CASCADE;
DROP TABLE IF EXISTS public.business_budgets CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
-- 1. FORCE DROP EXISTING TYPES TO PREVENT CONFLICTS
DROP TYPE IF EXISTS public.workspace_type CASCADE;
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.account_type CASCADE;
DROP TYPE IF EXISTS public.bill_status CASCADE;
DROP TYPE IF EXISTS public.goal_status CASCADE;
DROP TYPE IF EXISTS public.invoice_status CASCADE;
DROP TYPE IF EXISTS public.project_status CASCADE;
DROP TYPE IF EXISTS public.communication_type CASCADE;

-- 2. RECREATE TYPES WITH THE 'transfer' VALUE INCLUDED
CREATE TYPE public.workspace_type AS ENUM ('personal', 'business');
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE public.account_type AS ENUM ('bank', 'cash', 'credit_card', 'mobile_money', 'other');
CREATE TYPE public.bill_status AS ENUM ('paid', 'unpaid');
CREATE TYPE public.goal_status AS ENUM ('in_progress', 'completed', 'archived');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.project_status AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE public.communication_type AS ENUM ('email', 'phone', 'meeting', 'note', 'other');

-- 3. NOW CREATE THE TABLES
-- (The rest of your table creation script follows here...)

-- 3. TABLES DEFINITION
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type workspace_type NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    type transaction_type NOT NULL,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(name, type, workspace_id)
);

CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type account_type NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type transaction_type NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    to_account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT transfer_check CHECK (
        (type = 'transfer' AND to_account_id IS NOT NULL) OR 
        (type <> 'transfer' AND to_account_id IS NULL)
    )
);

-- (Adding other tables: Bills, Goals, Clients, Invoices)
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    status bill_status NOT NULL DEFAULT 'unpaid',
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    deadline DATE,
    status goal_status NOT NULL DEFAULT 'in_progress',
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status invoice_status NOT NULL DEFAULT 'draft',
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(invoice_number, workspace_id)
);

CREATE TABLE public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    type communication_type NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    communication_date DATE NOT NULL DEFAULT CURRENT_DATE,
    direction TEXT, -- 'inbound', 'outbound'
    duration_minutes INTEGER, -- For calls/meetings
    next_follow_up DATE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_workspace ON public.transactions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_accounts_workspace ON public.accounts(workspace_id);
CREATE INDEX idx_communication_client_date ON public.communication_logs(client_id, communication_date DESC);
CREATE INDEX idx_communication_project ON public.communication_logs(project_id);


-- 5. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to main tables
CREATE TRIGGER tr_update_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_update_workspaces BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_update_transactions BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communication_logs_updated_at BEFORE UPDATE ON public.communication_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. USER REGISTRATION TRIGGER (Hardened)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    personal_workspace_id UUID;
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'New User'));
    
    INSERT INTO public.workspaces (name, type, owner_id)
    VALUES ('Personal Workspace', 'personal', NEW.id)
    RETURNING id INTO personal_workspace_id;

    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (personal_workspace_id, NEW.id, 'admin');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ROW LEVEL SECURITY (RLS) - The "Anti-Deletion" Fix
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace visibility" ON public.workspaces FOR ALL 
USING (owner_id = auth.uid() OR id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Member visibility" ON public.workspace_members FOR ALL 
USING (user_id = auth.uid() OR workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

-- Global Workspace Data Policy (Safe Version)
DO $$
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'workspace_id' -- Only pick tables that HAVE this column
        AND table_name NOT IN ('users', 'workspaces', 'workspace_members')
    LOOP
        -- Enable RLS
        EXECUTE 'ALTER TABLE public.' || t_name || ' ENABLE ROW LEVEL SECURITY;';
        
        -- Drop if exists to prevent "already exists" errors during re-runs
        EXECUTE 'DROP POLICY IF EXISTS "workspace_access_policy" ON public.' || t_name;
        
        -- Create the policy
        EXECUTE 'CREATE POLICY "workspace_access_policy" ON public.' || t_name || ' FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.workspace_members 
                WHERE workspace_id = public.' || t_name || '.workspace_id 
                AND user_id = auth.uid()
            )
        );';
    END LOOP;
END;
$$;

ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own communication logs" ON public.communication_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own communication logs" ON public.communication_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own communication logs" ON public.communication_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own communication logs" ON public.communication_logs
    FOR DELETE USING (auth.uid() = user_id);
-- Fixed Group Savings Tables Migration
-- Creates tables for group savings functionality with correct syntax

-- Types for group savings
DO $$ BEGIN
    CREATE TYPE group_status AS ENUM ('active', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contribution_status AS ENUM ('pending', 'confirmed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Savings Groups table
CREATE TABLE IF NOT EXISTS public.savings_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15,2) DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    status group_status DEFAULT 'active',
    currency TEXT DEFAULT 'USD',
    contribution_rules JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Group Members table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT now(),
    total_contributed DECIMAL(15,2) DEFAULT 0 CHECK (total_contributed >= 0),
    last_contribution_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- Group Invitations table
CREATE TABLE IF NOT EXISTS public.group_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    status invitation_status DEFAULT 'pending',
    message TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Group Contributions table
CREATE TABLE IF NOT EXISTS public.group_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.group_members(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    contributed_at TIMESTAMPTZ DEFAULT now(),
    method TEXT,
    status contribution_status DEFAULT 'pending',
    confirmed_by UUID REFERENCES auth.users(id),
    confirmed_at TIMESTAMPTZ,
    proof_file TEXT,
    proof_url TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Group Activities table
CREATE TABLE IF NOT EXISTS public.group_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_savings_groups_created_by ON public.savings_groups(created_by, status);
CREATE INDEX IF NOT EXISTS idx_savings_groups_status ON public.savings_groups(status);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id, status);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_email ON public.group_invitations(invited_email, status);
CREATE INDEX IF NOT EXISTS idx_group_invitations_token ON public.group_invitations(token);
CREATE INDEX IF NOT EXISTS idx_group_contributions_group ON public.group_contributions(group_id, status);
CREATE INDEX IF NOT EXISTS idx_group_contributions_member ON public.group_contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_group_activities_group ON public.group_activities(group_id, created_at DESC);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_savings_groups_updated_at ON public.savings_groups;
CREATE TRIGGER update_savings_groups_updated_at 
    BEFORE UPDATE ON public.savings_groups 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_members_updated_at ON public.group_members;
CREATE TRIGGER update_group_members_updated_at 
    BEFORE UPDATE ON public.group_members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_invitations_updated_at ON public.group_invitations;
CREATE TRIGGER update_group_invitations_updated_at 
    BEFORE UPDATE ON public.group_invitations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_contributions_updated_at ON public.group_contributions;
CREATE TRIGGER update_group_contributions_updated_at 
    BEFORE UPDATE ON public.group_contributions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS public.savings_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_activities ENABLE ROW LEVEL SECURITY;

-- Savings Groups Policies
DROP POLICY IF EXISTS "Users can read public savings groups" ON public.savings_groups;
CREATE POLICY "Users can read public savings groups" ON public.savings_groups
    FOR SELECT USING (is_public = true OR auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can insert savings groups" ON public.savings_groups;
CREATE POLICY "Users can insert savings groups" ON public.savings_groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own savings groups" ON public.savings_groups;
CREATE POLICY "Users can update own savings groups" ON public.savings_groups
    FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete own savings groups" ON public.savings_groups;
CREATE POLICY "Users can delete own savings groups" ON public.savings_groups
    FOR DELETE USING (auth.uid() = created_by);

-- Group Members Policies
DROP POLICY IF EXISTS "Users can read group members of groups they belong to" ON public.group_members;
CREATE POLICY "Users can read group members of groups they belong to" ON public.group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = public.group_members.group_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert group members" ON public.group_members;
CREATE POLICY "Users can insert group members" ON public.group_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Group admins can update group members" ON public.group_members;
CREATE POLICY "Group admins can update group members" ON public.group_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Group admins can delete group members" ON public.group_members;
CREATE POLICY "Group admins can delete group members" ON public.group_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

-- Group Invitations Policies
DROP POLICY IF EXISTS "Users can read invitations they sent or received" ON public.group_invitations;
CREATE POLICY "Users can read invitations they sent or received" ON public.group_invitations
    FOR SELECT USING (
        auth.uid() = invited_by OR invited_email = auth.email()
    );

DROP POLICY IF EXISTS "Users can insert invitations" ON public.group_invitations;
CREATE POLICY "Users can insert invitations" ON public.group_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update invitations they sent" ON public.group_invitations;
CREATE POLICY "Users can update invitations they sent" ON public.group_invitations
    FOR UPDATE USING (auth.uid() = invited_by);

DROP POLICY IF EXISTS "Users can delete invitations they sent" ON public.group_invitations;
CREATE POLICY "Users can delete invitations they sent" ON public.group_invitations
    FOR DELETE USING (auth.uid() = invited_by);

-- Group Contributions Policies
DROP POLICY IF EXISTS "Users can read contributions of groups they belong to" ON public.group_contributions;
CREATE POLICY "Users can read contributions of groups they belong to" ON public.group_contributions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = public.group_contributions.group_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Group members can insert contributions" ON public.group_contributions;
CREATE POLICY "Group members can insert contributions" ON public.group_contributions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = public.group_contributions.group_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Contributors can update own contributions" ON public.group_contributions;
CREATE POLICY "Contributors can update own contributions" ON public.group_contributions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.id = member_id 
            AND gm.user_id = auth.uid()
        )
    );

-- Group Activities Policies
DROP POLICY IF EXISTS "Users can read activities of groups they belong to" ON public.group_activities;
CREATE POLICY "Users can read activities of groups they belong to" ON public.group_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = public.group_activities.group_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Group members can insert activities" ON public.group_activities;
CREATE POLICY "Group members can insert activities" ON public.group_activities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = public.group_activities.group_id 
            AND user_id = auth.uid()
        )
    );

-- Function to update group current amount when contribution is confirmed
CREATE OR REPLACE FUNCTION update_group_current_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE public.savings_groups 
        SET current_amount = current_amount + NEW.amount
        WHERE id = NEW.group_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update group amount
DROP TRIGGER IF EXISTS update_group_amount_on_contribution ON public.group_contributions;
CREATE TRIGGER update_group_amount_on_contribution
    AFTER UPDATE ON public.group_contributions
    FOR EACH ROW
    WHEN (NEW.status = 'confirmed' AND OLD.status != 'confirmed')
    EXECUTE FUNCTION update_group_current_amount();-- Fix Missing user_id Columns Migration
-- Adds user_id columns to tables that are missing them for sync compatibility

-- Update user_id columns to reference auth.users instead of public.users
-- This fixes sync compatibility issues

-- Categories table - already has user_id but needs to reference auth.users
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE public.categories ADD CONSTRAINT categories_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Transactions table - already has user_id but needs to reference auth.users
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Bills table - already has user_id but needs to reference auth.users
ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_user_id_fkey;
ALTER TABLE public.bills ADD CONSTRAINT bills_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Savings Goals table - already has user_id but needs to reference auth.users
ALTER TABLE public.savings_goals DROP CONSTRAINT IF EXISTS savings_goals_user_id_fkey;
ALTER TABLE public.savings_goals ADD CONSTRAINT savings_goals_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Loans table - already has user_id but needs to reference auth.users
ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS loans_user_id_fkey;
ALTER TABLE public.loans ADD CONSTRAINT loans_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Clients table - already has user_id but needs to reference auth.users
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_user_id_fkey;
ALTER TABLE public.clients ADD CONSTRAINT clients_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Products table - already has user_id but needs to reference auth.users
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_user_id_fkey;
ALTER TABLE public.products ADD CONSTRAINT products_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Quotes table - already has user_id but needs to reference auth.users
ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_user_id_fkey;
ALTER TABLE public.quotes ADD CONSTRAINT quotes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to use auth.uid() properly

-- Categories policies
DROP POLICY IF EXISTS "Users can manage own categories" ON public.categories;
CREATE POLICY "Users can manage own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id);

-- Transactions policies
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
CREATE POLICY "Users can manage own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- Bills policies
DROP POLICY IF EXISTS "Users can manage own bills" ON public.bills;
CREATE POLICY "Users can manage own bills" ON public.bills
    FOR ALL USING (auth.uid() = user_id);

-- Savings goals policies  
DROP POLICY IF EXISTS "Users can manage own goals" ON public.savings_goals;
CREATE POLICY "Users can manage own goals" ON public.savings_goals
    FOR ALL USING (auth.uid() = user_id);

-- Loans policies
DROP POLICY IF EXISTS "Users can manage own loans" ON public.loans;
CREATE POLICY "Users can manage own loans" ON public.loans
    FOR ALL USING (auth.uid() = user_id);

-- Clients policies
DROP POLICY IF EXISTS "Users can manage own clients" ON public.clients;
CREATE POLICY "Users can manage own clients" ON public.clients
    FOR ALL USING (auth.uid() = user_id);

-- Products policies
DROP POLICY IF EXISTS "Users can manage own products" ON public.products;
CREATE POLICY "Users can manage own products" ON public.products
    FOR ALL USING (auth.uid() = user_id);

-- Quotes policies
DROP POLICY IF EXISTS "Users can manage own quotes" ON public.quotes;
CREATE POLICY "Users can manage own quotes" ON public.quotes
    FOR ALL USING (auth.uid() = user_id);

-- Users table policies for profile management
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);-- Quick Fix: Add user_id to bills table
-- This fixes the immediate error: "column bills.user_id does not exist"

-- Add user_id column if it doesn't exist
ALTER TABLE public.bills 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);

-- Update RLS policies to use user_id instead of workspace_id
DROP POLICY IF EXISTS "Users can read own bills" ON public.bills;
CREATE POLICY "Users can read own bills" ON public.bills
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bills" ON public.bills;
CREATE POLICY "Users can insert own bills" ON public.bills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bills" ON public.bills;
CREATE POLICY "Users can update own bills" ON public.bills
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bills" ON public.bills;
CREATE POLICY "Users can delete own bills" ON public.bills
    FOR DELETE USING (auth.uid() = user_id);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bills' 
  AND column_name = 'user_id';-- Comprehensive Fix: Add user_id to ALL tables missing it
-- Run this in Supabase SQL Editor to fix all sync errors

-- Fix bills table (may already exist but let's ensure)
ALTER TABLE public.bills 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix savings_goals table (also needs user_id)
ALTER TABLE public.savings_goals 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix loans table
ALTER TABLE public.loans 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for all user_id columns
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON public.loans(user_id);

-- Update RLS policies to prioritize user_id

-- Bills policies
DROP POLICY IF EXISTS "Users can read own bills" ON public.bills;
CREATE POLICY "Users can read own bills" ON public.bills
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bills" ON public.bills;
CREATE POLICY "Users can insert own bills" ON public.bills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bills" ON public.bills;
CREATE POLICY "Users can update own bills" ON public.bills
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bills" ON public.bills;
CREATE POLICY "Users can delete own bills" ON public.bills
    FOR DELETE USING (auth.uid() = user_id);

-- Savings goals policies
DROP POLICY IF EXISTS "Users can read own savings goals" ON public.savings_goals;
CREATE POLICY "Users can read own savings goals" ON public.savings_goals
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own savings goals" ON public.savings_goals;
CREATE POLICY "Users can insert own savings goals" ON public.savings_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own savings goals" ON public.savings_goals;
CREATE POLICY "Users can update own savings goals" ON public.savings_goals
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own savings goals" ON public.savings_goals;
CREATE POLICY "Users can delete own savings goals" ON public.savings_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Categories policies
DROP POLICY IF EXISTS "Users can manage own categories" ON public.categories;
CREATE POLICY "Users can manage own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id);

-- Clients policies
DROP POLICY IF EXISTS "Users can manage own clients" ON public.clients;
CREATE POLICY "Users can manage own clients" ON public.clients
    FOR ALL USING (auth.uid() = user_id);

-- Products policies
DROP POLICY IF EXISTS "Users can manage own products" ON public.products;
CREATE POLICY "Users can manage own products" ON public.products
    FOR ALL USING (auth.uid() = user_id);

-- Quotes policies
DROP POLICY IF EXISTS "Users can manage own quotes" ON public.quotes;
CREATE POLICY "Users can manage own quotes" ON public.quotes
    FOR ALL USING (auth.uid() = user_id);

-- Loans policies
DROP POLICY IF EXISTS "Users can manage own loans" ON public.loans;
CREATE POLICY "Users can manage own loans" ON public.loans
    FOR ALL USING (auth.uid() = user_id);

-- Verify all user_id columns were added
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('bills', 'savings_goals', 'categories', 'clients', 'products', 'quotes', 'loans')
    AND column_name = 'user_id'
    AND table_schema = 'public'
ORDER BY table_name;-- IMMEDIATE FIX: Add user_id to categories table
-- Error: "column categories.user_id does not exist"

-- Add the missing user_id column
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- Update RLS policies to use user_id instead of workspace_id
DROP POLICY IF EXISTS "Users can manage own categories" ON public.categories;
CREATE POLICY "Users can manage own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id);

-- Verify the column was added successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'categories' 
    AND column_name = 'user_id'
    AND table_schema = 'public';-- Restore task_notes table that was dropped in migration 012
-- This table is needed by the application for CRM functionality

-- Task Notes table (for general client-related tasks)
CREATE TABLE IF NOT EXISTS public.task_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID, -- Reference to projects table (will be added later if needed)
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    due_date DATE,
    completed_date DATE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_notes_client_status ON public.task_notes(client_id, status);
CREATE INDEX IF NOT EXISTS idx_task_notes_due_date ON public.task_notes(due_date);
CREATE INDEX IF NOT EXISTS idx_task_notes_user_id ON public.task_notes(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task_notes
DROP POLICY IF EXISTS "Users can read own task notes" ON public.task_notes;
CREATE POLICY "Users can read own task notes" ON public.task_notes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own task notes" ON public.task_notes;
CREATE POLICY "Users can insert own task notes" ON public.task_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own task notes" ON public.task_notes;
CREATE POLICY "Users can update own task notes" ON public.task_notes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own task notes" ON public.task_notes;
CREATE POLICY "Users can delete own task notes" ON public.task_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS task_notes_updated_at ON public.task_notes;
CREATE TRIGGER task_notes_updated_at
    BEFORE UPDATE ON public.task_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();-- Fix infinite recursion in group_members RLS policies
-- The previous SELECT policy was querying the same table causing infinite recursion

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can read group members of groups they belong to" ON public.group_members;
DROP POLICY IF EXISTS "Users can insert group members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can update group members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can delete group members" ON public.group_members;

-- Fixed Group Members Policies
-- Users can read group members if they are either:
-- 1. The member themselves (their own membership)
-- 2. The creator of the savings group
CREATE POLICY "Users can read group members" ON public.group_members
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

-- Users can insert group members if they are the group creator
CREATE POLICY "Users can insert group members" ON public.group_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

-- Group creators can update group members
CREATE POLICY "Group admins can update group members" ON public.group_members
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );

-- Group creators can delete group members (or users can delete themselves)
CREATE POLICY "Group admins can delete group members" ON public.group_members
    FOR DELETE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.savings_groups 
            WHERE id = group_id 
            AND created_by = auth.uid()
        )
    );-- 021_add_revenue_expense_and_streak_tables.sql

-- Ensure helper function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* -------------------------------------------------------------------------- */
/* Business Revenue / Expense Tracking                    */
/* -------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS public.business_revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    source TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    received_at DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    vendor TEXT,
    category TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'USD',
    incurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT,
    receipt_url TEXT,
    tax_deductible BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_revenues_user_date ON public.business_revenues(user_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_expenses_user_date ON public.business_expenses(user_id, incurred_at DESC);

-- RLS
ALTER TABLE public.business_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own business_revenues" ON public.business_revenues;
CREATE POLICY "Users manage own business_revenues" ON public.business_revenues
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own business_expenses" ON public.business_expenses;
CREATE POLICY "Users manage own business_expenses" ON public.business_expenses
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Updated_at triggers
DO $$ BEGIN
    CREATE TRIGGER trg_business_revenues_updated_at BEFORE UPDATE ON public.business_revenues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_business_expenses_updated_at BEFORE UPDATE ON public.business_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* -------------------------------------------------------------------------- */
/* Streak System Tables                           */
/* -------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    total_active_days INTEGER NOT NULL DEFAULT 0 CHECK (total_active_days >= 0),
    streak_freeze_count INTEGER NOT NULL DEFAULT 0 CHECK (streak_freeze_count >= 0),
    last_activity_date DATE,
    last_activity_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activities JSONB DEFAULT '[]'::jsonb,
    transactions_count INTEGER DEFAULT 0,
    savings_count INTEGER DEFAULT 0,
    bills_paid_count INTEGER DEFAULT 0,
    goals_updated_count INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, activity_date)
);

CREATE TABLE IF NOT EXISTS public.streak_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_type TEXT NOT NULL,
    milestone_value INTEGER NOT NULL CHECK (milestone_value > 0),
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reward_type TEXT,
    reward_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.streak_freeze_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('earned', 'used')),
    amount INTEGER NOT NULL DEFAULT 1 CHECK (amount > 0),
    related_milestone UUID REFERENCES public.streak_milestones(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS & Indexes (Simplified)
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_freeze_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_daily_activities_composite ON public.daily_activities(user_id, activity_date DESC);

/* -------------------------------------------------------------------------- */
/* Logic: update_user_streak                              */
/* -------------------------------------------------------------------------- */



CREATE OR REPLACE FUNCTION public.update_user_streak(
    p_user_id UUID,
    p_activity_type TEXT,
    p_activity_date DATE DEFAULT CURRENT_DATE,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    streak_record public.user_streaks;
    days_difference INTEGER;
    new_current INTEGER;
    milestone_id UUID;
    milestone_record_json JSONB;
BEGIN
    SELECT * INTO streak_record FROM public.user_streaks WHERE user_id = p_user_id;

    IF streak_record IS NULL THEN
        INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, total_active_days, last_activity_date, last_activity_type)
        VALUES (p_user_id, 1, 1, 1, p_activity_date, p_activity_type)
        RETURNING * INTO streak_record;
        new_current := 1;
    ELSE
        days_difference := p_activity_date - streak_record.last_activity_date;

        IF days_difference <= 0 THEN
            -- Activity on same day or past day: maintain current streak
            new_current := streak_record.current_streak;
        ELSIF days_difference = 1 THEN
            -- Next day: increment
            new_current := streak_record.current_streak + 1;
        ELSE
            -- Break in streak: reset
            new_current := 1;
        END IF;

        UPDATE public.user_streaks
        SET current_streak = new_current,
            longest_streak = GREATEST(streak_record.longest_streak, new_current),
            total_active_days = total_active_days + (CASE WHEN days_difference = 0 THEN 0 ELSE 1 END),
            last_activity_date = p_activity_date,
            last_activity_type = p_activity_type,
            updated_at = now()
        WHERE user_id = p_user_id
        RETURNING * INTO streak_record;
    END IF;

    -- Upsert daily activity
    INSERT INTO public.daily_activities (user_id, activity_date, activities)
    VALUES (p_user_id, p_activity_date, jsonb_build_array(jsonb_build_object('type', p_activity_type, 'recorded_at', now())))
    ON CONFLICT (user_id, activity_date) DO UPDATE SET
        activities = daily_activities.activities || jsonb_build_array(jsonb_build_object('type', p_activity_type, 'recorded_at', now())),
        updated_at = now();

    -- Milestone Logic
    milestone_record_json := NULL;
    IF streak_record.current_streak IN (7, 30, 90, 365) THEN
        -- Check if already achieved to prevent double-insert
        IF NOT EXISTS (SELECT 1 FROM public.streak_milestones WHERE user_id = p_user_id AND milestone_value = streak_record.current_streak) THEN
            
            INSERT INTO public.streak_milestones (user_id, milestone_type, milestone_value, reward_type)
            VALUES (p_user_id, 'streak_target', streak_record.current_streak, 'badge')
            RETURNING id INTO milestone_id;

            -- Award Freezes
            IF streak_record.current_streak IN (7, 30, 90) THEN
                UPDATE public.user_streaks SET streak_freeze_count = streak_freeze_count + 1 WHERE user_id = p_user_id;
                INSERT INTO public.streak_freeze_history (user_id, action, amount, related_milestone, notes)
                VALUES (p_user_id, 'earned', 1, milestone_id, 'Milestone reward');
            END IF;

            SELECT row_to_json(m)::jsonb INTO milestone_record_json FROM public.streak_milestones m WHERE id = milestone_id;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'current_streak', streak_record.current_streak,
        'freeze_count', streak_record.streak_freeze_count,
        'milestone_achieved', milestone_record_json
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;