import { fetchHotels, fetchTransports, filterHotels, filterTransports, sortResults } from './api.js';
    import { HotelCard } from './components/hotelCard.js';
    import { TransportCard } from './components/transportCard.js';
    import { Filters } from './components/filters.js';
    import { createEl, formatPrice } from './utils.js';
    import { openGallery } from './gallery.js';
    import * as Wishlist from './wishlist.js';
    import * as Community from './community.js';

    const state = {
      hotels: [],
      transports: [],
      visibleHotels: [],
      visibleTransports: [],
      compare: []
    };

    async function init() {
      const [hotels, transports] = await Promise.all([fetchHotels(), fetchTransports()]);
      state.hotels = hotels;
      state.transports = transports;

      mountUI();
      runSearch();
      updateWishlistBadge();
    }

    function mountUI() {
      const filtersPanel = document.getElementById('filtersPanel');
      const filters = Filters();
      filtersPanel.appendChild(filters.el);

      const searchInput = document.getElementById('searchInput');
      const searchBtn = document.getElementById('searchBtn');
      const sortSelect = document.getElementById('sortSelect');
      const toggleButtons = document.querySelectorAll('.toggle-group .toggle');

      searchBtn.addEventListener('click', () => runSearch());
      searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') runSearch(); });

      sortSelect.addEventListener('change', () => {
        renderResults();
      });

      toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.toggle').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          const target = btn.dataset.target;
          document.getElementById('hotelsColumn').hidden = target !== 'hotels';
          document.getElementById('transportsColumn').hidden = target !== 'transports';
        });
      });

      filters.onApply(values => {
        runSearch(values);
      });

      // Compare tray actions
      document.getElementById('compareClear').addEventListener('click', () => {
        state.compare = [];
        updateCompareTray();
        renderResults();
      });

      document.getElementById('compareView').addEventListener('click', () => {
        openComparisonModal();
      });

      // Wishlist actions
      document.getElementById('wishlistClear').addEventListener('click', () => {
        Wishlist.clearWishlist();
        renderWishlistTray();
        updateWishlistBadge();
      });

      document.getElementById('wishlistView').addEventListener('click', () => {
        openWishlistModal();
      });

      document.getElementById('wishlistBtn').addEventListener('click', () => {
        toggleWishlistTrayVisibility();
      });

      // Community
      document.getElementById('communityBtn').addEventListener('click', () => {
        openCommunityModal();
      });

      // Modal close
      document.getElementById('modalBackdrop').addEventListener('click', () => closeModal());
    }

    function getFilters(values) {
      const searchQuery = document.getElementById('searchInput').value || '';
      const sortMethod = document.getElementById('sortSelect').value || 'recommended';
      return {
        query: values?.query ?? searchQuery,
        petFriendly: values?.petFriendly ?? false,
        minRating: values?.minRating ?? 0,
        maxPrice: values?.maxPrice ?? Infinity,
        transportType: values?.transportType ?? 'all',
        sortMethod
      };
    }

    function runSearch(externalFilters) {
      const filters = getFilters(externalFilters);
      state.visibleHotels = filterHotels(state.hotels, {
        query: filters.query,
        petFriendly: filters.petFriendly,
        minRating: filters.minRating,
        maxPrice: filters.maxPrice
      });
      state.visibleTransports = filterTransports(state.transports, {
        query: filters.query,
        type: filters.transportType,
        petFriendly: filters.petFriendly,
        maxPrice: filters.maxPrice
      });

      state.visibleHotels = sortResults(state.visibleHotels, filters.sortMethod);
      state.visibleTransports = sortResults(state.visibleTransports, filters.sortMethod);

      renderResults();
    }

    function renderResults() {
      const hotelsList = document.getElementById('hotelsList');
      const transportsList = document.getElementById('transportsList');
      hotelsList.innerHTML = '';
      transportsList.innerHTML = '';

      // Hotels
      if (state.visibleHotels.length === 0) {
        hotelsList.appendChild(createEl('div', { class: 'meta', html: 'No hotels found for your search.' }));
      } else {
        state.visibleHotels.forEach(h => {
          h._saved = isSaved(h.id);
          const card = HotelCard(h, toggleCompare, toggleSave);
          attachCardListeners(card);
          hotelsList.appendChild(card);
        });
      }

      // Transports
      if (state.visibleTransports.length === 0) {
        transportsList.appendChild(createEl('div', { class: 'meta', html: 'No transports found for your search.' }));
      } else {
        state.visibleTransports.forEach(t => {
          t._saved = isSaved(t.id);
          const card = TransportCard(t, toggleCompare, toggleSave);
          attachCardListeners(card);
          transportsList.appendChild(card);
        });
      }

      updateCompareTray();
      renderWishlistTray();
    }

    function attachCardListeners(card) {
      card.addEventListener('openGallery', (e) => {
        const item = e.detail.item;
        openGalleryModal(item);
      });
    }

    function toggleCompare(item) {
      // mark item._compare
      if (item._compare) {
        item._compare = false;
        state.compare = state.compare.filter(c => c.id !== item.id);
      } else {
        if (state.compare.length >= 4) {
          alert('You can compare up to 4 items.');
          return;
        }
        item._compare = true;
        state.compare.push(item);
      }
      updateCompareTray();
      renderResults();
    }

    function toggleSave(item) {
      const res = Wishlist.toggleWishlist(item);
      item._saved = res.saved;
      updateWishlistBadge();
      renderWishlistTray();
      renderResults();
    }

    function isSaved(id) {
      const list = Wishlist.loadWishlist();
      return list.some(i => i.id === id);
    }

    function updateCompareTray() {
      const tray = document.getElementById('compareTray');
      const itemsEl = document.getElementById('compareItems');
      itemsEl.innerHTML = '';

      if (state.compare.length === 0) {
        tray.setAttribute('aria-hidden', 'true');
        return;
      }

      tray.setAttribute('aria-hidden', 'false');

      state.compare.forEach(it => {
        const pill = createEl('div', { class: 'compare-pill' });
        pill.innerHTML = `
          <div style="display:flex;flex-direction:column;">
            <strong style="font-size:13px">${it.name || it.carrier}</strong>
            <span style="font-size:12px;color:var(--muted)">${(it.city || it.route) || ''}</span>
          </div>
          <div style="margin-left:auto;font-weight:700;color:var(--accent-2)">${formatPrice(it.price || 0)}</div>
          <button class="btn small" style="margin-left:8px">Remove</button>
        `;
        pill.querySelector('button').addEventListener('click', () => {
          it._compare = false;
          state.compare = state.compare.filter(c => c.id !== it.id);
          updateCompareTray();
          renderResults();
        });
        itemsEl.appendChild(pill);
      });
    }

    function renderWishlistTray() {
      const tray = document.getElementById('wishlistTray');
      const itemsEl = document.getElementById('wishlistItems');
      itemsEl.innerHTML = '';

      const list = Wishlist.loadWishlist();
      if (list.length === 0) {
        tray.setAttribute('aria-hidden', 'true');
        return;
      }
      tray.setAttribute('aria-hidden', 'false');
      Wishlist.renderWishlistTray(itemsEl, (newList) => {
        updateWishlistBadge();
        renderResults();
      });
    }

    function updateWishlistBadge() {
      const count = Wishlist.loadWishlist().length;
      const el = document.getElementById('wishlistCount');
      el.textContent = String(count);
    }

    function toggleWishlistTrayVisibility() {
      const tray = document.getElementById('wishlistTray');
      const hidden = tray.getAttribute('aria-hidden') === 'true';
      tray.setAttribute('aria-hidden', String(!hidden));
    }

    function openWishlistModal() {
      const modal = document.getElementById('modal');
      const panel = document.getElementById('modalPanel');
      modal.setAttribute('aria-hidden', 'false');
      panel.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h3>Your Wishlist</h3>
          <div style="display:flex;gap:8px;">
            <button id="modalClose" class="btn">Close</button>
          </div>
        </div>
        <div id="wishlistModalContent"></div>
      `;
      panel.querySelector('#modalClose').addEventListener('click', () => closeModal());
      Wishlist.renderWishlistTray(panel.querySelector('#wishlistModalContent'), () => {
        renderWishlistTray();
        updateWishlistBadge();
        renderResults();
      });
    }

    function openGalleryModal(item) {
      const modal = document.getElementById('modal');
      const panel = document.getElementById('modalPanel');
      modal.setAttribute('aria-hidden', 'false');
      openGallery(panel, item);
    }

    function openCommunityModal() {
      const modal = document.getElementById('modal');
      const panel = document.getElementById('modalPanel');
      modal.setAttribute('aria-hidden', 'false');
      // Community.renderCommunity will attach a close handler
      if (typeof Community.renderCommunity === 'function') {
        Community.renderCommunity(panel);
      } else {
        panel.innerHTML = '<div class="meta">Community module failed to load.</div>';
      }
    }

    function openComparisonModal() {
      if (state.compare.length < 2) {
        alert('Select at least 2 items to compare.');
        return;
      }
      const modal = document.getElementById('modal');
      const panel = document.getElementById('modalPanel');
      modal.setAttribute('aria-hidden', 'false');

      // Build a comparison table dynamically
      const headers = state.compare.map(c => `<th>${c.name || c.carrier} <div style="font-weight:600;color:var(--muted)">${formatPrice(c.price || 0)}</div></th>`).join('');
      const rows = [];

      // Price row
      rows.push(`<tr><th>Price</th>${state.compare.map(c => `<td>${formatPrice(c.price || 0)}</td>`).join('')}</tr>`);
      // Rating
      rows.push(`<tr><th>Rating</th>${state.compare.map(c => `<td>${(c.rating || '-')}★</td>`).join('')}</tr>`);
      // Reviews / Stops
      rows.push(`<tr><th>${state.compare.every(c => c.reviews !== undefined) ? 'Reviews' : 'Stops'}</th>${state.compare.map(c => `<td>${c.reviews !== undefined ? c.reviews : (c.stops !== undefined ? c.stops + ' stops' : '-')}</td>`).join('')}</tr>`);
      // Amenities
      const allAmenities = Array.from(new Set(state.compare.flatMap(c => c.amenities || [])));
      rows.push(`<tr><th>Amenities</th>${state.compare.map(c => `<td>${(c.amenities || []).join(', ') || '-'}</td>`).join('')}</tr>`);
      // Extra: distance or duration
      rows.push(`<tr><th>Extra</th>${state.compare.map(c => c.distance_km ? `<td>${c.distance_km} km</td>` : (c.duration_min ? `<td>${Math.floor(c.duration_min/60)}h ${c.duration_min%60}m</td>` : `<td>-</td>`)).join('')}</tr>`);

      panel.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h3>Comparison</h3>
          <div style="display:flex;gap:8px;">
            <button id="modalClose" class="btn">Close</button>
          </div>
        </div>
        <table class="comparison-table">
          <thead>
            <tr><th></th>${headers}</tr>
          </thead>
          <tbody>
            ${rows.join('')}
          </tbody>
        </table>
      `;

      panel.querySelector('#modalClose').addEventListener('click', () => closeModal());
    }

    function closeModal() {
      const modal = document.getElementById('modal');
      modal.setAttribute('aria-hidden', 'true');
      document.getElementById('modalPanel').innerHTML = '';
    }

    // Initialize app
    init();
