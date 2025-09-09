// ui.js — hero animations, tilt, counters and microinteractions
    export function initUI({ anime }) {
      initHeroEntrance(anime);
      initTiltEffect();
      initCounters();
      initFloatingOrb(anime);
      initButtonWaves();
    }

    function initHeroEntrance(anime) {
      anime.timeline()
        .add({
          targets: '.hero-title',
          translateY: [30, 0],
          opacity: [0, 1],
          duration: 700,
          easing: 'easeOutCubic'
        })
        .add({
          targets: '.hero-sub',
          translateY: [18, 0],
          opacity: [0, 1],
          duration: 600,
          easing: 'easeOutCubic'
        }, '-=450')
        .add({
          targets: '.card-main',
          translateX: [-40, 0],
          opacity: [0, 1],
          duration: 700,
          easing: 'easeOutQuart'
        }, '-=400')
        .add({
          targets: '.card-sub',
          translateX: [40, 0],
          opacity: [0, 1],
          duration: 700,
          easing: 'easeOutQuart'
        }, '-=650');
    }

    function initTiltEffect() {
      // Simple tilt effect without external libs
      const tiltEls = document.querySelectorAll('[data-tilt]');
      tiltEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;
          const rx = (py - 0.5) * 8; // rotateX
          const ry = (px - 0.5) * -12; // rotateY
          el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
          el.style.boxShadow = '0 24px 60px rgba(6,20,30,0.12)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = '';
          el.style.boxShadow = '';
        });
      });
    }

    function initCounters() {
      const elems = document.querySelectorAll('.stat-value');
      const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const to = parseInt(el.getAttribute('data-target') || '0', 10);
            animateNumber(el, to);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });
      elems.forEach(e => obs.observe(e));

      function animateNumber(el, to) {
        const start = 0;
        const dur = 1000;
        const t0 = performance.now();
        function step(now) {
          const t = Math.min(1, (now - t0) / dur);
          const val = Math.round(start + (to - start) * easeOutCubic(t));
          el.textContent = val;
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
      function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    }

    function initFloatingOrb(anime) {
      anime({
        targets: '.floating-orb',
        translateY: [-12, 12],
        translateX: [-6, 6],
        duration: 7000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
      });
    }

    function initButtonWaves() {
      document.querySelectorAll('.cta, .btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], { duration: 280, easing: 'ease-out' });
        });
      });
    }
