# 🚨 IMMEDIATE FIX: "column bills.user_id does not exist"

## Quick Solution (2 minutes)

### Apply This Single Migration:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in sidebar
4. Copy the content below:
5. Paste into SQL editor
6. Click **Run**

```sql
-- Quick Fix: Add user_id to bills table
-- This fixes: "column bills.user_id does not exist"

ALTER TABLE public.bills 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);

-- Update RLS policies to use user_id
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
```

7. After running, you should see: **Success**

## Verify Fix

1. Refresh your app
2. Check sync status - should show:
   - ✅ Connection: Online (Supabase)
   - ✅ Status: Supabase Synced
   - ✅ No more error messages

3. Try adding a bill to confirm it works

## Why This Error Occurred

The database schema was recreated with `workspace_id` columns, but the sync code expects `user_id` columns. This migration adds the missing `user_id` column and updates the security policies accordingly.

## Still Having Issues?

If the error persists after applying the migration:

1. Check the migration executed successfully in Supabase SQL Editor
2. Refresh your browser cache (Ctrl+F5)
3. Ensure your `.env` file has correct Supabase credentials
4. Check that you're logged into the correct Supabase project

## What About Group Tables?

The group savings tables also need the migration from `supabase/migrations/014_add_group_savings_tables.sql` - but apply the bills fix first to get sync working, then apply the group migration.