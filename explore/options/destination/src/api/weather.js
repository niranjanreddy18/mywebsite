// Weather and climate helpers using Open-Meteo APIs (no API key)
    export async function fetchWeatherAndHourly(lat, lon) {
      if (!isFinite(lat) || !isFinite(lon)) throw new Error('Invalid coordinates');
      const base = 'https://api.open-meteo.com/v1/forecast';
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        hourly: 'temperature_2m,relativehumidity_2m,precipitation',
        current_weather: 'true',
        timezone: 'auto',
        temperature_unit: 'celsius',
        precipitation_unit: 'mm'
      });
      const url = `${base}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather fetch failed');
      const data = await res.json();

      const current_weather = data.current_weather || null;
      const hourly = data.hourly || {};
      const times = hourly.time || [];
      const temps = hourly.temperature_2m || [];
      const hums = hourly.relativehumidity_2m || [];
      const precips = hourly.precipitation || [];

      // find current index by matching current_weather.time if available, else nearest hour
      let idx = 0;
      if (current_weather && current_weather.time) {
        idx = times.indexOf(current_weather.time);
        if (idx === -1) {
          // fallback: find nearest
          const nowIso = new Date().toISOString().slice(0,13);
          idx = times.findIndex(t => t.startsWith(nowIso)) || 0;
        }
      }

      const current_temp = current_weather?.temperature ?? (temps[idx] ?? null);
      const current_humidity = hums[idx] ?? null;
      // compute precipitation next 24h starting at idx
      let precip24 = 0;
      const next24 = [];
      for (let i = idx; i < Math.min(idx + 24, times.length); i++) {
        precip24 += (precips[i] ?? 0);
        next24.push({ time: times[i], temp: temps[i] ?? null, humidity: hums[i] ?? null, precip: precips[i] ?? 0 });
      }

      return {
        raw: data,
        current_weather,
        current_temp,
        current_humidity,
        precip24h: precip24,
        precip24,
        next24
      };
    }

    export async function fetchClimate(lat, lon) {
      if (!isFinite(lat) || !isFinite(lon)) throw new Error('Invalid coords');
      // Climate normals API (Open-Meteo climate API)
      const base = 'https://climate-api.open-meteo.com/v1/climate';
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        start_year: '1991',
        end_year: '2020',
        temperature_unit: 'celsius'
      });
      const url = `${base}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Climate fetch failed');
      const data = await res.json();
      // Try to extract monthly mean temperature and precipitation
      const monthly = {};
      if (data.monthly) {
        // monthly variables likely include temperature_2m_mean and precipitation_sum arrays
        // adaptively find keys
        const keys = Object.keys(data.monthly);
        // find arrays with length 12
        for (const k of keys) {
          if (Array.isArray(data.monthly[k]) && data.monthly[k].length === 12) {
            if (k.includes('temperature')) monthly.temperature = data.monthly[k];
            if (k.includes('precipitation') || k.includes('rain') || k.includes('pr')) monthly.precipitation = data.monthly[k];
          }
        }
      }
      return { monthly: monthly, raw: data };
    }
