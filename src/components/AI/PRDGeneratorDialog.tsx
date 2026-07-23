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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Sparkles, Save, RefreshCw, History } from 'lucide-react';
import { toast } from 'sonner';
import { PRDTemplate, PRD_TEMPLATES, systemPromptFor, buildUserPrompt } from '@/lib/ai/prompts/prd';
import { streamAI } from '@/lib/ai/registry';
import { AIError } from '@/lib/ai/types';
import { useAISettings } from '@/hooks/useAISettings';
import { usePRDGenerations } from '@/hooks/usePRDGenerations';
import { useDocuments } from '@/hooks/useDocuments';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { formatDistanceToNow } from 'date-fns';
import { TokenEstimate } from './TokenEstimate';

import { useSystemDesigns } from '@/hooks/useSystemDesigns';
import { streamRefinement } from '@/lib/ai/refine';

interface PRDGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceTitle: string;
  sourceContent: string;
  sourceDocumentId: string;
  projectId: string;
}

export function PRDGeneratorDialog({
  open,
  onOpenChange,
  sourceTitle,
  sourceContent,
  sourceDocumentId,
  projectId,
}: PRDGeneratorDialogProps) {
  const [template, setTemplate] = useState<PRDTemplate>('agile');
  const [customInstructions, setCustomInstructions] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isConfigured } = useAISettings();
  const { generations, createGeneration } = usePRDGenerations(projectId);
  const { documents, createDocument, updateDocument } = useDocuments(projectId);
  const { designs } = useSystemDesigns(projectId);
  const usage = useUsageLimits();

  useEffect(() => {
    if (!open) {
      setOutput('');
    }
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
        system: systemPromptFor(template),
        messages: [
          {
            role: 'user',
            content: buildUserPrompt({
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
          await createGeneration({
            template,
            output_markdown: full,
            source_document_id: sourceDocumentId,
          });
        } catch {
          /* history is best-effort */
        }
      }
    } catch (err) {
      const e = err as AIError;
      toast.error(e.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsDocument = async () => {
    if (!output.trim()) return;
    setIsSaving(true);
    try {
      const doc = await createDocument(projectId);
      await updateDocument({
        id: doc.id,
        title: `PRD — ${sourceTitle || 'Untitled'}`,
        content: output,
        format: 'markdown',
      });
      toast.success('PRD saved as new document');
      onOpenChange(false);
    } catch {
      toast.error('Failed to save PRD');
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
      toast.success('PRD refined & generic filler purged');
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
            <Sparkles className="h-5 w-5 text-primary" />
            PRD Generator
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive Product Requirements Document from your document.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="generate" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-fit">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="history">History ({generations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="flex-1 flex flex-col gap-4 mt-4 min-h-0">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">PRD Template</Label>
                <Select value={template} onValueChange={(v) => setTemplate(v as PRDTemplate)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRD_TEMPLATES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Custom Focus (optional)</Label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Focus on enterprise security and scalability"
                  className="h-9 min-h-[36px] py-1 text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button onClick={handleGenerate} disabled={isGenerating || isRefining} className="gap-2">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate PRD
              </Button>
              {output && (
                <Button
                  variant="outline"
                  onClick={handleRefine}
                  disabled={isGenerating || isRefining}
                  className="gap-2 border-primary/40 hover:bg-primary/10"
                >
                  {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                  Refine & Purge Filler
                </Button>
              )}
              <TokenEstimate
                input={[
                  systemPromptFor(template),
                  buildUserPrompt({
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
                <Label className="text-xs uppercase text-muted-foreground">Generated PRD</Label>
                <Textarea
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder={isGenerating ? 'Generating…' : 'PRD output will appear here.'}
                  className="flex-1 font-mono text-xs resize-none"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-auto mt-4">
            {generations.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No PRDs generated yet for this project.
              </div>
            ) : (
              <div className="space-y-2">
                {generations.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setOutput(g.output_markdown)}
                    className="w-full text-left p-3 rounded-md border border-border hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{g.template}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(g.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {g.output_markdown.slice(0, 200)}
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
