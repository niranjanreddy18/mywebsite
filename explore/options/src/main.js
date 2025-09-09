// Simple client script: keyboard navigation among the cards and set year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Keyboard navigation: Arrow keys move focus between cards
    const cards = Array.from(document.querySelectorAll('.card'));
    if (cards.length) {
      cards.forEach((c, i) => {
        c.setAttribute('tabindex', '0');
        c.dataset.index = i;
      });

      let focused = 0;
      function focusCard(i) {
        const idx = Math.max(0, Math.min(cards.length - 1, i));
        cards[idx].focus();
        focused = idx;
      }

      document.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        // Only if focus is inside the grid or on body
        if (!document.body.contains(active)) return;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          focusCard((focused + 1) % cards.length);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          focusCard((focused - 1 + cards.length) % cards.length);
        } else if (e.key === 'Enter' || e.key === ' ') {
          if (active && active.classList && active.classList.contains('card')) {
            // emulate click
            active.click();
          }
        }
      });

      // update focused idx when user tabs/clicks
      cards.forEach((c, i) => {
        c.addEventListener('focus', () => { focused = i; });
        c.addEventListener('click', () => { focused = i; });
      });
    }

    // Small polish: subtle tilt effect on mousemove for non-reduced-motion users
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      cards.forEach(card => {
        card.addEventListener('mousemove', (ev) => {
          const rect = card.getBoundingClientRect();
          const px = (ev.clientX - rect.left) / rect.width;
          const py = (ev.clientY - rect.top) / rect.height;
          const rx = (py - 0.5) * 6; // rotateX
          const ry = (px - 0.5) * -6; // rotateY
          card.style.transform = `perspective(700px) translateZ(0) rotateX(${rx}deg) rotateY(${ry}deg}) scale(1.01)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    }
