import { formatPrice, timeFromMinutes } from '../utils.js';

    export function TransportCard(tr, onCompareToggle, onSaveToggle) {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-media" data-role="media">
          <div style="padding:10px; color:var(--muted); font-size:13px;">${tr.type.toUpperCase()}</div>
        </div>
        <div class="card-body">
          <div class="card-title">
            <div>
              <div class="name">${tr.carrier}</div>
              <div class="meta">${tr.route} • ${tr.depart} - ${tr.arrive}</div>
            </div>
            <div style="text-align:right">
              <div class="rating">${tr.rating}★</div>
              <div class="price">${formatPrice(tr.price)}</div>
            </div>
          </div>

          <div class="amenities">
            <span class="amenity">${tr.class}</span>
            <span class="amenity">${timeFromMinutes(tr.duration_min)}</span>
            ${tr.amenities.map(a => `<span class="amenity">${a.replace('_',' ')}</span>`).join('')}
          </div>

          <div style="display:flex; gap:8px; margin-top:10px; align-items:center;">
            <button class="btn small compare">${tr._compare ? 'Remove' : 'Compare'}</button>
            <button class="btn small save">${tr._saved ? 'Saved' : 'Save'}</button>
            <div class="meta" style="margin-left:auto">${tr.stops} stops</div>
          </div>
        </div>
      `;

      const compareBtn = card.querySelector('.compare');
      const saveBtn = card.querySelector('.save');
      const media = card.querySelector('[data-role=media]');

      compareBtn.addEventListener('click', () => {
        onCompareToggle(tr);
        compareBtn.textContent = tr._compare ? 'Remove' : 'Compare';
      });

      saveBtn.addEventListener('click', () => {
        onSaveToggle(tr);
        saveBtn.textContent = tr._saved ? 'Saved' : 'Save';
      });

      // clicking media opens a lightweight details panel via event
      media.addEventListener('click', () => {
        const event = new CustomEvent('openGallery', { detail: { item: tr }, bubbles: true });
        card.dispatchEvent(event);
      });

      return card;
    }
