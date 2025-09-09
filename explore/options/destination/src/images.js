// Small helper to fetch themed images for markers; falls back to Unsplash random queries.
    const FALLBACK = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop&q=60';
    export function getImageUrl(tag = '', opts = {}) {
      const q = (tag || '').toString().trim() || 'travel';
      try {
        // Using source.unsplash to keep CORS/redirect behavior OK for browsers
        return `https://source.unsplash.com/400x400/?${encodeURIComponent(q)}`;
      } catch (e) {
        return FALLBACK;
      }
    }
