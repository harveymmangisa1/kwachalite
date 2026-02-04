# Fix Group Savings Tables Missing Error

The error `Could not find table 'public.group_members'` indicates that the group savings tables are missing from your Supabase database.

## Quick Fix (Recommended)

Go to your Supabase dashboard and run the SQL migration:

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on **SQL Editor** in the sidebar
4. Copy the entire content of `supabase/migrations/014_add_group_savings_tables.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the migration

## What This Migration Creates

✅ **savings_groups** - Main group information  
✅ **group_members** - Group membership management  
✅ **group_invitations** - Invitation system  
✅ **group_contributions** - Contribution tracking  
✅ **group_activities** - Activity logging  

Includes proper:
- Row Level Security (RLS) policies
- Performance indexes  
- Automatic triggers
- Foreign key constraints

## Verification

After running the migration, the group savings functionality should work properly with Supabase prioritized over local storage.

## Alternative: Using Supabase CLI

If you prefer using the CLI:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link

# Apply the migration
supabase db push --schema public
```

## Why This Happened

The group savings functionality was added to the app code but the corresponding database tables were not created during initial schema setup. This migration adds the missing infrastructure while maintaining Supabase as the primary storage layer.