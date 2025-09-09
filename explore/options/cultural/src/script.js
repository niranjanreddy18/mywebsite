// main entry - wires search, UI, filters, theme, keyboard shortcuts
    import { initFuse, search, allItems } from './search.js';
    import { renderChips, renderCards, initModalHandlers, renderFavoritesList, initDrawerHandlers } from './ui.js';
    import * as storage from './storage.js';

    // initialize
    initFuse();
    renderChips('all');
    renderCards(allItems());
    initModalHandlers();
    initDrawerHandlers();

    // state
    let currentTag = 'all';
    let currentQuery = '';
    let currentSort = 'relevance';

    const searchInput = document.getElementById('search');
    const clearSearch = document.getElementById('clear-search');
    const sortSelect = document.getElementById('sort-select');
    const themeToggle = document.getElementById('theme-toggle');
    const modal = document.getElementById('detail-modal');

    // apply stored theme
    const initialTheme = storage.loadTheme();
    if (initialTheme === 'dark') document.documentElement.classList.add('theme-dark');

    themeToggle.addEventListener('click', () => {
      const dark = document.documentElement.classList.toggle('theme-dark');
      themeToggle.textContent = dark ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-pressed', String(dark));
      storage.saveTheme(dark ? 'dark' : 'light');
    });

    // search handlers (debounced)
    let searchTimer = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        currentQuery = e.target.value.trim();
        applyFilters();
      }, 180);
    });

    clearSearch.addEventListener('click', () => {
      searchInput.value = '';
      currentQuery = '';
      applyFilters();
      searchInput.focus();
    });

    // filter events
    window.addEventListener('filter-change', (e) => {
      currentTag = e.detail.tag || 'all';
      applyFilters();
    });

    // sort
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFilters();
    });

    // favorites drawer close with Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modal.getAttribute('aria-hidden') === 'false') {
          document.getElementById('modal-close').click();
        }
        const drawer = document.getElementById('favorites-drawer');
        if (drawer.getAttribute('aria-hidden') === 'false') {
          document.getElementById('drawer-close').click();
        }
      }
      // quick focus to search
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });

    // apply combined filters and render
    function applyFilters() {
      let results = [];
      if (currentQuery) {
        results = search(currentQuery);
      } else {
        results = allItems();
      }

      // tag filter
      if (currentTag && currentTag !== 'all') {
        results = results.filter(i => i.tags && i.tags.includes(currentTag));
      }

      // sort
      if (currentSort === 'popularity') {
        results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      } else if (currentSort === 'alpha') {
        results.sort((a, b) => a.title.localeCompare(b.title));
      } // relevance leaves as-is

      renderCards(results);
    }

    // initial favorites render
    renderFavoritesList();

    // expose small API
    window._CULTURE = { applyFilters };
