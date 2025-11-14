# Supabase Setup Guide

This guide walks you through setting up Supabase for the CoFounder Hub platform.

## Prerequisites

- Supabase account (free tier works)
- Basic understanding of SQL
- Your project's Supabase credentials

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Name: `cofounder-hub`
   - Database Password: (save this securely)
   - Region: (choose closest to your users)
4. Wait for project to be provisioned (2-3 minutes)

## Step 2: Get API Credentials

1. Go to Project Settings > API
2. Save these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: (keep private, only for server-side)

## Step 3: Set Up Database

1. Go to SQL Editor in your Supabase dashboard
2. Create a new query
3. Copy the entire contents of `docs/database-schema.sql`
4. Execute the query
5. Verify tables were created in the Table Editor

## Step 4: Configure Authentication

### Enable Email Authentication

1. Go to Authentication > Providers
2. Enable "Email" provider
3. Configure settings:
   - Confirm email: ON (recommended for production)
   - Secure email change: ON
   - Email templates: Customize if needed

### Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize:
   - Confirmation email
   - Password reset email
   - Magic link email

### Configure Redirects

1. Go to Authentication > URL Configuration
2. Add allowed redirect URLs:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)

## Step 5: Set Up Row Level Security (RLS)

RLS is already configured in the schema file, but verify:

1. Go to Table Editor
2. For each table, check the "RLS enabled" indicator
3. Click on a table > "View policies" to see RLS policies

### Testing RLS

Create a test user and verify:
```sql
-- Check if policies are working
SELECT * FROM public.projects; -- Should work
INSERT INTO public.projects (owner_id, title, description, category)
VALUES (auth.uid(), 'Test', 'Test', 'Test'); -- Should work for own user
```

## Step 6: Configure Environment Variables

### Development

Create `.env.local` in your project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Production

Add environment variables to your hosting platform:
- Vercel: Project Settings > Environment Variables
- Netlify: Site Settings > Build & Deploy > Environment
- Other: Follow platform-specific instructions

## Step 7: Update Application Code

### Create Supabase Client

Create `src/services/supabaseClient.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Update Auth Context

In `src/contexts/AuthContext.tsx`:
```typescript
import { supabase } from '../services/supabaseClient';

// Replace getCurrentUser with:
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      // Fetch user profile from public.users table
      supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => setUser(data));
    }
    setLoading(false);
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => setUser(data));
    } else {
      setUser(null);
    }
  });

  return () => subscription.unsubscribe();
}, []);

// Update login:
const login = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
};

// Update signup:
const signup = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
  if (error) throw error;

  // Create user profile
  if (data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      email,
      name,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    });
  }
};

// Update logout:
const logout = async () => {
  await supabase.auth.signOut();
};
```

### Update API Service

In `src/services/api.ts`, uncomment the Supabase import and replace each function with Supabase queries. Example:

```typescript
// Before (mock):
async getAllProjects(): Promise<Project[]> {
  await delay(300);
  return mockProjects;
}

// After (Supabase):
async getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, owner:users(*)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

## Step 8: Set Up Storage (Optional)

For user avatars and file uploads:

1. Go to Storage
2. Create bucket: `avatars`
3. Set to public (or configure RLS)
4. Update avatar upload code:

```typescript
const uploadAvatar = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
```

## Step 9: Test Everything

### Test Authentication
1. Sign up a new user
2. Verify email (if enabled)
3. Login with credentials
4. Check if user profile is created in `public.users`

### Test Data Operations
1. Create a project
2. Add positions
3. Apply to a position
4. Accept an application
5. Add a review

### Test Permissions
Try to:
- Edit another user's project (should fail)
- View own applications (should work)
- View other's private data (should fail)

## Step 10: Edge Functions for Stripe (Optional)

For MRR tracking with Stripe webhooks:

1. Install Supabase CLI
2. Create edge function:
```bash
supabase functions new stripe-webhook
```

3. Implement webhook handler (see `docs/stripe-integration.md`)

4. Deploy:
```bash
supabase functions deploy stripe-webhook
```

5. Add Stripe webhook URL in Stripe Dashboard

## Troubleshooting

### Common Issues

**"JWT expired" errors:**
- Clear browser storage
- Re-login

**RLS Policy errors:**
- Check if user is authenticated: `SELECT auth.uid()`
- Verify policies are correctly configured
- Check if user has necessary relationships (e.g., project ownership)

**Connection errors:**
- Verify environment variables are set
- Check Supabase project is active
- Ensure API keys are correct

**CORS errors:**
- Add allowed origins in Supabase dashboard
- Check redirect URLs are configured

### Debug Mode

Enable debug logging:
```typescript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true,
  },
});
```

## Security Checklist

Before going to production:

- [ ] RLS enabled on all tables
- [ ] RLS policies tested thoroughly
- [ ] Email confirmation enabled
- [ ] Service role key kept private
- [ ] CORS configured correctly
- [ ] Environment variables secure
- [ ] Webhook endpoints authenticated
- [ ] Rate limiting considered
- [ ] Backup strategy in place

## Monitoring

Set up monitoring in Supabase:
1. Go to Reports
2. Monitor:
   - API requests
   - Database performance
   - Auth metrics
   - Storage usage

## Next Steps

- Set up Stripe integration (see `docs/stripe-integration.md`)
- Configure email notifications
- Add file upload functionality
- Set up database backups
- Configure custom domain (if needed)

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)
