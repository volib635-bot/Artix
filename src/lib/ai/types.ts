export type ProviderId = 'lovable' | 'openai' | 'anthropic' | 'google' | 'groq' | 'openrouter' | 'ollama';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  system?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  provider: ProviderId;
  model: string;
}

export class AIError extends Error {
  status?: number;
  retryable: boolean;
  constructor(message: string, opts?: { status?: number; retryable?: boolean }) {
    super(message);
    this.status = opts?.status;
    this.retryable = opts?.retryable ?? false;
  }
}

export interface ProviderConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface ProviderDef {
  id: ProviderId;
  label: string;
  defaultModel: string;
  models: { id: string; label: string }[];
  /** If true, UI lets user type a custom model id in addition to the preset list. */
  allowCustomModel?: boolean;
  /** If true, UI shows a baseUrl input (e.g. for local Ollama). */
  needsBaseUrl?: boolean;
  defaultBaseUrl?: string;
  chat: (req: AIRequest, cfg: ProviderConfig) => Promise<AIResponse>;
  /** Optional streaming variant. Yields text deltas as they arrive. */
  stream?: (req: AIRequest, cfg: ProviderConfig) => AsyncIterable<string>;
  testConnection: (cfg: ProviderConfig) => Promise<void>;
}

export interface AISettings {
  primary?: { provider: ProviderId; model: string; apiKey: string; baseUrl?: string };
  backup?: { provider: ProviderId; model: string; apiKey: string; baseUrl?: string };
}
