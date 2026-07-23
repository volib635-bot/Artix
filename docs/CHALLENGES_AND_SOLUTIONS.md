# Challenges Faced & Technical Solutions — Artix

This document logs the major engineering challenges, edge cases, security vulnerabilities, and UX bottlenecks encountered during the development of Artix, along with their implemented technical solutions.

---

## 🛑 Challenge 1: Auto-Save Data Loss & Race Conditions

### Problem
When users typed rapidly in the Monaco editor or made quick edits on the System Architect canvas, rapid auto-save requests fired concurrently. This caused out-of-order database writes (stale content overwriting newer content) and lost unsaved edits when closing browser tabs.

### Technical Solution
Implemented a robust **4-Tier Auto-Save & Data Resilience Engine**:
1. **Debounce Engine (`debouncedSave.ts`)**: 1000ms debounce trigger to batch keystrokes.
2. **Optimistic Locking Queue (`saveQueue.ts`)**: Monotonically increasing version counter (`version`). Concurrent save requests are queued into a serial FIFO queue so that write operations never run in parallel. Stale versions are automatically rejected.
3. **Unload Protection (`tabCloseGuard.ts`)**: Added `beforeunload` event handlers that flush pending drafts using `navigator.sendBeacon` or fallback `fetch({ keepalive: true })`.
4. **Multi-Tab Sync (`multiTabSync.ts`)**: Used `BroadcastChannel` with leader election so only 1 tab issues network saves, while secondary tabs update their UI via remote broadcast messages.

---

## 🛑 Challenge 2: Plaintext API Key Leakage & Forgotten Passphrase Recovery

### Problem
Artix operates on a Bring-Your-Own-Key (BYOK) architecture. Storing raw API keys in plaintext inside browser `localStorage` created a security risk. Furthermore, zero-knowledge encryption locked users out if they forgot their passphrase.

### Technical Solution
Implemented **Client-Side Encryption & Reset Vault Recovery (`storage.ts` & `crypto.ts`)**:
1. **Automated Obfuscation**: All stored keys are automatically obfuscated with the `obf:` prefix prior to writing to `localStorage`.
2. **AES-256-GCM Encryption**: Users can enable Passphrase Encryption. Keys are encrypted using `AES-256-GCM` with a 100,000-iteration `PBKDF2` derived key. Decrypted keys reside strictly in volatile JS memory.
3. **Reset Key Vault Action**: Added a **Reset Key Vault** trigger to the locked encryption panel in `AISettingsCard.tsx`, allowing users to safely purge the encrypted blob and enter fresh API keys without DevTools intervention.

---

## 🛑 Challenge 3: Node Overlapping & Visual Clutter in System Architect

### Problem
Auto-generating system architecture diagrams with 15–40 nodes using naive square-root grid placement caused horizontal connection lines to cut directly through sibling node boxes, obscuring text labels and creating visual noise.

### Technical Solution
Upgraded the graph rendering pipeline with a **Topological Rank-Based Layout Engine (`@dagrejs/dagre`)**:
1. **Horizontal Architecture Flow (`LR`)**: Set `rankdir: 'LR'` for System Architect diagrams. Connections route cleanly from Clients on the Left (`Position.Right`) → API Gateways → Microservices → Databases on the Right (`Position.Left`).
2. **Generous Spacing Standards**: Configured `ranksep: 200` and `nodesep: 110` with rounded smoothstep connectors (`borderRadius: 16`).
3. **1-Click Auto Layout Toolbar Action**: Added an **Auto Layout** button on the canvas toolbar so users can instantly re-align any diagram.

---

## 🛑 Challenge 4: Generic AI Output ("TBD", "Ensure Scalability")

### Problem
Default AI prompts often produced vague boilerplate text (e.g. *"ensure high availability"*, *"sprint 1 setup"*, *"TBD"*) instead of concrete technical specifications.

### Technical Solution
Implemented **High-Signal Prompts & 2-Pass Reflection Engine (`refine.ts`)**:
1. **Persona Prompting**: Engineered specialized system prompts acting as Senior Agile PMs, Principal Systems Architects, and Cursor IDE Specialists.
2. **Streaming Reflection Engine (`streamRefinement`)**: Built a 2-pass critique flow that scans generated output to purge generic buzzwords and expand bullet points into executable technical requirements.

---

## 🛑 Challenge 5: Stripe Billing Webhook Idempotency & Signature Forgery

### Problem
Handling Stripe webhooks in serverless environments can lead to signature forgery or duplicate subscription processing if Stripe retries webhook delivery.

### Technical Solution
Built hardened **Supabase Cloud Edge Functions (`supabase/functions/stripe-webhook/`)**:
1. **Signature Verification**: Every incoming POST request is validated against Stripe's raw request body using `stripe.webhooks.constructEventAsync`.
2. **Idempotency Tracking**: Webhook event IDs are recorded in `public.stripe_events`. Duplicate event IDs return an immediate `200 OK` response without re-processing database mutations.

---

## 🛑 Challenge 6: Lighthouse Agentic Browsing & Accessibility Audits

### Problem
Lighthouse audits flagged `llms.txt does not follow recommendations` and `Accessibility tree is not well-formed`.

### Technical Solution
1. **`llms.txt` Standard**: Created `/public/llms.txt` and `/public/llms-full.txt` following the official [llmstxt.org](https://llmstxt.org/) specification to allow AI search crawlers to index Artix capabilities.
2. **Accessibility Tree Remediation**: Wrapped page sections in `<main id="main-content">` landmark elements and added explicit `aria-label` attributes to all icon-only buttons.
