// Lightweight token & cost estimator. Uses a ~4 chars/token heuristic
// (with a small word-based floor) — accurate enough to give the user a
// sense of size and cost before/after a request without pulling a
// tokenizer bundle into the client.

import { ProviderId } from './types';

export function estimateTokens(text: string | undefined | null): number {
  if (!text) return 0;
  const chars = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // Blend: chars/4 is the standard OpenAI rule-of-thumb; words * 1.3 is a
  // floor for very short inputs where the char count is misleading.
  return Math.max(1, Math.ceil(Math.max(chars / 4, words * 1.3)));
}

export function estimateMessagesTokens(parts: (string | undefined | null)[]): number {
  return parts.reduce((sum, p) => sum + estimateTokens(p), 0);
}

// USD per 1M tokens. Rough public pricing snapshots; used only to give
// the user an order-of-magnitude estimate. Lovable AI (gateway) is
// billed in credits, not USD, so we surface it as "credits" instead.
type PriceRow = { in: number; out: number; unit?: 'usd' | 'credits' };

const PRICING: Record<ProviderId, Record<string, PriceRow> & { default?: PriceRow }> = {
  openai: {
    default: { in: 2.5, out: 10 },
    'gpt-4o': { in: 2.5, out: 10 },
    'gpt-4o-mini': { in: 0.15, out: 0.6 },
    'gpt-4.1': { in: 2, out: 8 },
    'gpt-4.1-mini': { in: 0.4, out: 1.6 },
    'gpt-4.1-nano': { in: 0.1, out: 0.4 },
    'o3-mini': { in: 1.1, out: 4.4 },
  },
  anthropic: {
    default: { in: 3, out: 15 },
    'claude-3-5-sonnet-latest': { in: 3, out: 15 },
    'claude-3-5-haiku-latest': { in: 0.8, out: 4 },
    'claude-3-opus-latest': { in: 15, out: 75 },
  },
  google: {
    default: { in: 0.15, out: 0.6 },
    'gemini-1.5-pro': { in: 1.25, out: 5 },
    'gemini-1.5-flash': { in: 0.075, out: 0.3 },
    'gemini-2.0-flash': { in: 0.1, out: 0.4 },
    'gemini-2.5-pro': { in: 1.25, out: 5 },
    'gemini-2.5-flash': { in: 0.15, out: 0.6 },
  },
  groq: {
    default: { in: 0.05, out: 0.08 },
    'llama-3.3-70b-versatile': { in: 0.59, out: 0.79 },
    'llama-3.1-8b-instant': { in: 0.05, out: 0.08 },
    'mixtral-8x7b-32768': { in: 0.24, out: 0.24 },
  },
  lovable: {
    default: { in: 0, out: 0, unit: 'credits' },
  },
};

export function estimateCost(
  provider: ProviderId,
  model: string,
  inputTokens: number,
  outputTokens: number,
): { amount: number; unit: 'usd' | 'credits' } {
  const table = PRICING[provider] ?? {};
  const row = table[model] ?? table.default ?? { in: 0, out: 0 };
  const unit = row.unit ?? 'usd';
  const amount = (inputTokens * row.in + outputTokens * row.out) / 1_000_000;
  return { amount, unit };
}

export function formatCost({ amount, unit }: { amount: number; unit: 'usd' | 'credits' }): string {
  if (unit === 'credits') return 'included';
  if (amount === 0) return '$0.00';
  if (amount < 0.0001) return '<$0.0001';
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(3)}`;
}
