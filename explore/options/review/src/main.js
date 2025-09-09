import { getDestinations } from './api.js';
    import { renderMediaGrid, attachModalHandlers } from './gallery.js';
    import { renderReviewsList, attachReviewForm } from './reviews.js';
    import { renderDestCardActions, updateWishlistUI } from './wishlist.js';

    // Initial UI wiring
    document.addEventListener('DOMContentLoaded', async ()=>{
      document.getElementById('year').textContent = new Date().getFullYear();

      // Hero carousel
      initHeroCarousel();

      // Render destinations
      const destContainer = document.getElementById('dest-cards');
      const destinations = getDestinations();
      destContainer.innerHTML = '';
      destinations.forEach(d=>{
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="media" style="background-image:url('${d.img}')"></div>
          <div class="content">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <strong>${d.name}</strong>
                <div style="font-size:13px;color:var(--muted)">${d.region}</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:800;color:var(--accent)">${d.rating}</div>
              </div>
            </div>
            <div class="meta">
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                ${d.tags.map(t=>`<span style="font-size:12px;color:var(--muted);background:#f1f8ff;padding:6px;border-radius:8px">${t}</span>`).join('')}
              </div>
            </div>
            <div class="card-actions">
              <button class="btn outline btn-view" data-id="${d.id}">Open Image</button>
              <button class="btn subtle btn-wishlist" data-id="${d.id}">Save</button>
            </div>
          </div>
        `;
        card.querySelector('.btn-view').addEventListener('click', ()=>{
          const pano = d.pano || d.img;
          // open panorama or image in new browser tab instead of modal
          window.open(pano, '_blank', 'noopener');
        });

        // attach wishlist behavior from module
        renderDestCardActions(card, d.id);

        destContainer.appendChild(card);
      });

      // Media grid
      await renderMediaGrid(document.getElementById('media-grid'));

      // Reviews
      renderReviewsList(document.getElementById('reviews-list'));
      attachReviewForm();

      // Wishlist UI initial
      updateWishlistUI();

      // Gallery handlers (noop now)
      attachModalHandlers();

      // Wire some header buttons
      document.getElementById('btn-wishlist').addEventListener('click', ()=>{
        const panel = document.getElementById('panel-wishlist');
        panel.classList.toggle('hidden');
      });

      // CTA write review
      document.getElementById('cta-write').addEventListener('click', ()=>{
        document.getElementById('review-destination').focus();
        window.scrollTo({top: document.getElementById('community').offsetTop - 80, behavior:'smooth'});
      });

      // attach close handlers for panels
      document.querySelectorAll('.panel-close').forEach(b=>{
        b.addEventListener('click', ()=> b.parentElement.classList.add('hidden'));
      });

    });

    // A small hero carousel
    function initHeroCarousel(){
      const slides = document.querySelectorAll('#hero-carousel .slide');
      let idx = 0;
      if(slides.length ===0) return;
      slides[idx].classList.add('active');
      setInterval(()=>{
        slides[idx].classList.remove('active');
        idx = (idx+1) % slides.length;
        slides[idx].classList.add('active');
      }, 4200);
    }
