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
