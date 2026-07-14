/**
 * tabCloseGuard.ts
 * ────────────────
 * Flushes unsaved (dirty) document content to the server when the user
 * closes / navigates away from the tab.
 *
 * Strategy:
 *  - Primary:  navigator.sendBeacon()  — survives tab close
 *  - Fallback: fetch({ keepalive: true }) — for browsers without sendBeacon
 *
 * Framework-agnostic (no React imports) — composed into hooks upstream.
 */

export interface TabCloseGuard {
  /** Mark a document as having unsaved local content. */
  markDirty(documentId: string, content: string): void;
  /** Mark a document as clean (DB save succeeded). */
  markClean(documentId: string): void;
  /** Flush all dirty documents — called from beforeunload handler. */
  handleBeforeUnload(): void;
  /** Tear down — remove the beforeunload listener. */
  destroy(): void;
}

export function createTabCloseGuard(saveEndpoint: string): TabCloseGuard {
  const dirtyDocs = new Map<string, string>();

  function markDirty(documentId: string, content: string): void {
    dirtyDocs.set(documentId, content);
  }

  function markClean(documentId: string): void {
    dirtyDocs.delete(documentId);
  }

  function flushOne(documentId: string, content: string): void {
    const payload = JSON.stringify({ documentId, content });

    // Primary: sendBeacon (survives page unload)
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(saveEndpoint, payload);
      return;
    }

    // Fallback: fetch with keepalive
    if (typeof fetch === 'function') {
      fetch(saveEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Best-effort — nothing we can do if this fails during unload
      });
    }
  }

  function handleBeforeUnload(): void {
    dirtyDocs.forEach((content, documentId) => {
      flushOne(documentId, content);
    });
  }

  function destroy(): void {
    // Caller is responsible for removing the window listener;
    // this just clears internal state.
    dirtyDocs.clear();
  }

  return { markDirty, markClean, handleBeforeUnload, destroy };
}
