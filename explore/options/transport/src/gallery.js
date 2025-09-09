// Lightweight panorama & gallery module.
    // Exports openGallery(panel, item) to show images and a draggable panorama viewer for wide images.
    export function createPanorama(url) {
      const wrapper = document.createElement('div');
      wrapper.className = 'panorama';
      wrapper.style.backgroundImage = `url(${url})`;

      let isDown = false;
      let startX = 0;
      let currentX = 50; // percent center
      function setBg(xPercent) {
        wrapper.style.backgroundPosition = `${xPercent}% center`;
      }
      setBg(currentX);

      function onDown(e) {
        isDown = true;
        wrapper.classList.add('grabbing');
        startX = e.clientX ?? (e.touches && e.touches[0].clientX);
      }
      function onMove(e) {
        if (!isDown) return;
        const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
        const dx = clientX - startX;
        startX = clientX;
        // move percent based on width
        const rect = wrapper.getBoundingClientRect();
        const deltaPercent = (dx / rect.width) * 100;
        currentX = (currentX - deltaPercent + 360) % 360;
        if (currentX < 0) currentX += 360;
        setBg(currentX);
      }
      function onUp() {
        isDown = false;
        wrapper.classList.remove('grabbing');
      }

      wrapper.addEventListener('pointerdown', (e) => { wrapper.setPointerCapture(e.pointerId); onDown(e); });
      wrapper.addEventListener('pointermove', onMove);
      wrapper.addEventListener('pointerup', onUp);
      wrapper.addEventListener('pointerleave', onUp);
      wrapper.addEventListener('touchstart', onDown, { passive: true });
      wrapper.addEventListener('touchmove', onMove, { passive: true });
      wrapper.addEventListener('touchend', onUp);

      return wrapper;
    }

    export function openGallery(panel, item) {
      // item may be hotel with gallery array or transport with no gallery
      const images = item.gallery || (item.image ? [item.image] : []);
      const title = item.name || item.carrier || 'Preview';
      let idx = 0;

      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.marginBottom = '12px';
      header.innerHTML = `<h3>${title}</h3><div style="display:flex;gap:8px"><button id="galleryClose" class="btn">Close</button></div>`;

      const viewer = document.createElement('div');
      viewer.style.display = 'flex';
      viewer.style.flexDirection = 'column';
      viewer.style.gap = '12px';

      const pano = createPanorama(images[idx]);
      pano.style.height = '420px';
      viewer.appendChild(pano);

      const thumbs = document.createElement('div');
      thumbs.style.display = 'flex';
      thumbs.style.gap = '8px';
      thumbs.style.flexWrap = 'wrap';
      images.forEach((src, i) => {
        const t = document.createElement('div');
        t.style.width = '88px';
        t.style.height = '60px';
        t.style.borderRadius = '6px';
        t.style.overflow = 'hidden';
        t.style.cursor = 'pointer';
        t.style.border = i === idx ? '2px solid var(--accent)' : '1px solid var(--card-border)';
        t.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover" alt="">`;
        t.addEventListener('click', () => {
          idx = i;
          pano.style.backgroundImage = `url(${images[idx]})`;
          // update borders
          Array.from(thumbs.children).forEach((c, ci) => c.style.border = ci === idx ? '2px solid var(--accent)' : '1px solid var(--card-border)');
        });
        thumbs.appendChild(t);
      });

      panel.innerHTML = '';
      panel.appendChild(header);
      panel.appendChild(viewer);
      panel.appendChild(thumbs);

      panel.querySelector('#galleryClose').addEventListener('click', () => {
        const modal = document.getElementById('modal');
        modal.setAttribute('aria-hidden', 'true');
        panel.innerHTML = '';
      });
    }
