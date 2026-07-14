/**
 * saveQueue.ts
 * ────────────
 * Serial save queue with optimistic locking (version-guarded writes).
 *
 * - Maintains a per-document version map: Map<docId, updated_at>
 * - `enqueue(payload)` adds a save to the queue. Only one save runs at a
 *   time per queue (serial execution).
 * - After each successful save, updates the version stamp from the response.
 * - If the save function rejects with VERSION_CONFLICT, the queue surfaces
 *   that error to the caller.
 *
 * Framework-agnostic (no React imports).
 */

export interface SavePayload {
  id: string;
  content: string;
  [key: string]: unknown;
}

export interface SaveResult {
  updated_at: string;
}

export interface SaveQueue {
  /** Enqueue a save. Resolves when this specific save completes. */
  enqueue(payload: SavePayload): Promise<SaveResult>;
  /** Get the last known `updated_at` for a document. */
  getVersion(docId: string): string | undefined;
}

export function createSaveQueue(
  saveFn: (payload: SavePayload) => Promise<SaveResult>,
): SaveQueue {
  const versions = new Map<string, string>();

  // A simple serial queue implemented as a chained promise.
  // Each enqueue appends to the tail so saves execute one-by-one.
  let queueTail: Promise<unknown> = Promise.resolve();

  function enqueue(payload: SavePayload): Promise<SaveResult> {
    const resultPromise = queueTail.then(
      () => executeSave(payload),
      // If a previous save in the chain rejected, still continue the chain
      () => executeSave(payload),
    );

    // Extend the chain — catch to prevent unhandled rejection on the tail
    queueTail = resultPromise.catch(() => {});

    return resultPromise;
  }

  async function executeSave(payload: SavePayload): Promise<SaveResult> {
    const result = await saveFn(payload);
    versions.set(payload.id, result.updated_at);
    return result;
  }

  function getVersion(docId: string): string | undefined {
    return versions.get(docId);
  }

  return { enqueue, getVersion };
}
