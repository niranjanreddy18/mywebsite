import anime from 'https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.es.js';
    import { initUI } from './ui.js';
    import { initAuth } from './auth.js';
    import { initFeedback } from './feedback.js';
    import { initHeader } from './header.js';

    document.addEventListener('DOMContentLoaded', () => {
      // fill year
      const y = document.getElementById('year');
      if (y) y.textContent = new Date().getFullYear();

      initHeader();
      initUI({ anime });
      initFeedback();
      initAuth();
    });
