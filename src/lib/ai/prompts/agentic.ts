export type AgenticPattern =
  | 'sequential'
  | 'parallel'
  | 'orchestrator-workers'
  | 'router'
  | 'evaluator-optimizer'
  | 'autonomous';

export const AGENTIC_PATTERNS: { id: AgenticPattern; label: string; description: string }[] = [
  { id: 'sequential', label: 'Sequential (Pipeline)', description: 'Each agent transforms the previous output in order.' },
  { id: 'parallel', label: 'Parallel (Fan-out / Aggregate)', description: 'Agents work concurrently; an aggregator merges results.' },
  { id: 'orchestrator-workers', label: 'Orchestrator + Workers', description: 'A planner agent dispatches subtasks to specialized workers.' },
  { id: 'router', label: 'Router / Dispatcher', description: 'A classifier routes the request to the right specialist.' },
  { id: 'evaluator-optimizer', label: 'Evaluator → Optimizer', description: 'Generator + critic loop until quality threshold is met.' },
  { id: 'autonomous', label: 'Autonomous Loop', description: 'Single agent with tools and a stop condition; ReAct-style.' },
];

const PATTERN_GUIDANCE: Record<AgenticPattern, string> = {
  sequential: 'Define an ordered pipeline. For each step list: agent name, role, input contract, output contract, prompt, model, tools.',
  parallel: 'Define independent worker agents that run concurrently plus one aggregator. Specify how outputs are merged and conflicts resolved.',
  'orchestrator-workers': 'Define a planner that decomposes tasks and a set of worker specialists. Include the planner prompt, the worker registry, and the routing/decision logic.',
  router: 'Define a classifier with a closed set of routes. List each downstream specialist, its trigger conditions, and a fallback.',
  'evaluator-optimizer': 'Define a generator agent and an evaluator/critic agent. Specify the scoring rubric, the revision instructions, and the stop condition (score threshold or max iterations).',
  autonomous: 'Define a single agent loop with tools. Specify the system prompt, available tools (name, description, JSON schema), the stop condition, and guardrails against runaway loops.',
};

const OUTPUT_CONTRACT = `Output a single Markdown document with these H2 sections in order:

## Goal
## Pattern & Rationale
## Agent Roster
## Workflow Diagram
## Per-Agent Specifications
## Tools & Integrations
## Data & State Flow
## Guardrails & Stop Conditions
## Evaluation Strategy
## Implementation Notes

Rules:
- For "Workflow Diagram", emit a Mermaid flowchart inside a \`\`\`mermaid fence.
- For each agent in "Per-Agent Specifications", include: Role, Inputs, Outputs, System Prompt (fenced), Model recommendation, Tools used, Failure handling.
- For tools, give name, purpose, and a JSON Schema input contract in a fenced \`\`\`json block.
- Mark unverified assumptions inline as "> Assumption: …".
- Do not wrap the entire response in a single outer code fence.`;

export function agenticSystemPrompt(pattern: AgenticPattern, agentCount: number): string {
  return `You are a senior AI systems architect who designs production-ready agentic workflows.
Pattern selected: ${pattern}.
Target agent count: approximately ${agentCount} (adjust if the task clearly needs fewer or more, and explain why).
${PATTERN_GUIDANCE[pattern]}

${OUTPUT_CONTRACT}`;
}

export function buildAgenticUserPrompt(args: {
  sourceTitle: string;
  sourceMarkdown: string;
  customInstructions?: string;
}): string {
  const { sourceTitle, sourceMarkdown, customInstructions } = args;
  const trimmed =
    sourceMarkdown.length > 12000
      ? sourceMarkdown.slice(0, 12000) + '\n\n[... source truncated for length ...]'
      : sourceMarkdown;
  return `Source document title: ${sourceTitle || 'Untitled'}

Source content:
"""
${trimmed}
"""

${customInstructions ? `Additional instructions from the user:\n${customInstructions}\n\n` : ''}Design the agentic workflow now.`;
}
