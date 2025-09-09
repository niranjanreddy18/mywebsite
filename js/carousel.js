// carousel.js — populates carousel, drag to scroll and autoplay
    export function initCarousel() {
      const track = document.getElementById('carousel');
      const prev = document.getElementById('prev');
      const next = document.getElementById('next');

      const items = [
        { title: 'Santorini, Greece', desc: 'Sunset cliffs & blue domes', img: 'https://images.unsplash.com/photo-1505765050444-cc88c6a1f87d?w=1200&q=60&auto=format&fit=crop' },
        { title: 'Kyoto, Japan', desc: 'Temples & cherry blossoms', img: 'https://images.unsplash.com/photo-1549693578-d683be217e58?w=1200&q=60&auto=format&fit=crop' },
        { title: 'Banff, Canada', desc: 'Lakes & alpine peaks', img: 'https://images.unsplash.com/photo-1508264165352-258a6b8c93f8?w=1200&q=60&auto=format&fit=crop' },
        { title: 'Marrakech, Morocco', desc: 'Markets & riads', img: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=1200&q=60&auto=format&fit=crop' },
        { title: 'Bali, Indonesia', desc: 'Rice terraces & temples', img: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=60&auto=format&fit=crop' },
      ];

      if (!track) return;
      track.innerHTML = '';
      items.forEach(it => {
        const el = document.createElement('article');
        el.className = 'place';
        el.innerHTML = `
          <img src="${it.img}" alt="${it.title}" loading="lazy"/>
          <div class="body"><h4>${it.title}</h4><p>${it.desc}</p></div>
        `;
        track.appendChild(el);
      });

      // draggable
      let isDown = false;
      let startX, scrollLeft;
      track.addEventListener('mousedown', (e) => {
        isDown = true;
        track.classList.add('dragging');
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
      });
      track.addEventListener('mouseleave', () => { isDown = false; track.classList.remove('dragging'); });
      track.addEventListener('mouseup', () => { isDown = false; track.classList.remove('dragging'); });
      track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.6;
        track.scrollLeft = scrollLeft - walk;
      });

      // touch
      let startTouchX = 0;
      let startTouchScroll = 0;
      track.addEventListener('touchstart', (e) => {
        startTouchX = e.touches[0].pageX;
        startTouchScroll = track.scrollLeft;
      }, { passive: true });
      track.addEventListener('touchmove', (e) => {
        const x = e.touches[0].pageX;
        const walk = (x - startTouchX) * 1.2;
        track.scrollLeft = startTouchScroll - walk;
      }, { passive: true });

      function scrollByCard(dir = 1) {
        const card = track.querySelector('.place');
        if (!card) return;
        const w = card.getBoundingClientRect().width + 12;
        track.scrollBy({ left: dir * w, behavior: 'smooth' });
      }

      prev?.addEventListener('click', () => scrollByCard(-1));
      next?.addEventListener('click', () => scrollByCard(1));

      // autoplay
      let auto = setInterval(() => scrollByCard(1), 4200);
      track.addEventListener('mouseenter', () => clearInterval(auto));
      track.addEventListener('mouseleave', () => { auto = setInterval(() => scrollByCard(1), 4200); });

      // keyboard
      track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') scrollByCard(-1);
        if (e.key === 'ArrowRight') scrollByCard(1);
      });
    }
