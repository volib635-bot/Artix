import { streamAI, callAI } from './registry';

export const REFINEMENT_SYSTEM_PROMPT = `You are a principal software engineer and technical editor.
Your task is to refine and elevate a draft software document or prompt specification.

Refinement Rules:
1. PURGE GENERIC FILLER: Eliminate generic buzzwords ("ensure scalability", "user-friendly", "TBD", "Sprint 1 setup", "seamless experience"). Replace them with concrete implementation details.
2. ENFORCE SPECIFICITY: Every requirement must state exact data types, HTTP routes, RLS rules, state flow triggers, or exact file paths where appropriate.
3. PRESERVE FORMATTING: Keep the existing Markdown structure and section titles intact, but expand brief bullet points into comprehensive, actionable specifications.
4. Output only the refined Markdown document directly without code fences surrounding the entire response.`;

export function buildRefinementUserPrompt(draftMarkdown: string): string {
  return `Critique and refine the following draft document according to your system rules:\n\n"""\n${draftMarkdown}\n"""\n\nProduce the polished, high-signal document now.`;
}

/**
 * Runs a reflection/refinement pass over an initial draft generation.
 * Yields streaming deltas of the refined output.
 */
export async function* streamRefinement(draftMarkdown: string): AsyncGenerator<string> {
  if (!draftMarkdown.trim()) return;

  yield* streamAI({
    system: REFINEMENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildRefinementUserPrompt(draftMarkdown),
      },
    ],
    temperature: 0.3,
    maxTokens: 4096,
  });
}

/**
 * Non-streaming variant of streamRefinement.
 */
export async function callRefinement(draftMarkdown: string): Promise<string> {
  if (!draftMarkdown.trim()) return draftMarkdown;

  const res = await callAI({
    system: REFINEMENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildRefinementUserPrompt(draftMarkdown),
      },
    ],
    temperature: 0.3,
    maxTokens: 4096,
  });

  return res.text || draftMarkdown;
}
