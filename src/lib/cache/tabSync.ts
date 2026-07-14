/**
 * tabSync.ts
 * ──────────
 * BroadcastChannel-based leader election and cross-tab content synchronization.
 *
 * - Opens a BroadcastChannel with a given channel name.
 * - On creation, attempts to claim the "leader" role via a localStorage lock.
 *   The leader tab is the only one that writes to the DB; follower tabs write
 *   only to localStorage.
 * - `broadcast(message)` — posts a message to all other tabs.
 * - `onRemoteUpdate` callback — invoked when a follower receives a content
 *   update from the leader.
 * - `destroy()` — resigns leader role, closes the channel, and broadcasts
 *   LEADER_RESIGN so another tab can claim.
 *
 * Framework-agnostic (no React imports).
 */

export interface TabSyncMessage {
  type: string;
  docId?: string;
  content?: string;
  [key: string]: unknown;
}

export interface TabSyncOptions {
  onRemoteUpdate?: (message: TabSyncMessage) => void;
}

export interface TabSync {
  /** Returns true if this tab is the current leader. */
  isLeader(): boolean;
  /** Broadcast a message to all other tabs on this channel. */
  broadcast(message: TabSyncMessage): void;
  /** Tear down: resign leader, close channel, notify other tabs. */
  destroy(): void;
}

export function createTabSync(
  channelName: string,
  options?: TabSyncOptions,
): TabSync {
  const lockKey = `artix.leader.${channelName}`;
  const tabId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let leader = false;

  // --- Leader election via localStorage lock ---
  function tryClaimLeader(): boolean {
    const existing = localStorage.getItem(lockKey);
    if (!existing) {
      localStorage.setItem(lockKey, tabId);
      return true;
    }
    return existing === tabId;
  }

  // Attempt to claim on creation
  leader = tryClaimLeader();

  // --- BroadcastChannel setup ---
  let channel: BroadcastChannel | null = null;

  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(channelName);

    channel.onmessage = (event: MessageEvent<TabSyncMessage>) => {
      const msg = event.data;

      if (msg.type === 'LEADER_RESIGN') {
        // Another tab resigned — try to claim
        localStorage.removeItem(lockKey);
        leader = tryClaimLeader();
      }

      if (options?.onRemoteUpdate) {
        options.onRemoteUpdate(msg);
      }
    };
  }

  function isLeaderFn(): boolean {
    return leader;
  }

  function broadcast(message: TabSyncMessage): void {
    channel?.postMessage(message);
  }

  function destroy(): void {
    // Resign leader role
    if (leader) {
      const current = localStorage.getItem(lockKey);
      if (current === tabId) {
        localStorage.removeItem(lockKey);
      }
      leader = false;
    }

    // Notify other tabs
    broadcast({ type: 'LEADER_RESIGN' });

    // Close the channel
    channel?.close();
    channel = null;
  }

  return { isLeader: isLeaderFn, broadcast, destroy };
}
