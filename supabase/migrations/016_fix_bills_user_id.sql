-- Quick Fix: Add user_id to bills table
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
  AND column_name = 'user_id';