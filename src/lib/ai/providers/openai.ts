import { AIError, ProviderDef } from '../types';
import { readOpenAICompatibleDeltas } from '../streaming';

export const openaiProvider: ProviderDef = {
  id: 'openai',
  label: 'OpenAI',
  defaultModel: 'gpt-4o-mini',
  models: [
    { id: 'gpt-5.6-sol', label: 'GPT-5.6 Sol (Flagship)' },
    { id: 'gpt-5.6-terra', label: 'GPT-5.6 Terra' },
    { id: 'gpt-5.6-luna', label: 'GPT-5.6 Luna' },
    { id: 'gpt-5.4-mini', label: 'GPT-5.4 Mini' },
    { id: 'gpt-4o', label: 'GPT-4o' },
    { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
    { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { id: 'o3-mini', label: 'o3-mini' },
    { id: 'o4-mini', label: 'o4-mini' },
  ],
  async chat(req, cfg) {
    const messages = [
      ...(req.system ? [{ role: 'system', content: req.system }] : []),
      ...req.messages,
    ];
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new AIError(`OpenAI error: ${errText.slice(0, 200)}`, {
        status: res.status,
        retryable: res.status === 429 || res.status >= 500,
      });
    }
    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content ?? '',
      provider: 'openai',
      model: cfg.model,
    };
  },
  async *stream(req, cfg) {
    const messages = [
      ...(req.system ? [{ role: 'system', content: req.system }] : []),
      ...req.messages,
    ];
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens,
        stream: true,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new AIError(`OpenAI error: ${errText.slice(0, 200)}`, {
        status: res.status,
        retryable: res.status === 429 || res.status >= 500,
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
