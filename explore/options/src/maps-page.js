// Maps page script: initializes map on maps.html and wires style switcher
    import { initMap, addAllMarkers, changeStyle, fitToAll } from './map.js';
    import { destinations } from './data.js';

    // Wait for DOM
    document.addEventListener('DOMContentLoaded', () => {
      // initialize map inside this page. initMap will create a map if none exists.
      const map = initMap('map', { style: 'topo', onClick: (d) => {
        // open details in a simple popup or dispatch event
        const url = `destination.html`;
        // For now show Leaflet popup handled by map.js centerOn; dispatch custom behavior if needed
      }});

      // Add markers (map.js already adds initial markers inside initMap, but ensure consistent)
      addAllMarkers(destinations, (d) => {
        // open a popup with name and center for clarity
        map.setView([d.lat, d.lng], 12, { animate: true });
      });

      const styleSelect = document.getElementById('map-style');
      styleSelect.addEventListener('change', (e) => {
        const v = e.target.value;
        // map.js changeStyle expects 'topo' or 'sat'
        changeStyle(v);
      });

      // Fit-all button
      const fitBtn = document.getElementById('fit-all');
      fitBtn.addEventListener('click', () => {
        fitToAll();
      });
    });
