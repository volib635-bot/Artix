# Testing & Quality Assurance Guide — Artix

This document details the testing architecture, test suites, execution commands, security penetration tests, and Playwright E2E coverage for Artix.

---

## 🧪 Testing Architecture Overview

Artix employs a dual-layer testing strategy to guarantee 100% feature coverage and zero security regressions before production deployments:

```
                      [ Artix Test Pipeline ]
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
[ Vitest Unit & Integration ]                [ Playwright E2E & Security ]
  • 77 Tests Across 11 Files                   • Multi-Browser Execution
  • Fast In-Memory Execution (~4s)             • Real Chromium, Firefox, WebKit
  • AI Prompts, Crypto, Auto-Save              • Auth, Dashboards, XSS & Security
```

---

## ⚡ 1. Vitest Unit & Integration Suite (`src/test/`)

The Vitest suite verifies core business logic, encryption, prompt generation, auto-save queues, and billing rules.

### Test Files Breakdown (`src/test/`)
- `security.test.ts`: Key obfuscation (`obf:` prefix), CORS header origin matching, open redirect URL validation, DB tier limit guards.
- `ai.test.ts`: BYOK provider registry (OpenAI, Anthropic, Gemini, Groq, Ollama), token pricing estimation, storage key migration.
- `ai-architecture.test.ts`: 16k context window limits, sibling project context injection, 2-pass reflection critique engine (`refine.ts`).
- `edge-cases.test.ts`: 4-tier auto-save engine (1000ms debounce, `saveQueue.ts` optimistic locking, `tabCloseGuard.ts` unload beacon, `multiTabSync.ts` BroadcastChannel leader election).
- `api-saving.test.ts`: Passphrase `AES-256-GCM` encryption, lock/unlock state transitions, and setting clearing.
- `billing.test.ts`: Stripe price IDs, Free vs Pro plan limits, 7-day grace period for past-due subscriptions.
- `ux-feedback.test.ts`: Optimistic UI cache mutation to prevent premature 404 views.
- `branding.test.ts`: Verification of Artix logo assets, dark theme canvas wrappers, and removal of legacy references.

### Running Vitest Commands
```bash
# Run all 77 unit tests
npm run test

# Run tests in watch mode
npx vitest

# Run tests with verbose output
npx vitest run --reporter=verbose
```

---

## 🎭 2. Playwright E2E & Security Test Suite (`tests/e2e/`)

The Playwright suite executes real browser end-to-end user journeys and security penetration vectors across **Chromium, Firefox, and WebKit**.

### Test Suites Breakdown (`tests/e2e/`)

#### 1. `tests/e2e/auth.spec.ts` — Authentication & Session Management
- **Unauthenticated Access**: Verifies unauthenticated users navigating to protected routes (`/dashboard`, `/settings`) are redirected to `/auth`.
- **Public Routes**: Verifies public access to landing page (`/`) and pricing page (`/pricing`).
- **REST Security**: Validates that direct API calls to Supabase REST endpoints without a JWT token return `401 Unauthorized`.

#### 2. `tests/e2e/features.spec.ts` — Core User Journeys
- **Dashboard & Workspaces**: Verifies project creation, navigation to document workspace, and dark theme rendering.
- **Document Forge**: Verifies Monaco editor loading, text input, split-pane preview rendering, and multi-format switching.
- **System Architect**: Verifies node graph canvas rendering, node creation, double-click label editing, and **Auto-Layout** toolbar action.
- **AI Generators**: Verifies PRD modal, Vibe Coding target selection (Cursor / Artix), and prompt copy-to-clipboard functionality.

#### 3. `tests/e2e/security.spec.ts` — Security & Penetration Testing
- **XSS Vector Injection**: Injects `<script>alert('xss')</script>` and `javascript:` payload strings into document titles, PRD inputs, and node labels, verifying all user inputs are sanitized and escaped before rendering.
- **API Key Storage Protection**: Verifies that API keys stored in `localStorage` carry the `obf:` obfuscation prefix and are never exposed in DOM attributes or console logs.
- **Double-Click Attack Prevention**: Simulates rapid double-clicks on billing upgrade buttons to verify request debouncing and idempotency.

---

## 🚀 Running Playwright Tests

### Prerequisites
Install Playwright browser binaries (one-time setup):
```bash
npx playwright install --with-deps
```

### Execution Commands
```bash
# Run all E2E & Security tests headless across Chromium, Firefox, WebKit
npm run test:e2e

# Run E2E tests in interactive UI mode (debugger & inspector)
npm run test:e2e:ui

# View HTML Test Report after a test run
npm run test:e2e:report
```

---

## 📊 CI/CD Test Pipeline Standards

Before committing or pushing code to production, every release must satisfy:
1. `npx tsc --noEmit` — Zero TypeScript compilation errors.
2. `npm run test` — 77/77 Vitest unit tests passing.
3. `npm run build` — Clean production bundle build in under 10 seconds.
