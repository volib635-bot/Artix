# API Specification — Artix

This document details all Supabase database tables (REST API), Cloud Edge Functions, and client-side AI provider API integrations.

---

## 🗄️ Database Tables (Supabase REST API)

All database endpoints require `apikey: VITE_SUPABASE_PUBLISHABLE_KEY` and are protected by Supabase Row Level Security (RLS) policies.

### 1. `public.projects`
Represents user workspaces.

- **GET `/rest/v1/projects?select=*`**
  - *Auth*: Required (JWT)
  - *Response*: `Array<{ id: string, user_id: string, name: string, description: string, created_at: string, updated_at: string }>`
- **POST `/rest/v1/projects`**
  - *Auth*: Required (JWT)
  - *Body*: `{ name: string, description?: string }`
  - *Limits*: Max 3 for Free plan users (enforced by DB trigger).
- **PATCH `/rest/v1/projects?id=eq.{id}`**
  - *Auth*: Required (JWT)
  - *Body*: `{ name?: string, description?: string }`
- **DELETE `/rest/v1/projects?id=eq.{id}`**
  - *Auth*: Required (JWT)

---

### 2. `public.documents`
Represents Markdown, XML, and Plain Text specs inside projects.

- **GET `/rest/v1/documents?project_id=eq.{projectId}&select=*`**
  - *Auth*: Required (JWT)
  - *Response*: `Array<{ id: string, project_id: string, title: string, content: string, format: 'markdown' | 'xml' | 'text', updated_at: string }>`
- **POST `/rest/v1/documents`**
  - *Auth*: Required (JWT)
  - *Body*: `{ project_id: string, title: string, content?: string, format?: string }`
  - *Limits*: Max 10 per user on Free plan.
- **PATCH `/rest/v1/documents?id=eq.{id}`**
  - *Auth*: Required (JWT)
  - *Body*: `{ title?: string, content?: string, format?: string }`

---

### 3. `public.system_designs`
Represents React Flow visual architecture boards.

- **GET `/rest/v1/system_designs?project_id=eq.{projectId}&select=*`**
  - *Auth*: Required (JWT)
  - *Response*: `Array<{ id: string, project_id: string, name: string, board_state: BoardState, updated_at: string }>`
- **POST `/rest/v1/system_designs`**
  - *Auth*: Required (JWT)
  - *Body*: `{ project_id: string, name: string, board_state: { nodes: [], edges: [], strokes: [] } }`
  - *Limits*: Max 3 per user on Free plan.

---

### 4. `public.subscriptions`
Represents user billing state.

- **GET `/rest/v1/subscriptions?select=*`**
  - *Auth*: Required (JWT)
  - *Response*: `{ user_id: string, plan_tier: 'free' | 'pro', status: 'active' | 'past_due' | 'canceled', billing_cycle: 'monthly' | 'annual', current_period_end: string }`

---

## ⚡ Supabase Edge Functions

### 1. `POST /functions/v1/create-checkout-session`
Creates a Stripe Checkout Session for upgrading to Pro.

- **Auth**: Required (`Authorization: Bearer <user_jwt>`)
- **Body**: `{ priceId: string, origin: string }`
- **Response**: `{ url: string }`

### 2. `POST /functions/v1/create-portal-session`
Generates a Stripe Customer Portal link for managing subscriptions.

- **Auth**: Required (`Authorization: Bearer <user_jwt>`)
- **Body**: `{ return_url: string }`
- **Response**: `{ url: string }`

### 3. `POST /functions/v1/stripe-webhook`
Handles incoming Stripe billing webhooks idempotently.

- **Auth**: Verified via `Stripe-Signature` header (`constructEventAsync`).
- **Events Handled**:
  - `checkout.session.completed` -> Sets `plan_tier = 'pro'`, `status = 'active'`.
  - `customer.subscription.updated` -> Updates subscription status & period end.
  - `customer.subscription.deleted` -> Reverts `plan_tier = 'free'`.
  - `invoice.payment_failed` -> Sets `status = 'past_due'`.

---

## 🤖 Client-Side AI Provider Integrations

All AI calls are executed directly from the client browser to provider endpoints (BYOK architecture):

- **OpenAI**: `https://api.openai.com/v1/chat/completions` (`gpt-4o`, `gpt-4o-mini`)
- **Anthropic**: `https://api.anthropic.com/v1/messages` (`claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`)
- **Google Gemini**: `https://generativelanguage.googleapis.com/v1beta/models/...:streamGenerateContent` (`gemini-1.5-pro`, `gemini-1.5-flash`)
- **Groq**: `https://api.groq.com/openai/v1/chat/completions` (`llama-3.3-70b-versatile`)
- **OpenRouter**: `https://openrouter.ai/api/v1/chat/completions`
- **Ollama**: `http://localhost:11434/api/generate` (Local keyless server)
