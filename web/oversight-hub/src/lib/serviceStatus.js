/**
 * serviceStatus.js
 *
 * Tracks backend connectivity state and deduplicates cascading error logs
 * during backend restarts / hot-reload windows.
 *
 * Usage:
 *   import { serviceStatus } from '@/lib/serviceStatus';
 *
 *   // Mark offline (call on ERR_CONNECTION_RESET / "Failed to fetch")
 *   serviceStatus.markOffline();
 *
 *   // Mark online (call on any successful response)
 *   serviceStatus.markOnline();
 *
 *   // Subscribe to state changes for UI
 *   const unsub = serviceStatus.subscribe(({ offline }) => { ... });
 */

const DEDUP_WINDOW_MS = 10_000; // Suppress duplicate logs for 10s after first error

class ServiceStatus {
  constructor() {
    this._offline = false;
    this._lastErrorTime = 0;
    this._listeners = new Set();
  }

  get offline() {
    return this._offline;
  }

  /**
   * Call when a network-level connection failure is detected.
   * Deduplicates — only emits state change on the first call per window.
   * @returns {boolean} true if this was the first/new offline signal
   */
  markOffline() {
    const now = Date.now();
    const isNewEvent = now - this._lastErrorTime > DEDUP_WINDOW_MS;
    this._lastErrorTime = now;

    if (!this._offline || isNewEvent) {
      this._offline = true;
      this._notify();
    }

    // Return true only on the first error in the dedup window (caller should still log)
    return isNewEvent;
  }

  /**
   * Call when any API request succeeds.
   * Clears the offline state and notifies listeners.
   */
  markOnline() {
    if (this._offline) {
      this._offline = false;
      this._lastErrorTime = 0;
      this._notify();
    }
  }

  /**
   * Subscribe to connectivity state changes.
   * @param {Function} listener - Called with { offline: boolean }
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _notify() {
    const state = { offline: this._offline };
    this._listeners.forEach((fn) => {
      try {
        fn(state);
      } catch {
        // ignore listener errors
      }
    });
  }
}

export const serviceStatus = new ServiceStatus();
