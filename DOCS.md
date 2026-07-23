# Artix — Complete Platform & Technical Specification

Artix is a modern, unified SaaS platform designed for software engineers, technical product leads, and system architects. It combines multi-format technical documentation, visual system design, algorithm visualization, and high-signal AI prompt engineering into a single high-performance workspace.

---

## Table of Contents
1. [Product Overview & Features](#1-product-overview--features)
2. [System Architecture](#2-system-architecture)
3. [API Reference](#3-api-reference)
4. [Changelog & Release History](#4-changelog--release-history)
5. [UI & UX Guidelines](#5-ui--ux-guidelines)
6. [Project File Structure](#6-project-file-structure)
7. [Engineering Challenges & Technical Solutions](#7-engineering-challenges--technical-solutions)

---

## 1. Product Overview & Features

### Core Capabilities

- **Document Forge**: Multi-format technical editor powered by Monaco Editor supporting Markdown (`.md`), XML (`.xml`), and Plain Text (`.txt`). Features live split-pane rendering, debounced auto-save, multi-tab synchronization, and PDF/HTML/Markdown export capabilities.
- **System Architect**: Interactive visual canvas powered by React Flow (`@xyflow/react`) for designing microservices, cloud infrastructure, and algorithm state machines. Features horizontal Left-to-Right (`LR`) Dagre rank layout with 1-click **Auto Layout** auto-spacing.
- **AI Intelligence Suite**:
  - **PRD Generator**: 4 specialized modes (Agile, Technical Spec, Lean MVP, Custom) powered by senior engineering personas.
  - **Vibe Coding Engine**: Generates surgical, file-precise prompts with relative file actions (`[NEW]`, `[MODIFY]`) for Cursor, Artix, and Generic LLMs.
  - **Agentic Workflow Designer**: Blueprints multi-agent architectures (Sequential, Fan-Out, Orchestrator-Workers, Router, Evaluator, Autonomous ReAct).
  - **Reflection Pass Engine (`refine.ts`)**: 2-pass critique flow that purges generic filler prose ("ensure scalability", "TBD").
- **BYOK Privacy & Security**: Bring-Your-Own-Key model supporting OpenAI, Anthropic, Google Gemini, Groq, OpenRouter, and local Ollama servers. Features client-side `AES-256-GCM` encryption and automated `obf:` key obfuscation.
- **Stripe Billing & Subscriptions**: Integrated Free vs Pro subscription tiers managed via Supabase Cloud Edge Functions and Stripe Checkout/Portal.
- **PWA & Offline First**: Progressive Web App with ServiceWorker precaching and offline local storage persistence.

### Tech Stack
- **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Editor & Canvas**: Monaco Editor (`@monaco-editor/react`), React Flow (`@xyflow/react`), `@dagrejs/dagre`
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security policies and triggers, Auth)
- **Edge Architecture**: Supabase Cloud Edge Functions (Deno / TypeScript)
- **Testing**: Vitest (Unit & Integration), Playwright (E2E & Security Audits)

---

## 2. System Architecture

### High-Level Flow
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

### Subsystems Breakdown

1. **Document Forge & Resilience Subsystem**:
   - Monaco Editor dual-view rendering.
   - 4-Tier Auto-Save strategy: 1000ms Debounce → Optimistic Lock Queue (`saveQueue.ts`) → `sendBeacon` / `keepalive` Unload Guard → `BroadcastChannel` Multi-Tab Sync (`multiTabSync.ts`).

2. **System Architect & Visual Canvas Engine**:
   - React Flow (`@xyflow/react`) canvas supporting custom nodes, curved connectors, double-click label editing, and freehand drawing overlays.
   - Topological Rank-Based Layout Engine (`@dagrejs/dagre`): Left-to-Right (`LR`) layout for System Architect; Top-to-Bottom (`TB`) layout for Algorithm Visualizer. Includes 1-click Auto Layout action.

3. **AI Intelligence & Reflection Engine**:
   - BYOK direct streaming registry (`registry.ts`).
   - High-signal system prompts for PRD, Vibe Coding, and Architecture diagrams.
   - 2-Pass Reflection Critique (`refine.ts`) purging buzzwords and expanding specifications.

4. **Security & Encryption Subsystem**:
   - Automated `obf:` key obfuscation prior to `localStorage` write.
   - Optional `AES-256-GCM` encryption with `PBKDF2` key derivation (100,000 iterations), isolating decrypted keys in volatile JS memory.

5. **Billing & Subscriptions Subsystem**:
   - PostgreSQL limit trigger (`enforce_tier_limits_trigger.sql`) enforcing Free tier limits (3 projects, 10 documents, 3 designs).
   - Cloud Edge Functions handling Stripe Checkout, Customer Portal, and signature-verified webhook idempotency.

---

## 3. API Reference

### Database Tables (Supabase REST API)

- **`public.projects`**: Workspace container (`id`, `user_id`, `name`, `description`). Max 3 for Free users.
- **`public.documents`**: Technical documents (`id`, `project_id`, `title`, `content`, `format`). Max 10 per user on Free tier.
- **`public.system_designs`**: Architecture boards (`id`, `project_id`, `name`, `board_state`). Max 3 for Free users.
- **`public.subscriptions`**: Billing state (`user_id`, `plan_tier`, `status`, `billing_cycle`, `current_period_end`).

### Supabase Edge Functions

- `POST /functions/v1/create-checkout-session`: Generates Stripe Checkout URLs.
- `POST /functions/v1/create-portal-session`: Generates Stripe Customer Portal URLs.
- `POST /functions/v1/stripe-webhook`: Idempotently processes Stripe events (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`).

### AI Provider Integrations (BYOK Direct Client Calls)
- OpenAI (`gpt-4o`, `gpt-4o-mini`)
- Anthropic (`claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`)
- Google Gemini (`gemini-1.5-pro`, `gemini-1.5-flash`)
- Groq (`llama-3.3-70b-versatile`)
- OpenRouter & Local keyless Ollama

---

## 4. Changelog & Release History

### [v1.4.0] — 2026-07-23
- **Clean Hero Layout**: Removed sub-hero format badges for an uncluttered hero section.
- **Lighthouse Agentic Browsing & Accessibility**: Added `/public/llms.txt` and `/public/llms-full.txt` for AI agent web indexing. Added `<main id="main-content">` landmark and explicit `aria-label` tags.

### [v1.3.0] — 2026-07-23
- **System Architect Upgrades**: Switched graph layout to horizontal Left-to-Right (`LR`) Dagre placement. Added 1-click **Auto Layout** button and expanded node capacity to **40 nodes**.

### [v1.2.0] — 2026-07-23
- **High-Signal Prompts & Reflection**: Integrated senior persona prompts for PRD and Vibe Coding (Artix & Cursor targets). Added `refine.ts` 2-pass critique flow.

### [v1.1.0] — 2026-07-23
- **Stripe Billing & Tier Enforcement**: Created Stripe Checkout/Portal/Webhook Edge Functions and PostgreSQL quota triggers.

### [v1.0.0] — 2026-07-22
- **Core Platform**: Rebranding to Artix, 4-tier auto-save engine, BYOK AES-256-GCM encryption, Playwright E2E suite.

---

## 5. UI & UX Guidelines

- **Design System Aesthetic**: Dark Theme SaaS aesthetic with Warm Amber Accents (`hsl(38 92% 50%)`), glassmorphism cards (`backdrop-blur-md`), and dark slate background (`hsl(220 14% 8%)`).
- **Typography**: Inter (Body & UI controls) + JetBrains Mono (Monaco Editor & code blocks).
- **Component Hierarchy**: Primary amber CTAs (`glow-amber`), outline buttons, and icon buttons with explicit `aria-label` tags.
- **Micro-Interactions**: Framer Motion entrance animations and smooth hover transitions.

---

## 6. Project File Structure

```
c:/Fenix-main/
├── DOCS.md                    # Master Consolidated Platform Specification
├── public/                    # PWA assets & llms.txt specs
├── src/
│   ├── assets/                # App branding & logo assets
│   ├── components/            # UI components, AI Dialogs & Monaco Editor
│   ├── hooks/                 # Custom React hooks (Auth, Docs, Billing)
│   ├── lib/                   # BYOK AI Registry, Storage & 4-tier Auto-Save
│   ├── pages/                 # React Router pages (Dashboard, Workspace, Pricing)
│   └── test/                  # Vitest unit test suite (77 tests)
├── supabase/                  # Edge Functions & PostgreSQL Migrations
└── tests/                     # Playwright E2E & Security Test Suite
```

---

## 7. Engineering Challenges & Technical Solutions

1. **Auto-Save Data Loss & Race Conditions** → *Solution*: 4-tier caching engine (Debounce, optimistic lock queue, `sendBeacon`/`keepalive` unload guard, `BroadcastChannel` tab sync).
2. **Plaintext API Key Leakage** → *Solution*: `AES-256-GCM` encryption + automatic `obf:` prefix obfuscation.
3. **Graph Overlapping in System Architect** → *Solution*: Left-to-Right (`LR`) Dagre rank layout engine + 1-click Auto Layout button.
4. **Generic AI Output** → *Solution*: High-signal persona prompts + 2-pass reflection critique engine (`refine.ts`).
5. **Stripe Webhook Forgery & Retries** → *Solution*: Signature verification (`constructEventAsync`) + `stripe_events` idempotency table.
6. **Lighthouse Agentic Browsing Audits** → *Solution*: `public/llms.txt` & `public/llms-full.txt` implementation + W3C accessibility landmarks.
