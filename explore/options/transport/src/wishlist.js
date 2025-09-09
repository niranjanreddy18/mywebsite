import { formatPrice } from './utils.js';

    const KEY = 'st_wishlist_v1';

    export function loadWishlist() {
      try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.warn('failed loading wishlist', e);
        return [];
      }
    }

    export function saveWishlist(list) {
      localStorage.setItem(KEY, JSON.stringify(list || []));
    }

    export function toggleWishlist(item) {
      const list = loadWishlist();
      const idx = list.findIndex(x => x.id === item.id);
      if (idx >= 0) {
        list.splice(idx, 1);
        saveWishlist(list);
        return { saved: false, list };
      } else {
        list.push(Object.assign({ _saved: true }, item));
        saveWishlist(list);
        return { saved: true, list };
      }
    }

    export function renderWishlistTray(el, onRemove) {
      const list = loadWishlist();
      el.innerHTML = '';
      if (!list.length) {
        el.innerHTML = `<div class="wishlist-empty">Your wishlist is empty.</div>`;
        return;
      }
      list.forEach(it => {
        const pill = document.createElement('div');
        pill.className = 'compare-pill';
        pill.innerHTML = `
          <div style="display:flex;flex-direction:column;">
            <strong style="font-size:13px">${it.name || it.carrier}</strong>
            <span style="font-size:12px;color:var(--muted)">${(it.city || it.route) || ''}</span>
          </div>
          <div style="margin-left:auto;font-weight:700;color:var(--accent-2)">${formatPrice(it.price || 0)}</div>
          <button class="btn small" style="margin-left:8px">Remove</button>
        `;
        pill.querySelector('button').addEventListener('click', () => {
          const res = removeFromWishlist(it.id);
          onRemove && onRemove(res);
        });
        el.appendChild(pill);
      });
    }

    export function removeFromWishlist(id) {
      const list = loadWishlist();
      const idx = list.findIndex(x => x.id === id);
      if (idx >= 0) list.splice(idx, 1);
      saveWishlist(list);
      return list;
    }

    export function clearWishlist() {
      saveWishlist([]);
    }
