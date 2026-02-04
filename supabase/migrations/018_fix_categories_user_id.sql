-- IMMEDIATE FIX: Add user_id to categories table
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
    AND table_schema = 'public';