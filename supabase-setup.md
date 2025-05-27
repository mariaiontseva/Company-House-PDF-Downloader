# Supabase Setup Guide for DocSpace

## 1. Create Supabase Project

1. Go to https://app.supabase.com
2. Create new project (free tier is fine)
3. Save these credentials:
   - Project URL: `https://YOUR_PROJECT.supabase.co`
   - Anon Key: `eyJ...` (public key, safe for frontend)
   - Service Key: `eyJ...` (secret, for backend only)

## 2. Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free', -- free, pro, enterprise
  credits INTEGER DEFAULT 1, -- free downloads remaining
  stripe_customer_id TEXT
);

-- Monitored companies table
CREATE TABLE public.monitored_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_number TEXT NOT NULL,
  company_name TEXT NOT NULL,
  last_filing_date DATE,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, company_number)
);

-- Download history
CREATE TABLE public.download_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  company_number TEXT NOT NULL,
  company_name TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_count INTEGER,
  stripe_payment_id TEXT
);

-- Webhook notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_number TEXT NOT NULL,
  filing_type TEXT,
  filing_date DATE,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitored_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own monitored companies" ON public.monitored_companies
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own downloads" ON public.download_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 3. Enable Authentication Providers

In Supabase Dashboard > Authentication > Providers:

1. **Email** - Already enabled by default
2. **Google**:
   - Create OAuth app at https://console.cloud.google.com
   - Add redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Add Client ID and Secret to Supabase
3. **Facebook**:
   - Create app at https://developers.facebook.com
   - Add redirect URL
   - Add App ID and Secret to Supabase

## 4. Environment Variables

Create `.env` file (don't commit!):
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

## 5. Edge Function for Monitoring (optional)

Create Supabase Edge Function for checking new filings:

```typescript
// supabase/functions/check-filings/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Get all monitored companies
  const { data: companies } = await supabase
    .from('monitored_companies')
    .select('*')
    .eq('is_active', true)

  // Check each company for new filings
  for (const company of companies) {
    // Call Companies House API
    // Compare with last_filing_date
    // Create notification if new filing found
  }

  return new Response(JSON.stringify({ checked: companies.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

Deploy with: `supabase functions deploy check-filings`

Schedule with cron job or call periodically.