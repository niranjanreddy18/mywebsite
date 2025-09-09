import { getNearbyPlaces } from '../data.js';

    // parse query string and present summary
    function parseQuery() {
      const params = new URLSearchParams(window.location.search);
      const summary = {
        destination: params.get('destination') || '',
        startDate: params.get('startDate') || '',
        endDate: params.get('endDate') || '',
        budget: params.get('budget') || '',
        tripType: params.get('tripType') || '',
        interests: params.getAll('interest') // can be multiple
      };
      return summary;
    }

    function renderSummary(s) {
      const container = document.getElementById('summary');
      container.innerHTML = `
        ${s.destination ? `<div><strong>Destination:</strong> ${escapeHtml(s.destination)}</div>` : ''}
        <div><strong>Dates:</strong> ${escapeHtml(s.startDate)} → ${escapeHtml(s.endDate)}</div>
        <div><strong>Budget:</strong> ${escapeHtml(s.budget)}</div>
        <div><strong>Trip Type:</strong> ${escapeHtml(s.tripType)}</div>
        <div><strong>Interests:</strong> ${s.interests.length ? escapeHtml(s.interests.join(', ')) : '—'}</div>
      `;
    }

    // show a few suggestions (nearby)
    function renderSuggestions() {
      const suggestionsEl = document.getElementById('suggestions');
      const list = getNearbyPlaces(4);
      suggestionsEl.innerHTML = '';
      list.forEach(p => {
        const a = document.createElement('a');
        a.href = `place.html?id=${encodeURIComponent(p.id)}`;
        a.className = 'flex gap-3 items-center p-3 rounded-lg border hover:shadow transition bg-white';
        a.innerHTML = `
          <img src="${p.image}" alt="${p.title}" class="w-20 h-14 object-cover rounded-md" />
          <div>
            <div class="font-semibold">${p.title}</div>
            <div class="text-xs text-slate-500">${p.season} · ${p.nearby ? 'Nearby' : 'Destination'}</div>
          </div>
        `;
        suggestionsEl.appendChild(a);
      });
    }

    function escapeHtml(str) {
      return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    }

    // Init
    document.addEventListener('DOMContentLoaded', () => {
      const summary = parseQuery();
      renderSummary(summary);
      renderSuggestions();
    });
