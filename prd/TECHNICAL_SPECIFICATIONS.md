# Artix — Technical Specifications & Database Schema

> **Document Status**: Production-Ready  
> **Target Release**: v1.4.0  

---

## 🗄️ 1. Database Schema & Row Level Security (RLS)

All database tables reside in Supabase PostgreSQL (`public` schema) and are protected by Row Level Security policies requiring authenticated JWT sessions (`auth.uid() = user_id`).

```sql
-- 1. Projects Table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Documents Table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content TEXT NOT NULL DEFAULT '',
  format TEXT NOT NULL DEFAULT 'markdown' CHECK (format IN ('markdown', 'xml', 'text')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. System Designs Table
CREATE TABLE public.system_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled System Architecture',
  board_state JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[],"strokes":[]}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Subscriptions Table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Stripe Events Table (Idempotency)
CREATE TABLE public.stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## ⚡ 2. Supabase Cloud Edge Functions

Edge Functions run on Deno TypeScript runtime at edge locations:

### 1. `create-checkout-session`
- **Location**: `supabase/functions/create-checkout-session/index.ts`
- **Purpose**: Creates Stripe Checkout Sessions for Pro tier upgrades.
- **Security**: Validates user JWT from `Authorization` header. Imports CORS header utility (`../_shared/cors.ts`).

### 2. `create-portal-session`
- **Location**: `supabase/functions/create-portal-session/index.ts`
- **Purpose**: Generates Stripe Customer Portal URLs.
- **Security**: Validates JWT, queries `subscriptions.stripe_customer_id`, passes `return_url`.

### 3. `stripe-webhook`
- **Location**: `supabase/functions/stripe-webhook/index.ts`
- **Purpose**: Processes Stripe billing webhooks idempotently.
- **Security**: Validates `Stripe-Signature` header against raw request body using `constructEventAsync`. Checks idempotency against `public.stripe_events`.

---

## 🤖 3. AI Streaming & Reflection Pipeline

```
[ User Input ]
      │
      ▼
[ Prompt Generator (prd.ts / vibe.ts / architecture.ts) ]
      │
      ▼
[ 1st Pass: BYOK Provider Direct Call (registry.ts) ]
      │
      ▼
[ Draft Stream Output ]
      │
      ▼
[ 2nd Pass: Reflection & Critique Engine (refine.ts) ]
      │ Purges filler ("ensure scalability", "TBD")
      │ Expands concrete specs & verification steps
      ▼
[ Final High-Signal Response Render ]
```
