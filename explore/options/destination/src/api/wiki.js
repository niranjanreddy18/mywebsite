// Helpers to search Wikipedia for attractions, festivals, and cuisine
    const WIKI_API = 'https://en.wikipedia.org/w/api.php?origin=*';

    async function searchTitles(query, limit = 5) {
      const params = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: query,
        srlimit: String(limit),
        format: 'json'
      });
      const res = await fetch(`${WIKI_API}&${params.toString()}`);
      if (!res.ok) throw new Error('Wiki search failed');
      const data = await res.json();
      return (data.query?.search || []).map(s => s.title);
    }

    async function fetchSummary(title) {
      try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        return { title: data.title, extract: data.extract, thumbnail: data.thumbnail?.source || null };
      } catch (e) {
        return null;
      }
    }

    export async function fetchLocalHighlights(place) {
      // Try to find attractions, festivals, cuisine
      const attractions = [];
      const festivals = [];
      const cuisine = [];

      // Search for attractions: "PLACE tourist attractions" and "PLACE attractions"
      const attQueries = [`${place} tourist attractions`, `${place} attractions`, `${place} landmarks`, `${place} tourism`];
      for (const q of attQueries) {
        try {
          const titles = await searchTitles(q, 4);
          for (const t of titles) {
            const s = await fetchSummary(t);
            if (s) attractions.push(s);
            if (attractions.length >= 4) break;
          }
        } catch (e) { /* ignore */ }
        if (attractions.length >= 4) break;
      }

      // Festivals
      const festQueries = [`${place} festival`, `${place} festivals`, `${place} events`];
      for (const q of festQueries) {
        try {
          const titles = await searchTitles(q, 4);
          for (const t of titles) {
            const s = await fetchSummary(t);
            if (s) festivals.push(s);
            if (festivals.length >= 5) break;
          }
        } catch (e) {}
        if (festivals.length >= 5) break;
      }

      // Cuisine
      const cuisineQueries = [`${place} cuisine`, `${place} food`, `${place} specialties`, `${place} culinary`];
      for (const q of cuisineQueries) {
        try {
          const titles = await searchTitles(q, 4);
          for (const t of titles) {
            const s = await fetchSummary(t);
            if (s) cuisine.push(s);
            if (cuisine.length >= 5) break;
          }
        } catch (e) {}
        if (cuisine.length >= 5) break;
      }

      // Fallback: if none found, search main place page for extract
      if (!attractions.length) {
        try {
          const mainTitles = await searchTitles(place, 1);
          if (mainTitles.length) {
            const main = await fetchSummary(mainTitles[0]);
            if (main) {
              // use main extract as a single highlight
              attractions.push(main);
            }
          }
        } catch (e) {}
      }

      return { attractions, festivals, cuisine };
    }
