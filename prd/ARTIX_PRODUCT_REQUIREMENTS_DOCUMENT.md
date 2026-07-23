# Artix — Product Requirements Document (PRD)

> **Document Status**: Production-Ready  
> **Target Release**: v1.4.0  
> **Author**: Antigravity System Architect & Product Engineering Team

---

## 🎯 1. Product Vision & Executive Summary

**Artix** is a unified, high-performance SaaS developer workspace designed to bridge the gap between technical documentation, visual system architecture, and AI-assisted code generation. 

Developers and engineering leads often struggle with fragmented toolchains — writing Markdown specs in one app, drawing architecture diagrams in another, and generating AI code prompts in a third. Artix solves this by integrating:
- **Document Forge**: Multi-format spec editor (Markdown, XML, Plain Text) with Monaco Editor and live previewers.
- **System Architect**: Interactive React Flow diagram canvas with topological Left-to-Right (`LR`) Dagre auto-layout.
- **AI Intelligence Suite**: Senior PM personas for PRDs, file-precise Vibe Coding prompts (Cursor & Artix targets), and Agentic Workflow design.
- **BYOK Privacy Model**: Bring-Your-Own-Key model with client-side `AES-256-GCM` encryption and zero-knowledge passphrase protection.

---

## 👥 2. Target Audience & Core Personas

### 1. The Full-Stack Engineer ("Alex")
- **Needs**: Rapidly blueprint feature specs, generate file-precise Vibe Coding prompts with exact relative paths (`[NEW]`, `[MODIFY]`), and verify code against `npx tsc --noEmit`.
- **Pain Points**: Vague AI code output that hallucinates non-existent imports or breaks existing type contracts.

### 2. The System Architect ("Priya")
- **Needs**: Visual canvas to map microservices, databases, and message queues with clean Left-to-Right data flow and 1-click auto-layout.
- **Pain Points**: Overlapping nodes and messy connector lines in traditional drawing tools.

### 3. The Technical Product Lead ("Marcus")
- **Needs**: Auto-generate sprint-ready Agile PRDs with Given/When/Then acceptance criteria, user stories, and technical specs without filler prose ("TBD", "ensure scalability").
- **Pain Points**: Spending hours writing boilerplate documentation that gets outdated.

---

## 🛠️ 3. Functional Requirements

### FR-1: Document Forge (Spec Editor)
- **FR-1.1 Multi-Format Support**: Monaco editor instance supporting `.md` (Markdown), `.xml` (XML), and `.txt` (Plain Text).
- **FR-1.2 Live Dual Preview**: Synchronized split-pane HTML rendering with high-contrast syntax highlighting for code blocks.
- **FR-1.3 Auto-Save Resilience**: 4-tier data protection: 1000ms debounce → optimistic locking serial queue (`saveQueue.ts`) → `sendBeacon`/`keepalive` unload guard → `BroadcastChannel` multi-tab sync (`multiTabSync.ts`).
- **FR-1.4 Multi-Format Export**: 1-click export to PDF, standalone HTML, and raw `.md` files.

### FR-2: System Architect (Visual Graph Engine)
- **FR-2.1 React Flow Graph Canvas**: Custom nodes for Microservices, Databases, Message Queues, API Gateways, and Caches.
- **FR-2.2 Horizontal Dagre Auto-Layout**: 1-click **Auto Layout** toolbar action arranging graph nodes with `rankdir: 'LR'` (Left-to-Right) and generous spacing (`nodesep: 110`, `ranksep: 200`).
- **FR-2.3 Freehand Sketch Overlay**: SVG drawing canvas for quick whiteboarding and annotation overlays.

### FR-3: AI Intelligence Suite
- **FR-3.1 PRD Generator**: 4 modes (Agile, Technical Spec, Lean MVP, Custom) powered by senior PM personas.
- **FR-3.2 Vibe Coding Prompt Generator**: Generates file-precise prompts for Artix and Cursor IDE targets.
- **FR-3.3 2-Pass Reflection Engine (`refine.ts`)**: Automatic critique pass that purges generic filler prose and enforces concrete specifications.
- **FR-3.4 Agentic Workflow Designer**: Blueprints 6 multi-agent patterns (Sequential, Fan-Out, Orchestrator-Workers, Router, Evaluator, ReAct).

### FR-4: Security & BYOK Privacy
- **FR-4.1 Key Obfuscation**: Stored keys automatically receive `obf:` prefix prior to `localStorage` write.
- **FR-4.2 AES-256-GCM Encryption**: Optional `PBKDF2` passphrase-derived encryption (100,000 iterations), isolating decrypted keys in volatile JS memory during active sessions.
- **FR-4.3 Reset Key Vault Recovery**: Allows users who lost their passphrase to reset the encrypted vault and enter fresh keys.

### FR-5: Stripe Billing & Subscription Tiers
- **FR-5.1 Free Tier Limits**: Max 3 projects, 10 documents, 3 system designs (enforced by PostgreSQL trigger `enforce_tier_limits_trigger.sql`).
- **FR-5.2 Pro Tier ($8/mo or $72/yr)**: Unlimited projects, documents, designs, and AI generations. Managed via Stripe Checkout and Customer Portal Edge Functions.

---

## 🔒 4. Non-Functional Requirements (NFRs)

- **NFR-1 Security**: Zero plaintext API keys on GitHub or server logs; dynamic CORS origin protection.
- **NFR-2 Performance**: Lighthouse Performance score ≥ 95; First Contentful Paint < 0.8s; production bundle build < 10s.
- **NFR-3 Accessibility**: Lighthouse Accessibility ≥ 90; W3C semantic landmarks (`<main id="main-content">`) and explicit `aria-label` tags across all icon buttons.
- **NFR-4 Agentic Browsing Compliance**: Public `/public/llms.txt` and `/public/llms-full.txt` spec compliance for AI web search indexing.
