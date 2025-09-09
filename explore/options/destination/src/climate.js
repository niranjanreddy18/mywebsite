// Seasonal data: Visual Crossing preferred, open-meteo climate API fallback
    import { CONFIG } from './config.js';
    import { cacheGet, cacheSet } from './cache.js';

    export async function fetchSeasonalMonthly(lat, lon) {
      const key = `climate:${lat.toFixed(4)},${lon.toFixed(4)}`;
      const cached = cacheGet(key);
      if (cached) return cached;

      if (CONFIG.VISUAL_CROSSING_KEY) {
        try {
          const vcKey = CONFIG.VISUAL_CROSSING_KEY;
          // Visual Crossing monthly averages endpoint
          const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/?unitGroup=metric&include=months&key=${vcKey}&contentType=json`;
          const res = await fetch(url);
          if (!res.ok) throw new Error('VC fetch failed');
          const data = await res.json();
          // data.months is array of 12 months with temp and precip
          if (data.months && data.months.length === 12) {
            const months = data.months.map(m => ({ month: m.name.slice(0,3), avg_temp_c: m.temp, avg_precip_mm: m.precip }));
            cacheSet(key, { provider: 'visualcrossing', months });
            return { provider: 'visualcrossing', months };
          }
        } catch (e) { /* fallback */ }
      }

      // Open-Meteo climate API fallback
      try {
        const url = `https://climate-api.open-meteo.com/v1/climate?latitude=${lat}&longitude=${lon}&start_year=1991&end_year=2020&temperature_unit=celsius`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Climate API failed');
        const data = await res.json();
        const monthly = data.monthly || {};
        // try to find temp and precip arrays
        let temps = null, prec = null;
        for (const k of Object.keys(monthly)) {
          if (Array.isArray(monthly[k]) && monthly[k].length === 12) {
            if (k.toLowerCase().includes('temperature')) temps = monthly[k];
            if (k.toLowerCase().includes('precip')) prec = monthly[k];
          }
        }
        const months = [];
        const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        for (let i = 0; i < 12; i++) {
          months.push({ month: names[i], avg_temp_c: temps ? temps[i] : null, avg_precip_mm: prec ? prec[i] : null });
        }
        cacheSet(key, { provider: 'open-meteo-climate', months });
        return { provider: 'open-meteo-climate', months };
      } catch (e) {
        throw e;
      }
    }
