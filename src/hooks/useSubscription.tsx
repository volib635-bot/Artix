/**
 * useSubscription.tsx
 * ───────────────────
 * React hook that reads the current user's subscription from Supabase.
 *
 * The `subscriptions` table is written ONLY by Edge Functions (webhook).
 * This hook only reads — no user can write to their own subscription row.
 *
 * If no subscription row exists (legacy users created before billing),
 * the hook returns a safe fallback: plan = 'free', status = 'active'.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { PlanTier } from '@/lib/plans';

export interface Subscription {
  plan: PlanTier;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete';
  billingCycle: 'monthly' | 'annual' | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}

const FREE_FALLBACK: Subscription = {
  plan: 'free',
  status: 'active',
  billingCycle: null,
  currentPeriodEnd: null,
  stripeCustomerId: null,
};

export function useSubscription() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<Subscription> => {
      if (!user) return FREE_FALLBACK;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_tier, status, billing_cycle, current_period_end, stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Failed to load subscription:', error);
        return FREE_FALLBACK;
      }

      // No row = legacy user → free plan
      if (!data) return FREE_FALLBACK;

      return {
        plan: data.plan_tier as PlanTier,
        status: data.status as Subscription['status'],
        billingCycle: data.billing_cycle as Subscription['billingCycle'],
        currentPeriodEnd: data.current_period_end,
        stripeCustomerId: data.stripe_customer_id,
      };
    },
    enabled: !!user,
    staleTime: 60_000, // Cache for 60 seconds
  });

  const subscription = query.data ?? FREE_FALLBACK;
  const isPro = subscription.plan === 'pro' && subscription.status === 'active';
  const isPastDue = subscription.status === 'past_due';

  return {
    subscription,
    planTier: subscription.plan,
    isPro,
    isPastDue,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
