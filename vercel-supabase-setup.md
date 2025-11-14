# Adding Supabase Keys to Vercel Project

## Step 1: Get Your Supabase Keys
From your Supabase dashboard, you'll need these keys:
- **Supabase URL** (your-project-url.supabase.co)
- **Anon/Public Key** (starts with "eyJ...")
- **Service Role Key** (starts with "eyJ...") - if needed

## Step 2: Add to Vercel Environment Variables

### Option A: Via Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (cofounder)
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar
5. Click **Add New** button
6. Add each variable:

#### Variable 1:
- **Name:** `VITE_SUPABASE_URL`
- **Value:** Your Supabase project URL
- **Environment:** Production, Preview, Development
- Click **Add**

#### Variable 2:
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon/public key
- **Environment:** Production, Preview, Development
- Click **Add**

#### Variable 3 (if needed for server-side operations):
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Your Supabase service role key
- **Environment:** Production only (or where needed)
- Click **Add**

### Option B: Via Vercel CLI
```bash
# Login to Vercel
vercel login

# Add environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Redeploy
vercel --prod
```

## Step 3: Update Your Code (if needed)
Make sure your frontend code reads these variables:

```typescript
// src/lib/supabase.ts or similar
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Step 4: Deploy
- Vercel will automatically redeploy when environment variables change
- Or manually trigger redeploy from Vercel dashboard

## Important Notes:
- **VITE_ prefix:** Required for Vite to expose environment variables to the frontend
- **Never expose Service Role Key** in frontend code - only use it in server-side edge functions
- **Supabase URL format:** `https://your-project-id.supabase.co`
- **Security:** The anon/public key is safe to use in frontend, but don't commit it to public repos

## Troubleshooting:
- If you get "Supabase client not initialized" errors, check that the variables are properly named
- Ensure the project URL format is correct (https://your-project-id.supabase.co)
- Make sure the keys match what's in your Supabase project settings