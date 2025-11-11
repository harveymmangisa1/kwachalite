-- CRM System Enhancement Migration
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
    EXECUTE FUNCTION update_project_actual_cost();