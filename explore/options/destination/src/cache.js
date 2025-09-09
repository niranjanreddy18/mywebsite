// Simple localStorage cache with TTL
    import { CONFIG } from './config.js';

    const PREFIX = 'hub-cache-v1:';

    export function cacheSet(key, value) {
      try {
        const item = { ts: Date.now(), value };
        localStorage.setItem(PREFIX + key, JSON.stringify(item));
      } catch (e) { /* ignore */ }
    }

    export function cacheGet(key) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        if (!raw) return null;
        const item = JSON.parse(raw);
        if (!item.ts || !('value' in item)) return null;
        if (Date.now() - item.ts > (CONFIG.CACHE_TTL_MS || 24 * 3600 * 1000)) {
          localStorage.removeItem(PREFIX + key);
          return null;
        }
        return item.value;
      } catch (e) {
        return null;
      }
    }

    export function cacheClear(key) {
      try { localStorage.removeItem(PREFIX + key); } catch (e) {}
    }
