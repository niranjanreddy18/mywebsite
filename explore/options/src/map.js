// Map module: creates and manages a Leaflet map
    import L from 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js';
    import { destinations } from './data.js';

    let mapInstance = null;
    let markers = [];
    let currentLayer = null;

    function createTileLayer(style = 'topo') {
      if (style === 'topo') {
        return L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenTopoMap contributors'
        });
      } else if (style === 'sat') {
        return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri'
        });
      } else {
        return L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenTopoMap contributors'
        });
      }
    }

    function initMap(elId, opts = {}) {
      if (mapInstance) return mapInstance;

      const el = document.getElementById(elId);
      mapInstance = L.map(el, { zoomControl: false }).setView([20, 0], 2);

      currentLayer = createTileLayer(opts.style || 'topo');
      currentLayer.addTo(mapInstance);

      L.control.zoom({ position: 'topright' }).addTo(mapInstance);

      // Add markers for initial set
      addAllMarkers(destinations, opts.onClick);

      return mapInstance;
    }

    function clearMarkers() {
      markers.forEach(m => m.remove());
      markers = [];
    }

    function addAllMarkers(list, onClick) {
      if (!mapInstance) return;
      clearMarkers();
      list.forEach(d => {
        const marker = L.circleMarker([d.lat, d.lng], {
          radius: 8,
          color: '#ffffff',
          fillColor: '#06b6d4',
          fillOpacity: 0.95,
          weight: 1.2
        }).addTo(mapInstance);

        marker.bindTooltip(`<strong>${d.name}</strong><br/><span style="font-size:0.9rem;color:var(--text)">${d.region}</span>`, { direction: 'top' });

        marker.on('click', () => {
          if (onClick) onClick(d);
        });

        markers.push(marker);
      });
    }

    function centerOn(destination, opts = {}) {
      if (!mapInstance) return;
      mapInstance.setView([destination.lat, destination.lng], opts.zoom || 13, { animate: true });
      L.popup({ closeButton: false, offset: [0,-10] })
        .setLatLng([destination.lat, destination.lng])
        .setContent(`<strong style="color:var(--text)">${destination.name}</strong>`)
        .openOn(mapInstance);
    }

    function fitToAll() {
      if (!mapInstance || markers.length === 0) return;
      const group = L.featureGroup(markers);
      mapInstance.fitBounds(group.getBounds().pad(0.2));
    }

    function changeStyle(styleName) {
      if (!mapInstance) return;
      if (currentLayer) mapInstance.removeLayer(currentLayer);
      currentLayer = createTileLayer(styleName);
      currentLayer.addTo(mapInstance);
    }

    export { initMap, addAllMarkers, centerOn, fitToAll, changeStyle };
