#!/bin/bash

# Apply Group Savings Migration
# This script applies the missing group savings tables to Supabase

echo "🚀 Applying Group Savings Migration to Supabase..."

# Check if SUPABASE_URL and SUPABASE_ANON_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required"
    echo "   Please set these in your .env file or environment"
    exit 1
fi

# Read the migration file
MIGRATION_FILE="supabase/migrations/014_add_group_savings_tables.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Apply the migration using curl to Supabase REST API
echo "📋 Applying migration: $MIGRATION_FILE"

# Using the Supabase SQL Editor approach:
echo ""
echo "🔧 TO APPLY THIS MIGRATION:"
echo "============================"
echo ""
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to SQL Editor" 
echo "3. Copy and paste the content of: $MIGRATION_FILE"
echo "4. Click 'Run' to execute the migration"
echo ""
echo "============================"
echo ""
echo "📄 Migration file content:"
echo "======================"
cat "$MIGRATION_FILE"
echo "======================"

echo ""
echo "✅ Migration file ready!"
echo ""
echo "📝 Alternative: You can also apply this using the Supabase CLI:"
echo "   supabase db push --db-url \$SUPABASE_URL --schema public"
echo ""

echo "🎯 This will create the following tables:"
echo "   - savings_groups"
echo "   - group_members" 
echo "   - group_invitations"
echo "   - group_contributions"
echo "   - group_activities"
echo ""
echo "With proper RLS policies and indexes for security and performance."