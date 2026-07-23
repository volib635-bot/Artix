# Changelog — Artix

All notable changes to the Artix platform are documented below, grouped by feature release.

---

## 🚀 [v1.4.0] — 2026-07-23

### 🎨 UI & Hero Section Optimization
- **Clean Hero Layout**: Removed sub-hero file format badges (`Markdown .md`, `XML .xml`, `Plain Text .txt`) to provide an uncluttered, high-converting hero section.
- **Vite Build Fix**: Resolved JSX closing tag nesting order in `Index.tsx` and moved `@import` URL to line 1 of `index.css` to eliminate CSS build warnings.

### 🌐 Lighthouse Agentic Browsing & Accessibility
- **`llms.txt` Implementation**: Added `/public/llms.txt` and `/public/llms-full.txt` following the official [llmstxt.org](https://llmstxt.org/) specification for AI agent web indexing.
- **Accessibility Landmarks**: Added `<main id="main-content">` semantic landmark wrapper and explicit `aria-label` attributes across Navbar icon buttons.

---

## 🎨 [v1.3.0] — 2026-07-23

### 📐 System Architect & Algorithm Visualizer Upgrades
- **Horizontal Dagre Rank Layout (`LR`)**: Switched System Architect graph positioning from vertical `TB` to horizontal **Left-to-Right (`LR`)**, routing connections cleanly from Clients on the Left (`Position.Right`) → Microservices → Databases on the Right (`Position.Left`).
- **Interactive Auto-Layout Button**: Added a 1-click **Auto Layout** toolbar action on the System Architect header to auto-align nodes with zero visual overlap.
- **High-Node Capacity Prompts**: Expanded AI architecture diagram generation token budget to `4096` tokens and node capacity to **40 nodes**.

---

## 🤖 [v1.2.0] — 2026-07-23

### 💡 High-Signal System Prompts & Reflection Engine
- **PRD System Prompts**: Integrated 4 senior PM personas for Agile, Technical Spec, Lean MVP, and Custom modes in `prd.ts`.
- **Vibe Coding Engine**: Integrated Artix Stack Lead (`vibe_artix`) and Cursor IDE Specialist (`vibe_cursor`) prompts with relative paths (`[NEW]`, `[MODIFY]`) and mandatory verification commands (`npx tsc --noEmit`).
- **Refinement Pass (`refine.ts`)**: Built 2-pass critique flow purging generic filler words ("ensure scalability", "TBD").
- **Target Refactoring**: Removed legacy `bolt` and `v0` targets, focusing on `artix`, `cursor`, and `generic`.

---

## 💳 [v1.1.0] — 2026-07-23

### 💳 Stripe Billing & Tier Enforcement
- **Cloud Edge Functions**: Created `create-checkout-session`, `create-portal-session`, and `stripe-webhook` Edge Functions with CORS origin hardening.
- **Database Trigger Quotas**: Applied `enforce_tier_limits_trigger.sql` PostgreSQL migration to enforce Free plan limits (3 projects, 10 documents, 3 designs).
- **Admin Pro Access**: Applied database migration granting lifetime Pro subscription to `volij00635@gmail.com`.

---

## 🔒 [v1.0.0] — 2026-07-22

### 🔒 Core Platform & Security Remediation
- **Branding Migration**: Completed full migration from legacy project naming to **Artix**.
- **BYOK Key Protection**: Implemented automated key obfuscation (`obf:` prefix) and client-side `AES-256-GCM` encryption.
- **Auto-Save Resilience**: Built 4-tier auto-save architecture (Debounce, optimistic lock queue, sendBeacon/keepalive unload guard, BroadcastChannel multi-tab sync).
- **Playwright Test Suite**: Added complete E2E and security audit testing suite in `tests/e2e/`.
