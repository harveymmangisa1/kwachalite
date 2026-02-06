# Supabase Connection Troubleshooting Guide

## Issue: "TypeError: Failed to fetch"

### Quick Solutions

#### 1. Check Environment Variables
```bash
# Make sure these are set in your .env file
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### 2. Check Network Connection
- Verify internet connectivity
- Check if you can access your Supabase URL in browser
- Try disabling VPN/proxy temporarily

#### 3. CORS Configuration
Go to Supabase Dashboard → Settings → API → CORS
Add your development URL:
```
http://localhost:9002
http://localhost:3000
```

#### 4. Database Tables
Ensure required tables exist in your Supabase database:
- `transactions`
- `bills` 
- `savings_goals`
- `categories`
- `clients`
- `products`
- `quotes`

#### 5. RLS Policies
Check Row Level Security policies allow user access:
```sql
-- Example policy for transactions
CREATE POLICY "Users can view own transactions" ON transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Diagnostic Steps

1. **Run the diagnostic tool**: Visit `/dashboard/debug` and click "Run Diagnostic"
2. **Check browser console**: Look for detailed error messages
3. **Verify Supabase status**: Check https://status.supabase.com/

### Common Fixes

#### Reset Connection
```javascript
// In browser console
localStorage.removeItem('kwachalite-auth');
location.reload();
```

#### Clear Browser Data
- Clear cache and cookies
- Try incognito/private browsing mode
- Disable browser extensions temporarily

#### Check Supabase Configuration
1. Go to Supabase Dashboard
2. Settings → API
3. Verify URL and keys match your .env
4. Check JWT settings (should be 1 hour)
5. Verify database URL is correct

### Environment-Specific Issues

#### Development
- Ensure `VITE_` prefix for environment variables
- Restart dev server after changing .env
- Check port conflicts (default: 9002)

#### Production
- Use HTTPS URLs
- Verify domain in CORS settings
- Check SSL certificate validity

### Get Help

1. **Check the debug page**: `/dashboard/debug`
2. **View console logs**: F12 → Console tab
3. **Test with diagnostic tool**: Click "Run Diagnostic" button
4. **Check Supabase logs**: Dashboard → Settings → Logs

### Emergency Fallback

If Supabase is completely unavailable:
1. The app should work in offline mode
2. Data is saved locally in browser storage
3. Sync will resume when connection is restored

---

## Database Setup SQL

Run this in Supabase SQL Editor to create required tables:

```sql
-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) DEFAULT 'expense',
  category TEXT,
  workspace TEXT DEFAULT 'personal',
  category_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own transactions" ON transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
FOR DELETE USING (auth.uid() = user_id);
```

Remember to create similar tables and policies for:
- `bills`
- `savings_goals` 
- `categories`
- `clients`
- `products`
- `quotes`