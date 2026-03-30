

# Plan: Convert TextForge to a Full PWA with Offline Support

## Overview
Install `vite-plugin-pwa`, configure service worker with Workbox for asset caching and offline support, add a web app manifest with proper icons, and guard against service worker issues in the Lovable preview environment.

**Important caveat**: PWA features (offline mode, install prompt) will only work in the **published/deployed** version, not in the Lovable editor preview.

---

## Steps

### 1. Install `vite-plugin-pwa`
Add `vite-plugin-pwa` as a dev dependency.

### 2. Generate PWA icons
Create icon files in `public/`:
- `pwa-192x192.png` and `pwa-512x512.png` (generated as simple SVG-based icons with the TextForge branding)
- `apple-touch-icon-180x180.png`

### 3. Update `vite.config.ts`
Add VitePWA plugin with:
- `registerType: "autoUpdate"`
- `devOptions: { enabled: false }` — prevents SW issues in dev/preview
- `workbox.navigateFallbackDenylist: [/^\/~oauth/]`
- `workbox.runtimeCaching` rules for API calls and static assets
- Full `manifest` object (name, short_name, theme_color, icons, display: standalone, etc.)

### 4. Update `index.html`
Add:
- `<link rel="manifest" href="/manifest.webmanifest">`
- `<meta name="theme-color" content="...">`
- `<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`

### 5. Add service worker guard in `src/main.tsx`
Prevent service worker registration when running inside an iframe or on Lovable preview domains. Unregister any existing SWs in those contexts.

### 6. Create an Install Prompt component
A small `PWAInstallPrompt.tsx` component that:
- Listens for the `beforeinstallprompt` event
- Shows a dismissible banner/button inviting users to install
- Integrates into the app layout (e.g., in Navbar or as a floating prompt)

---

## Technical Details

**Manifest config:**
```
name: "TextForge - Developer's Command Center"
short_name: "TextForge"
description: "Architect systems, forge documents, manage projects"
theme_color: "#1a1a2e"
background_color: "#1a1a2e"
display: "standalone"
start_url: "/"
```

**Workbox strategy:**
- Static assets (JS, CSS, images): CacheFirst
- API calls to Supabase: NetworkFirst with fallback
- Navigation: NetworkFirst

**Files to create/modify:**
- `vite.config.ts` — add VitePWA plugin
- `index.html` — add meta tags
- `src/main.tsx` — add SW guard
- `src/components/PWAInstallPrompt.tsx` — install banner
- `src/App.tsx` — integrate install prompt
- `public/pwa-192x192.svg`, `public/pwa-512x512.svg`, `public/apple-touch-icon-180x180.svg` — app icons (SVG for simplicity)

