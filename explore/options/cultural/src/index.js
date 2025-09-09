import { createMap } from './map.js';
    import { calculateDistanceKm, estimateTime } from './distance.js';
    import { downloadArea } from './offline.js';

    const POIS = [
      { id: 'central-park', name: 'Central Park', type: 'poi', coords: [40.785091, -73.968285] },
      { id: 'grand-hotel', name: 'Grand Hotel', type: 'hotel', coords: [40.758896, -73.985130] },
      { id: 'city-museum', name: 'City Museum', type: 'poi', coords: [40.779437, -73.963244] },
      { id: 'main-station', name: 'Main Station', type: 'station', coords: [40.752726, -73.977229] },
      { id: 'ferry-terminal', name: 'Ferry Terminal', type: 'station', coords: [40.700292, -74.012085] }
    ];

    // Initialize map with POIs
    const map = createMap('map', POIS);

    // gentle initial pulse
    setTimeout(() => map.pulseAll(), 600);

    const mapEl = document.getElementById('map');
    const exitFsBtn = document.getElementById('exit-fullscreen');

    // Wire up feature buttons (delegation)
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        // If this is the "View" inside the feature card, open fullscreen map.
        if (action === 'focus-map') {
          // detect if originating from a feature card "View"
          if (btn.closest && btn.closest('.feature-card')) {
            openFullscreenMap();
            return;
          }
          // otherwise, just pulse
          map.pulseAll();
        } else if (action === 'download-area') {
          startDownloadDemo();
        } else if (action === 'open-calculator') {
          openCalculator();
        }
      });
    });

    // Toggle pins
    const togglePins = document.getElementById('toggle-pins');
    togglePins.addEventListener('change', (e) => {
      map.setPinsVisible(e.target.checked);
    });

    // Center all
    document.getElementById('center-all').addEventListener('click', () => {
      map.centerAll();
    });

    // Download demo
    const downloadStatus = document.getElementById('download-status');
    const progressEl = downloadStatus.querySelector('.download-progress');
    const downloadLabel = document.getElementById('download-label');
    const cancelDownload = document.getElementById('cancel-download');

    let currentDownload = null;
    function startDownloadDemo() {
      if (currentDownload) return;
      downloadStatus.hidden = false;
      progressEl.style.width = '0%';
      downloadLabel.textContent = 'Downloading area...';
      currentDownload = downloadArea('downtown-01', (progress) => {
        progressEl.style.width = `${Math.min(progress,100)}%`;
        downloadLabel.textContent = `Downloading area... ${Math.round(Math.min(progress,100))}%`;
        if (progress >= 100) {
          downloadLabel.textContent = 'Download complete';
          currentDownload = null;
          setTimeout(() => downloadStatus.hidden = true, 900);
        }
      });
    }

    cancelDownload.addEventListener('click', () => {
      if (currentDownload) {
        currentDownload.cancel();
        downloadLabel.textContent = 'Cancelled';
        currentDownload = null;
        setTimeout(() => downloadStatus.hidden = true, 700);
      }
    });

    // Distance calculator modal
    const modal = document.getElementById('calc-modal');
    const fromSelect = document.getElementById('from-select');
    const toSelect = document.getElementById('to-select');
    const modeSelect = document.getElementById('mode-select');
    const distanceForm = document.getElementById('distance-form');
    const calcResult = document.getElementById('calc-result');
    const distanceKmEl = document.getElementById('distance-km');
    const etaEl = document.getElementById('eta');
    const closeCalc = document.getElementById('close-calc');

    function openCalculator() {
      [fromSelect, toSelect].forEach(sel => {
        sel.innerHTML = '';
        POIS.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = `${p.name} — ${capitalize(p.type)}`;
          sel.appendChild(opt);
        });
      });

      if (fromSelect.options.length > 1) toSelect.selectedIndex = 1;
      modal.setAttribute('aria-hidden', 'false');
      setTimeout(() => fromSelect.focus(), 80);
    }

    closeCalc.addEventListener('click', () => {
      modal.setAttribute('aria-hidden', 'true');
      calcResult.hidden = true;
      distanceForm.reset();
    });

    distanceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fromId = fromSelect.value;
      const toId = toSelect.value;
      if (!fromId || !toId || fromId === toId) {
        alert('Please select two different locations.');
        return;
      }
      const from = POIS.find(p => p.id === fromId);
      const to = POIS.find(p => p.id === toId);
      const km = calculateDistanceKm(from.coords, to.coords);
      const mode = modeSelect.value;
      const eta = estimateTime(km, mode);

      distanceKmEl.textContent = km.toFixed(2);
      etaEl.textContent = eta;
      calcResult.hidden = false;

      map.highlightPair(from.id, to.id);
      modal.setAttribute('aria-hidden', 'true');
    });

    // allow pins to trigger detail display or actions
    map.on('pinClick', ({ id }) => {
      map.centerOn(id);
      openCalculator();
      fromSelect.value = id;
    });

    // Fullscreen handling
    function openFullscreenMap() {
      if (!mapEl) return;
      // Try native fullscreen
      const el = mapEl;
      const request = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      if (request) {
        try {
          request.call(el);
        } catch (err) {
          // fallback to class based fullscreen
          enableFallbackFullscreen();
        }
      } else {
        // no fullscreen API -> fallback
        enableFallbackFullscreen();
      }
    }

    function enableFallbackFullscreen() {
      if (!mapEl) return;
      mapEl.classList.add('is-fullscreen');
      document.documentElement.style.overflow = 'hidden';
      exitFsBtn.hidden = false;
      mapEl.focus();
    }

    function exitFallbackFullscreen() {
      if (!mapEl) return;
      mapEl.classList.remove('is-fullscreen');
      document.documentElement.style.overflow = '';
      exitFsBtn.hidden = true;
    }

    exitFsBtn.addEventListener('click', () => {
      exitFullscreenMap();
    });

    function exitFullscreenMap() {
      if (document.fullscreenElement) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) {
          exit.call(document);
          return;
        }
      }
      exitFallbackFullscreen();
    }

    document.addEventListener('fullscreenchange', () => {
      const fsEl = document.fullscreenElement;
      if (fsEl === mapEl) {
        mapEl.classList.add('is-fullscreen');
        exitFsBtn.hidden = false;
      } else {
        mapEl.classList.remove('is-fullscreen');
        exitFsBtn.hidden = true;
      }
    });

    document.addEventListener('webkitfullscreenchange', () => {
      const fsEl = document.webkitFullscreenElement;
      if (fsEl === mapEl) {
        mapEl.classList.add('is-fullscreen');
        exitFsBtn.hidden = false;
      } else {
        mapEl.classList.remove('is-fullscreen');
        exitFsBtn.hidden = true;
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (mapEl.classList.contains('is-fullscreen') && !document.fullscreenElement) {
          exitFallbackFullscreen();
        }
        if (modal.getAttribute('aria-hidden') === 'false') {
          closeCalc.click();
        }
      }
    });

    function capitalize(s) { return s[0].toUpperCase() + s.slice(1); }
