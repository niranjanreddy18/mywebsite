import { createEl } from '../utils.js';

    export function Filters(initial = {}) {
      const container = createEl('div', { class: 'filters' });
      container.innerHTML = `
        <h4>Smart Filters</h4>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
          <label>
            <input id="filterPet" type="checkbox"> Pet friendly
          </label>

          <label>
            Min rating:
            <select id="filterRating">
              <option value="0">Any</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
          </label>

          <label>
            Max price:
            <input id="filterMaxPrice" type="number" placeholder="No limit" min="0" style="width:120px;padding:6px;border-radius:8px;background:transparent;border:1px solid rgba(16,24,32,0.06);">
          </label>

          <label>
            Transport type:
            <select id="filterTransportType">
              <option value="all">Any</option>
              <option value="train">Train</option>
              <option value="flight">Flight</option>
            </select>
          </label>

          <button id="applyFilters" class="btn primary">Apply Filters</button>
        </div>
      `;

      function getValues() {
        return {
          petFriendly: container.querySelector('#filterPet').checked,
          minRating: parseFloat(container.querySelector('#filterRating').value) || 0,
          maxPrice: Number(container.querySelector('#filterMaxPrice').value) || Infinity,
          transportType: container.querySelector('#filterTransportType').value || 'all'
        };
      }

      function onApply(cb) {
        container.querySelector('#applyFilters').addEventListener('click', () => cb(getValues()));
      }

      function setFrom(obj = {}) {
        if (obj.petFriendly !== undefined) container.querySelector('#filterPet').checked = !!obj.petFriendly;
        if (obj.minRating !== undefined) container.querySelector('#filterRating').value = String(obj.minRating);
        if (obj.maxPrice !== undefined && isFinite(obj.maxPrice)) container.querySelector('#filterMaxPrice').value = String(obj.maxPrice);
        if (obj.transportType !== undefined) container.querySelector('#filterTransportType').value = obj.transportType;
      }

      return { el: container, onApply, getValues, setFrom };
    }
