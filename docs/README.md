# Artix — The Developer's Command Center

Artix is a modern, unified SaaS platform designed for software engineers, product leads, and system architects. It combines multi-format technical documentation, visual system design, algorithm mapping, and high-signal AI prompt engineering into a single high-performance workspace.

---

## 🌟 Core Capabilities

### 📄 Document Forge
- **Multi-Format Technical Editor**: Rich editor powered by Monaco Editor supporting Markdown (`.md`), XML (`.xml`), and Plain Text (`.txt`) formats.
- **Split-Pane Live Preview**: Synchronized Markdown and XML rendering with high-contrast syntax highlighting.
- **Resilient Auto-Save Engine**: 1000ms debounced storage, optimistic lock queueing (`saveQueue.ts`), `sendBeacon`/`keepalive` tab close protection, and multi-tab synchronization via `BroadcastChannel`.
- **Multi-Format Export**: One-click export to PDF, standalone HTML, and raw Markdown.

### 📐 System Architect
- **Interactive Visual Canvas**: Drag-and-drop node graph canvas powered by React Flow (`@xyflow/react`).
- **Architectural Node Library**: Specialized nodes for Microservices, API Gateways, PostgreSQL Databases, Message Queues, and Cache layers.
- **Horizontal Dagre Rank Layout (`LR`)**: Automatic Left-to-Right layout directing flow from Ingress/Clients on the Left (`Position.Right`) → Microservices → Databases on the Right (`Position.Left`).
- **1-Click Auto Layout & Freehand Drawing**: Auto-space graph nodes with zero overlap and draw freehand sketch overlays.

### 🧠 AI Intelligence Suite
- **PRD Generator**: Generates sprint-ready Product Requirements Documents across 4 specialized modes (Agile, Technical Spec, Lean MVP, Custom).
- **Vibe Coding Prompt Generator**: Generates surgical, file-precise prompts for Cursor, Artix, and generic AI coders with explicit file actions (`[NEW]`, `[MODIFY]`), exact function signatures, and post-change verification commands.
- **Agentic Workflow Designer**: Blueprints multi-agent systems across 6 architectural patterns (Sequential, Parallel Fan-Out, Orchestrator-Workers, Router, Evaluator-Optimizer, Autonomous ReAct).
- **Reflection & Refinement Pass**: Built-in 2-pass critique engine (`refine.ts`) that purges generic filler prose ("ensure scalability", "TBD") and expands technical specifications.

### 🔐 BYOK Security & Key Obfuscation
- **Bring-Your-Own-Key (BYOK)**: Supports OpenAI, Anthropic Claude, Google Gemini, Groq, OpenRouter, and local Ollama servers.
- **Client-Side Encryption**: Optional `AES-256-GCM` encryption with `PBKDF2` passphrase derivation, paired with automated client-side key obfuscation (`obf:` prefix) and a Reset Key Vault recovery trigger.

### ⚡ PWA & Offline Support
- **Progressive Web App**: Installable as a native desktop or mobile application.
- **Offline Workspace**: ServiceWorker precaching for uninterrupted document editing and offline system design.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Editors & Canvas**: Monaco Editor (`@monaco-editor/react`), `@xyflow/react` (React Flow), `@dagrejs/dagre`
- **Backend & Auth**: Supabase PostgreSQL with Row Level Security (RLS) policies and triggers
- **Edge Architecture**: Supabase Cloud Edge Functions for Stripe subscription billing & portal management
- **Testing**: Vitest (Unit & Integration), Playwright (E2E & Security Audits)
