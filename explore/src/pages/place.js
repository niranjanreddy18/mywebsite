import { findPlaceById } from '../data.js';

    function getIdFromQuery() {
      const params = new URLSearchParams(window.location.search);
      return params.get('id');
    }

    function renderPlace(place) {
      const container = document.getElementById('placeCard');
      if (!place) {
        container.innerHTML = `
          <div class="p-6">
            <h2 class="text-xl font-semibold">Place not found</h2>
            <p class="text-slate-600 mt-2">The place you're looking for couldn't be found.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="relative">
          <img src="${place.image}" alt="${place.title}" class="w-full h-64 object-cover" />
        </div>
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-1">${place.title}</h2>
          <p class="text-sm text-slate-500 mb-4">${place.season} · ${place.nearby ? 'Nearby' : 'Destination'}</p>
          <p class="text-slate-700 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae eros eget tellus tristique bibendum. Donec rutrum sed sem quis venenatis. Proin viverra risus a eros volutpat tempor. In quis arcu et eros porta lobortis sit amet at magna.</p>

          <div class="mt-6 flex gap-3">
            <a href="#" id="bookBtn" class="px-4 py-2 rounded bg-primary text-white">Book or Explore</a>
            <a href="index.html" class="px-4 py-2 rounded border">Back</a>
          </div>
        </div>
      `;

      // Book button redirects to results with the place pre-filled as destination
      const bookBtn = document.getElementById('bookBtn');
      bookBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = new URL('results.html', window.location.href);
        url.searchParams.set('destination', place.title);
        window.location.href = url.toString();
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      const id = getIdFromQuery();
      const place = findPlaceById(id);
      renderPlace(place);
    });
