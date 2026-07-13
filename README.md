# Artix - The Developer's Command Center

Artix is a unified workspace for developers to write documentation, design systems, and visualize algorithms.

## Features

- **Document Forge**: Write in Markdown, XML, or plain text with Monaco editor, live preview, auto-save, and export to PDF/HTML.
- **System Architect**: Design system architectures visually with drag-and-drop nodes, curved connections, and freehand drawing.
- **Algorithm Visualizer**: Map out sorting, graph traversal, and data structure algorithms with specialized node templates.
- **AI Workspace**: Generate PRDs (Product Requirements Documents), multi-agent workflow blueprints, and vibe coding prompts using self-owned AI APIs.
- **Offline First**: PWA support allows installing Artix as a native desktop or mobile application with offline workspace access.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Flow Engine**: @xyflow/react (React Flow), Dagre
- **Backend**: Supabase (Database with Row-Level Security, Authentication)
- **Local Dev Server**: Node.js & npm

## Development Setup

Follow these steps to run Artix locally:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Install dependencies
npm install

# Step 3: Configure Environment Variables
# Copy .env.example or create .env with your Supabase credentials:
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-anon-key"

# Step 4: Start the development server
npm run dev
```

## AI Configuration

Artix is built on a "bring-your-own-key" architecture. Stored API keys are encrypted client-side using `AES-256-GCM` with a passphrase PBKDF2 derivative. Configure your API keys directly in **Settings → AI Configuration** for:
- OpenAI (GPT-4o, GPT-4o-mini, etc.)
- Anthropic (Claude 3.5 Sonnet, Haiku, Opus)
- Google Gemini (Gemini 1.5 Pro, Flash, etc.)
- Groq (Llama 3.3, 3.1)
- OpenRouter
- Ollama (Local LLM server)

## License

MIT - Built for developers.
