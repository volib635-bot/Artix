# Artix — The Developer's Command Center

Artix is a modern, unified SaaS platform designed for software engineers, technical product leads, and system architects. It combines multi-format technical documentation, visual system design, algorithm visualization, and high-signal AI prompt engineering into a single high-performance workspace.

---

## 🌟 Core Features

- **Document Forge**: Multi-format technical editor powered by Monaco Editor supporting Markdown (`.md`), XML (`.xml`), and Plain Text (`.txt`). Features live split-pane rendering, debounced auto-save, multi-tab sync, and PDF/HTML/Markdown export.
- **System Architect**: Interactive visual canvas powered by React Flow (`@xyflow/react`) for designing microservices, cloud infrastructure, and algorithm state machines. Features horizontal Left-to-Right (`LR`) Dagre rank layout with 1-click **Auto Layout** auto-spacing.
- **AI Intelligence Suite**:
  - **PRD Generator**: 4 specialized modes (Agile, Technical Spec, Lean MVP, Custom) powered by senior engineering personas.
  - **Vibe Coding Engine**: Generates surgical, file-precise prompts with relative file actions (`[NEW]`, `[MODIFY]`) for Cursor, Artix, and Generic LLMs.
  - **Agentic Workflow Designer**: Blueprints multi-agent architectures (Sequential, Fan-Out, Orchestrator-Workers, Router, Evaluator, Autonomous ReAct).
  - **Reflection Pass Engine (`refine.ts`)**: 2-pass critique flow to purge generic filler prose ("ensure scalability", "TBD").
- **BYOK Privacy & Security**: Bring-Your-Own-Key model supporting OpenAI, Anthropic, Google Gemini, Groq, OpenRouter, and local Ollama servers. Features client-side `AES-256-GCM` encryption and automated `obf:` key obfuscation.
- **Stripe Billing & Subscriptions**: Integrated Free vs Pro subscription tiers managed via Supabase Cloud Edge Functions and Stripe Checkout/Portal.
- **PWA & Offline First**: Progressive Web App with ServiceWorker precaching and offline local storage persistence.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Editor & Canvas**: Monaco Editor (`@monaco-editor/react`), React Flow (`@xyflow/react`), `@dagrejs/dagre`
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security policies and triggers, Auth)
- **Edge Architecture**: Supabase Cloud Edge Functions (Deno / TypeScript)
- **Testing**: Vitest (Unit & Integration), Playwright (E2E & Security Audits)

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js `v18.x` or higher
- npm `v9.x` or higher

### Step 1: Clone & Install
```bash
git clone https://github.com/volib635-bot/Artix.git
cd Artix
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_PROJECT_ID="ldhbjeustealybjffadn"
VITE_SUPABASE_URL="https://ldhbjeustealybjffadn.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-anon-key"
```

### Step 3: Run Local Dev Server
```bash
npm run dev
```
Open `http://localhost:8080` in your browser.

---

## 🧪 Testing Commands

- **Unit & Integration Suite**: `npm run test`
- **Playwright E2E Suite**: `npm run test:e2e`
- **Playwright UI Debugger**: `npm run test:e2e:ui`
- **Production Build**: `npm run build`
