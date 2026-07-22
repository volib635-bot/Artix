import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

Deno.serve(async (req) => {
  // We don't verify JWT here, as this is called by Stripe

  // 1. Verify webhook signature
  const signature = req.headers.get('Stripe-Signature')
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string
    
    // This is NON-NEGOTIABLE
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Check idempotency
    const { data: existingEvent } = await supabaseAdmin
      .from('stripe_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .maybeSingle()

    if (existingEvent) {
      console.log(`Event ${event.id} already processed.`)
      return new Response('Event already processed', { status: 200 })
    }

    // 3. Handle events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId = session.subscription as string
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata.supabase_user_id

          if (userId) {
            await supabaseAdmin
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscriptionId,
                plan_tier: 'pro',
                status: 'active',
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              }, { onConflict: 'user_id' })
          }
        }
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan_tier: subscription.status === 'active' ? 'pro' : 'free',
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            billing_cycle: subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'annual' : 'monthly',
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan_tier: 'free',
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription)
        }
        break
      }
    }

    // 4. Record event
    await supabaseAdmin
      .from('stripe_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
      })

    // 5. Return 200
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error(`Webhook error: ${error.message}`)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
})
