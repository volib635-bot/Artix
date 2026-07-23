import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { callAI } from '@/lib/ai/registry';
import {
  ArchMode,
  buildUserPrompt,
  GeneratedArchitecture,
  parseArchitectureJSON,
  systemPromptFor,
} from '@/lib/ai/prompts/architecture';
import { useAISettings } from '@/hooks/useAISettings';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { algorithmTemplates, systemDesignTemplates } from '@/components/SystemArchitect/AlgorithmNodeTemplates';
import { BoardState } from '@/hooks/useSystemDesigns';

interface DocLite {
  id: string;
  title: string;
  content: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ArchMode;
  documents?: DocLite[];
  onApply: (boardState: BoardState) => void;
}

export function ArchitectureGeneratorDialog({
  open,
  onOpenChange,
  mode,
  documents = [],
  onApply,
}: Props) {
  const { isConfigured } = useAISettings();
  const usage = useUsageLimits();
  const [docId, setDocId] = useState<string>('none');
  const [text, setText] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedArchitecture | null>(null);

  const templateByType = useMemo(() => {
    const map = new Map<string, { icon: string; color: string }>();
    [...systemDesignTemplates, ...algorithmTemplates].forEach((t) => {
      map.set(t.type, { icon: t.icon, color: t.color });
    });
    return map;
  }, []);

  const source = useMemo(() => {
    if (docId !== 'none') {
      const d = documents.find((x) => x.id === docId);
      return d?.content ?? '';
    }
    return text;
  }, [docId, documents, text]);

  const handleGenerate = async () => {
    if (!isConfigured) {
      toast.error('Configure AI in Settings first.');
      return;
    }
    if (!usage.aiGenerations.canCreate) {
      toast.error(`You've used all ${usage.aiGenerations.limit} AI generations this month. Upgrade to Pro for unlimited.`);
      return;
    }
    if (!source.trim()) {
      toast.error('Provide a description or pick a document.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await callAI({
        system: systemPromptFor(mode),
        messages: [{ role: 'user', content: buildUserPrompt(source, instructions) }],
        temperature: 0.3,
        maxTokens: 4096,
      });
      const parsed = parseArchitectureJSON(res.text);
      setResult(parsed);
      toast.success(`Generated ${parsed.nodes.length} nodes, ${parsed.edges.length} edges`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    
    // Topological rank-based layout for zero overlapping and clean visual hierarchy
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();
    result.nodes.forEach((n) => {
      inDegree.set(n.id, 0);
      graph.set(n.id, []);
    });
    result.edges.forEach((e) => {
      if (inDegree.has(e.target)) {
        inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      }
      if (graph.has(e.source)) {
        graph.get(e.source)!.push(e.target);
      }
    });

    // Compute ranks using BFS
    const ranks = new Map<string, number>();
    const queue: string[] = [];
    result.nodes.forEach((n) => {
      if ((inDegree.get(n.id) || 0) === 0) {
        ranks.set(n.id, 0);
        queue.push(n.id);
      }
    });
    if (queue.length === 0 && result.nodes.length > 0) {
      ranks.set(result.nodes[0].id, 0);
      queue.push(result.nodes[0].id);
    }
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const currRank = ranks.get(curr) || 0;
      const neighbors = graph.get(curr) || [];
      for (const next of neighbors) {
        if (!ranks.has(next) || ranks.get(next)! < currRank + 1) {
          ranks.set(next, currRank + 1);
          queue.push(next);
        }
      }
    }

    // Group nodes by rank
    const nodesByRank = new Map<number, typeof result.nodes>();
    result.nodes.forEach((n) => {
      const r = ranks.get(n.id) || 0;
      if (!nodesByRank.has(r)) nodesByRank.set(r, []);
      nodesByRank.get(r)!.push(n);
    });

    const gapX = 280;
    const gapY = 160;
    const fallback = mode === 'algorithm' ? 'variable' : 'custom';

    const formattedNodes: BoardState['nodes'] = [];
    nodesByRank.forEach((nodesInRank, rank) => {
      nodesInRank.forEach((n, idx) => {
        const known = templateByType.has(n.type);
        formattedNodes.push({
          id: n.id,
          type: known ? n.type : fallback,
          position: {
            x: 100 + rank * gapX,
            y: 100 + idx * gapY,
          },
          data: { label: n.label, description: n.description },
        });
      });
    });

    const board: BoardState = {
      nodes: formattedNodes,
      edges: result.edges
        .filter((e) => e.source !== e.target || true)
        .map((e, i) => ({
          id: `edge-ai-${i}-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          label: e.label,
        })),
    };
    onApply(board);
    onOpenChange(false);
    setResult(null);
    setText('');
    setInstructions('');
    setDocId('none');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Auto-Generate {mode === 'algorithm' ? 'Algorithm' : 'System'} Diagram
          </DialogTitle>
          <DialogDescription>
            Describe the {mode === 'algorithm' ? 'algorithm' : 'system'} or pick a document. AI will build nodes and connections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {documents.length > 0 && (
            <div className="space-y-2">
              <Label>Source document (optional)</Label>
              <Select value={docId} onValueChange={setDocId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Use description below —</SelectItem>
                  {documents.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {docId === 'none' && (
            <div className="space-y-2">
              <Label htmlFor="arch-desc">Description</Label>
              <Textarea
                id="arch-desc"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  mode === 'algorithm'
                    ? 'e.g. Binary search on a sorted array with low/high pointers and a mid comparator.'
                    : 'e.g. A web app with React frontend, Node API gateway, Postgres database, Redis cache, and S3 storage.'
                }
                rows={5}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="arch-instr">Extra instructions (optional)</Label>
            <Textarea
              id="arch-instr"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. emphasize data flow, include a CDN, keep under 10 nodes…"
              rows={2}
            />
          </div>

          {result && (
            <div className="rounded-lg border border-border bg-card/50 p-3 text-sm">
              <div className="font-medium mb-2">
                Preview: {result.nodes.length} nodes • {result.edges.length} edges
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-auto">
                {result.nodes.map((n) => (
                  <span
                    key={n.id}
                    className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs"
                    title={n.description}
                  >
                    {n.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={loading} variant={result ? 'outline' : 'default'}>
            {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
            {result ? 'Regenerate' : 'Generate'}
          </Button>
          {result && (
            <Button onClick={handleApply}>
              Add to canvas
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
