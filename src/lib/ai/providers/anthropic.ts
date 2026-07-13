import { AIError, ProviderDef } from '../types';
import { readSSELines } from '../streaming';

export const anthropicProvider: ProviderDef = {
  id: 'anthropic',
  label: 'Anthropic',
  defaultModel: 'claude-3-5-haiku-latest',
  models: [
    { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
    { id: 'claude-fable-5', label: 'Claude Fable 5' },
    { id: 'claude-opus-4-8', label: 'Claude Opus 4.8' },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
    { id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku' },
    { id: 'claude-3-opus-latest', label: 'Claude 3 Opus' },
  ],
  async chat(req, cfg) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': cfg.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: req.maxTokens ?? 4096,
        temperature: req.temperature ?? 0.7,
        system: req.system,
        messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new AIError(`Anthropic error: ${errText.slice(0, 200)}`, {
        status: res.status,
        retryable: res.status === 429 || res.status >= 500,
      });
    }
    const data = await res.json();
    const text = (data.content ?? [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');
    return { text, provider: 'anthropic', model: cfg.model };
  },
  async *stream(req, cfg) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': cfg.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: req.maxTokens ?? 4096,
        temperature: req.temperature ?? 0.7,
        system: req.system,
        messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new AIError(`Anthropic error: ${errText.slice(0, 200)}`, {
        status: res.status,
        retryable: res.status === 429 || res.status >= 500,
      });
    }
    for await (const line of readSSELines(res)) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      try {
        const json = JSON.parse(payload);
        if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
          const text = json.delta.text as string;
          if (text) yield text;
        }
      } catch {
        /* ignore */
      }
    }
  },
  async testConnection(cfg) {
    await this.chat(
      { messages: [{ role: 'user', content: "Reply with 'ok'." }], maxTokens: 10 },
      cfg
    );
  },
};
