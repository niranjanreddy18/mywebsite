import L from 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js';
    import { fetchWeatherAndHourly, fetchClimate } from './api/weather.js';
    import { fetchLocalHighlights } from './api/wiki.js';

    // Read query params
    const qs = new URLSearchParams(window.location.search);
    const dest = qs.get('dest') || 'Unknown place';
    const lat = parseFloat(qs.get('lat')) || 0;
    const lon = parseFloat(qs.get('lon')) || 0;

    // DOM
    const hubTitle = document.getElementById('hub-title');
    const hubSub = document.getElementById('hub-sub');
    const weatherLocation = document.getElementById('weather-location');
    const weatherNowDesc = document.getElementById('weather-now-desc');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherFeels = document.getElementById('weather-feels');
    const weatherHumidity = document.getElementById('weather-humidity');
    const weatherPrecip = document.getElementById('weather-precip');
    const weatherWind = document.getElementById('weather-wind');
    const bestTimeSummary = document.getElementById('best-time-summary');
    const bestMonthsEl = document.getElementById('best-months');
    const attractionsEl = document.getElementById('attractions');
    const festivalsList = document.getElementById('festivals-list');
    const cuisineList = document.getElementById('cuisine-list');
    const quickFacts = document.getElementById('quick-facts');

    hubTitle.textContent = `${dest} — Destination Hub`;
    hubSub.textContent = `Live updates & rich local info for ${dest}`;

    // Initialize map
    const map = L.map('map', { zoomControl: true, attributionControl: false }).setView([lat || 20, lon || 0], lat && lon ? 9 : 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    let marker;
    if (isFinite(lat) && isFinite(lon)) {
      marker = L.marker([lat, lon]).addTo(map);
      marker.bindPopup(dest).openPopup();
      document.getElementById('open-map').addEventListener('click', () => {
        map.setView([lat, lon], 12, { animate: true });
      });
    } else {
      document.getElementById('open-map').style.display = 'none';
    }

    // Fetch & render weather + climate + highlights
    async function init() {
      try {
        const w = await fetchWeatherAndHourly(lat, lon);
        renderWeather(w);
      } catch (e) {
        console.error('Weather error', e);
        weatherLocation.textContent = dest;
        weatherNowDesc.textContent = 'Weather data unavailable';
      }

      try {
        const climate = await fetchClimate(lat, lon);
        renderClimate(climate);
      } catch (e) {
        console.warn('Climate fetch failed', e);
        bestTimeSummary.textContent = 'Climate normals not available. Use current weather for planning.';
      }

      try {
        const highlights = await fetchLocalHighlights(dest);
        renderHighlights(highlights);
      } catch (e) {
        console.warn('Highlights fetch error', e);
        attractionsEl.innerHTML = `<div class="text-sm text-slate-400">Local highlights not available.</div>`;
      }

      renderQuickFacts();
    }

    function renderWeather(w) {
      if (!w) return;
      weatherLocation.textContent = dest;
      weatherNowDesc.textContent = w.current_description || w.current_weather?.weathercode_description || 'Current conditions';
      weatherTemp.textContent = `${Math.round(w.current_temp)}°`;
      weatherFeels.textContent = `Hourly temperature: ${Math.round(w.next24[0]?.temp ?? w.current_temp)}°`;
      weatherHumidity.textContent = `${Math.round(w.current_humidity)}%`;
      weatherPrecip.textContent = `${(w.precip24h ?? 0).toFixed(1)} mm`;
      weatherWind.textContent = `${(w.current_weather?.windspeed || 0).toFixed(1)} m/s`;

      // small sparkline: show next 12 hour temps
      const spark = document.createElement('div');
      spark.className = 'mt-3 flex items-end gap-1';
      const temps = w.next24.slice(0, 12).map(p => Math.round(p.temp));
      const min = Math.min(...temps);
      const max = Math.max(...temps);
      temps.forEach(t => {
        const h = 40 * ((t - min) / Math.max(1, (max - min))) + 6;
        const bar = document.createElement('div');
        bar.style.height = `${h}px`;
        bar.className = 'w-2 bg-gradient-to-b from-accent to-accent2 rounded-sm';
        bar.title = `${t}°C`;
        spark.appendChild(bar);
      });
      const container = document.createElement('div');
      container.appendChild(spark);
      // append if not existing
      const parent = document.getElementById('weather-card');
      const old = parent.querySelector('.sparkline');
      if (old) old.remove();
      const wrapper = document.createElement('div');
      wrapper.className = 'sparkline mt-3';
      wrapper.appendChild(spark);
      parent.appendChild(wrapper);
    }

    function renderClimate(climate) {
      if (!climate || !climate.monthly) {
        bestTimeSummary.textContent = 'Climate normals unavailable.';
        return;
      }
      // monthly.precipitation & monthly.temperature arrays of length 12 expected
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const temps = climate.monthly.temperature || [];
      const prec = climate.monthly.precipitation || [];

      // Heuristic: prefer months with moderate temps (12-26°C) and low precipitation
      const scored = months.map((m, i) => {
        const t = temps[i] ?? null;
        const p = prec[i] ?? null;
        let score = 0;
        if (t !== null) {
          if (t >= 15 && t <= 26) score += 2;
          else if (t >= 10 && t <= 30) score += 1;
        }
        if (p !== null) {
          if (p < (average(prec) || 50)) score += 1;
        }
        return { month: m, idx: i, score, t, p };
      });

      scored.sort((a,b) => b.score - a.score || (a.p ?? 999) - (b.p ?? 999));
      const top = scored.slice(0, 3).sort((a,b) => a.idx - b.idx);

      bestTimeSummary.textContent = `Top recommended months for ${dest}:`;
      bestMonthsEl.innerHTML = '';
      top.forEach(s => {
        const el = document.createElement('div');
        el.className = 'px-3 py-1 rounded-md bg-slate-800/60 text-sm';
        el.innerHTML = `<strong>${s.month}</strong> ${s.t ? `• ${Math.round(s.t)}°C` : ''} ${s.p ? `• ${Math.round(s.p)} mm` : ''}`;
        bestMonthsEl.appendChild(el);
      });
    }

    function average(arr) {
      if (!arr || arr.length === 0) return null;
      const nums = arr.filter(v => typeof v === 'number');
      return nums.reduce((a,b)=>a+b,0)/nums.length;
    }

    function renderHighlights(h) {
      // attractions (array of {title, extract, thumbnail})
      attractionsEl.innerHTML = '';
      if (h.attractions && h.attractions.length) {
        h.attractions.slice(0,4).forEach(a => {
          const card = document.createElement('div');
          card.className = 'p-3 rounded-lg bg-slate-800/40 border border-slate-700';
          card.innerHTML = `
            <div class="flex items-start gap-3">
              <div class="w-14 h-14 rounded-lg bg-slate-700/30 flex items-center justify-center text-xl">${a.thumbnail ? `<img src="${a.thumbnail}" class="w-full h-full object-cover rounded-lg" alt="${a.title}"/>` : '📍'}</div>
              <div>
                <div class="font-semibold">${a.title}</div>
                <div class="text-sm text-slate-400 mt-1">${a.extract || ''}</div>
              </div>
            </div>
          `;
          attractionsEl.appendChild(card);
        });
      } else {
        attractionsEl.innerHTML = `<div class="text-sm text-slate-400">No top attractions found automatically.</div>`;
      }

      // festivals
      festivalsList.innerHTML = '';
      if (h.festivals && h.festivals.length) {
        h.festivals.slice(0,5).forEach(f => {
          const div = document.createElement('div');
          div.className = 'text-sm text-slate-200';
          div.textContent = `• ${f.title} — ${f.extract ? f.extract.slice(0,120) + (f.extract.length > 120 ? '…' : '') : ''}`;
          festivalsList.appendChild(div);
        });
      } else {
        festivalsList.innerHTML = '<div class="text-sm text-slate-400">No festival info found.</div>';
      }

      // cuisine
      cuisineList.innerHTML = '';
      if (h.cuisine && h.cuisine.length) {
        h.cuisine.slice(0,5).forEach(c => {
          const div = document.createElement('div');
          div.className = 'text-sm text-slate-200';
          div.textContent = `• ${c.title} — ${c.extract ? c.extract.slice(0,140) + (c.extract.length > 140 ? '…' : '') : ''}`;
          cuisineList.appendChild(div);
        });
      } else {
        cuisineList.innerHTML = '<div class="text-sm text-slate-400">No cuisine info found.</div>';
      }
    }

    function renderQuickFacts() {
      quickFacts.innerHTML = `
        <div class="text-sm">Destination: <strong>${dest}</strong></div>
        <div class="text-sm mt-2">Coordinates: <strong>${lat.toFixed(4)}, ${lon.toFixed(4)}</strong></div>
      `;
    }

    init().catch(e => console.error(e));
