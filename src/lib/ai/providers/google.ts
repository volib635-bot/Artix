import { AIError, ProviderDef } from '../types';
import { readSSELines } from '../streaming';

export const googleProvider: ProviderDef = {
  id: 'google',
  label: 'Google Gemini',
  defaultModel: 'gemini-3.5-flash',
  models: [
    { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
    { id: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro' },
    { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
  async chat(req, cfg) {
    const contents = req.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const body: any = {
      contents,
      generationConfig: {
        temperature: req.temperature ?? 0.7,
        maxOutputTokens: req.maxTokens,
      },
    };
    if (req.system) {
      body.systemInstruction = { parts: [{ text: req.system }] };
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      cfg.model
    )}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new AIError(`Google error: ${errText.slice(0, 200)}`, {
        status: res.status,
        retryable: res.status === 429 || res.status >= 500,
      });
    }
    const data = await res.json();
    const text =
      data.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? '';
    return { text, provider: 'google', model: cfg.model };
  },
  async *stream(req, cfg) {
    const contents = req.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const body: any = {
      contents,
      generationConfig: {
        temperature: req.temperature ?? 0.7,
        maxOutputTokens: req.maxTokens,
      },
    };
    if (req.system) {
      body.systemInstruction = { parts: [{ text: req.system }] };
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      cfg.model
    )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(cfg.apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new AIError(`Google error: ${errText.slice(0, 200)}`, {
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
        const parts = json?.candidates?.[0]?.content?.parts ?? [];
        for (const p of parts) {
          if (typeof p.text === 'string' && p.text) yield p.text;
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
