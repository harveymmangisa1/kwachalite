-- Additional tables for complete Supabase sync
-- Run this migration after the main database-setup.sql

-- ============================================
-- CREATE UPDATED_AT TRIGGER FUNCTION (if not exists)
-- ============================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SALES RECEIPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales_receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL,
    invoice_id UUID,
    quote_id UUID,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'check', 'card', 'bank_transfer', 'mobile_money', 'other')),
    reference_number TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DELIVERY NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS delivery_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    delivery_note_number TEXT NOT NULL,
    invoice_id UUID,
    quote_id UUID,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    delivery_address TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('pickup', 'delivery', 'courier', 'shipping')),
    tracking_number TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
    received_by TEXT,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUSINESS REVENUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS business_revenues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('quote', 'invoice', 'receipt', 'direct')),
    source_id UUID,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received')),
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUSINESS EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS business_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor TEXT,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    receipt_url TEXT,
    tax_deductible BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GROUP SAVINGS TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS savings_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    currency TEXT DEFAULT 'USD',
    contribution_rules JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES savings_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    total_contributed DECIMAL(10,2) DEFAULT 0,
    last_contribution_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES savings_groups(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES savings_groups(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    contributed_at TIMESTAMPTZ DEFAULT NOW(),
    method TEXT NOT NULL CHECK (method IN ('cash', 'bank_transfer', 'mobile_money', 'other')),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'rejected')),
    confirmed_by UUID REFERENCES auth.users(id),
    confirmed_at TIMESTAMPTZ,
    proof_file TEXT,
    proof_url TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES savings_groups(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('member_joined', 'member_left', 'contribution_made', 'goal_updated', 'group_created')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CRM TABLES (Projects, Invoices, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    actual_cost DECIMAL(10,2) DEFAULT 0,
    priority TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_method TEXT,
    reference_number TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    vendor TEXT,
    receipt_url TEXT,
    is_billable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'phone', 'meeting', 'note', 'other')),
    subject TEXT,
    content TEXT NOT NULL,
    communication_date TIMESTAMPTZ NOT NULL,
    direction TEXT,
    duration_minutes INTEGER,
    next_follow_up DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    due_date DATE,
    completed_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE sales_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Sales Receipts
DROP POLICY IF EXISTS "Users can manage their own sales_receipts" ON sales_receipts;
CREATE POLICY "Users can manage their own sales_receipts" 
ON sales_receipts FOR ALL USING (auth.uid() = user_id);

-- Delivery Notes
DROP POLICY IF EXISTS "Users can manage their own delivery_notes" ON delivery_notes;
CREATE POLICY "Users can manage their own delivery_notes" 
ON delivery_notes FOR ALL USING (auth.uid() = user_id);

-- Business Revenues
DROP POLICY IF EXISTS "Users can manage their own business_revenues" ON business_revenues;
CREATE POLICY "Users can manage their own business_revenues" 
ON business_revenues FOR ALL USING (auth.uid() = user_id);

-- Business Expenses
DROP POLICY IF EXISTS "Users can manage their own business_expenses" ON business_expenses;
CREATE POLICY "Users can manage their own business_expenses" 
ON business_expenses FOR ALL USING (auth.uid() = user_id);

-- Savings Groups (created_by or member)
DROP POLICY IF EXISTS "Users can manage savings_groups they created or are members of" ON savings_groups;
CREATE POLICY "Users can manage savings_groups they created or are members of" 
ON savings_groups FOR ALL USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM group_members WHERE group_id = savings_groups.id AND user_id = auth.uid())
);

-- Group Members
DROP POLICY IF EXISTS "Users can manage group_members for their groups" ON group_members;
CREATE POLICY "Users can manage group_members for their groups" 
ON group_members FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM savings_groups WHERE id = group_members.group_id AND created_by = auth.uid())
);

-- Group Invitations
DROP POLICY IF EXISTS "Users can manage group_invitations they created" ON group_invitations;
CREATE POLICY "Users can manage group_invitations they created" 
ON group_invitations FOR ALL USING (auth.uid() = invited_by);

-- Group Contributions
DROP POLICY IF EXISTS "Users can view contributions for their groups" ON group_contributions;
CREATE POLICY "Users can view contributions for their groups" 
ON group_contributions FOR ALL USING (
    EXISTS (SELECT 1 FROM group_members WHERE id = group_contributions.member_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM savings_groups WHERE id = group_contributions.group_id AND created_by = auth.uid())
);

-- Group Activities
DROP POLICY IF EXISTS "Users can view activities for their groups" ON group_activities;
CREATE POLICY "Users can view activities for their groups" 
ON group_activities FOR ALL USING (
    EXISTS (SELECT 1 FROM savings_groups WHERE id = group_activities.group_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM group_members WHERE group_id = group_activities.group_id AND user_id = auth.uid())))
);

-- Projects
DROP POLICY IF EXISTS "Users can manage their own projects" ON projects;
CREATE POLICY "Users can manage their own projects" 
ON projects FOR ALL USING (auth.uid() = user_id);

-- Invoices
DROP POLICY IF EXISTS "Users can manage their own invoices" ON invoices;
CREATE POLICY "Users can manage their own invoices" 
ON invoices FOR ALL USING (auth.uid() = user_id);

-- Client Payments
DROP POLICY IF EXISTS "Users can manage their own client_payments" ON client_payments;
CREATE POLICY "Users can manage their own client_payments" 
ON client_payments FOR ALL USING (auth.uid() = user_id);

-- Client Expenses
DROP POLICY IF EXISTS "Users can manage their own client_expenses" ON client_expenses;
CREATE POLICY "Users can manage their own client_expenses" 
ON client_expenses FOR ALL USING (auth.uid() = user_id);

-- Communication Logs
DROP POLICY IF EXISTS "Users can manage their own communication_logs" ON communication_logs;
CREATE POLICY "Users can manage their own communication_logs" 
ON communication_logs FOR ALL USING (auth.uid() = user_id);

-- Task Notes
DROP POLICY IF EXISTS "Users can manage their own task_notes" ON task_notes;
CREATE POLICY "Users can manage their own task_notes" 
ON task_notes FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS sales_receipts_user_id_idx ON sales_receipts(user_id);
CREATE INDEX IF NOT EXISTS sales_receipts_client_id_idx ON sales_receipts(client_id);
CREATE INDEX IF NOT EXISTS delivery_notes_user_id_idx ON delivery_notes(user_id);
CREATE INDEX IF NOT EXISTS delivery_notes_client_id_idx ON delivery_notes(client_id);
CREATE INDEX IF NOT EXISTS business_revenues_user_id_idx ON business_revenues(user_id);
CREATE INDEX IF NOT EXISTS business_expenses_user_id_idx ON business_expenses(user_id);
CREATE INDEX IF NOT EXISTS savings_groups_created_by_idx ON savings_groups(created_by);
CREATE INDEX IF NOT EXISTS group_members_group_id_idx ON group_members(group_id);
CREATE INDEX IF NOT EXISTS group_members_user_id_idx ON group_members(user_id);
CREATE INDEX IF NOT EXISTS group_invitations_group_id_idx ON group_invitations(group_id);
CREATE INDEX IF NOT EXISTS group_contributions_group_id_idx ON group_contributions(group_id);
CREATE INDEX IF NOT EXISTS group_activities_group_id_idx ON group_activities(group_id);
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_client_id_idx ON projects(client_id);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_client_id_idx ON invoices(client_id);
CREATE INDEX IF NOT EXISTS client_payments_user_id_idx ON client_payments(user_id);
CREATE INDEX IF NOT EXISTS client_payments_client_id_idx ON client_payments(client_id);
CREATE INDEX IF NOT EXISTS client_expenses_user_id_idx ON client_expenses(user_id);
CREATE INDEX IF NOT EXISTS client_expenses_client_id_idx ON client_expenses(client_id);
CREATE INDEX IF NOT EXISTS communication_logs_user_id_idx ON communication_logs(user_id);
CREATE INDEX IF NOT EXISTS communication_logs_client_id_idx ON communication_logs(client_id);
CREATE INDEX IF NOT EXISTS task_notes_user_id_idx ON task_notes(user_id);
CREATE INDEX IF NOT EXISTS task_notes_client_id_idx ON task_notes(client_id);

-- ============================================
-- CREATE UPDATED_AT TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS sales_receipts_updated_at ON sales_receipts;
CREATE TRIGGER sales_receipts_updated_at BEFORE UPDATE ON sales_receipts
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS delivery_notes_updated_at ON delivery_notes;
CREATE TRIGGER delivery_notes_updated_at BEFORE UPDATE ON delivery_notes
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS business_revenues_updated_at ON business_revenues;
CREATE TRIGGER business_revenues_updated_at BEFORE UPDATE ON business_revenues
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS business_expenses_updated_at ON business_expenses;
CREATE TRIGGER business_expenses_updated_at BEFORE UPDATE ON business_expenses
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS savings_groups_updated_at ON savings_groups;
CREATE TRIGGER savings_groups_updated_at BEFORE UPDATE ON savings_groups
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS group_members_updated_at ON group_members;
CREATE TRIGGER group_members_updated_at BEFORE UPDATE ON group_members
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS group_invitations_updated_at ON group_invitations;
CREATE TRIGGER group_invitations_updated_at BEFORE UPDATE ON group_invitations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS group_contributions_updated_at ON group_contributions;
CREATE TRIGGER group_contributions_updated_at BEFORE UPDATE ON group_contributions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS invoices_updated_at ON invoices;
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS client_payments_updated_at ON client_payments;
CREATE TRIGGER client_payments_updated_at BEFORE UPDATE ON client_payments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS client_expenses_updated_at ON client_expenses;
CREATE TRIGGER client_expenses_updated_at BEFORE UPDATE ON client_expenses
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS communication_logs_updated_at ON communication_logs;
CREATE TRIGGER communication_logs_updated_at BEFORE UPDATE ON communication_logs
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS task_notes_updated_at ON task_notes;
CREATE TRIGGER task_notes_updated_at BEFORE UPDATE ON task_notes
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
