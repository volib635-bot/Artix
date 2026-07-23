# System Architecture — Artix

This document details the architectural design, component interactions, data persistence models, and security boundary decisions governing Artix.

---

## 🏗️ High-Level System Architecture

```
[ Browser / Client ]
  │
  ├──► Local Storage Cache (AES-256-GCM / obf: Obfuscation)
  ├──► Monaco Editor & React Flow Canvas Engine
  │
  ├──► Supabase Client (Auth & Postgres RLS Tables)
  │      ├── public.projects
  │      ├── public.documents
  │      ├── public.system_designs
  │      └── public.subscriptions
  │
  ├──► Supabase Edge Functions (Deno Runtime)
  │      ├── create-checkout-session (Stripe Checkout)
  │      ├── create-portal-session (Stripe Customer Portal)
  │      └── stripe-webhook (Idempotent Webhook Handler)
  │
  └──► Self-Owned AI APIs (OpenAI / Anthropic / Gemini / Groq / Ollama)
```

---

## 🧱 Core Subsystems

### 1. Document Forge & Resilience Subsystem
- **Monaco Editor Integration**: Embedded Monaco editor with dual-view synchronized Markdown and XML previewers.
- **4-Tier Auto-Save Strategy**:
  1. *Debounced Storage*: 1000ms debounced save trigger (`debouncedSave.ts`).
  2. *Optimistic Lock Queue*: Version-tracked FIFO queue preventing parallel write collisions (`saveQueue.ts`).
  3. *Unload Guard*: Flush via `navigator.sendBeacon` or `fetch({ keepalive: true })` on `beforeunload` (`tabCloseGuard.ts`).
  4. *Multi-Tab Synchronization*: `BroadcastChannel` leader election and remote state update broadcasting (`multiTabSync.ts`).

### 2. System Architect & Visual Canvas Engine
- **React Flow (`@xyflow/react`)**: Node-and-edge graph canvas supporting drag-and-drop, node creation, double-click label editing, and freehand drawing overlays.
- **Topological Rank-Based Layout Engine (`@dagrejs/dagre`)**:
  - System Architect diagrams use **Horizontal Left-to-Right (`LR`) Dagre placement**, directing data flow from Ingress/Clients on the Left (`Position.Right`) → API Gateways → Microservices → Databases on the Right (`Position.Left`).
  - Algorithm diagrams use **Top-to-Bottom (`TB`) state transition placement**.
  - Includes a 1-click **Auto Layout** toolbar action to re-arrange graph nodes with zero overlap.

### 3. AI Intelligence & Reflection Engine
- **BYOK Streaming Registry (`registry.ts`)**: Direct browser-to-provider streaming client supporting OpenAI, Anthropic, Gemini, Groq, OpenRouter, and local keyless Ollama servers.
- **High-Signal Prompts**:
  - *PRD*: Agile, Technical Spec, Lean MVP, Custom PM personas.
  - *Vibe Coding*: Artix Stack Lead and Cursor IDE Specialist personas enforcing relative paths (`[NEW]`, `[MODIFY]`) and mandatory verification commands (`npx tsc --noEmit`).
  - *Architecture*: Cloud Infrastructure and Algorithm visualizer personas up to 40 nodes.
- **Reflection Pass (`refine.ts`)**: 2-pass critique flow that scans generated drafts to purge filler prose ("ensure scalability", "TBD", "sprint 1") and expand concrete specifications.

### 4. Security & Encryption Subsystem
- **Key Obfuscation (`storage.ts`)**: Stored API keys are automatically obfuscated with the `obf:` prefix prior to writing to `localStorage`.
- **Passphrase Encryption (`crypto.ts`)**: Optional `AES-256-GCM` encryption with `PBKDF2` key derivation (100,000 iterations). When enabled, un-encrypted keys remain strictly in RAM during an active session and are locked upon page refresh.

### 5. Billing & Subscription Tier Subsystem
- **Database Limits Trigger**: PostgreSQL trigger (`enforce_tier_limits_trigger.sql`) enforcing Free tier quotas (3 projects, 10 documents, 3 system designs). Pro users bypass limits.
- **Stripe Edge Functions**:
  - `create-checkout-session`: Creates Stripe Checkout sessions with customer metadata.
  - `create-portal-session`: Generates Stripe Customer Portal URLs.
  - `stripe-webhook`: Verifies raw signature (`constructEventAsync`) and logs event IDs to `stripe_events` table for idempotency.
