// UI module: builds DOM, handles interactions, modals and updates
    import { destIndex, destinations } from './data.js';
    import { initMap, centerOn, fitToAll, changeStyle } from './map.js';

    const yearEl = document.getElementById('year');
    const searchInput = document.getElementById('search-input');
    const mapStyleSelect = document.getElementById('map-style');
    const stayListEl = document.getElementById('stay-list');
    const cultureListEl = document.getElementById('culture-list');
    const communityListEl = document.getElementById('community-list');
    const safetyListEl = document.getElementById('safety-list');
    const modalRoot = document.getElementById('modal-root');

    function setYear() {
      const y = new Date().getFullYear();
      yearEl.textContent = y;
    }

    function renderStayCards(list) {
      stayListEl.innerHTML = '';
      list.forEach(dest => {
        const wrapper = document.createElement('div');
        wrapper.className = 'card';
        wrapper.innerHTML = `
          <div class="thumb" style="background-image:url('${dest.thumbnail}')"></div>
          <div class="meta">
            <div class="title">${dest.name}</div>
            <div class="muted">${dest.summary}</div>
            <div style="margin-top:8px">
              <button class="btn small" data-action="view" data-id="${dest.id}">View</button>
              <button class="btn small" data-action="center" data-id="${dest.id}">Show on map</button>
            </div>
          </div>
        `;

        wrapper.querySelector('[data-action="view"]').addEventListener('click', () => openDetails(dest));
        wrapper.querySelector('[data-action="center"]').addEventListener('click', () => {
          centerOn(dest, { zoom: 13 });
        });

        stayListEl.appendChild(wrapper);
      });
    }

    function renderCulture() {
      cultureListEl.innerHTML = '';
      destinations.forEach(dest => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div style="flex:1">
            <div class="title">${dest.name}</div>
            <div class="muted">${dest.region} • ${dest.summary}</div>
            <ul style="margin-top:8px;padding-left:18px">
              ${dest.culture.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
          <div style="min-width:64px;display:flex;align-items:center;justify-content:center">
            <button class="btn" data-id="${dest.id}">Explore</button>
          </div>
        `;
        card.querySelector('button').addEventListener('click', () => openDetails(dest));
        cultureListEl.appendChild(card);
      });
    }

    function renderCommunity() {
      communityListEl.innerHTML = '';
      destinations.forEach(dest => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div style="flex:1">
            <div class="title">${dest.name} • Community</div>
            <div class="muted">${dest.region}</div>
            <ul style="margin-top:8px;padding-left:18px">
              ${dest.community.map(c => `<li><strong>${c.title}</strong> — ${c.date} <a href="${c.link}" style="margin-left:8px;color:var(--accent)">Details</a></li>`).join('')}
            </ul>
          </div>
        `;
        communityListEl.appendChild(card);
      });
    }

    function renderSafety() {
      safetyListEl.innerHTML = '';
      destinations.forEach(dest => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div style="flex:1">
            <div class="title">${dest.name} • Safety</div>
            <div class="muted">${dest.region}</div>
            <ul style="margin-top:8px;padding-left:18px">
              ${dest.safety.map(s => `<li><strong>${s.level}:</strong> ${s.notes}</li>`).join('')}
            </ul>
          </div>
        `;
        safetyListEl.appendChild(card);
      });
    }

    function openDetails(dest) {
      centerOn(dest, { zoom: 12 });
      openModal(dest);
    }

    function openModal(dest) {
      modalRoot.innerHTML = '';
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-label="Details: ${dest.name}">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:700;font-size:1.05rem">${dest.name}</div>
              <div class="muted">${dest.region}</div>
            </div>
            <button id="modal-close" class="btn">Close</button>
          </div>

          <div style="margin-top:12px">
            <p>${dest.summary}</p>

            <h4>Culture Tips</h4>
            <ul>${dest.culture.map(c => `<li>${c}</li>`).join('')}</ul>

            <h4>Community</h4>
            <ul>${dest.community.map(c => `<li>${c.title} — ${c.date}</li>`).join('')}</ul>

            <div style="display:flex;gap:8px;margin-top:12px">
              <button id="modal-directions" class="btn primary">Open Directions</button>
              <button id="modal-book" class="btn">Book a Stay</button>
            </div>
          </div>
        </div>
      `;

      modalRoot.appendChild(backdrop);
      backdrop.querySelector('#modal-close').addEventListener('click', () => closeModal());
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });

      backdrop.querySelector('#modal-directions').addEventListener('click', () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest.lat + ',' + dest.lng)}&travelmode=driving`;
        window.open(url, '_blank');
      });

      backdrop.querySelector('#modal-book').addEventListener('click', () => {
        alert('Booking flow placeholder — link to booking providers or integrated widget.');
      });
    }

    function closeModal() {
      modalRoot.innerHTML = '';
    }

    function wireSearch(cb) {
      let timer = null;
      if (!searchInput) return;
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (!q) { cb(destinations); return; }
          const filtered = destinations.filter(d => {
            return d.name.toLowerCase().includes(q) ||
                   d.summary.toLowerCase().includes(q) ||
                   d.culture.join(' ').toLowerCase().includes(q);
          });
          cb(filtered);
        }, 220);
      });
    }

    function wireMapStyle() {
      if (!mapStyleSelect) return;
      mapStyleSelect.addEventListener('change', (e) => {
        changeStyle(e.target.value);
      });
    }

    function wireThemeToggle() {
      const btn = document.getElementById('theme-toggle');
      if (!btn) return;
      btn.addEventListener('click', () => {
        document.body.classList.toggle('light');
        btn.textContent = document.body.classList.contains('light') ? '🌞' : '🌙';
      });
    }

    function setYear() {
      const el = document.getElementById('year');
      if (el) el.textContent = new Date().getFullYear();
    }

    function initApp() {
      setYear();
      renderStayCards(destinations);
      renderCulture();
      renderCommunity();
      renderSafety();

      // init map in index page map container if present
      const mapEl = document.getElementById('map');
      if (mapEl) {
        initMap('map', { style: 'topo', onClick: (d) => openDetails(d) });
      }

      wireSearch((filteredList) => {
        if (filteredList.length > 0) {
          renderStayCards(filteredList);
        } else {
          if (stayListEl) stayListEl.innerHTML = `<div class="muted">No results found.</div>`;
        }
        window.dispatchEvent(new CustomEvent('dest-filter', { detail: filteredList }));
      });

      wireMapStyle();
      wireThemeToggle();

      document.getElementById('feedback-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Feedback placeholder — integrate a form or third-party widget.');
      });
      document.getElementById('credits-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Built with OpenStreetMap, Leaflet and modern web APIs.');
      });

      window.addEventListener('marker-click', (e) => {
        if (!e.detail) return;
        openDetails(e.detail);
      });
    }

    export { initApp, openDetails, openModal, closeModal, renderStayCards, setYear };
