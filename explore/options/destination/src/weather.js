// Unified weather retrieval using OpenWeatherMap (if key) or Open-Meteo fallback
    import { CONFIG } from './config.js';
    import { cacheGet, cacheSet } from './cache.js';

    function cToF(c) { return (c * 9/5 + 32); }

    export async function fetchWeatherUnified(lat, lon) {
      const key = `weather:${lat.toFixed(4)},${lon.toFixed(4)}`;
      const cached = cacheGet(key);
      if (cached) return cached;

      if (CONFIG.OPENWEATHERMAP_KEY) {
        // Use One Call 3.0 if available, use current + daily 7
        try {
          const apiKey = CONFIG.OPENWEATHERMAP_KEY;
          const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${apiKey}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error('OWM failed');
          const data = await res.json();
          // normalize
          const current = data.current || {};
          const daily = (data.daily || []).slice(0, 7).map(d => ({
            date: new Date(d.dt * 1000).toISOString(),
            temp_max: d.temp?.max,
            temp_min: d.temp?.min,
            pop: d.pop != null ? Math.round(d.pop * 100) : null,
            precip_mm: (d.rain || d.snow || 0),
            weather: d.weather && d.weather[0] ? { main: d.weather[0].main, icon: `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`, desc: d.weather[0].description } : null
          }));
          const normalized = {
            provider: 'openweathermap',
            current_temp_c: current.temp,
            current_temp_f: cToF(current.temp),
            feels_like_c: current.feels_like,
            humidity: current.humidity,
            wind_speed: current.wind_speed,
            precip_24h_mm: (data.hourly || []).slice(0,24).reduce((s,h)=> s + (h.rain?.['1h'] || h.snow?.['1h'] || 0), 0),
            daily
          };
          cacheSet(key, normalized);
          return normalized;
        } catch (e) {
          // fallback to open-meteo
        }
      }

      // Open-Meteo fallback (free, no key)
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&current_weather=true&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Open-Meteo failed');
        const data = await res.json();
        const curr = data.current_weather || {};
        const dailyRaw = data.daily || {};
        const daily = (dailyRaw.time || []).map((t, i) => ({
          date: t,
          temp_max: dailyRaw.temperature_2m_max ? dailyRaw.temperature_2m_max[i] : null,
          temp_min: dailyRaw.temperature_2m_min ? dailyRaw.temperature_2m_min[i] : null,
          precip_mm: dailyRaw.precipitation_sum ? dailyRaw.precipitation_sum[i] : null,
          pop: null,
          weather: null
        })).slice(0,7);
        const normalized = {
          provider: 'open-meteo',
          current_temp_c: curr.temperature,
          current_temp_f: cToF(curr.temperature),
          feels_like_c: null,
          humidity: (data.hourly && data.hourly.relativehumidity_2m && data.hourly.relativehumidity_2m[0]) || null,
          wind_speed: curr.windspeed,
          precip_24h_mm: (daily.slice(0,1).reduce((s,d)=> s + (d.precip_mm||0),0)),
          daily
        };
        cacheSet(key, normalized);
        return normalized;
      } catch (e) {
        throw e;
      }
    }
