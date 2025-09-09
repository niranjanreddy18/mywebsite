// Small geocoding module using Nominatim with caching
    export function initGeocode() {
      const cache = new Map();

      async function geocodePlace(query) {
        const key = (query || '').trim().toLowerCase();
        if (!key) throw new Error('Empty query');
        if (cache.has(key)) return cache.get(key);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en-US,en;q=0.9' } });
        if (!res.ok) throw new Error('Geocoding failed');
        const data = await res.json();
        if (!data || data.length === 0) throw new Error('No results');
        const place = { name: data[0].display_name, lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        cache.set(key, place);
        return place;
      }

      return { geocodePlace };
    }
