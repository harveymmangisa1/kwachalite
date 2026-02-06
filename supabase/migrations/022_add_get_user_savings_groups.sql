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
END $$;