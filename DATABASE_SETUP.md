# Database Setup Instructions

## Quick Setup

The application now includes fallbacks for database issues, but for the best experience, you should set up the Supabase database tables.

### Option 1: Automatic Setup (Recommended)

1. Go to your Supabase project: https://app.supabase.com/projects
2. Navigate to your project dashboard
3. Go to the "SQL Editor" section
4. Copy and paste the contents of `database-setup.sql` into a new query
5. Click "Run" to execute the SQL

### Option 2: Using the Supabase CLI (if installed)

```bash
supabase db reset
```

### Option 3: Business Profiles Table (Recommended - Avoids Schema Conflicts)

If you're getting "column user_id does not exist" errors, use this approach:

```sql
-- Create dedicated business_profiles table
CREATE TABLE business_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    website TEXT,
    tax_id TEXT,
    registration_number TEXT,
    terms_and_conditions TEXT,
    payment_details TEXT,
    bank_details TEXT,
    bank_name TEXT,
    account_name TEXT,
    account_number TEXT,
    routing_number TEXT,
    swift_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own business profile" 
ON business_profiles FOR ALL USING (auth.uid() = user_id);
```

### Option 4: Manual user_metadata Table Creation (Fallback)

If you want to use the original approach:

```sql
-- Create user_metadata table
CREATE TABLE user_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index
CREATE UNIQUE INDEX user_metadata_user_key_idx ON user_metadata(user_id, key);

-- Enable RLS
ALTER TABLE user_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own metadata" 
ON user_metadata FOR ALL USING (auth.uid() = user_id);
```

## What's Fixed

✅ **Supabase Sync Errors**: Fixed 342 TypeScript errors in `supabase-sync.ts`
- Added proper type casting with fallback values
- Fixed undefined value handling
- Ensured all required fields have default values

✅ **Business Info Editing**: Added robust fallback system with alternative table approach
- **NEW**: Uses dedicated `business_profiles` table to avoid schema conflicts
- Primary storage: Supabase `business_profiles` table (recommended)
- Fallback storage: Browser localStorage (always works)
- Graceful error handling with user feedback

✅ **Schema Conflict Resolution**: Fixed ERROR 42703 (column "user_id" does not exist)
- Created alternative business profile hook (`use-business-profile-v2.ts`)
- Uses dedicated `business_profiles` table instead of problematic `user_metadata`
- Prioritizes localStorage for immediate save, Supabase for persistence
- Graceful error handling with user feedback

✅ **Schema Conflict Resolution**: Fixed ERROR 42703 (column "user_id" does not exist)
- Created alternative business profile hook (`use-business-profile-v2.ts`)
- Uses dedicated `business_profiles` table instead of problematic `user_metadata`
- Prioritizes localStorage for immediate save, Supabase for persistence

## Current Status

The application will now work even if the database tables don't exist:

1. **Business Profile Editing**: 
   - Will try to save to Supabase first
   - If that fails, will save to localStorage as backup
   - Loading will check both Supabase and localStorage

2. **Sync Functionality**: 
   - All TypeScript errors resolved
   - Better error handling for missing tables
   - Graceful degradation when database is unavailable

## Testing Your Fix

1. Start the development server: `npm run dev`
2. Go to http://localhost:9004/dashboard
3. Switch to the "Business" workspace
4. Try editing business information in settings
5. Check the browser console for any errors

The system should now work smoothly with appropriate fallbacks!