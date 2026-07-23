import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Bot, Save, RefreshCw, History, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  AgenticPattern,
  AGENTIC_PATTERNS,
  agenticSystemPrompt,
  buildAgenticUserPrompt,
} from '@/lib/ai/prompts/agentic';
import { streamAI } from '@/lib/ai/registry';
import { AIError } from '@/lib/ai/types';
import { useAISettings } from '@/hooks/useAISettings';
import { useAgenticWorkflows } from '@/hooks/useAgenticWorkflows';
import { useDocuments } from '@/hooks/useDocuments';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { formatDistanceToNow } from 'date-fns';
import { TokenEstimate } from './TokenEstimate';

import { useSystemDesigns } from '@/hooks/useSystemDesigns';
import { streamRefinement } from '@/lib/ai/refine';

interface AgenticWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceTitle: string;
  sourceContent: string;
  sourceDocumentId: string;
  projectId: string;
}

export function AgenticWorkflowDialog({
  open,
  onOpenChange,
  sourceTitle,
  sourceContent,
  sourceDocumentId,
  projectId,
}: AgenticWorkflowDialogProps) {
  const [pattern, setPattern] = useState<AgenticPattern>('orchestrator-workers');
  const [agentCount, setAgentCount] = useState(3);
  const [customInstructions, setCustomInstructions] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isConfigured } = useAISettings();
  const { workflows, createWorkflow } = useAgenticWorkflows(projectId);
  const { documents, createDocument, updateDocument } = useDocuments(projectId);
  const { designs } = useSystemDesigns(projectId);
  const usage = useUsageLimits();

  useEffect(() => {
    if (!open) setOutput('');
  }, [open]);

  const handleGenerate = async () => {
    if (!isConfigured) {
      toast.error('Configure an AI provider in Settings first.');
      return;
    }
    if (!usage.aiGenerations.canCreate) {
      toast.error(`You've used all ${usage.aiGenerations.limit} AI generations this month. Upgrade to Pro for unlimited.`);
      return;
    }
    setIsGenerating(true);
    setOutput('');
    let full = '';
    try {
      const siblingDocs = (documents || [])
        .filter((d) => d.id !== sourceDocumentId)
        .map((d) => ({ title: d.title }));
      const sysDesigns = (designs || []).map((d) => ({ name: d.name }));

      const stream = streamAI({
        system: agenticSystemPrompt(pattern, agentCount),
        messages: [
          {
            role: 'user',
            content: buildAgenticUserPrompt({
              sourceTitle,
              sourceMarkdown: sourceContent,
              customInstructions: customInstructions.trim() || undefined,
              projectContext: {
                siblingDocs,
                systemDesigns: sysDesigns,
              },
            }),
          },
        ],
        temperature: 0.4,
        maxTokens: 4096,
      });
      for await (const delta of stream) {
        full += delta;
        setOutput(full);
      }
      if (full.trim()) {
        try {
          await createWorkflow({
            pattern,
            agent_count: agentCount,
            output_markdown: full,
            source_document_id: sourceDocumentId,
          });
        } catch {
          /* best effort */
        }
      }
    } catch (err) {
      const e = err as AIError;
      toast.error(e.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Workflow copied to clipboard');
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveAsDocument = async () => {
    if (!output.trim()) return;
    setIsSaving(true);
    try {
      const doc = await createDocument(projectId);
      const patternLabel = AGENTIC_PATTERNS.find((p) => p.id === pattern)?.label ?? pattern;
      await updateDocument({
        id: doc.id,
        title: `Workflow (${patternLabel}) — ${sourceTitle || 'Untitled'}`,
        content: output,
        format: 'markdown',
      });
      toast.success('Workflow saved as new document');
      onOpenChange(false);
    } catch {
      toast.error('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefine = async () => {
    if (!output.trim() || isGenerating || isRefining) return;
    setIsRefining(true);
    let full = '';
    try {
      for await (const delta of streamRefinement(output)) {
        full += delta;
        setOutput(full);
      }
      toast.success('Agentic workflow refined & generic filler purged');
    } catch {
      toast.error('Refinement failed');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Agentic Workflow Designer
          </DialogTitle>
          <DialogDescription>
            Design multi-agent architectures, flowcharts, and tool contracts.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="generate" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-fit">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="history">History ({workflows.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="flex-1 flex flex-col gap-4 mt-4 min-h-0">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs">Agent Pattern</Label>
                <Select value={pattern} onValueChange={(v) => setPattern(v as AgenticPattern)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENTIC_PATTERNS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Target Agent Count: {agentCount}</Label>
                <div className="pt-2">
                  <Slider
                    value={[agentCount]}
                    min={1}
                    max={8}
                    step={1}
                    onValueChange={([val]) => setAgentCount(val)}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Custom Focus (optional)</Label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Focus on vector retrieval and tool schema validation"
                  className="h-9 min-h-[36px] py-1 text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button onClick={handleGenerate} disabled={isGenerating || isRefining} className="gap-2">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                Design Workflow
              </Button>
              {output && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleRefine}
                    disabled={isGenerating || isRefining}
                    className="gap-2 border-primary/40 hover:bg-primary/10"
                  >
                    {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4 text-primary" />}
                    Refine & Purge Filler
                  </Button>
                  <Button variant="outline" onClick={handleCopy} className="gap-2">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </>
              )}
              <TokenEstimate
                input={[
                  agenticSystemPrompt(pattern, agentCount),
                  buildAgenticUserPrompt({
                    sourceTitle,
                    sourceMarkdown: sourceContent,
                    customInstructions: customInstructions.trim() || undefined,
                  }),
                ]}
                output={output}
                maxTokens={4096}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
              <div className="flex flex-col gap-2 overflow-hidden">
                <Label className="text-xs uppercase text-muted-foreground">Source</Label>
                <div className="flex-1 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs font-mono whitespace-pre-wrap">
                  {sourceContent || <span className="text-muted-foreground">(empty document)</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2 overflow-hidden">
                <Label className="text-xs uppercase text-muted-foreground">Generated workflow</Label>
                <Textarea
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder={isGenerating ? 'Designing…' : 'Workflow blueprint will appear here.'}
                  className="flex-1 font-mono text-xs resize-none"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-auto mt-4">
            {workflows.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No workflows designed yet for this project.
              </div>
            ) : (
              <div className="space-y-2">
                {workflows.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setOutput(w.output_markdown)}
                    className="w-full text-left p-3 rounded-md border border-border hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {w.pattern} · {w.agent_count} agents
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(w.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {w.output_markdown.slice(0, 200)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSaveAsDocument} disabled={!output.trim() || isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save as new document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
