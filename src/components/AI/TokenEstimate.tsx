import { useMemo } from 'react';
import { Coins } from 'lucide-react';
import { useAISettings } from '@/hooks/useAISettings';
import {
  estimateMessagesTokens,
  estimateTokens,
  estimateCost,
  formatCost,
} from '@/lib/ai/tokens';

interface Props {
  /** Input strings to count as prompt (system + user). */
  input: (string | undefined | null)[];
  /** Output text (if a generation has completed). */
  output?: string;
  /** Cap requested via maxTokens — used as a ceiling before a real output exists. */
  maxTokens?: number;
}

/**
 * Small badge shown next to Generate buttons that estimates input/output
 * tokens and cost for the currently configured AI provider.
 */
export function TokenEstimate({ input, output, maxTokens }: Props) {
  const { settings } = useAISettings();
  const primary = settings.primary;

  const inputTokens = useMemo(() => estimateMessagesTokens(input), [input]);
  const outputTokens = useMemo(() => {
    if (output && output.length > 0) return estimateTokens(output);
    return maxTokens ?? 0;
  }, [output, maxTokens]);

  if (!primary) return null;

  const cost = estimateCost(primary.provider, primary.model, inputTokens, outputTokens);
  const isEstimate = !output;

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground"
      title={
        isEstimate
          ? `Estimated: ${inputTokens} input tokens, up to ${outputTokens} output tokens`
          : `Actual estimate: ${inputTokens} input tokens, ${outputTokens} output tokens`
      }
    >
      <Coins className="h-3 w-3" />
      <span className="font-mono">
        {isEstimate ? '~' : ''}
        {inputTokens.toLocaleString()} in
        {' · '}
        {isEstimate ? '≤' : ''}
        {outputTokens.toLocaleString()} out
      </span>
      <span className="text-muted-foreground/70">·</span>
      <span className="font-mono">{formatCost(cost)}</span>
    </div>
  );
}
