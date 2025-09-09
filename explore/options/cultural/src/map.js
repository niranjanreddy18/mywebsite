// map.js - lightweight interactive map renderer with polished interactions
    // exports createMap(containerId, pois)
    // map API: on(event, handler), setPinsVisible(bool), centerAll(), centerOn(id), pulseAll(), highlightPair(a,b)

    const EVENT_HANDLERS = new Map();

    export function createMap(containerId, pois = []) {
      const container = document.getElementById(containerId);
      if (!container) throw new Error('Map container not found');

      // state
      const state = {
        pois: JSON.parse(JSON.stringify(pois)),
        pinsVisible: true,
        bounds: computeBounds(pois)
      };

      container.innerHTML = '';
      container.tabIndex = 0;
      container.classList.add('map-stage-wrapper');

      // stage holds pins and interactions
      const stage = document.createElement('div');
      stage.className = 'map-stage';
      stage.style.position = 'absolute';
      stage.style.inset = '0';
      stage.style.zIndex = '2';
      container.appendChild(stage);

      // subtle background parallax layer
      const bg = document.createElement('div');
      bg.className = 'map-bg';
      bg.style.position = 'absolute';
      bg.style.inset = '0';
      bg.style.zIndex = '1';
      bg.style.pointerEvents = 'none';
      container.appendChild(bg);

      // create pins
      state.pois.forEach(p => {
        const el = createPinElement(p);
        el.dataset.id = p.id;
        el.classList.add('pin', p.type);
        // compute position
        const pos = coordToPercent(p.coords, state.bounds);
        el.style.left = `${pos.x}%`;
        el.style.top = `${pos.y}%`;
        stage.appendChild(el);

        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          dispatch('pinClick', { id: p.id });
          showTooltip(el, p.name);
        });

        // keyboard
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            el.click();
          }
        });
      });

      // hide tooltips on stage click
      container.addEventListener('click', () => {
        document.querySelectorAll('.pin.show-tooltip').forEach(t => t.classList.remove('show-tooltip'));
      });

      // parallax on mouse move
      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        bg.style.transform = `translate(${px * 6}px, ${py * 4}px) scale(1.03) rotate(${px * 1.2}deg)`;
      });

      // API
      return {
        on: (evt, handler) => {
          if (!EVENT_HANDLERS.has(evt)) EVENT_HANDLERS.set(evt, []);
          EVENT_HANDLERS.get(evt).push(handler);
        },
        setPinsVisible: (v) => {
          state.pinsVisible = Boolean(v);
          stage.querySelectorAll('.pin').forEach(p => {
            p.style.display = state.pinsVisible ? 'inline-grid' : 'none';
          });
        },
        centerAll: () => {
          // do a gentle pulse series
          pulseAll();
        },
        centerOn: (id) => {
          const el = stage.querySelector(`.pin[data-id="${id}"]`);
          if (!el) return;
          el.classList.add('show-tooltip');
          setTimeout(() => el.classList.remove('show-tooltip'), 2400);
        },
        pulseAll: pulseAll,
        highlightPair: (aId, bId) => {
          const a = stage.querySelector(`.pin[data-id="${aId}"]`);
          const b = stage.querySelector(`.pin[data-id="${bId}"]`);
          [a, b].forEach(el => {
            if (!el) return;
            el.classList.add('pulse');
            el.style.transform = 'translate(-50%,-100%) scale(1.12)';
            setTimeout(() => {
              el.classList.remove('pulse');
              el.style.transform = '';
            }, 1400);
          });
          if (a) showTooltip(a, a.dataset.id || '');
          if (b) showTooltip(b, b.dataset.id || '');
        }
      };

      // helpers
      function dispatch(evt, detail) {
        const handlers = EVENT_HANDLERS.get(evt) || [];
        handlers.forEach(h => h(detail));
      }

      function createPinElement(poi) {
        const el = document.createElement('div');
        el.className = 'pin';
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', poi.name);
        el.tabIndex = 0;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = poi.name;

        const dot = document.createElement('span');
        dot.className = 'dot';

        el.appendChild(tooltip);
        el.appendChild(dot);

        // subtle entrance animation
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%,-120%) scale(0.98)';
        requestAnimationFrame(() => {
          setTimeout(() => {
            el.style.transition = 'opacity 420ms ease, transform 420ms cubic-bezier(.2,.9,.2,1)';
            el.style.opacity = '1';
            el.style.transform = 'translate(-50%,-100%) scale(1)';
          }, 40 + Math.random() * 220);
        });

        return el;
      }

      function showTooltip(el, text) {
        const tip = el.querySelector('.tooltip');
        if (tip) tip.textContent = text;
        document.querySelectorAll('.pin.show-tooltip').forEach(t => t.classList.remove('show-tooltip'));
        el.classList.add('show-tooltip');
        setTimeout(() => el.classList.remove('show-tooltip'), 2400);
      }

      function pulseAll() {
        const pins = Array.from(stage.querySelectorAll('.pin'));
        pins.forEach((p, i) => {
          setTimeout(() => {
            p.classList.add('pulse');
            p.style.transform = 'translate(-50%,-100%) scale(1.08)';
            setTimeout(() => {
              p.classList.remove('pulse');
              p.style.transform = '';
            }, 520);
          }, i * 110);
        });
      }

      function computeBounds(items) {
        if (!items || items.length === 0) return { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 };
        const lats = items.map(x => x.coords[0]);
        const lons = items.map(x => x.coords[1]);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const latPad = (maxLat - minLat) * 0.14 || 0.02;
        const lonPad = (maxLon - minLon) * 0.14 || 0.02;
        return { minLat: minLat - latPad, maxLat: maxLat + latPad, minLon: minLon - lonPad, maxLon: maxLon + lonPad };
      }

      function coordToPercent([lat, lon], bounds) {
        const latRange = bounds.maxLat - bounds.minLat || 1;
        const lonRange = bounds.maxLon - bounds.minLon || 1;
        const x = ((lon - bounds.minLon) / lonRange) * 100;
        const y = (1 - (lat - bounds.minLat) / latRange) * 100;
        return { x: clamp(x, 3, 97), y: clamp(y, 4, 96) };
      }

      function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    }
