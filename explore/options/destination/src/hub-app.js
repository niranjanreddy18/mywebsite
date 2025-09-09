import { fetchWeatherUnified } from './weather.js';
    import { fetchSeasonalMonthly } from './climate.js';
    import { fetchHighlights } from './highlights.js';
    import { cacheGet, cacheSet } from './cache.js';

    // Read query
    const qs = new URLSearchParams(window.location.search);
    const dest = qs.get('dest') || 'Unknown place';
    const lat = parseFloat(qs.get('lat')) || 0;
    const lon = parseFloat(qs.get('lon')) || 0;

    // DOM nodes
    const weatherLocation = document.getElementById('weather-location');
    const weatherNowDesc = document.getElementById('weather-now-desc');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherHighLow = document.getElementById('weather-highlow');
    const weatherFeels = document.getElementById('weather-feels');
    const weatherHumidity = document.getElementById('weather-humidity');
    const weatherPrecip = document.getElementById('weather-precip');
    const weatherChance = document.getElementById('weather-chance');
    const weatherTip = document.getElementById('weather-tip');
    const dailyForecast = document.getElementById('daily-forecast');

    const bestTimeSummary = document.getElementById('best-time-summary');
    const climateCanvas = document.getElementById('climate-chart').getContext('2d');
    let climateChart = null;

    const attractionsEl = document.getElementById('attractions');
    const eventsList = document.getElementById('events-list');
    const foodList = document.getElementById('food-list');
    const quickFacts = document.getElementById('quick-facts');

    const mapEl = document.getElementById('map');

    // small spinner helper
    function showSpinner(target) {
      const s = document.createElement('div');
      s.className = 'spinner';
      s.innerHTML = '<div class="loader"></div>';
      target.appendChild(s);
      return s;
    }

    function removeSpinner(s) { if (s && s.parentNode) s.parentNode.removeChild(s); }

    // Map init
    const L = (await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js')).default;
    const map = L.map(mapEl, { zoomControl: true, attributionControl: false }).setView((lat && lon) ? [lat, lon] : [20, 0], (lat && lon) ? 10 : 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    let hubMarker = null;
    if (lat && lon) {
      hubMarker = L.marker([lat, lon]).addTo(map).bindPopup(dest);
    }

    // Render functions
    function renderWeatherCard(w) {
      if (!w) { weatherLocation.textContent = dest; weatherNowDesc.textContent = 'Weather unavailable'; return; }
      weatherLocation.textContent = dest;
      weatherNowDesc.textContent = w.provider === 'openweathermap' ? (w.daily[0]?.weather?.desc || '') : 'Current conditions';
      weatherTemp.textContent = `${Math.round(w.current_temp_c)}°C / ${Math.round(w.current_temp_f)}°F`;
      const high = w.daily[0]?.temp_max ?? '—';
      const low = w.daily[0]?.temp_min ?? '—';
      weatherHighLow.textContent = `High ${high}° / Low ${low}°`;
      weatherFeels.textContent = w.feels_like_c != null ? `Feels like ${Math.round(w.feels_like_c)}°C` : '';
      weatherHumidity.textContent = `${w.humidity ?? '—'}%`;
      weatherPrecip.textContent = `${Math.round(w.precip_24h_mm ?? 0)} mm`;
      weatherChance.textContent = `${w.daily[0]?.pop ?? '—'}%`;
      // Weather tip
      const tip = generateWeatherTip(w);
      weatherTip.textContent = tip;

      // daily forecast mini
      dailyForecast.innerHTML = '';
      (w.daily || []).slice(0,5).forEach(d => {
        const box = document.createElement('div');
        box.className = 'p-2 rounded-md bg-white/6';
        const date = new Date(d.date || Date.now()).toLocaleDateString(undefined, { weekday: 'short' });
        const icon = d.weather?.icon ? `<img src="${d.weather.icon}" alt="${d.weather.desc}" class="mx-auto w-10 h-10"/>` : `<div class="text-xl mx-auto">☁️</div>`;
        box.innerHTML = `<div class="text-xs">${date}</div>${icon}<div class="text-sm mt-1">${d.temp_max != null ? Math.round(d.temp_max) + '°' : '—'}</div>`;
        dailyForecast.appendChild(box);
      });
    }

    function generateWeatherTip(w) {
      if (!w) return '';
      const t = w.current_temp_c;
      if (t >= 28) return `Expect hot afternoons. Bring sunglasses and light clothing for ${dest}.`;
      if (t >= 20) return `Pleasant temperatures today. A light jacket for evenings should suffice.`;
      if (t >= 10) return `Cool weather. Pack a warm layer for mornings and evenings.`;
      return `Cold conditions likely. Pack warm clothing and waterproof gear if precipitation is expected.`;
    }

    function renderClimateChart(monthly) {
      if (!monthly || !monthly.length) {
        bestTimeSummary.textContent = 'Seasonal data not available.';
        return;
      }
      const labels = monthly.map(m => m.month);
      const temps = monthly.map(m => m.avg_temp_c ?? null);
      const prec = monthly.map(m => m.avg_precip_mm ?? null);

      if (climateChart) climateChart.destroy();
      climateChart = new Chart(climateCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Avg Temp (°C)', data: temps, backgroundColor: 'rgba(54,162,235,0.7)', yAxisID: 'y' },
            { label: 'Avg Rainfall (mm)', data: prec, backgroundColor: 'rgba(99,99,99,0.6)', yAxisID: 'y1' }
          ]
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          scales: {
            y: { type: 'linear', position: 'left', beginAtZero: true, title: { display: true, text: '°C' } },
            y1: { type: 'linear', position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: 'mm' } }
          },
          plugins: { title: { display: true, text: `${dest} Weather Trends` } }
        }
      });
    }

    function renderHighlights(hl) {
      attractionsEl.innerHTML = '';
      if (hl.attractions && hl.attractions.length) {
        hl.attractions.slice(0,5).forEach(a => {
          const card = document.createElement('div');
          card.className = 'p-3 rounded-lg border bg-white/6';
          card.innerHTML = `
            <div class="flex gap-3 items-start">
              <div class="w-16 h-12 rounded-md overflow-hidden bg-white/8">${a.thumbnail ? `<img src="${a.thumbnail}" alt="${a.title}" class="w-full h-full object-cover"/>` : '📍'}</div>
              <div>
                <div class="font-semibold text-white">${a.title}</div>
                <div class="text-sm text-white/80 mt-1">${a.extract ? a.extract.slice(0,140) + (a.extract.length > 140 ? '…' : '') : ''}</div>
              </div>
            </div>
          `;
          attractionsEl.appendChild(card);
        });
      } else {
        attractionsEl.innerHTML = '<div class="text-white/80">No attractions found.</div>';
      }

      eventsList.innerHTML = '';
      if (hl.events && hl.events.length) {
        hl.events.slice(0,4).forEach(ev => {
          const d = document.createElement('div');
          d.className = 'text-sm text-white/80';
          d.innerHTML = `<div class="font-semibold">${ev.title}</div><div>${ev.start ? new Date(ev.start).toLocaleDateString() : ''}</div><div class="mt-1">${ev.description ? ev.description.slice(0,140) + (ev.description.length > 140 ? '…' : '') : ''}</div>`;
          eventsList.appendChild(d);
        });
      } else {
        eventsList.innerHTML = '<div class="text-white/80">No upcoming events found.</div>';
      }

      foodList.innerHTML = '';
      if (hl.cuisine && hl.cuisine.length) {
        hl.cuisine.slice(0,4).forEach(f => {
          const el = document.createElement('div');
          el.className = 'text-sm text-white/80';
          el.innerHTML = `<div class="font-semibold">${f.title}</div><div class="mt-1">${f.extract ? f.extract.slice(0,140) + (f.extract.length > 140 ? '…' : '') : ''}</div>`;
          foodList.appendChild(el);
        });
      } else {
        foodList.innerHTML = '<div class="text-white/80">No food specialties found.</div>';
      }
    }

    function renderQuickFacts() {
      quickFacts.innerHTML = `
        <div>Destination: <strong>${dest}</strong></div>
        <div class="mt-2">Coordinates: <strong>${lat ? lat.toFixed(4) : '—'}, ${lon ? lon.toFixed(4) : '—'}</strong></div>
      `;
    }

    // Orchestrator with caching and spinners
    async function init() {
      document.getElementById('hub-title').textContent = `${dest} — Destination Hub`;
      const spinner = showSpinner(document.querySelector('#weather-card'));

      try {
        const w = await fetchWeatherUnified(lat, lon);
        renderWeatherCard(w);
      } catch (e) {
        console.error('Weather error', e);
        weatherLocation.textContent = dest;
        weatherNowDesc.textContent = 'Weather data unavailable';
      } finally {
        removeSpinner(spinner);
      }

      // climate
      const spinner2 = showSpinner(document.getElementById('when-card'));
      try {
        const climate = await fetchSeasonalMonthly(lat, lon);
        if (climate && climate.months) {
          bestTimeSummary.textContent = `Seasonal averages (monthly) for ${dest}`;
          renderClimateChart(climate.months);
          // simple recommendation: find months with moderate temp & low precip
          const months = climate.months;
          const recommended = months.filter(m => m.avg_temp_c != null && m.avg_temp_c >= 12 && m.avg_temp_c <= 26).slice(0,4).map(m => m.month);
          document.getElementById('season-recommend').textContent = recommended.length ? `Recommended months: ${recommended.join(', ')}` : 'Consider shoulder seasons for best balance.';
        } else {
          bestTimeSummary.textContent = 'Seasonal data not available.';
        }
      } catch (e) {
        console.warn('Climate error', e);
        bestTimeSummary.textContent = 'Seasonal data unavailable.';
      } finally {
        removeSpinner(spinner2);
      }

      // highlights
      const spinner3 = showSpinner(document.getElementById('highlights-card'));
      try {
        const hl = await fetchHighlights(dest, lat, lon);
        renderHighlights(hl);
      } catch (e) {
        console.warn('Highlights error', e);
        attractionsEl.innerHTML = '<div class="text-white/80">Could not retrieve local highlights.</div>';
      } finally {
        removeSpinner(spinner3);
      }

      renderQuickFacts();
    }

    init().catch(e => console.error(e));
