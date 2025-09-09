import { getDestinations, getReviews, addReview } from './api.js';

    function renderReviewFormSelect(selectEl){
      const dests = getDestinations();
      selectEl.innerHTML = dests.map(d=>`<option value="${d.id}">${d.name}</option>`).join('');
    }

    function renderReviewsList(container){
      const dests = getDestinations();
      container.innerHTML = '';
      // show recent reviews across all destinations
      const all = [];
      dests.forEach(d=>{
        const revs = getReviews(d.id);
        revs.forEach(r=>{
          all.push(Object.assign({}, r, { destination: d.name, destId: d.id }));
        });
      });

      all.sort((a,b)=> new Date(b.date) - new Date(a.date));
      if(all.length === 0){
        container.innerHTML = '<p class="muted">No reviews yet — be the first to share your story!</p>';
        return;
      }

      all.forEach(r=>{
        const el = document.createElement('div');
        el.className = 'review';
        el.innerHTML = `
          <div class="meta">
            <div>
              <strong>${escapeHtml(r.name)}</strong>
              <div style="font-size:13px;color:var(--muted)">${escapeHtml(r.destination)} · ${new Date(r.date).toLocaleDateString()}</div>
            </div>
            <div class="rating">${'★'.repeat(Number(r.rating))}</div>
          </div>
          <p style="margin-top:8px">${escapeHtml(r.text)}</p>
        `;
        container.appendChild(el);
      });
    }

    function attachReviewForm(){
      const form = document.getElementById('review-form');
      const select = document.getElementById('review-destination');
      renderReviewFormSelect(select);
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const dest = select.value;
        const name = document.getElementById('review-name').value.trim() || 'Anonymous';
        const rating = document.getElementById('review-rating').value;
        const text = document.getElementById('review-text').value.trim();
        addReview(dest, name, rating, text);
        form.reset();
        // re-render reviews
        renderReviewsList(document.getElementById('reviews-list'));
      });

      document.getElementById('btn-reset-review').addEventListener('click', ()=>{
        form.reset();
      });
    }

    function escapeHtml(str){
      if(!str) return '';
      return str.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    }

    export {
      renderReviewsList,
      attachReviewForm
    };
