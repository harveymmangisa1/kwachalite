-- Add user_metadata table for custom settings
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
USING (auth.uid() = user_id);