// Context compression for source documents.
//
// Goal: fit large source documents into a token budget while preserving
// the highest-signal parts (headings, list items, opening & closing
// paragraphs). Falls back to head+tail slicing with an elided middle
// when structural compression is not enough.

import { estimateTokens } from './tokens';

export interface CompressResult {
  text: string;
  compressed: boolean;
  originalTokens: number;
  finalTokens: number;
  strategy: 'none' | 'structural' | 'head-tail';
}

const ELISION = '\n\n[... content elided for length ...]\n\n';

// Rough token → chars conversion (matches tokens.ts heuristic).
const tokensToChars = (t: number) => t * 4;

function headTail(text: string, budgetChars: number): string {
  if (text.length <= budgetChars) return text;
  const half = Math.max(200, Math.floor((budgetChars - ELISION.length) / 2));
  return text.slice(0, half) + ELISION + text.slice(text.length - half);
}

// Structural pass: keep headings, list bullets, and the first sentence
// of each paragraph. Collapse fenced code blocks to a one-line summary.
function structuralCompress(md: string): string {
  const withoutCode = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, body: string) => {
    const lines = body.split('\n').length;
    return `\n\`\`\`${lang || ''} [${lines}-line code block elided]\`\`\`\n`;
  });

  const blocks = withoutCode.split(/\n{2,}/);
  const kept: string[] = [];
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    // Always keep headings & list-heavy blocks in full.
    if (/^#{1,6}\s/.test(block) || /^([-*+]|\d+\.)\s/m.test(block)) {
      kept.push(block);
      continue;
    }
    // For prose paragraphs, keep only the first ~2 sentences.
    const sentences = block.split(/(?<=[.!?])\s+/);
    kept.push(sentences.slice(0, 2).join(' '));
  }
  return kept.join('\n\n');
}

/**
 * Compress `source` so its estimated token count fits within `maxTokens`.
 * Tries structural compression first, then head+tail slicing.
 */
export function compressSource(source: string, maxTokens = 16000): CompressResult {
  const original = source ?? '';
  const originalTokens = estimateTokens(original);
  if (originalTokens <= maxTokens) {
    return {
      text: original,
      compressed: false,
      originalTokens,
      finalTokens: originalTokens,
      strategy: 'none',
    };
  }

  const structural = structuralCompress(original);
  const structuralTokens = estimateTokens(structural);

  if (structuralTokens <= maxTokens) {
    return {
      text: structural,
      compressed: true,
      originalTokens,
      finalTokens: structuralTokens,
      strategy: 'structural',
    };
  }

  const budgetChars = tokensToChars(maxTokens);
  const sliced = headTail(structural.length < original.length ? structural : original, budgetChars);
  return {
    text: sliced,
    compressed: true,
    originalTokens,
    finalTokens: estimateTokens(sliced),
    strategy: 'head-tail',
  };
}
