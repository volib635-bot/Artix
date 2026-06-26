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

export function systemPromptFor(mode: ArchMode): string {
  return `You are an expert ${mode === 'algorithm' ? 'algorithm visualizer' : 'system architect'}. Convert the user's description into a node-and-edge graph.

OUTPUT CONTRACT — return ONLY raw JSON (no markdown fences, no prose) matching:
{
  "nodes": [{ "id": "n1", "type": "<one-of-allowed>", "label": "short name", "description": "optional 1-line note" }],
  "edges": [{ "source": "n1", "target": "n2", "label": "optional relation" }]
}

Allowed node types (use exactly these strings for "type"):
${typeList(mode)}

Rules:
- 4–20 nodes. Choose types that best match each concept; fall back to "custom" only if nothing fits.
- IDs must be stable and unique strings like "n1", "n2"…
- Every edge must reference existing node ids.
- Keep labels concise (≤ 30 chars). Edge labels describe the relation (e.g. "reads", "REST", "publishes").
- No duplicate edges. No self-loops unless the concept truly requires it.
- Output JSON only. No explanation.`;
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
