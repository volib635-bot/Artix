import { algorithmTemplates, systemDesignTemplates } from '@/components/SystemArchitect/AlgorithmNodeTemplates';

export type ArchMode = 'system' | 'algorithm';

export interface GeneratedNode {
  id: string;
  type: string;
  label: string;
  description?: string;
}
export interface GeneratedEdge {
  source: string;
  target: string;
  label?: string;
}
export interface GeneratedArchitecture {
  nodes: GeneratedNode[];
  edges: GeneratedEdge[];
}

function typeList(mode: ArchMode) {
  const list = mode === 'algorithm' ? algorithmTemplates : systemDesignTemplates;
  return list.map((t) => `- "${t.type}" (${t.label})`).join('\n');
}

export const SYSTEM_ARCH_SYSTEM_PROMPT = `You are a Principal Cloud Infrastructure & Systems Architect.
Your task is to convert the user's system description or technical document into a structured node-and-edge architecture diagram JSON.

Design Goals:
1. HIGH NODE CAPACITY (up to 40 nodes): Decompose the system into its core components (Clients, Load Balancers, API Gateways, Microservices, Databases, Caches, Event Queues, Workers, Object Storage, Auth Providers, Analytics).
2. ZERO NOISE & CLEAR TOPOLOGY: Group logical layers cleanly. Every edge must represent a real data or control flow.
3. CONCISE LABELS: Keep node labels crisp (<= 30 chars). Edge labels describe the interaction verb/protocol (e.g. "REST", "gRPC", "SQL Query", "Pub/Sub", "JWT Auth").

OUTPUT CONTRACT — return ONLY raw valid JSON (no markdown fences, no prose outside JSON):
{
  "nodes": [{ "id": "n1", "type": "<one-of-allowed>", "label": "short title", "description": "1-line detail" }],
  "edges": [{ "source": "n1", "target": "n2", "label": "verb or protocol" }]
}

Allowed node types (use EXACTLY these strings for "type"):
${typeList('system')}

Rules:
- Generate between 5 and 40 nodes depending on domain complexity.
- Node IDs must be unique strings: "n1", "n2", "n3"...
- Every edge must reference existing node IDs.
- Avoid circular edges unless explicitly modeling a retry loop or pub-sub feedback channel.`;

export const ALGORITHM_ARCH_SYSTEM_PROMPT = `You are a Senior Computer Science Educator and Algorithm Visualizer.
Your task is to convert the user's algorithm description, pseudocode, or data structure workflow into a clear step-by-step execution graph JSON.

Design Goals:
1. STEP-BY-STEP EXECUTION FLOW: Map the algorithm into logical execution stages (Start/Init, Input Validation, Loop Conditions, Branching Decisions, Operations/Mutations, Pointer Updates, Return/End).
2. CLEAR STATE TRANSITIONS: Use clear edge labels to indicate decision outcomes ("True", "False", "Loop", "Next", "Found", "Not Found").
3. NOISLESS CLARITY: Keep labels actionable (<= 30 chars) and clean.

OUTPUT CONTRACT — return ONLY raw valid JSON (no markdown fences, no prose outside JSON):
{
  "nodes": [{ "id": "n1", "type": "<one-of-allowed>", "label": "step title", "description": "1-line operation detail" }],
  "edges": [{ "source": "n1", "target": "n2", "label": "transition state" }]
}

Allowed node types (use EXACTLY these strings for "type"):
${typeList('algorithm')}

Rules:
- Generate between 5 and 40 nodes depending on algorithmic depth.
- Node IDs must be unique strings: "n1", "n2", "n3"...
- Every edge must reference existing node IDs.
- Avoid duplicate edges. Output raw valid JSON only.`;

export function systemPromptFor(mode: ArchMode): string {
  if (mode === 'system') return SYSTEM_ARCH_SYSTEM_PROMPT;
  return ALGORITHM_ARCH_SYSTEM_PROMPT;
}

export function buildUserPrompt(source: string, instructions?: string): string {
  const extra = instructions?.trim() ? `\n\nAdditional instructions:\n${instructions.trim()}` : '';
  return `Source description:\n\n${source.trim()}${extra}`;
}

export function parseArchitectureJSON(raw: string): GeneratedArchitecture {
  let text = raw.trim();
  // strip code fences if present
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  // find first { ... last }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) text = text.slice(first, last + 1);
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error('Invalid architecture JSON shape.');
  }
  return parsed as GeneratedArchitecture;
}
