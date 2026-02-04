-- Restore task_notes table that was dropped in migration 012
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
    EXECUTE FUNCTION update_updated_at_column();