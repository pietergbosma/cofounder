// Stripe Webhook Handler for MRR Tracking
// This Edge Function handles Stripe webhooks to track subscription data and calculate MRR

// IMPORTANT: Deploy this function with:
// supabase functions deploy stripe-webhook
//
// Then set the webhook URL in your Stripe Dashboard:
// https://your-project.supabase.co/functions/v1/stripe-webhook
//
// Required Stripe webhook events:
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get Stripe signature for verification
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    // Parse the request body
    const body = await req.text();
    
    // TODO: Verify webhook signature with Stripe
    // const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    // const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    // Verify signature here...

    const event = JSON.parse(body);
    
    console.log('Received Stripe event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionEvent(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'WEBHOOK_ERROR',
          message: error.message,
        },
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleSubscriptionEvent(subscription: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Get project_id from subscription metadata
    // You should add project_id to Stripe subscription metadata when creating subscriptions
    const projectId = subscription.metadata?.project_id;
    
    if (!projectId) {
      console.warn('No project_id found in subscription metadata');
      return;
    }

    // Upsert subscription data
    const subscriptionData = {
      project_id: projectId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      status: subscription.status,
      amount: subscription.items.data[0].price.unit_amount, // Amount in cents
      currency: subscription.items.data[0].price.currency,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    };

    // Insert or update subscription
    const response = await fetch(`${supabaseUrl}/rest/v1/stripe_subscriptions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      throw new Error(`Failed to upsert subscription: ${await response.text()}`);
    }

    // Update MRR data
    await updateMRRData(projectId);

    console.log('Subscription processed successfully:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription event:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Update subscription status to 'canceled'
    const response = await fetch(
      `${supabaseUrl}/rest/v1/stripe_subscriptions?stripe_subscription_id=eq.${subscription.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceRoleKey,
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'canceled' }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update subscription: ${await response.text()}`);
    }

    // Update MRR data
    const projectId = subscription.metadata?.project_id;
    if (projectId) {
      await updateMRRData(projectId);
    }

    console.log('Subscription deleted:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    throw error;
  }
}

async function updateMRRData(projectId: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Get all active subscriptions for this project
    const response = await fetch(
      `${supabaseUrl}/rest/v1/stripe_subscriptions?project_id=eq.${projectId}&status=eq.active&select=*`,
      {
        headers: {
          'apikey': supabaseServiceRoleKey,
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${await response.text()}`);
    }

    const subscriptions = await response.json();

    // Calculate total MRR (sum of all active subscription amounts, convert from cents to dollars)
    const totalMRR = subscriptions.reduce((sum: number, sub: any) => {
      return sum + (sub.amount / 100);
    }, 0);

    // Get current month in YYYY-MM format
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Upsert MRR data for current month
    const mrrData = {
      project_id: projectId,
      month: month,
      revenue: Math.round(totalMRR),
      stripe_subscription_count: subscriptions.length,
    };

    const mrrResponse = await fetch(`${supabaseUrl}/rest/v1/mrr_data`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(mrrData),
    });

    if (!mrrResponse.ok) {
      throw new Error(`Failed to upsert MRR data: ${await mrrResponse.text()}`);
    }

    console.log('MRR data updated:', mrrData);
  } catch (error) {
    console.error('Error updating MRR data:', error);
    throw error;
  }
}
