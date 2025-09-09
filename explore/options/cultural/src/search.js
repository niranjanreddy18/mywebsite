// search.js - fuse-based fuzzy search wrapper
    import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.esm.min.js';
    import { ITEMS } from './data.js';

    let fuse = null;
    export function initFuse() {
      const options = {
        keys: ['title', 'desc', 'tags'],
        threshold: 0.35,
        includeScore: true,
        useExtendedSearch: true
      };
      fuse = new Fuse(ITEMS, options);
    }

    export function search(query) {
      if (!fuse || !query) return ITEMS.slice();
      const results = fuse.search(query);
      return results.map(r => r.item);
    }

    export function allItems() {
      return ITEMS.slice();
    }
