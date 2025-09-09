// offline.js - simulate area download and storage (localStorage)
    // downloadArea(areaId, onProgress) -> returns { cancel() }

    export function downloadArea(areaId, onProgress = () => {}) {
      let cancelled = false;
      let progress = 0;
      const key = `offline-area:${areaId}`;

      const interval = setInterval(() => {
        if (cancelled) {
          clearInterval(interval);
          onProgress(0);
          return;
        }
        progress += Math.random() * 14 + 5; // increase 5-19%
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          const data = {
            id: areaId,
            downloadedAt: new Date().toISOString(),
            pois: [
              { id: 'sample', name: 'Sample POI', coords: [0,0] }
            ],
            meta: { sizeMB: Math.round(Math.random() * 16 + 4) }
          };
          try { localStorage.setItem(key, JSON.stringify(data)); } catch (err) { console.warn('Storage error', err); }
        }
        onProgress(progress);
      }, 320);

      return {
        cancel() {
          cancelled = true;
          try { localStorage.removeItem(key); } catch (e) {}
        }
      };
    }
