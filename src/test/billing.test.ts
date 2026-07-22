import { describe, it, expect } from 'vitest';
import { PLAN_LIMITS, PLAN_PRICES, isWithinLimit } from '../lib/plans';
import fs from 'fs';
import path from 'path';

describe('Stripe Billing & Subscription Plan Logic', () => {
  describe('Plan Limits Configuration', () => {
    it('should configure free tier limits correctly', () => {
      expect(PLAN_LIMITS.free).toEqual({
        projects: 3,
        documents: 10,
        systemDesigns: 3,
        aiGenerationsPerMonth: 5,
      });
    });

    it('should configure pro tier limits correctly', () => {
      expect(PLAN_LIMITS.pro.projects).toBe(100);
      expect(PLAN_LIMITS.pro.documents).toBeNull();
      expect(PLAN_LIMITS.pro.systemDesigns).toBeNull();
      expect(PLAN_LIMITS.pro.aiGenerationsPerMonth).toBeNull();
    });

    it('should accurately evaluate isWithinLimit for numeric limits', () => {
      expect(isWithinLimit(0, 3)).toBe(true);
      expect(isWithinLimit(2, 3)).toBe(true);
      expect(isWithinLimit(3, 3)).toBe(false);
      expect(isWithinLimit(4, 3)).toBe(false);
    });

    it('should accurately evaluate isWithinLimit for unlimited (null) limits', () => {
      expect(isWithinLimit(0, null)).toBe(true);
      expect(isWithinLimit(999, null)).toBe(true);
      expect(isWithinLimit(10000, null)).toBe(true);
    });
  });

  describe('Stripe Pricing Config', () => {
    it('should have valid price IDs for monthly and annual plans', () => {
      expect(PLAN_PRICES.monthly.priceId).toBe('price_1Tw4QxFhYsZG2pP7gamnWTX6');
      expect(PLAN_PRICES.monthly.amount).toBe(8);
      expect(PLAN_PRICES.annual.priceId).toBe('price_1Tw4RxFhYsZG2pP7MBbos4He');
      expect(PLAN_PRICES.annual.amount).toBe(72);
    });
  });

  describe('Database Security & Migration Validation', () => {
    it('should have created the stripe_billing migration with SELECT-only RLS', () => {
      const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260722180000_stripe_billing.sql');
      expect(fs.existsSync(migrationPath)).toBe(true);

      const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
      
      // Verify subscriptions table and RLS
      expect(sqlContent).toContain('CREATE TABLE public.subscriptions');
      expect(sqlContent).toContain('ENABLE ROW LEVEL SECURITY');
      expect(sqlContent).toContain('CREATE POLICY "Users can view own subscription"');
      expect(sqlContent).toContain('ON public.subscriptions FOR SELECT');
      
      // Verify NO insert/update policies exist for client user
      expect(sqlContent).not.toContain('FOR INSERT');
      expect(sqlContent).not.toContain('FOR UPDATE');

      // Verify stripe_events table for idempotency
      expect(sqlContent).toContain('CREATE TABLE public.stripe_events');
      expect(sqlContent).toContain('stripe_event_id');
    });
  });

  describe('Supabase Edge Functions Structure', () => {
    it('should have create-checkout-session edge function with JWT & CORS checks', () => {
      const fnPath = path.join(process.cwd(), 'supabase/functions/create-checkout-session/index.ts');
      expect(fs.existsSync(fnPath)).toBe(true);

      const code = fs.readFileSync(fnPath, 'utf-8');
      expect(code).toContain('stripe.checkout.sessions.create');
      expect(code).toContain('Authorization');
      expect(code).toContain('corsHeaders');
    });

    it('should have stripe-webhook edge function with signature verification & idempotency', () => {
      const fnPath = path.join(process.cwd(), 'supabase/functions/stripe-webhook/index.ts');
      expect(fs.existsSync(fnPath)).toBe(true);

      const code = fs.readFileSync(fnPath, 'utf-8');
      expect(code).toContain('stripe.webhooks.constructEventAsync'); // Signature check mandatory
      expect(code).toContain('stripe_events'); // Idempotency check
      expect(code).toContain('checkout.session.completed');
      expect(code).toContain('customer.subscription.updated');
      expect(code).toContain('customer.subscription.deleted');
      expect(code).toContain('invoice.payment_failed');
    });

    it('should have create-portal-session edge function for self-service subscription management', () => {
      const fnPath = path.join(process.cwd(), 'supabase/functions/create-portal-session/index.ts');
      expect(fs.existsSync(fnPath)).toBe(true);

      const code = fs.readFileSync(fnPath, 'utf-8');
      expect(code).toContain('stripe.billingPortal.sessions.create');
    });
  });
});
