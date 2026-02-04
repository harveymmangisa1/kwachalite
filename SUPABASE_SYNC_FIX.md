# Fix Supabase Sync Errors - Migration Instructions

## 🚨 Current Issues

1. **Group Tables Missing**: `Could not find table 'public.group_members'`
2. **User ID Columns Missing**: `column bills.user_id does not exist`

## 📋 **Required Migrations (Apply in Order)**

### Migration 1: Group Savings Tables
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in sidebar
4. Copy entire content of: `supabase/migrations/014_add_group_savings_tables.sql`
5. Paste into SQL editor
6. Click **Run** to execute

### Migration 2: Fix User ID Columns  
1. In the same SQL Editor
2. Copy entire content of: `supabase/migrations/015_fix_user_id_columns.sql`
3. Paste into SQL editor (below the first migration)
4. Click **Run** to execute

## 🔧 What These Migrations Fix

### Migration 1: Group Savings Tables
- ✅ Creates `savings_groups` table
- ✅ Creates `group_members` table  
- ✅ Creates `group_invitations` table
- ✅ Creates `group_contributions` table
- ✅ Creates `group_activities` table
- ✅ Adds RLS policies for security
- ✅ Adds performance indexes
- ✅ Adds automated triggers

### Migration 2: User ID Columns
- ✅ Adds `user_id` to all tables missing it
- ✅ Updates RLS policies to use `user_id` instead of `workspace_id`
- ✅ Creates performance indexes
- ✅ Maintains compatibility with sync code

## 🎯 Expected Result

After applying both migrations:

```sql
-- Test that user_id columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bills' 
  AND column_name = 'user_id';

-- Test group tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'group_%';
```

**Sync Status should show:**
- ✅ Connection: Online (Supabase)
- ✅ Status: Supabase Synced  
- ✅ Last Supabase sync: [current time]

**No more errors like:**
- ❌ `Could not find table 'public.group_members'`
- ❌ `column bills.user_id does not exist`

## 🚀 After Migration

1. **Test sync status** - Should show "Supabase Synced"
2. **Test group savings** - Create/join groups should work
3. **Test CRUD operations** - All data types should sync to Supabase first
4. **Test offline behavior** - Should queue changes and sync when online

## 🔄 If Issues Persist

**Check migration execution:**
- SQL Editor should show "Success" for both migrations
- Refresh browser and check sync status

**Verify table structure:**
```sql
-- Verify bills table has user_id
\d public.bills

-- Verify group tables exist
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'group_%';
```

## 📞 Need Help?

If migrations fail or issues persist:
1. Check your Supabase project permissions
2. Ensure you're using correct project URL/keys
3. Try running one migration at a time
4. Check Supabase logs for specific error messages

The sync architecture is designed to **prioritize Supabase over local storage** - these migrations ensure the database schema supports this architecture.