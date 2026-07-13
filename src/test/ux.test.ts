import { describe, it, expect } from 'vitest';
import { estimateTokens, estimateCost, formatCost } from '../lib/ai/tokens';

describe('UX & Utility Tests', () => {
  it('should estimate tokens accurately using character/word heuristics', () => {
    // 4 chars = ~1 token
    expect(estimateTokens('hello')).toBe(2); // max of 5/4=1.25 -> 2, or word floor
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('This is a longer sentence with multiple words.')).toBe(12);
  });

  it('should calculate estimated cost based on active provider rates', () => {
    // OpenAI mini rates: $0.15 / 1M in, $0.60 / 1M out
    const cost = estimateCost('openai', 'gpt-4o-mini', 100000, 50000);
    expect(cost.amount).toBeCloseTo(0.045); // (100000*0.15 + 50000*0.60)/1000000 = (15000 + 30000)/1000000 = 0.045
    expect(cost.unit).toBe('usd');

    // Google Flash rates: $0.075 / 1M in, $0.3 / 1M out
    const costGoogle = estimateCost('google', 'gemini-1.5-flash', 100000, 100000);
    expect(costGoogle.amount).toBeCloseTo(0.0375); // (100000*0.075 + 100000*0.3)/1000000 = (7500 + 30000)/1000000 = 0.0375
  });

  it('should format cost values correctly for display', () => {
    expect(formatCost({ amount: 0, unit: 'usd' })).toBe('$0.00');
    expect(formatCost({ amount: 0.125, unit: 'usd' })).toBe('$0.125');
    expect(formatCost({ amount: 1.5, unit: 'usd' })).toBe('$1.500');
    expect(formatCost({ amount: 0.00001, unit: 'usd' })).toBe('<$0.0001');
  });
});
