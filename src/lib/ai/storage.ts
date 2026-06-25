import { AISettings } from './types';

const KEY = 'fenix.ai.settings.v1';

export function loadSettings(): AISettings {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AISettings;
  } catch {
    return {};
  }
}

export function saveSettings(settings: AISettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent('fenix-ai-settings-changed'));
}

export function clearSettings(): void {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent('fenix-ai-settings-changed'));
}

export function hasPrimaryProvider(s: AISettings = loadSettings()): boolean {
  if (!s.primary?.provider || !s.primary.model) return false;
  // Lovable provider doesn't need a user API key (handled server-side).
  if (s.primary.provider === 'lovable') return true;
  return !!s.primary.apiKey;
}
