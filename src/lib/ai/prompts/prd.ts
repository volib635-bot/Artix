export type PRDTemplate = 'agile' | 'technical' | 'lean' | 'custom';

export const PRD_TEMPLATES: { id: PRDTemplate; label: string; description: string }[] = [
  { id: 'agile', label: 'Agile', description: 'User-story driven, sprint-friendly' },
  { id: 'technical', label: 'Technical Spec', description: 'Engineering-focused, deep technical detail' },
  { id: 'lean', label: 'Lean Startup', description: 'Hypothesis-driven, MVP-first' },
  { id: 'custom', label: 'Custom', description: 'Follow your own instructions' },
];

const SHARED_OUTPUT_CONTRACT = `Output a single Markdown document. Use these H2 sections in order, even if a section is brief:

## Overview
## User Stories
## Technical Requirements
## Functional Requirements
## Non-Functional Requirements
## Acceptance Criteria
## Timeline & Milestones
## Dependencies & Risks

Rules:
- Use proper Markdown headings, bullet lists, and tables where helpful.
- When the source is incomplete or ambiguous, make reasonable assumptions and mark them with a "> Assumption:" blockquote.
- Write user stories in the form: "As a <user>, I want <feature>, so that <benefit>."
- Keep each section actionable; avoid filler prose.
- Do not wrap the response in code fences.`;

const TEMPLATE_GUIDANCE: Record<PRDTemplate, string> = {
  agile: `Audience: a cross-functional agile team. Optimize for user stories with acceptance criteria, sprint sizing hints, and definition-of-done style criteria.`,
  technical: `Audience: senior engineers. Emphasize technical requirements, architecture constraints, APIs, data models, performance/security/scalability, and edge cases.`,
  lean: `Audience: a lean startup team. Frame requirements around the riskiest hypotheses, MVP scope, validation experiments, and learning metrics.`,
  custom: `Audience: as described by the user. Follow the custom instructions strictly while still producing every section.`,
};

export function systemPromptFor(template: PRDTemplate): string {
  return `You are a senior product manager generating a Product Requirements Document (PRD).
${TEMPLATE_GUIDANCE[template]}

${SHARED_OUTPUT_CONTRACT}`;
}

import { compressSource } from '../compress';

export function buildUserPrompt(args: {
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
    ? `\n\n[Note: source was compressed (${strategy}) from ~${originalTokens} to ~${finalTokens} tokens to fit the context budget.]`
    : '';
  return `Source document title: ${sourceTitle || 'Untitled'}

Source content:
"""
${text}
"""${notice}

${customInstructions ? `Additional instructions from the user:\n${customInstructions}\n\n` : ''}Produce the PRD now.`;
}
