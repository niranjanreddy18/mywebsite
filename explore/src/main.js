// Main entry for index.html: render cards and wire interactions
    import { places, getNearbyPlaces, getSeasonalPlaces } from './data.js';

    // Utility to create a place card element
    function createCard(place) {
      const a = document.createElement('a');
      a.href = `place.html?id=${encodeURIComponent(place.id)}`;
      a.className = 'block rounded-xl overflow-hidden bg-white shadow card hover:shadow-lg transition';

      a.innerHTML = `
        <div class="relative">
          <img src="${place.image}" alt="${place.title}" loading="lazy" class="w-full h-44 object-cover card-image" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-90"></div>
          <div class="absolute left-4 bottom-4 text-white">
            <h4 class="text-lg font-semibold">${place.title}</h4>
            <p class="text-xs opacity-90">${place.season} · ${place.nearby ? 'Nearby' : 'Destination'}</p>
          </div>
        </div>
      `;

      // When clicked, browser will navigate to place.html. No extra JS needed.
      return a;
    }

    // Render sections
    function renderSections() {
      const nearbyEl = document.getElementById('nearby');
      const seasonalEl = document.getElementById('seasonal');
      const nearby = getNearbyPlaces(6);
      const seasonal = getSeasonalPlaces('Summer', 6);

      nearby.forEach(p => {
        nearbyEl.appendChild(createCard(p));
      });

      seasonal.forEach(p => {
        seasonalEl.appendChild(createCard(p));
      });
    }

    // Small enhancement: when form checkboxes are toggled change style to indicate selection
    function enhanceFormToggles() {
      const planner = document.getElementById('plannerForm');
      if (!planner) return;

      // For checkbox interest labels, toggle bg on checked
      planner.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const label = checkbox.closest('label');
        function update() {
          if (checkbox.checked) {
            label.classList.add('bg-primary', 'text-white', 'border-transparent');
            label.classList.remove('bg-white');
            label.querySelector('span')?.classList.add('brightness-110');
          } else {
            label.classList.remove('bg-primary', 'text-white', 'border-transparent');
          }
        }
        checkbox.addEventListener('change', update);
        update();
      });

      // For radio groups, we rely on peer and native radio behavior, but add keyboard support
      planner.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('keydown', (e) => {
          // allow arrow keys to navigate radios
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const group = Array.from(planner.querySelectorAll(`input[name="${radio.name}"]`));
            const idx = group.indexOf(radio);
            let nextIdx = idx;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              nextIdx = (idx + 1) % group.length;
            } else {
              nextIdx = (idx - 1 + group.length) % group.length;
            }
            group[nextIdx].checked = true;
            group[nextIdx].focus();
            // trigger change event
            group[nextIdx].dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      });
    }

    // Render current year in footer
    function setYear() {
      const y = new Date().getFullYear();
      const el = document.getElementById('year');
      if (el) el.textContent = y;
    }

    // Init
    document.addEventListener('DOMContentLoaded', () => {
      renderSections();
      enhanceFormToggles();
      setYear();
    });
