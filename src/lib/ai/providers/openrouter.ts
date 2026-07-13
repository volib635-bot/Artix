import { AIError, ProviderDef } from '../types';
import { readOpenAICompatibleDeltas } from '../streaming';

const BASE = 'https://openrouter.ai/api/v1/chat/completions';

// Popular free/cheap OpenRouter models. Users can also type any custom id.
export const openrouterProvider: ProviderDef = {
  id: 'openrouter',
  label: 'OpenRouter',
  defaultModel: 'meta-llama/llama-3.3-70b-instruct',
  allowCustomModel: true,
  models: [
    { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct' },
    { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1' },
    { id: 'anthropic/claude-sonnet-5', label: 'Claude Sonnet 5' },
    { id: 'openai/gpt-5.6-sol', label: 'GPT-5.6 Sol' },
    { id: 'google/gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
    { id: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B (free)' },
    { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
    { id: 'openai/gpt-4o-mini', label: 'GPT-4o mini' },
    { id: 'qwen/qwen-2.5-coder-32b-instruct', label: 'Qwen 2.5 Coder 32B' },
  ],
  async chat(req, cfg) {
    const messages = [
      ...(req.system ? [{ role: 'system', content: req.system }] : []),
      ...req.messages,
    ];
    const res = await fetch(BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://artix.ai',
        'X-Title': 'Artix',
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
      throw new AIError(`OpenRouter error: ${errText.slice(0, 200)}`, {
        status: res.status,
        retryable: res.status === 429 || res.status >= 500,
      });
    }
    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content ?? '',
      provider: 'openrouter',
      model: cfg.model,
    };
  },
  async *stream(req, cfg) {
    const messages = [
      ...(req.system ? [{ role: 'system', content: req.system }] : []),
      ...req.messages,
    ];
    const res = await fetch(BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://artix.ai',
        'X-Title': 'Artix',
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
      throw new AIError(`OpenRouter error: ${errText.slice(0, 200)}`, {
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
