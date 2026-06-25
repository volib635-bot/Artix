export type ProviderId = 'lovable' | 'openai' | 'anthropic' | 'google' | 'groq';

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
}

export interface ProviderDef {
  id: ProviderId;
  label: string;
  defaultModel: string;
  models: { id: string; label: string }[];
  chat: (req: AIRequest, cfg: ProviderConfig) => Promise<AIResponse>;
  testConnection: (cfg: ProviderConfig) => Promise<void>;
}

export interface AISettings {
  primary?: { provider: ProviderId; model: string; apiKey: string };
  backup?: { provider: ProviderId; model: string; apiKey: string };
}
