export type VibeTarget = 'lovable' | 'cursor' | 'bolt' | 'v0' | 'generic';

export const VIBE_TARGETS: { id: VibeTarget; label: string; description: string }[] = [
  { id: 'lovable', label: 'Lovable', description: 'React + Vite + Tailwind + shadcn, Supabase backend' },
  { id: 'cursor', label: 'Cursor', description: 'IDE agent prompts with file-level instructions' },
  { id: 'bolt', label: 'Bolt.new', description: 'Full-stack scaffolding prompt' },
  { id: 'v0', label: 'v0 by Vercel', description: 'UI-first component generation' },
  { id: 'generic', label: 'Generic AI Coder', description: 'Tool-agnostic implementation prompt' },
];

export type VibeScope = 'mvp' | 'feature' | 'refactor';

export const VIBE_SCOPES: { id: VibeScope; label: string; description: string }[] = [
  { id: 'mvp', label: 'Full MVP', description: 'Bootstrap the whole app from scratch' },
  { id: 'feature', label: 'Single Feature', description: 'Add one focused capability to an existing app' },
  { id: 'refactor', label: 'Refactor / Improve', description: 'Restructure or harden existing code' },
];

const TARGET_GUIDANCE: Record<VibeTarget, string> = {
  lovable: `Target stack: React 18 + Vite + TypeScript + Tailwind + shadcn/ui + React Router + TanStack Query. Backend: Lovable Cloud (Supabase) with RLS. Reference shadcn components by name. Reference semantic Tailwind tokens (no hardcoded hex). Mention required tables/policies explicitly.`,
  cursor: `Target: Cursor IDE agent. Structure the prompt as: (1) Goal, (2) Files to create/modify with relative paths, (3) Step-by-step edits per file, (4) Verification commands. Be explicit about imports.`,
  bolt: `Target: Bolt.new full-stack scaffolder. Produce a single comprehensive prompt that includes stack choice, file tree, env vars, and a prioritized build order.`,
  v0: `Target: v0 by Vercel. Focus on UI components: layout, props, variants, states, responsive behavior, and accessibility. Avoid backend specifics.`,
  generic: `Target: any capable coding AI. Stay framework-neutral when possible; if a stack choice is required, state it explicitly and justify briefly.`,
};

const SCOPE_GUIDANCE: Record<VibeScope, string> = {
  mvp: `Scope: bootstrap a complete MVP. Include project setup, core data model, primary screens, and a deploy/run note.`,
  feature: `Scope: add a single, well-defined feature to an existing codebase. Assume the project already exists; do not re-scaffold.`,
  refactor: `Scope: refactor or harden existing code. Identify the smell or risk, propose the target structure, and list the edits in order.`,
};

const OUTPUT_CONTRACT = `Output a single Markdown document the user can copy-paste directly into the target tool. Use these H2 sections in order:

## Goal
## Context & Assumptions
## Tech Stack
## Data Model
## File-by-File Plan
## Implementation Steps
## UI / UX Notes
## Acceptance Criteria
## Follow-up Prompts

Rules:
- Write in the imperative voice the target AI expects ("Create…", "Add…", "Replace…").
- Use fenced code blocks for any code, SQL, or config snippets.
- Where the source is ambiguous, state an assumption inline as "> Assumption: …".
- Keep the prompt self-contained — no external links required.
- Do not wrap the whole response in a single outer code fence.`;

export function vibeSystemPrompt(target: VibeTarget, scope: VibeScope): string {
  return `You are a senior engineer who writes high-signal prompts for AI coding tools.
${TARGET_GUIDANCE[target]}
${SCOPE_GUIDANCE[scope]}

${OUTPUT_CONTRACT}`;
}

import { compressSource } from '../compress';

export function buildVibeUserPrompt(args: {
  sourceTitle: string;
  sourceMarkdown: string;
  customInstructions?: string;
  maxSourceTokens?: number;
}): string {
  const { sourceTitle, sourceMarkdown, customInstructions, maxSourceTokens = 3000 } = args;
  const { text, compressed, strategy, originalTokens, finalTokens } = compressSource(
    sourceMarkdown,
    maxSourceTokens,
  );
  const notice = compressed
    ? `\n\n[Note: source was compressed (${strategy}) from ~${originalTokens} to ~${finalTokens} tokens.]`
    : '';
  return `Source document title: ${sourceTitle || 'Untitled'}

Source content:
"""
${text}
"""${notice}

${customInstructions ? `Additional instructions from the user:\n${customInstructions}\n\n` : ''}Produce the vibe-coding prompt now.`;
}
