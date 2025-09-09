import { uid } from './utils.js';

    const REV_KEY = 'st_reviews_v1';
    const BLOG_KEY = 'st_blogs_v1';

    function load(key) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    function save(key, list) {
      localStorage.setItem(key, JSON.stringify(list || []));
    }

    export function loadReviews() {
      return load(REV_KEY);
    }
    export function saveReview(review) {
      const list = loadReviews();
      review.id = uid('r_');
      review.createdAt = new Date().toISOString();
      list.unshift(review);
      save(REV_KEY, list);
      return review;
    }

    export function loadBlogs() {
      return load(BLOG_KEY);
    }
    export function saveBlog(blog) {
      const list = loadBlogs();
      blog.id = uid('b_');
      blog.createdAt = new Date().toISOString();
      list.unshift(blog);
      save(BLOG_KEY, list);
      return blog;
    }

    export function renderCommunity(panel) {
      panel.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h3>Community — Reviews & Blogs</h3>
          <div style="display:flex;gap:8px;">
            <button id="commClose" class="btn">Close</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns: 1fr 320px; gap:12px;">
          <div>
            <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">
              <input id="revFilterHotel" placeholder="Filter by hotel or city" style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--card-border);background:var(--surface-2)">
              <button id="newReviewBtn" class="btn small">New review</button>
              <button id="newBlogBtn" class="btn small">New blog</button>
            </div>
            <div id="reviewsList" class="review-list"></div>
          </div>
          <aside style="background:var(--surface-2);border-radius:10px;padding:12px;border:1px solid var(--card-border);height:100%;">
            <h4>Latest blogs</h4>
            <div id="blogsList" class="blog-list" style="margin-top:8px;"></div>
          </aside>
        </div>
      `;

      panel.querySelector('#commClose').addEventListener('click', () => {
        const modal = document.getElementById('modal');
        modal.setAttribute('aria-hidden', 'true');
        panel.innerHTML = '';
      });

      const reviewsList = panel.querySelector('#reviewsList');
      const blogsList = panel.querySelector('#blogsList');
      const revFilter = panel.querySelector('#revFilterHotel');

      function renderReviews(filter = '') {
        const data = loadReviews().filter(r => {
          if (!filter) return true;
          const f = filter.toLowerCase();
          return (r.hotel && r.hotel.toLowerCase().includes(f)) || (r.city && r.city.toLowerCase().includes(f)) || r.content.toLowerCase().includes(f);
        });
        reviewsList.innerHTML = '';
        if (!data.length) reviewsList.innerHTML = '<div class="wishlist-empty">No reviews yet. Be the first to share!</div>';
        data.forEach(r => {
          const d = document.createElement('div');
          d.className = 'review';
          d.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><strong>${r.title || 'Review'}</strong><div style="color:var(--muted);font-size:12px">${(new Date(r.createdAt)).toLocaleString()}</div></div><div style="margin-top:8px;color:var(--muted)">${r.rating ? 'Rating: ' + r.rating + '★' : ''}</div><p style="margin-top:8px">${r.content}</p><div style="font-size:12px;color:var(--muted)">By ${r.author || 'Anonymous'} ${r.hotel ? ' • ' + r.hotel : ''} ${r.city ? ' • ' + r.city : ''}</div>`;
          reviewsList.appendChild(d);
        });
      }

      function renderBlogs() {
        const data = loadBlogs();
        blogsList.innerHTML = '';
        if (!data.length) blogsList.innerHTML = '<div class="wishlist-empty">No blog posts yet.</div>';
        data.forEach(b => {
          const el = document.createElement('div');
          el.style.border = '1px solid var(--card-border)';
          el.style.borderRadius = '8px';
          el.style.padding = '8px';
          el.innerHTML = `<strong>${b.title}</strong><div style="color:var(--muted);font-size:12px">${(new Date(b.createdAt)).toLocaleDateString()}</div><p style="margin-top:8px;color:var(--muted);font-size:13px">${b.content.slice(0,120)}${b.content.length>120? '…':''}</p>`;
          blogsList.appendChild(el);
        });
      }

      panel.querySelector('#newReviewBtn').addEventListener('click', () => openReviewForm(panel, renderReviews));
      panel.querySelector('#newBlogBtn').addEventListener('click', () => openBlogForm(panel, renderBlogs));
      revFilter.addEventListener('input', () => renderReviews(revFilter.value));

      renderReviews();
      renderBlogs();
    }

    function openReviewForm(panel, onSaved) {
      const form = document.createElement('div');
      form.innerHTML = `
        <h3>Write a review</h3>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <input id="rTitle" placeholder="Title" style="padding:8px;border-radius:8px;border:1px solid var(--card-border);">
          <input id="rHotel" placeholder="Hotel or place (optional)" style="padding:8px;border-radius:8px;border:1px solid var(--card-border);">
          <input id="rCity" placeholder="City (optional)" style="padding:8px;border-radius:8px;border:1px solid var(--card-border);">
          <textarea id="rContent" placeholder="Share your experience..." rows="6" style="padding:8px;border-radius:8px;border:1px solid var(--card-border);"></textarea>
          <div style="display:flex;gap:8px;align-items:center;">
            <label>Rating:</label>
            <select id="rRating">
              <option value="">—</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            <input id="rAuthor" placeholder="Your name (optional)" style="margin-left:auto;padding:8px;border-radius:8px;border:1px solid var(--card-border);">
          </div>
          <div style="display:flex;gap:8px;">
            <button id="submitReview" class="btn primary">Submit</button>
            <button id="cancelReview" class="btn">Cancel</button>
          </div>
        </div>
      `;

      // replace left column content area
      const left = panel.querySelector('#reviewsList');
      left.scrollTop = 0;
      left.prepend(form);

      panel.querySelector('#cancelReview').addEventListener('click', () => {
        form.remove();
      });

      panel.querySelector('#submitReview').addEventListener('click', () => {
        const title = form.querySelector('#rTitle').value.trim();
        const hotel = form.querySelector('#rHotel').value.trim();
        const city = form.querySelector('#rCity').value.trim();
        const content = form.querySelector('#rContent').value.trim();
        const rating = form.querySelector('#rRating').value ? Number(form.querySelector('#rRating').value) : undefined;
        const author = form.querySelector('#rAuthor').value.trim();

        if (!content) {
          alert('Please add some content to your review.');
          return;
        }
        const { saveReview } = window.ST_COMM || {};
        if (saveReview) {
          saveReview({ title, hotel, city, content, rating, author });
          form.remove();
          onSaved && onSaved(panel.querySelector('#revFilterHotel')?.value || '');
        }
      });
    }

    function openBlogForm(panel, onSaved) {
      const form = document.createElement('div');
      form.innerHTML = `
        <h3>Publish a blog post</h3>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <input id="bTitle" placeholder="Title" style="padding:8px;border-radius:8px;border:1px solid var(--card-border);">
          <input id="bAuthor" placeholder="Author" style="padding:8px;border-radius:8px;border:1px solid var(--card-border);">
          <textarea id="bContent" placeholder="Write your story..." rows="8" style="padding:8px;border-radius:8px;border:1px solid var(--card-border);"></textarea>
          <div style="display:flex;gap:8px;">
            <button id="submitBlog" class="btn primary">Publish</button>
            <button id="cancelBlog" class="btn">Cancel</button>
          </div>
        </div>
      `;

      const left = panel.querySelector('#reviewsList');
      left.scrollTop = 0;
      left.prepend(form);

      panel.querySelector('#cancelBlog').addEventListener('click', () => form.remove());

      panel.querySelector('#submitBlog').addEventListener('click', () => {
        const title = form.querySelector('#bTitle').value.trim();
        const author = form.querySelector('#bAuthor').value.trim();
        const content = form.querySelector('#bContent').value.trim();
        if (!title || !content) {
          alert('Title and content are required.');
          return;
        }
        const { saveBlog } = window.ST_COMM || {};
        if (saveBlog) {
          saveBlog({ title, author, content });
          form.remove();
          onSaved && onSaved();
        }
      });
    }

    // expose helper on window to avoid circular imports in this simple module wiring
    window.ST_COMM = {
      loadReviews,
      saveReview,
      loadBlogs,
      saveBlog
    };
