    import { nominatimSearch, getCapitalForCountryName } from './search.js';

    const input = document.getElementById('search-input');
    const suggestions = document.getElementById('suggestions');
    const detectBtn = document.getElementById('detect-btn');
    const goHub = document.getElementById('go-hub');
    const recentList = document.getElementById('recent-list');
    const fallbacks = document.getElementById('fallbacks');

    let timer = null;
    let lastResults = [];

    function renderRecent() {
      const raw = localStorage.getItem('hub-recent') || '[]';
      const arr = JSON.parse(raw);
      recentList.innerHTML = arr.map(it => `<li><button class="text-weatherBlue hover:underline link-suggestion" data-val="${it}">${it}</button></li>`).join('') || '<li class="text-white/60">No recent searches</li>';
      document.querySelectorAll('.link-suggestion').forEach(b => {
        b.addEventListener('click', () => {
          input.value = b.dataset.val;
          performSearch(b.dataset.val);
        });
      });
    }

    function addRecent(v) {
      if (!v) return;
      const raw = localStorage.getItem('hub-recent') || '[]';
      const arr = JSON.parse(raw);
      if (arr[0] === v) return;
      const next = [v].concat(arr.filter(x => x !== v)).slice(0,6);
      localStorage.setItem('hub-recent', JSON.stringify(next));
      renderRecent();
    }

    async function showFallbacksFor(q) {
      fallbacks.innerHTML = 'Searching fallback suggestions...';
      // if contains comma and likely country part, fetch capital
      const parts = q.split(',');
      if (parts.length > 1) {
        const country = parts[parts.length - 1].trim();
        const cap = await getCapitalForCountryName(country);
        if (cap) {
          fallbacks.innerHTML = `Suggested capital for ${country}: <button id="cap-btn" class="text-weatherBlue hover:underline">${cap}</button>`;
          document.getElementById('cap-btn').addEventListener('click', () => { input.value = `${cap}, ${country}`; });
          return;
        }
      }
      // generic: ask nominatim with fuzzy limit=5
      try {
        const results = await nominatimSearch(q, 5);
        if (results && results.length) {
          fallbacks.innerHTML = results.map(r => `<div class="py-1"><button class="text-weatherBlue link-suggestion" data-lat="${r.lat}" data-lon="${r.lon}" data-display="${r.display}">${r.display}</button></div>`).join('');
          document.querySelectorAll('.link-suggestion').forEach(b => {
            b.addEventListener('click', () => {
              input.value = b.dataset.display;
            });
          });
          return;
        }
      } catch (e) {
        /* ignore */
      }
      fallbacks.innerHTML = 'No fallback suggestions available.';
    }

    async function performSearch(q) {
      suggestions.classList.add('hidden');
      if (!q || q.trim().length < 2) return;
      try {
        const res = await nominatimSearch(q, 8);
        lastResults = res;
        if (!res || !res.length) {
          suggestions.classList.add('hidden');
          showFallbacksFor(q);
          return;
        }
        suggestions.innerHTML = res.map((r,i) => `<li class="p-2 hover:bg-white/6 cursor-pointer" data-i="${i}">${r.display}</li>`).join('');
        suggestions.classList.remove('hidden');
        suggestions.querySelectorAll('li').forEach(li => {
          li.addEventListener('click', () => {
            const i = parseInt(li.dataset.i, 10);
            const sel = lastResults[i];
            input.value = sel.display;
            suggestions.classList.add('hidden');
            saveSelectionAndGo(sel);
          });
        });
      } catch (e) {
        suggestions.classList.add('hidden');
        showFallbacksFor(q);
      }
    }

    function debounceSearch(ev) {
      clearTimeout(timer);
      timer = setTimeout(() => performSearch(input.value.trim()), 300);
    }

    async function saveSelectionAndGo(sel) {
      // Save selected location to localStorage and redirect to hub with lat/lon
      addRecent(sel.display);
      const params = new URLSearchParams({ dest: sel.display, lat: String(sel.lat), lon: String(sel.lon) });
      window.location.href = `hub.html?${params.toString()}`;
    }

    input.addEventListener('input', debounceSearch);

    detectBtn.addEventListener('click', () => {
      if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
      detectBtn.textContent = 'Detecting…';
      navigator.geolocation.getCurrentPosition(async pos => {
        detectBtn.textContent = 'Detect';
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        // reverse geocode to get display name
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          const display = data.display_name || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
          input.value = display;
          addRecent(display);
        } catch (e) {
          alert('Could not detect location');
        }
      }, err => {
        detectBtn.textContent = 'Detect';
        alert('Permission denied or unavailable');
      }, { timeout: 8000 });
    });

    goHub.addEventListener('click', async () => {
      const q = input.value.trim();
      if (!q) { alert('Please enter a destination'); return; }
      // Try to find selection among lastResults
      const matched = lastResults.find(r => r.display === q);
      if (matched) { saveSelectionAndGo(matched); return; }
      // else perform single search and redirect
      try {
        const res = await nominatimSearch(q, 1);
        if (res && res.length) {
          saveSelectionAndGo(res[0]);
          return;
        }
        // fallback to capital suggestion
        const parts = q.split(',');
        if (parts.length > 1) {
          const country = parts[parts.length - 1].trim();
          const cap = await getCapitalForCountryName(country);
          if (cap) {
            input.value = `${cap}, ${country}`;
            // try again
            const res2 = await nominatimSearch(input.value, 1);
            if (res2 && res2.length) {
              saveSelectionAndGo(res2[0]); return;
            }
          }
        }
        alert('Could not find location. Try another query or select a suggestion.');
      } catch (e) {
        alert('Search failed. Check your network.');
      }
    });

    // init recent
    renderRecent();
    // If user presses Enter in input, try goHub
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); goHub.click(); }
    });
