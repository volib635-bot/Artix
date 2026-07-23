# Project File Structure — Artix

This document maps out the repository file organization, directory breakdown, and component responsibilities across the Artix codebase.

---

## 📁 Root Directory Layout

```
c:/Fenix-main/
├── DOCS.md                    # Master Consolidated Platform Specification
├── docs/                      # Technical documentation suite
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── CHANGELOG.md
│   ├── UI_UX_GUIDELINES.md
│   ├── PROJECT_FILE_STRUCTURE.md
│   └── CHALLENGES_AND_SOLUTIONS.md
├── public/                    # Static assets & PWA manifest
│   ├── favicon.png
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   ├── robots.txt
│   ├── llms.txt               # AI Web Agent indexing spec (llmstxt.org)
│   └── llms-full.txt          # Full AI Agent technical capabilities spec
├── src/                       # Frontend React Application Source
│   ├── assets/                # App images & branding logos
│   ├── components/            # Reusable UI components & AI Dialogs
│   │   ├── AI/                # PRD, Vibe Coding, Agentic & Arch AI Dialogs
│   │   ├── Editor/            # Monaco Editor & Split-Pane Previewers
│   │   ├── SystemArchitect/   # React Flow Canvas, Auto-Layout & Drawing
│   │   └── ui/                # shadcn/ui component primitives
│   ├── hooks/                 # Custom React hooks (Auth, Docs, Billing)
│   ├── integrations/          # Supabase client initialization
│   ├── lib/                   # Core business logic & utilities
│   │   ├── ai/                # BYOK AI Registry, Storage & Prompt Generators
│   │   └── cache/             # 4-tier Auto-Save caching engines
│   ├── pages/                 # React Router page views
│   ├── test/                  # Vitest unit test suite (77 tests)
│   ├── App.tsx                # App root router & providers
│   ├── index.css              # Global Design System tokens & HSL variables
│   └── main.tsx               # React entrypoint
├── supabase/                  # Database & Cloud Architecture
│   ├── functions/             # Cloud Edge Functions (Stripe Checkout & Webhook)
│   └── migrations/            # PostgreSQL schema migrations & limit triggers
├── tests/                     # Playwright E2E & Security Test Suite
│   └── e2e/                   # E2E test specs (auth, features, security)
├── package.json               # Dependencies, scripts, and package metadata
├── playwright.config.ts       # Playwright multi-browser test configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite build & PWA plugin configuration
└── vitest.config.ts           # Vitest test runner configuration
```

---

## 🔍 Key Module Directory Breakdowns

### `src/lib/ai/` — AI Engine & BYOK Core
- `registry.ts`: Direct browser streaming engine for OpenAI, Anthropic, Gemini, Groq, OpenRouter, and Ollama.
- `storage.ts`: API Key loading, obfuscation (`obf:`), and decryption logic.
- `crypto.ts`: `AES-256-GCM` encryption with `PBKDF2` key derivation.
- `refine.ts`: 2-pass critique engine (`streamRefinement`) purging generic filler words.
- `prompts/prd.ts`: High-signal system prompts for Agile, Technical Spec, Lean MVP, and Custom PRDs.
- `prompts/vibe.ts`: High-signal system prompts for Artix and Cursor Vibe Coding.
- `prompts/architecture.ts`: Cloud Infrastructure and Algorithm visualizer system prompts up to 40 nodes.

### `src/lib/cache/` — Auto-Save Data Resilience
- `debouncedSave.ts`: 1000ms debounced save trigger.
- `saveQueue.ts`: Optimistic locking FIFO queue preventing parallel write collisions.
- `tabCloseGuard.ts`: `navigator.sendBeacon` and `keepalive` fetch unload guard.
- `multiTabSync.ts`: `BroadcastChannel` leader election and remote tab sync.

### `src/components/SystemArchitect/` — Visual Graph Engine
- `SystemArchitect.tsx`: React Flow canvas container with Left-to-Right (`LR`) Dagre auto-layout.
- `ArchitectNode.tsx`: Custom React Flow node component with color accents and icons.
- `AlgorithmNodeTemplates.ts`: Pre-defined node templates for systems and algorithms.
- `DrawingCanvas.tsx`: SVG freehand drawing overlay canvas.

### `supabase/` — Database & Cloud Infrastructure
- `migrations/20260723120000_enforce_tier_limits_trigger.sql`: Free tier quota triggers.
- `migrations/20260723130000_grant_admin_pro_tier.sql`: Admin Pro tier migration.
- `functions/_shared/cors.ts`: Dynamic CORS header utility.
- `functions/create-checkout-session/index.ts`: Stripe Checkout session Edge Function.
- `functions/create-portal-session/index.ts`: Stripe Customer Portal Edge Function.
- `functions/stripe-webhook/index.ts`: Idempotent Stripe Webhook Edge Function.
