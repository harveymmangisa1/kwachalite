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
    EXECUTE FUNCTION update_group_current_amount();-- Complete Missing Tables Fix for KwachaLite
-- Execute this in your Supabase SQL Editor

-- First, create any missing types
CREATE TYPE IF NOT EXISTS project_status AS ENUM ('planning', 'in_progress', 'completed', 'on_hold', 'cancelled');
CREATE TYPE IF NOT EXISTS milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE IF NOT EXISTS invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- Business Revenue table
CREATE TABLE IF NOT EXISTS public.business_revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    source_id UUID,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    date DATE DEFAULT CURRENT_DATE,
    revenue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'received',
    payment_method TEXT,
    workspace workspace_type NOT NULL DEFAULT 'business',
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Business Expenses table
CREATE TABLE IF NOT EXISTS public.business_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    date DATE DEFAULT CURRENT_DATE,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT,
    vendor TEXT,
    receipt_url TEXT,
    tax_deductible BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'paid',
    payment_method TEXT,
    workspace workspace_type NOT NULL DEFAULT 'business',
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Business Budgets table
CREATE TABLE IF NOT EXISTS public.business_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    category TEXT NOT NULL,
    budget_amount DECIMAL(12,2) NOT NULL CHECK (budget_amount > 0),
    spent_amount DECIMAL(12,2) DEFAULT 0,
    current_spent DECIMAL(12,2) DEFAULT 0,
    period TEXT DEFAULT 'monthly', -- monthly, quarterly, yearly
    start_date DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE),
    end_date DATE NOT NULL DEFAULT (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day'),
    workspace workspace_type NOT NULL DEFAULT 'business',
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sales Receipts table
CREATE TABLE IF NOT EXISTS public.sales_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    date DATE DEFAULT CURRENT_DATE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    payment_method TEXT,
    reference_number TEXT,
    category TEXT,
    items JSONB,
    notes TEXT,
    status TEXT DEFAULT 'confirmed',
    workspace workspace_type NOT NULL DEFAULT 'business',
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery Notes table
CREATE TABLE IF NOT EXISTS public.delivery_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_number TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    delivery_note_number TEXT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    date DATE DEFAULT CURRENT_DATE,
    order_reference TEXT,
    delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_address TEXT,
    items JSONB NOT NULL,
    status TEXT DEFAULT 'delivered',
    notes TEXT,
    received_by TEXT,
    received_at TIMESTAMPTZ,
    delivery_method TEXT,
    tracking_number TEXT,
    workspace workspace_type NOT NULL DEFAULT 'business',
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
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

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
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
    items JSONB NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Client Payments table
CREATE TABLE IF NOT EXISTS public.client_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT,
    reference TEXT,
    notes TEXT,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Client Expenses table
CREATE TABLE IF NOT EXISTS public.client_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT,
    reimbursed BOOLEAN DEFAULT false,
    notes TEXT,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Communication Log table
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- email, phone, meeting, note
    subject TEXT,
    content TEXT NOT NULL,
    communication_date TIMESTAMPTZ DEFAULT now(),
    next_follow_up DATE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Task Notes table
CREATE TABLE IF NOT EXISTS public.task_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    task TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed
    priority TEXT DEFAULT 'medium', -- low, medium, high
    due_date DATE,
    completed_at TIMESTAMPTZ,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.business_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (ignore if they already exist)
DO $$ 
BEGIN
    CREATE POLICY "Users can manage their own business revenues" ON public.business_revenues FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can manage their own business expenses" ON public.business_expenses FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can manage their own business budgets" ON public.business_budgets FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can manage their own sales receipts" ON public.sales_receipts FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can manage their own delivery notes" ON public.delivery_notes FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can manage their own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can manage their own invoices" ON public.invoices FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can manage their own client payments" ON public.client_payments FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can manage their own client expenses" ON public.client_expenses FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can manage their own communication logs" ON public.communication_logs FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can manage their own task notes" ON public.task_notes FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_business_revenues_updated_at ON public.business_revenues;
CREATE TRIGGER handle_business_revenues_updated_at BEFORE UPDATE ON public.business_revenues FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_business_expenses_updated_at ON public.business_expenses;
CREATE TRIGGER handle_business_expenses_updated_at BEFORE UPDATE ON public.business_expenses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_business_budgets_updated_at ON public.business_budgets;
CREATE TRIGGER handle_business_budgets_updated_at BEFORE UPDATE ON public.business_budgets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_sales_receipts_updated_at ON public.sales_receipts;
CREATE TRIGGER handle_sales_receipts_updated_at BEFORE UPDATE ON public.sales_receipts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_delivery_notes_updated_at ON public.delivery_notes;
CREATE TRIGGER handle_delivery_notes_updated_at BEFORE UPDATE ON public.delivery_notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_projects_updated_at ON public.projects;
CREATE TRIGGER handle_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_invoices_updated_at ON public.invoices;
CREATE TRIGGER handle_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_client_payments_updated_at ON public.client_payments;
CREATE TRIGGER handle_client_payments_updated_at BEFORE UPDATE ON public.client_payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_client_expenses_updated_at ON public.client_expenses;
CREATE TRIGGER handle_client_expenses_updated_at BEFORE UPDATE ON public.client_expenses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_communication_logs_updated_at ON public.communication_logs;
CREATE TRIGGER handle_communication_logs_updated_at BEFORE UPDATE ON public.communication_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_task_notes_updated_at ON public.task_notes;
CREATE TRIGGER handle_task_notes_updated_at BEFORE UPDATE ON public.task_notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- First, ensure savings_groups table has the correct structure
CREATE TABLE IF NOT EXISTS public.savings_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15,2) DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    currency TEXT DEFAULT 'USD',
    contribution_rules JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- If the table already exists, add missing columns
DO $$ 
BEGIN
    -- Add created_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'savings_groups' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.savings_groups ADD COLUMN created_by UUID;
        
        -- Set a default value for existing rows (use the first user or admin)
        UPDATE public.savings_groups 
        SET created_by = (
            SELECT id FROM auth.users ORDER BY created_at LIMIT 1
        ) 
        WHERE created_by IS NULL;
        
        -- Now add the foreign key constraint
        ALTER TABLE public.savings_groups 
        ADD CONSTRAINT savings_groups_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Make it NOT NULL after setting values
        ALTER TABLE public.savings_groups ALTER COLUMN created_by SET NOT NULL;
    END IF;
END $$;

-- Now create the function
CREATE OR REPLACE FUNCTION public.get_user_savings_groups()
RETURNS SETOF public.savings_groups
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT sg.*
  FROM public.savings_groups sg
  LEFT JOIN public.group_members gm ON gm.group_id = sg.id
  WHERE sg.created_by = auth.uid() OR gm.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_user_savings_groups() TO authenticated;

-- Enable RLS on savings_groups if not already enabled
ALTER TABLE IF EXISTS public.savings_groups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for savings_groups
DO $$ 
BEGIN
    -- Policy for users to read groups they created or are members of
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'savings_groups' 
        AND policyname = 'Users can read groups they created or belong to'
    ) THEN
        CREATE POLICY "Users can read groups they created or belong to" 
        ON public.savings_groups 
        FOR SELECT USING (
            created_by = auth.uid() OR 
            EXISTS (
                SELECT 1 FROM public.group_members 
                WHERE group_id = savings_groups.id AND user_id = auth.uid()
            )
        );
    END IF;
END $$;-- Expand finance-related tables to match app types (non-destructive)

-- sales_receipts: add richer fields expected by app
alter table public.sales_receipts
  add column if not exists invoice_id uuid references public.invoices(id) on delete set null,
  add column if not exists quote_id uuid references public.quotes(id) on delete set null,
  add column if not exists date date default current_date,
  add column if not exists reference_number text,
  add column if not exists notes text,
  add column if not exists status text default 'confirmed';

-- delivery_notes: add richer fields expected by app
alter table public.delivery_notes
  add column if not exists delivery_note_number text,
  add column if not exists invoice_id uuid references public.invoices(id) on delete set null,
  add column if not exists quote_id uuid references public.quotes(id) on delete set null,
  add column if not exists date date default current_date,
  add column if not exists delivery_address text,
  add column if not exists delivery_method text,
  add column if not exists tracking_number text,
  add column if not exists received_at timestamptz;

-- business_revenues: add richer fields expected by app
alter table public.business_revenues
  add column if not exists source text,
  add column if not exists source_id uuid,
  add column if not exists client_id uuid references public.clients(id) on delete set null,
  add column if not exists date date default current_date,
  add column if not exists status text,
  add column if not exists payment_method text;

-- business_expenses: add richer fields expected by app
alter table public.business_expenses
  add column if not exists date date default current_date,
  add column if not exists receipt_url text,
  add column if not exists tax_deductible boolean default false,
  add column if not exists status text,
  add column if not exists payment_method text;

-- business_budgets: add optional name + current_spent to match app
alter table public.business_budgets
  add column if not exists name text,
  add column if not exists current_spent numeric default 0;

-- Backfill date columns from existing *_date columns where present
update public.sales_receipts set date = coalesce(date, sale_date) where date is null;
update public.delivery_notes set date = coalesce(date, delivery_date) where date is null;
update public.business_revenues set date = coalesce(date, revenue_date) where date is null;
update public.business_expenses set date = coalesce(date, expense_date) where date is null;

