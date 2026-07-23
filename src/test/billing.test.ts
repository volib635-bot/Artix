import { describe, it, expect } from 'vitest';
import { PLAN_LIMITS, PLAN_PRICES, GRACE_PERIOD_DAYS, isWithinLimit } from '../lib/plans';

describe('Stripe Billing & Plan Limits Configuration', () => {
  it('should define correct limits for Free tier', () => {
    expect(PLAN_LIMITS.free.projects).toBe(3);
    expect(PLAN_LIMITS.free.documents).toBe(10);
    expect(PLAN_LIMITS.free.systemDesigns).toBe(3);
    expect(PLAN_LIMITS.free.aiGenerationsPerMonth).toBe(5);
  });

  it('should define unlimited (null) limits for Pro tier (with abuse cap on projects)', () => {
    expect(PLAN_LIMITS.pro.projects).toBe(100);
    expect(PLAN_LIMITS.pro.documents).toBeNull();
    expect(PLAN_LIMITS.pro.systemDesigns).toBeNull();
    expect(PLAN_LIMITS.pro.aiGenerationsPerMonth).toBeNull();
  });

  it('should correctly evaluate isWithinLimit for numeric limits', () => {
    // Free document limit is 10
    expect(isWithinLimit(0, 10)).toBe(true);
    expect(isWithinLimit(9, 10)).toBe(true);
    expect(isWithinLimit(10, 10)).toBe(false);
    expect(isWithinLimit(15, 10)).toBe(false);
  });

  it('should always return true for unlimited (null) limits', () => {
    expect(isWithinLimit(0, null)).toBe(true);
    expect(isWithinLimit(999, null)).toBe(true);
    expect(isWithinLimit(100000, null)).toBe(true);
  });

  it('should configure correct Stripe price IDs and details', () => {
    expect(PLAN_PRICES.monthly.priceId).toBe('price_1Tw4QxFhYsZG2pP7gamnWTX6');
    expect(PLAN_PRICES.monthly.amount).toBe(8);

    expect(PLAN_PRICES.annual.priceId).toBe('price_1Tw4RxFhYsZG2pP7MBbos4He');
    expect(PLAN_PRICES.annual.amount).toBe(72);
  });

  it('should specify a 7-day grace period for past due subscriptions', () => {
    expect(GRACE_PERIOD_DAYS).toBe(7);
  });
});
