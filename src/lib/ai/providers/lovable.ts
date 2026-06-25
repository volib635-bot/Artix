import { supabase } from '@/integrations/supabase/client';
import { AIError, ProviderDef } from '../types';

export const lovableProvider: ProviderDef = {
  id: 'lovable',
  label: 'Lovable AI (built-in, no key)',
  defaultModel: 'google/gemini-3-flash-preview',
  models: [
    { id: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash (default, free trial)' },
    { id: 'google/gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
    { id: 'google/gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite (cheap)' },
    { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { id: 'openai/gpt-5-mini', label: 'GPT-5 mini' },
    { id: 'openai/gpt-5-nano', label: 'GPT-5 nano' },
    { id: 'openai/gpt-5', label: 'GPT-5' },
  ],
  async chat(req, cfg) {
    const messages = [
      ...(req.system ? [{ role: 'system', content: req.system }] : []),
      ...req.messages,
    ];
    const { data, error } = await supabase.functions.invoke('ai-gateway-chat', {
      body: {
        model: cfg.model,
        messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens,
      },
    });
    if (error) {
      const status = (error as any).context?.status as number | undefined;
      throw new AIError(`Lovable AI error: ${error.message}`, {
        status,
        retryable: status === 429 || (status ?? 0) >= 500,
      });
    }
    if (data?.error) {
      throw new AIError(`Lovable AI error: ${typeof data.error === 'string' ? data.error : JSON.stringify(data.error)}`);
    }
    return {
      text: data?.choices?.[0]?.message?.content ?? '',
      provider: 'lovable',
      model: cfg.model,
    };
  },
  async testConnection(cfg) {
    await this.chat(
      { messages: [{ role: 'user', content: "Reply with 'ok'." }], maxTokens: 5 },
      cfg
    );
  },
};
