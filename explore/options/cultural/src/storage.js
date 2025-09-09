// storage.js - small localStorage helpers for favorites and theme
    const FAVORITES_KEY = 'local:favs:v1';
    const THEME_KEY = 'local:theme:v1';

    export function loadFavorites() {
      try {
        const raw = localStorage.getItem(FAVORITES_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.warn('loadFavorites error', e);
        return [];
      }
    }

    export function saveFavorites(list) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(new Set(list))));
      } catch (e) {
        console.warn('saveFavorites error', e);
      }
    }

    export function isFavorited(id) {
      const list = loadFavorites();
      return list.includes(id);
    }

    export function toggleFavorite(id) {
      const list = loadFavorites();
      const idx = list.indexOf(id);
      if (idx === -1) list.push(id);
      else list.splice(idx, 1);
      saveFavorites(list);
      return list;
    }

    export function loadTheme() {
      try {
        return localStorage.getItem(THEME_KEY) || 'light';
      } catch (e) {
        return 'light';
      }
    }

    export function saveTheme(theme) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {}
    }
