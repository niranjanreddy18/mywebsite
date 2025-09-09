// ui.js - rendering and UI helpers (cards, modal, drawer)
    import { ITEMS, TAGS } from './data.js';
    import * as storage from './storage.js';

    const grid = document.getElementById('cards-grid');
    const chipsEl = document.getElementById('tag-chips');
    const modal = document.getElementById('detail-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalFav = document.getElementById('modal-fav');
    const favoritesDrawer = document.getElementById('favorites-drawer');
    const favoritesList = document.getElementById('favorites-list');

    export function renderChips(selectedTag = 'all') {
      chipsEl.innerHTML = '';
      TAGS.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.type = 'button';
        btn.textContent = tag;
        btn.dataset.tag = tag;
        btn.setAttribute('aria-pressed', String(tag === selectedTag));
        btn.addEventListener('click', () => {
          document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
          btn.setAttribute('aria-pressed', 'true');
          const ev = new CustomEvent('filter-change', { detail: { tag } });
          window.dispatchEvent(ev);
        });
        chipsEl.appendChild(btn);
      });
    }

    export function renderCards(items = []) {
      grid.innerHTML = '';
      if (!items || items.length === 0) {
        grid.innerHTML = '<div class="empty">No items found.</div>';
        return;
      }
      items.forEach(item => {
        const el = document.createElement('article');
        el.className = 'card';
        el.setAttribute('role', 'listitem');
        el.tabIndex = 0;
        el.innerHTML = `
          <div class="card-header">
            <img class="card-thumb" src="${item.img}" alt="${item.title}" loading="lazy"/>
            <div>
              <h4 class="card-title">${item.title}</h4>
              <p class="card-desc">${item.desc}</p>
            </div>
          </div>
          <div class="card-meta">
            <div class="tag-list">
              ${item.tags.slice(0,3).map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            <div class="card-actions">
              <button class="btn small btn-view" data-id="${item.id}">View</button>
              <button class="btn small btn-save" data-id="${item.id}">${storage.isFavorited(item.id) ? '★' : '☆'}</button>
            </div>
          </div>
        `;
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openDetail(item.id);
          }
        });

        el.querySelector('.btn-view').addEventListener('click', () => openDetail(item.id));
        el.querySelector('.btn-save').addEventListener('click', (e) => {
          storage.toggleFavorite(item.id);
          e.currentTarget.textContent = storage.isFavorited(item.id) ? '★' : '☆';
          renderFavoritesList();
        });

        grid.appendChild(el);
      });
    }

    export function openDetail(id) {
      const item = ITEMS.find(i => i.id === id);
      if (!item) return;
      modalTitle.textContent = item.title;
      modalContent.innerHTML = `
        <p>${item.desc}</p>
        <div class="tag-list" style="margin-top:12px">${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <img src="${item.img}" alt="${item.title}" loading="lazy"/>
      `;
      modal.setAttribute('aria-hidden', 'false');
      modalFav.textContent = storage.isFavorited(id) ? '★ Saved' : '☆ Save';
      modalFav.dataset.id = id;
      modalFav.focus();
    }

    export function closeDetail() {
      modal.setAttribute('aria-hidden', 'true');
    }

    export function initModalHandlers() {
      document.getElementById('modal-close').addEventListener('click', closeDetail);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeDetail();
      });
      modalFav.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (!id) return;
        storage.toggleFavorite(id);
        modalFav.textContent = storage.isFavorited(id) ? '★ Saved' : '☆ Save';
        renderFavoritesList();
        document.querySelectorAll(`.btn-save[data-id="${id}"]`).forEach(b => b.textContent = storage.isFavorited(id) ? '★' : '☆');
      });
    }

    export function renderFavoritesList() {
      const favs = storage.loadFavorites();
      favoritesList.innerHTML = '';
      if (favs.length === 0) {
        favoritesList.innerHTML = '<div class="empty">No favorites yet. Save items to quickly access them here.</div>';
        return;
      }
      favs.forEach(id => {
        const item = ITEMS.find(i => i.id === id);
        if (!item) return;
        const el = document.createElement('div');
        el.className = 'fav-item';
        el.innerHTML = `
          <img src="${item.img}" alt="${item.title}" loading="lazy" />
          <div style="flex:1">
            <div style="font-weight:700">${item.title}</div>
            <div style="color:var(--muted);font-size:0.92rem">${item.type}</div>
          </div>
          <div>
            <button class="btn small btn-open" data-id="${item.id}">Open</button>
            <button class="btn small btn-remove" data-id="${item.id}">Remove</button>
          </div>
        `;
        el.querySelector('.btn-open').addEventListener('click', () => openDetail(item.id));
        el.querySelector('.btn-remove').addEventListener('click', () => {
          storage.toggleFavorite(item.id);
          renderFavoritesList();
          document.querySelectorAll(`.btn-save[data-id="${item.id}"]`).forEach(b => b.textContent = '☆');
        });
        favoritesList.appendChild(el);
      });
    }

    export function openFavoritesDrawer() {
      favoritesDrawer.setAttribute('aria-hidden', 'false');
      renderFavoritesList();
    }

    export function closeFavoritesDrawer() {
      favoritesDrawer.setAttribute('aria-hidden', 'true');
    }

    export function initDrawerHandlers() {
      document.getElementById('favorites-open').addEventListener('click', () => openFavoritesDrawer());
      document.getElementById('drawer-close').addEventListener('click', () => closeFavoritesDrawer());
      document.getElementById('clear-favs').addEventListener('click', () => {
        const favs = storage.loadFavorites();
        favs.forEach(id => storage.toggleFavorite(id));
        renderFavoritesList();
        document.querySelectorAll('.btn-save').forEach(b => b.textContent = '☆');
      });
    }
