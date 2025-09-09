import { formatPrice } from '../utils.js';

    export function HotelCard(hotel, onCompareToggle, onSaveToggle) {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-media" data-role="media">
          <img src="${hotel.image}" alt="${hotel.name}">
        </div>
        <div class="card-body">
          <div class="card-title">
            <div>
              <div class="name">${hotel.name}</div>
              <div class="meta">${hotel.city} • ${hotel.distance_km} km from center</div>
            </div>
            <div style="text-align:right">
              <div class="rating">${hotel.rating}★</div>
              <div class="price">${formatPrice(hotel.price)}</div>
            </div>
          </div>
          <div class="amenities">
            ${hotel.amenities.map(a => `<span class="amenity">${a.replace('_',' ')}</span>`).join('')}
          </div>
          <div style="display:flex; gap:8px; margin-top:10px; align-items:center;">
            <button class="btn small compare">${hotel._compare ? 'Remove' : 'Compare'}</button>
            <button class="btn small save">${hotel._saved ? 'Saved' : 'Save'}</button>
            <div class="meta" style="margin-left:auto">${hotel.reviews} reviews</div>
          </div>
        </div>
      `;

      const compareBtn = card.querySelector('.compare');
      const saveBtn = card.querySelector('.save');
      const media = card.querySelector('[data-role=media]');

      compareBtn.addEventListener('click', () => {
        onCompareToggle(hotel);
        compareBtn.textContent = hotel._compare ? 'Remove' : 'Compare';
      });

      saveBtn.addEventListener('click', () => {
        onSaveToggle(hotel);
        saveBtn.textContent = hotel._saved ? 'Saved' : 'Save';
      });

      // clicking media opens gallery
      media.addEventListener('click', () => {
        const event = new CustomEvent('openGallery', { detail: { item: hotel }, bubbles: true });
        card.dispatchEvent(event);
      });

      return card;
    }
