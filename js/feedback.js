// feedback.js — footer feedback interactions and local storage
    const KEY = 'wanderly:feedbacks';

    function announce(msg) {
      const r = document.getElementById('ariaAnnouncements');
      if (!r) return;
      r.textContent = msg;
      setTimeout(() => { r.textContent = ''; }, 2200);
    }

    function save(obj) {
      try {
        const raw = localStorage.getItem(KEY);
        const arr = raw ? JSON.parse(raw) : [];
        arr.push({ ...obj, createdAt: new Date().toISOString() });
        localStorage.setItem(KEY, JSON.stringify(arr));
      } catch (err) { console.error(err); }
    }

    export function initFeedback() {
      const btn = document.getElementById('feedbackBtn');
      const panel = document.getElementById('feedbackPanel');
      const form = document.getElementById('feedbackForm');
      const close = document.getElementById('fbClose');

      if (!btn || !panel || !form) return;

      function open() {
        panel.setAttribute('aria-hidden', 'false');
        const ta = panel.querySelector('textarea');
        if (ta) ta.focus();
        announce('Feedback panel opened');
      }
      function closePanel() {
        panel.setAttribute('aria-hidden', 'true');
        btn.focus();
        announce('Feedback panel closed');
      }

      btn.addEventListener('click', () => {
        const openState = panel.getAttribute('aria-hidden') === 'false';
        if (openState) closePanel();
        else open();
      });

      close?.addEventListener('click', closePanel);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = form.querySelector('textarea')?.value.trim() || '';
        const email = form.querySelector('input[type="email"]')?.value.trim() || '';
        if (!text) {
          announce('Please enter feedback');
          form.querySelector('textarea')?.focus();
          return;
        }
        save({ text, email: email || null });
        announce('Thanks — feedback saved locally');
        form.reset();
        setTimeout(closePanel, 700);
      });

      document.addEventListener('click', (e) => {
        if (panel.getAttribute('aria-hidden') === 'false') {
          if (!panel.contains(e.target) && !btn.contains(e.target)) closePanel();
        }
      });
    }
