import { describe, it, expect } from "vitest";
import { PROVIDERS, PROVIDER_LIST, KEYLESS_PROVIDERS, providerNeedsKey } from "../lib/ai/registry";
import { isEncrypted, loadSettings } from "../lib/ai/storage";
import { estimateCost } from "../lib/ai/tokens";
import { VIBE_TARGETS } from "../lib/ai/prompts/vibe";

describe("AI Registry & Storage (Artix Migration)", () => {
  it("should not contain 'lovable' in the provider list or registry", () => {
    // The provider list and registry should not reference the old 'lovable' gateway
    expect(PROVIDERS).not.toHaveProperty("lovable");
    
    const providerIds = PROVIDER_LIST.map(p => p.id);
    expect(providerIds).not.toContain("lovable");
  });

  it("should support the requested self-owned AI providers", () => {
    const expectedProviders = ["openai", "anthropic", "google", "groq", "openrouter", "ollama"];
    
    expectedProviders.forEach(id => {
      expect(PROVIDERS).toHaveProperty(id);
      expect(PROVIDER_LIST.map(p => p.id)).toContain(id);
    });
  });

  it("should verify that only 'ollama' is keyless and all others need API keys", () => {
    // Only local ollama should be keyless now that lovable gateway is removed
    expect(KEYLESS_PROVIDERS).toEqual(["ollama"]);
    
    expect(providerNeedsKey("ollama" as any)).toBe(false);
    expect(providerNeedsKey("openai" as any)).toBe(true);
    expect(providerNeedsKey("anthropic" as any)).toBe(true);
    expect(providerNeedsKey("google" as any)).toBe(true);
    expect(providerNeedsKey("groq" as any)).toBe(true);
    expect(providerNeedsKey("openrouter" as any)).toBe(true);
  });

  it("should not contain 'lovable' cost estimation in tokens/pricing", () => {
    // lovable should be removed from token cost estimate table
    const cost = estimateCost("openai" as any, "gpt-4o", 1000, 1000);
    expect(cost.unit).toBe("usd");

    // lovable as an input provider should throw or default safely
    expect(() => estimateCost("lovable" as any, "default", 1000, 1000)).toThrow();
  });

  it("should use 'artix' instead of 'fenix' in storage keys", () => {
    // LocalStorage keys must reflect the new Artix app branding
    // We check that the keys in storage.ts implementation have changed.
    // Since we don't export KEY/ENC_KEY directly, we verify this indirectly by asserting local storage accesses
    const storageSpy = {
      getItem: localStorage.getItem,
      setItem: localStorage.setItem,
    };
    
    let accessedKeys: string[] = [];
    localStorage.getItem = (key: string) => {
      accessedKeys.push(key);
      return null;
    };

    try {
      isEncrypted();
      loadSettings();
    } finally {
      localStorage.getItem = storageSpy.getItem;
    }

    expect(accessedKeys).toContain("artix.ai.settings.v1");
    expect(accessedKeys).toContain("artix.ai.settings.enc.v1");
    expect(accessedKeys).not.toContain("fenix.ai.settings.v1");
    expect(accessedKeys).not.toContain("fenix.ai.settings.enc.v1");
  });

  it("should have updated or removed Lovable from VibeTargets", () => {
    // The target list for prompt generation should not refer to 'lovable' or should have it updated
    const vibeIds = VIBE_TARGETS.map(t => t.id);
    expect(vibeIds).not.toContain("lovable");
  });
});
