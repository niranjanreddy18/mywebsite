// Attractions, events and food using Wikipedia as primary fallback.
    import { cacheGet, cacheSet } from './cache.js';
    import { CONFIG } from './config.js';

    const WIKI_API = 'https://en.wikipedia.org/w/api.php?origin=*';

    async function wikiSearch(q, limit = 6) {
      const params = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: q,
        srlimit: String(limit),
        format: 'json'
      });
      const res = await fetch(`${WIKI_API}&${params.toString()}`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.query?.search || []).map(s => s.title);
    }

    async function wikiSummary(title) {
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        if (!res.ok) return null;
        const data = await res.json();
        return { title: data.title, extract: data.extract, thumbnail: data.thumbnail?.source || null, content_urls: data.content_urls || null };
      } catch (e) { return null; }
    }

    // Main fetcher
    export async function fetchHighlights(place, lat, lon) {
      const key = `high:${place}:${lat}:${lon}`;
      const cached = cacheGet(key);
      if (cached) return cached;

      const result = { attractions: [], festivals: [], cuisine: [], events: [] };

      // 1) Try attraction queries
      const attQueries = [`${place} tourist attractions`, `${place} landmarks`, `${place} travel`];
      for (const q of attQueries) {
        const titles = await wikiSearch(q, 6);
        for (const t of titles) {
          const s = await wikiSummary(t);
          if (s) result.attractions.push(s);
          if (result.attractions.length >= 5) break;
        }
        if (result.attractions.length >= 5) break;
      }

      // 2) Festivals/events: try searches for "festival" and "events"
      const festQueries = [`${place} festival`, `${place} festivals`, `${place} cultural festival`];
      for (const q of festQueries) {
        const titles = await wikiSearch(q, 6);
        for (const t of titles) {
          const s = await wikiSummary(t);
          if (s) result.festivals.push(s);
          if (result.festivals.length >= 4) break;
        }
        if (result.festivals.length >= 4) break;
      }

      // 3) Cuisine/food
      const foodQueries = [`${place} cuisine`, `${place} food`, `${place} specialty`];
      for (const q of foodQueries) {
        const titles = await wikiSearch(q, 6);
        for (const t of titles) {
          const s = await wikiSummary(t);
          if (s) result.cuisine.push(s);
          if (result.cuisine.length >= 4) break;
        }
        if (result.cuisine.length >= 4) break;
      }

      // 4) Events via Eventbrite if key present (optional)
      if (CONFIG.EVENTBRITE_KEY && lat && lon) {
        try {
          const eurl = `https://www.eventbriteapi.com/v3/events/search/?location.within=50km&location.latitude=${lat}&location.longitude=${lon}&expand=venue&sort_by=date`;
          const res = await fetch(eurl, { headers: { Authorization: `Bearer ${CONFIG.EVENTBRITE_KEY}` } });
          if (res.ok) {
            const data = await res.json();
            (data.events || []).slice(0, 5).forEach(ev => result.events.push({
              title: ev.name?.text,
              description: ev.summary || ev.description?.text || '',
              start: ev.start?.local,
              url: ev.url
            }));
          }
        } catch (e) { /* ignore */ }
      }

      // Fallback: if attractions empty, try the main place page extract
      if (!result.attractions.length) {
        const titles = await wikiSearch(place, 1);
        if (titles.length) {
          const main = await wikiSummary(titles[0]);
          if (main) result.attractions.push(main);
        }
      }

      cacheSet(key, result);
      return result;
    }
