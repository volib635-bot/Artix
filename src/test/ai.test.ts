import { describe, it, expect, vi } from "vitest";
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

  it("should use 'artix' instead of 'fenix' in storage keys and migrate legacy settings", () => {
    localStorage.clear();

    // 1. Assert that saving/loading settings writes to the new 'artix.ai.settings.v1' key
    const testSettings = { primary: { provider: "openai" as any, model: "gpt-4o", apiKey: "test-key" } };
    localStorage.setItem("artix.ai.settings.v1", JSON.stringify(testSettings));

    const loaded = loadSettings();
    expect(loaded).toEqual(testSettings);

    // 2. Assert migration from legacy 'fenix.ai.settings.v1' key
    localStorage.clear();
    localStorage.setItem("fenix.ai.settings.v1", JSON.stringify(testSettings));
    
    const loadedMigrated = loadSettings();
    expect(loadedMigrated).toEqual(testSettings);
    expect(localStorage.getItem("artix.ai.settings.v1")).toBe(JSON.stringify(testSettings));
    expect(localStorage.getItem("fenix.ai.settings.v1")).toBeNull();
  });

  it("should have updated or removed Lovable from VibeTargets", () => {
    // The target list for prompt generation should not refer to 'lovable' or should have it updated
    const vibeIds = VIBE_TARGETS.map(t => t.id);
    expect(vibeIds).not.toContain("lovable");
  });
});
