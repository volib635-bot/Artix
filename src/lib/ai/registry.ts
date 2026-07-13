import { openaiProvider } from './providers/openai';
import { anthropicProvider } from './providers/anthropic';
import { googleProvider } from './providers/google';
import { groqProvider } from './providers/groq';
import { openrouterProvider } from './providers/openrouter';
import { ollamaProvider } from './providers/ollama';
import { loadSettings, isEncrypted, isUnlocked } from './storage';
import { AIError, AIRequest, AIResponse, ProviderDef, ProviderId } from './types';

export const PROVIDERS: Record<ProviderId, ProviderDef> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  google: googleProvider,
  groq: groqProvider,
  openrouter: openrouterProvider,
  ollama: ollamaProvider,
};

export const PROVIDER_LIST: ProviderDef[] = [
  openaiProvider,
  anthropicProvider,
  googleProvider,
  groqProvider,
  openrouterProvider,
  ollamaProvider,
];

// Providers that don't need a user-supplied API key (handled server-side or local).
export const KEYLESS_PROVIDERS: ProviderId[] = ['ollama'];

export function providerNeedsKey(id: ProviderId): boolean {
  return !KEYLESS_PROVIDERS.includes(id);
}

export async function callAI(req: AIRequest): Promise<AIResponse> {
  if (isEncrypted() && !isUnlocked()) {
    throw new AIError('AI keys are locked. Open Settings → AI Configuration and unlock.');
  }
  const settings = loadSettings();
  const primary = settings.primary;
  if (!primary || (providerNeedsKey(primary.provider) && !primary.apiKey)) {
    throw new AIError('No AI provider configured. Open Settings → AI Configuration.');
  }


  const tryOne = async (cfg: { provider: ProviderId; model: string; apiKey: string; baseUrl?: string }) => {
    const provider = PROVIDERS[cfg.provider];
    return provider.chat(req, { apiKey: cfg.apiKey, model: cfg.model, baseUrl: cfg.baseUrl });
  };

  try {
    return await tryOne(primary);
  } catch (err) {
    const e = err as AIError;
    const backup = settings.backup;
    const backupReady = backup && (!providerNeedsKey(backup.provider) || !!backup.apiKey);
    if (backupReady && (e.retryable || e.status === 401 || e.status === 404)) {
      try {
        return await tryOne(backup!);
      } catch (err2) {
        const e2 = err2 as AIError;
        throw new AIError(
          `Primary failed (${e.message}). Backup also failed: ${e2.message}`,
          { status: e2.status }
        );
      }
    }
    throw err;
  }
}

/**
 * Streaming variant of {@link callAI}. Yields text deltas as they arrive from
 * the primary provider. If the primary provider does not implement `stream`,
 * falls back to a single non-streaming call and yields the full response once.
 * On stream failure, retries with the backup provider (if any).
 */
export async function* streamAI(req: AIRequest): AsyncGenerator<string> {
  if (isEncrypted() && !isUnlocked()) {
    throw new AIError('AI keys are locked. Open Settings → AI Configuration and unlock.');
  }
  const settings = loadSettings();
  const primary = settings.primary;
  if (!primary || (providerNeedsKey(primary.provider) && !primary.apiKey)) {
    throw new AIError('No AI provider configured. Open Settings → AI Configuration.');
  }

  const tryStream = async function* (cfg: { provider: ProviderId; model: string; apiKey: string; baseUrl?: string }) {
    const provider = PROVIDERS[cfg.provider];
    if (provider.stream) {
      yield* provider.stream(req, { apiKey: cfg.apiKey, model: cfg.model, baseUrl: cfg.baseUrl });
    } else {
      const res = await provider.chat(req, { apiKey: cfg.apiKey, model: cfg.model, baseUrl: cfg.baseUrl });
      if (res.text) yield res.text;
    }
  };

  try {
    yield* tryStream(primary);
  } catch (err) {
    const e = err as AIError;
    const backup = settings.backup;
    const backupReady = backup && (!providerNeedsKey(backup.provider) || !!backup.apiKey);
    if (backupReady && (e.retryable || e.status === 401 || e.status === 404)) {
      yield* tryStream(backup!);
      return;
    }
    throw err;
  }
}
