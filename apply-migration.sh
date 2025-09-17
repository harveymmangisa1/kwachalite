#!/bin/bash

# This script applies the business profile migration to your Supabase project

echo "🔄 Applying the business profile database migration..."

# Check if we're in the project root directory
if [ ! -d "supabase" ]; then
  echo "❌ Error: Please run this script from the project root directory."
  exit 1
fi

# Apply the migration
echo "📦 Applying migration: 002_add_user_metadata.sql"
npx supabase db push

echo "✅ Migration complete! Business profile features are now available."
echo "You can now save your business information in the Settings page."