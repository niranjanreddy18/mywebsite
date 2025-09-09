import { toggleWishlist, getWishlist, getDestinationById } from './api.js';

    function renderDestCardActions(cardEl, destId){
      const btn = cardEl.querySelector('.btn-wishlist');
      const wishlist = getWishlist();
      if(wishlist.includes(destId)){
        btn.textContent = 'Saved';
        btn.classList.add('saved');
      } else {
        btn.textContent = 'Save';
        btn.classList.remove('saved');
      }
      btn.onclick = (e)=>{
        e.stopPropagation();
        toggleWishlist(destId);
        updateWishlistUI();
        renderDestCardActions(cardEl, destId);
      };
    }

    function updateWishlistUI(){
      const count = getWishlist().length;
      document.getElementById('wishlist-count').textContent = count;
      renderWishlistPanel();
    }

    function renderWishlistPanel(){
      const items = getWishlist();
      const container = document.getElementById('wishlist-items');
      container.innerHTML = '';
      if(items.length===0){
        container.innerHTML = '<p class="muted">Your wishlist is empty. Save a destination to start exploring!</p>';
        return;
      }
      items.forEach(id=>{
        const d = getDestinationById(id);
        if(!d) return;
        const el = document.createElement('div');
        el.className = 'card';
        el.style.display = 'flex';
        el.style.marginBottom = '10px';
        el.innerHTML = `
          <div style="width:80px;height:60px;background-image:url('${d.img}');background-size:cover;background-position:center;border-radius:8px;margin-right:10px"></div>
          <div style="flex:1">
            <div style="font-weight:700">${d.name}</div>
            <div style="font-size:13px;color:var(--muted)">${d.region}</div>
            <div style="margin-top:6px">
              <a class="btn outline btn-view" href="${d.pano || d.img}" target="_blank" rel="noopener">View</a>
              <button class="btn subtle btn-remove" data-id="${d.id}">Remove</button>
            </div>
          </div>
        `;
        container.appendChild(el);
      });

      container.querySelectorAll('.btn-remove').forEach(b=>{
        b.addEventListener('click', (e)=>{
          toggleWishlist(b.dataset.id);
          updateWishlistUI();
        });
      });
    }

    export {
      renderDestCardActions,
      updateWishlistUI,
      renderWishlistPanel
    };
