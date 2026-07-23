# UI & UX Guidelines — Artix

This document outlines the design system, color tokens, layout boundaries, typography standards, and micro-interaction rules for Artix.

---

## 🎨 1. Design System Aesthetic

Artix uses a **Dark Theme SaaS aesthetic with Warm Amber Accents**, glassmorphism card containers, subtle border glows, and developer-focused high-contrast typography.

- **Theme Rule**: Dark mode is mandatory and default across all components. Light mode overrides are removed to maintain a unified visual hierarchy.
- **Glassmorphism**: Backdrop blur utility classes (`backdrop-blur-md`, `backdrop-blur-xl`) paired with semi-transparent background surfaces (`bg-background/80`, `bg-card/50`).

---

## 🎨 2. Color Palette & Tokens (HSL Format)

All colors are declared in `src/index.css` using CSS custom properties in HSL format:

- **Background**: `hsl(220 14% 8%)` — Deep slate-black canvas (`#12151c`)
- **Card / Surface**: `hsl(220 13% 11%)` — Dark elevated surfaces (`#181c24`)
- **Foreground / Text**: `hsl(210 20% 98%)` — Crisp off-white (`#f8fafc`)
- **Muted Foreground**: `hsl(215 16% 57%)` — Readable slate-gray (`#64748b`)
- **Primary Accent (Warm Amber)**: `hsl(38 92% 50%)` — Warm golden amber (`#f59e0b`)
- **Primary Glow**: `box-shadow: 0 0 25px rgba(245, 158, 11, 0.25)` (`.glow-amber`)
- **Borders**: `hsl(220 13% 18%)` — Subtle dark division lines (`#262b36`)

---

## 🔤 3. Typography Standards

- **Body & UI Font**: `Inter`, sans-serif
  - Used for titles, navigation items, buttons, form controls, and dialog content.
  - Weights: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold).
- **Code & Syntax Font**: `JetBrains Mono`, monospace
  - Used in Monaco Editor, code preview panes, system prompt output areas, and token counters.
  - Weights: `400` (Regular), `500` (Medium), `700` (Bold).

---

## 🧩 4. Component Patterns & Hierarchy

### Buttons & Call-to-Actions (CTAs)
- **Primary Button**: Warm amber background (`bg-primary`), dark text, subtle hover scale/glow (`glow-amber`).
- **Outline Button**: Dark background with border (`border-border/80`), hover border primary (`hover:border-primary/50`).
- **Icon Buttons**: Always specify explicit `size="icon"` and an `aria-label` attribute (e.g. `aria-label="Settings"`).

### Dialog Modals & Drawers
- **Max Width**: `sm:max-w-2xl` for standard dialogs; `max-w-4xl max-h-[90vh]` for AI generators (PRD, Vibe, Agentic).
- **Header**: Icon + Title + Description subtitle.
- **Footer**: Cancel/Close button on left, primary action button on right.

---

## ⚡ 5. Micro-Animations & Interactivity

- **Page & Component Entrances**: Framer Motion `motion.div` with fade-in and subtle vertical slide (`y: 20 -> y: 0`).
- **Hover Micro-Interactions**: Smooth scale transforms (`hover:scale-[1.02]`) and subtle border color transitions (`transition-colors duration-200`).
- **Loading States**: Animated spinner (`<Loader2 className="animate-spin" />`) paired with disabled button state during pending network requests.
