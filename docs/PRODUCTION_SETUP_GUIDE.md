# Production Backend Integration Guide

## Prerequisites

Before proceeding, ensure you have:
1. A Supabase account (https://supabase.com)
2. A Stripe account (https://stripe.com) - for MRR tracking

## Step 1: Set Up Supabase Project

### 1.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details and wait for setup to complete

### 1.2 Run Database Schema
1. In your Supabase project, go to "SQL Editor"
2. Copy the entire contents of `docs/complete-database-schema.sql`
3. Paste and click "Run"
4. This will create all tables, RLS policies, indexes, and triggers

### 1.3 Get Supabase Credentials
1. Go to Project Settings → API
2. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (for Edge Functions)

## Step 2: Configure Frontend

### 2.1 Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
```

### 2.2 Verify Supabase Client
The Supabase client is already configured in `src/lib/supabaseClient.ts`
It will automatically use environment variables from `.env.local`

## Step 3: Update API Service Layer

The mock data in `src/services/api.ts` needs to be replaced with real Supabase queries.

### 3.1 Auth Service Example
Replace mock auth with Supabase Auth:

```typescript
export const authService = {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user!.id)
      .maybeSingle();
    
    return profile!;
  },

  async signup(email: string, password: string, name: string, userType: 'founder' | 'investor'): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          user_type: userType,
        },
      },
    });
    if (error) throw error;
    
    // Profile is automatically created by trigger
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user!.id)
      .maybeSingle();
    
    return profile!;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    return profile;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },
};
```

### 3.2 Project Service Example
```typescript
export const projectService = {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createProject(project: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data!;
  },
};
```

### 3.3 Investment Service Example
```typescript
export const investmentRoundService = {
  async getOpenRounds(): Promise<InvestmentRound[]> {
    const { data, error } = await supabase
      .from('investment_rounds')
      .select('*, project:projects(*)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};
```

## Step 4: Set Up Stripe Integration (MRR Tracking)

### 4.1 Get Stripe Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy:
   - Publishable key → `VITE_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY` (for Edge Function)

### 4.2 Deploy Stripe Webhook Edge Function

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

3. Set Edge Function secrets:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your-key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

4. Deploy the Edge Function:
```bash
supabase functions deploy stripe-webhook
```

### 4.3 Configure Stripe Webhook
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### 4.4 Add Project ID to Stripe Subscriptions
When creating Stripe subscriptions, add project_id to metadata:

```typescript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  metadata: {
    project_id: projectId, // IMPORTANT: This links subscription to project
  },
});
```

## Step 5: Update Auth Context

Update `src/contexts/AuthContext.tsx` to use real Supabase auth:

```typescript
useEffect(() => {
  authService.getCurrentUser()
    .then(setUser)
    .catch(() => setUser(null))
    .finally(() => setLoading(false));

  // Listen to auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        const profile = await authService.getCurrentUser();
        setUser(profile);
      } else {
        setUser(null);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Step 6: Testing

### 6.1 Test Authentication
1. Sign up as a founder
2. Sign up as an investor
3. Verify profiles are created
4. Test login/logout

### 6.2 Test Founder Features
1. Create a project
2. Add positions
3. Create an investment round
4. Review applications

### 6.3 Test Investor Features
1. Browse investment opportunities
2. Make an investment
3. View portfolio
4. Check investment status

### 6.4 Test MRR Tracking
1. Create test Stripe subscriptions with project_id in metadata
2. Trigger webhook events
3. Verify MRR data updates in dashboard

## Step 7: Deploy to Production

### 7.1 Build
```bash
pnpm run build
```

### 7.2 Deploy
The `dist` folder can be deployed to:
- Vercel
- Netlify
- Cloudflare Pages
- Or use the existing deployment tool

### 7.3 Update Environment Variables
Set production environment variables in your hosting platform.

## Troubleshooting

### RLS Policy Errors
If you get "new row violates row-level security policy", ensure:
1. User is authenticated
2. The policy allows the operation
3. Check policy conditions match your use case

### Stripe Webhook Not Working
1. Verify endpoint URL is correct
2. Check webhook secret matches
3. View logs in Supabase Functions dashboard
4. Test with Stripe CLI: `stripe listen --forward-to your-webhook-url`

### Auth Issues
1. Verify environment variables are set
2. Check Supabase Auth settings (email confirmation, etc.)
3. Review auth logs in Supabase dashboard

## Next Steps

1. Replace all mock data calls with real Supabase queries
2. Test all user flows end-to-end
3. Add error handling and loading states
4. Implement proper form validation
5. Add toast notifications for user feedback
6. Optimize queries with indexes
7. Monitor performance and costs
8. Set up analytics and monitoring

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Project Issues: Create issues in your repository
