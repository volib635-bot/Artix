import { AIError, ProviderDef } from '../types';
import { readOpenAICompatibleDeltas } from '../streaming';

const DEFAULT_BASE = 'http://localhost:11434';

function endpoint(cfg: { baseUrl?: string }): string {
  const base = (cfg.baseUrl || DEFAULT_BASE).replace(/\/+$/, '');
  return `${base}/v1/chat/completions`;
}

// Ollama runs locally. No API key required. Uses its OpenAI-compatible endpoint.
export const ollamaProvider: ProviderDef = {
  id: 'ollama',
  label: 'Ollama (local, no key)',
  defaultModel: 'llama3.2',
  allowCustomModel: true,
  needsBaseUrl: true,
  defaultBaseUrl: DEFAULT_BASE,
  models: [
    { id: 'llama3.2', label: 'Llama 3.2' },
    { id: 'llama3.1', label: 'Llama 3.1' },
    { id: 'llama3.1:8b', label: 'Llama 3.1 8B' },
    { id: 'qwen2.5-coder', label: 'Qwen 2.5 Coder' },
    { id: 'qwen2.5', label: 'Qwen 2.5' },
    { id: 'mistral', label: 'Mistral' },
    { id: 'phi3', label: 'Phi-3' },
    { id: 'gemma2', label: 'Gemma 2' },
    { id: 'deepseek-r1', label: 'DeepSeek R1' },
  ],
  async chat(req, cfg) {
    const messages = [
      ...(req.system ? [{ role: 'system', content: req.system }] : []),
      ...req.messages,
    ];
    let res: Response;
    try {
      res = await fetch(endpoint(cfg), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cfg.model,
          messages,
          temperature: req.temperature ?? 0.7,
          max_tokens: req.maxTokens,
        }),
      });
    } catch (err) {
      throw new AIError(
        `Ollama not reachable at ${cfg.baseUrl || DEFAULT_BASE}. Start it with 'ollama serve' and allow CORS (OLLAMA_ORIGINS=*).`,
        { retryable: false }
      );
    }
    if (!res.ok) {
      const errText = await res.text();
      throw new AIError(`Ollama error: ${errText.slice(0, 200)}`, {
        status: res.status,
        retryable: res.status >= 500,
      });
    }
    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content ?? '',
      provider: 'ollama',
      model: cfg.model,
    };
  },
  async *stream(req, cfg) {
    const messages = [
      ...(req.system ? [{ role: 'system', content: req.system }] : []),
      ...req.messages,
    ];
    let res: Response;
    try {
      res = await fetch(endpoint(cfg), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cfg.model,
          messages,
          temperature: req.temperature ?? 0.7,
          max_tokens: req.maxTokens,
          stream: true,
        }),
      });
    } catch (err) {
      throw new AIError(
        `Ollama not reachable at ${cfg.baseUrl || DEFAULT_BASE}. Start it with 'ollama serve' and allow CORS (OLLAMA_ORIGINS=*).`,
        { retryable: false }
      );
    }
    if (!res.ok) {
      const errText = await res.text();
      throw new AIError(`Ollama error: ${errText.slice(0, 200)}`, {
        status: res.status,
        retryable: res.status >= 500,
      });
    }
    yield* readOpenAICompatibleDeltas(res);
  },
  async testConnection(cfg) {
    await this.chat(
      { messages: [{ role: 'user', content: "Reply with 'ok'." }], maxTokens: 5 },
      cfg
    );
  },
};
