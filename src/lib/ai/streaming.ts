// Shared Server-Sent Events line parser for OpenAI-compatible streams
// (OpenAI, Groq, Lovable gateway) and delta extractors for others.

export async function* readSSELines(res: Response): AsyncGenerator<string> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, idx).replace(/\r$/, '');
        buf = buf.slice(idx + 1);
        if (line) yield line;
      }
    }
    if (buf.trim()) yield buf;
  } finally {
    reader.releaseLock();
  }
}

/** Parse `data: {...}` lines from an OpenAI-compatible SSE stream. */
export async function* readOpenAICompatibleDeltas(res: Response): AsyncGenerator<string> {
  for await (const line of readSSELines(res)) {
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    try {
      const json = JSON.parse(payload);
      const delta = json?.choices?.[0]?.delta?.content;
      if (typeof delta === 'string' && delta.length > 0) yield delta;
    } catch {
      /* ignore malformed chunk */
    }
  }
}
