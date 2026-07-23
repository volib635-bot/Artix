import { describe, it, expect } from 'vitest';
import { compressSource } from '../lib/ai/compress';
import { buildUserPrompt as buildPRDPrompt } from '../lib/ai/prompts/prd';
import { buildVibeUserPrompt } from '../lib/ai/prompts/vibe';
import { buildAgenticUserPrompt } from '../lib/ai/prompts/agentic';
import { REFINEMENT_SYSTEM_PROMPT, buildRefinementUserPrompt } from '../lib/ai/refine';

describe('AI Architecture Upgrade Suite', () => {
  describe('1. Context Window Expansion (16k tokens)', () => {
    it('should allow up to 16,000 tokens without truncating source content', () => {
      const longText = 'Paragraph of text. '.repeat(1000); // ~4,000 tokens
      const result = compressSource(longText, 16000);

      expect(result.compressed).toBe(false);
      expect(result.text.length).toBe(longText.length);
    });
  });

  describe('2. Project Context Injection', () => {
    it('should inject sibling document titles and system designs into PRD prompt', () => {
      const prompt = buildPRDPrompt({
        sourceTitle: 'Core Auth Spec',
        sourceMarkdown: '# Auth Content',
        projectContext: {
          siblingDocs: [{ title: 'Database Schema.md' }, { title: 'API Routes.md' }],
          systemDesigns: [{ name: 'Microservices Flow' }],
        },
      });

      expect(prompt).toContain('Project Workspace Context:');
      expect(prompt).toContain('Database Schema.md');
      expect(prompt).toContain('API Routes.md');
      expect(prompt).toContain('Microservices Flow');
    });

    it('should inject project context into Vibe Prompt generator', () => {
      const prompt = buildVibeUserPrompt({
        sourceTitle: 'Feature Spec',
        sourceMarkdown: '# Feature',
        projectContext: {
          siblingDocs: [{ title: 'Architecture.md' }],
        },
      });

      expect(prompt).toContain('Project Workspace Context:');
      expect(prompt).toContain('Architecture.md');
    });

    it('should inject project context into Agentic Workflow generator', () => {
      const prompt = buildAgenticUserPrompt({
        sourceTitle: 'Agent Loop Spec',
        sourceMarkdown: '# Agent Loop',
        projectContext: {
          systemDesigns: [{ name: 'Orchestrator Pipeline' }],
        },
      });

      expect(prompt).toContain('Project Workspace Context:');
      expect(prompt).toContain('Orchestrator Pipeline');
    });
  });

  describe('3. Reflection & Refinement Pass (refine.ts)', () => {
    it('should construct a refinement prompt banning generic filler words', () => {
      const draft = '## Technical Requirements\nEnsure high scalability and TBD performance.';
      const userPrompt = buildRefinementUserPrompt(draft);

      expect(REFINEMENT_SYSTEM_PROMPT).toContain('PURGE GENERIC FILLER');
      expect(userPrompt).toContain(draft);
    });

    it('should return the high-signal Agile PRD prompt when template is agile', async () => {
      const { systemPromptFor, AGILE_PRD_SYSTEM_PROMPT } = await import('../lib/ai/prompts/prd');
      expect(systemPromptFor('agile')).toBe(AGILE_PRD_SYSTEM_PROMPT);
      expect(systemPromptFor('agile')).toContain('Senior Agile Product Manager with deep engineering fluency');
    });

    it('should return the high-signal Technical PRD prompt when template is technical', async () => {
      const { systemPromptFor, TECHNICAL_PRD_SYSTEM_PROMPT } = await import('../lib/ai/prompts/prd');
      expect(systemPromptFor('technical')).toBe(TECHNICAL_PRD_SYSTEM_PROMPT);
      expect(systemPromptFor('technical')).toContain('Principal Systems Architect');
    });

    it('should return the high-signal Lean PRD prompt when template is lean', async () => {
      const { systemPromptFor, LEAN_PRD_SYSTEM_PROMPT } = await import('../lib/ai/prompts/prd');
      expect(systemPromptFor('lean')).toBe(LEAN_PRD_SYSTEM_PROMPT);
      expect(systemPromptFor('lean')).toContain('Lean Startup Product Lead');
    });

    it('should return the high-signal Custom PRD prompt when template is custom', async () => {
      const { systemPromptFor, CUSTOM_PRD_SYSTEM_PROMPT } = await import('../lib/ai/prompts/prd');
      expect(systemPromptFor('custom')).toBe(CUSTOM_PRD_SYSTEM_PROMPT);
      expect(systemPromptFor('custom')).toContain('Custom Technical PM');
    });

    it('should return the high-signal Artix Vibe prompt when target is artix', async () => {
      const { vibeSystemPrompt, ARTIX_VIBE_SYSTEM_PROMPT } = await import('../lib/ai/prompts/vibe');
      expect(vibeSystemPrompt('artix', 'feature')).toContain(ARTIX_VIBE_SYSTEM_PROMPT);
      expect(vibeSystemPrompt('artix', 'feature')).toContain('Senior Full-Stack React & Supabase Lead');
    });

    it('should return the high-signal Cursor Vibe prompt when target is cursor', async () => {
      const { vibeSystemPrompt, CURSOR_VIBE_SYSTEM_PROMPT } = await import('../lib/ai/prompts/vibe');
      expect(vibeSystemPrompt('cursor', 'feature')).toContain(CURSOR_VIBE_SYSTEM_PROMPT);
      expect(vibeSystemPrompt('cursor', 'feature')).toContain('Cursor IDE Prompt Specialist');
    });
  });
});
