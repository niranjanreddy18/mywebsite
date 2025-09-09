// auth.js — authentication modal, local sign in/up and Google Sign-In integration
    const USERS_KEY = 'wanderly:users';
    const SESSION_KEY = 'wanderly:session';
    const GOOGLE_CLIENT_ID = ''; // <-- Add your Google Client ID to enable real Google sign-in

    function announce(msg) {
      const r = document.getElementById('ariaAnnouncements');
      if (!r) return;
      r.textContent = msg;
      setTimeout(() => { r.textContent = ''; }, 2200);
    }

    function saveUser(u) {
      try {
        const raw = localStorage.getItem(USERS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        arr.push(u);
        localStorage.setItem(USERS_KEY, JSON.stringify(arr));
      } catch (err) { console.error(err); }
    }

    function findUserByEmail(email) {
      try {
        const raw = localStorage.getItem(USERS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return arr.find(x => x.email && x.email.toLowerCase() === email.toLowerCase());
      } catch (err) { return null; }
    }

    function setSession(s) {
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (err) {}
      refreshAuthUI();
    }
    function clearSession() { localStorage.removeItem(SESSION_KEY); refreshAuthUI(); }
    function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (err) { return null; } }

    function validateEmail(email) { return /\S+@\S+\.\S+/.test(email); }

    // focus trap
    function trapFocus(container) {
      const focusable = Array.from(container.querySelectorAll('a,button,input,textarea,[tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
      if (!focusable.length) return () => {};
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      function handler(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }

    export function initAuth() {
      const modal = document.getElementById('authModal');
      const backdrop = document.getElementById('authBackdrop');
      const openBtn = document.getElementById('authBtn');
      const closeBtn = document.getElementById('authClose');
      const tabSignIn = document.getElementById('tabSignIn');
      const tabSignUp = document.getElementById('tabSignUp');
      const signInForm = document.getElementById('signInForm');
      const signUpForm = document.getElementById('signUpForm');
      const googleContainer = document.getElementById('googleSignInDiv');
      const fakeGoogle = document.getElementById('fakeGoogle');

      if (!modal || !backdrop) return;
      let removeTrap = null;

      function open() {
        modal.setAttribute('aria-hidden', 'false');
        backdrop.setAttribute('aria-hidden', 'false');
        showSignIn();
        setTimeout(() => modal.querySelector('input,button')?.focus(), 60);
        removeTrap = trapFocus(modal);
        document.addEventListener('keydown', onKey);
        announce('Authentication opened');
      }

      function close() {
        modal.setAttribute('aria-hidden', 'true');
        backdrop.setAttribute('aria-hidden', 'true');
        if (removeTrap) removeTrap();
        document.removeEventListener('keydown', onKey);
        openBtn?.focus();
        announce('Authentication closed');
      }

      function onKey(e) { if (e.key === 'Escape') close(); }

      openBtn?.addEventListener('click', open);
      closeBtn?.addEventListener('click', close);
      backdrop?.addEventListener('click', close);

      function showSignIn() {
        tabSignIn.setAttribute('aria-selected', 'true');
        tabSignUp.setAttribute('aria-selected', 'false');
        signInForm.setAttribute('aria-hidden', 'false');
        signUpForm.setAttribute('aria-hidden', 'true');
      }
      function showSignUp() {
        tabSignIn.setAttribute('aria-selected', 'false');
        tabSignUp.setAttribute('aria-selected', 'true');
        signInForm.setAttribute('aria-hidden', 'true');
        signUpForm.setAttribute('aria-hidden', 'false');
      }

      tabSignIn.addEventListener('click', showSignIn);
      tabSignUp.addEventListener('click', showSignUp);

      // sign up
      signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const pwd = document.getElementById('signupPassword').value;
        if (!name) { announce('Please enter your name'); document.getElementById('signupName').focus(); return; }
        if (!validateEmail(email)) { announce('Please enter a valid email'); document.getElementById('signupEmail').focus(); return; }
        if (pwd.length < 6) { announce('Password must be at least 6 characters'); document.getElementById('signupPassword').focus(); return; }
        if (findUserByEmail(email)) { announce('Account already exists'); return; }
        const user = { id: 'u_' + Date.now(), name, email, password: pwd };
        saveUser(user);
        setSession({ id: user.id, name: user.name, email: user.email, provider: 'local' });
        announce('Account created — signed in');
        setTimeout(close, 700);
      });

      // sign in
      signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signinEmail').value.trim();
        const pwd = document.getElementById('signinPassword').value;
        if (!validateEmail(email)) { announce('Please enter a valid email'); document.getElementById('signinEmail').focus(); return; }
        const user = findUserByEmail(email);
        if (!user || user.password !== pwd) { announce('Invalid credentials'); return; }
        setSession({ id: user.id, name: user.name || '', email: user.email, provider: 'local' });
        announce('Signed in successfully');
        setTimeout(close, 600);
      });

      // cancel signup
      const cancelSignup = document.getElementById('cancelSignup');
      cancelSignup?.addEventListener('click', (e) => { e.preventDefault(); showSignIn(); });

      // google sign-in
      function handleCredentialResponse(response) {
        try {
          const jwt = response.credential;
          const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
          const user = { id: payload.sub, name: payload.name || '', email: payload.email || '', picture: payload.picture || '', provider: 'google' };
          try {
            const raw = localStorage.getItem(USERS_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            if (!arr.find(u => u.id === user.id)) { arr.push(user); localStorage.setItem(USERS_KEY, JSON.stringify(arr)); }
          } catch (err) {}
          setSession({ id: user.id, name: user.name, email: user.email, provider: 'google', token: jwt });
          announce(`Signed in as ${user.name || user.email}`);
          setTimeout(close, 700);
        } catch (err) { console.error(err); announce('Google sign-in failed'); }
      }

      function initGoogle() {
        if (!window.google || !window.google.accounts || !window.google.accounts.id || !GOOGLE_CLIENT_ID) {
          fakeGoogle.style.display = 'block';
          fakeGoogle.addEventListener('click', () => {
            announce('Google not configured. Add GOOGLE_CLIENT_ID in js/auth.js to enable.');
          });
          googleContainer.style.display = 'none';
          return;
        }
        googleContainer.style.display = 'flex';
        fakeGoogle.style.display = 'none';
        window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredentialResponse });
        window.google.accounts.id.renderButton(googleContainer, { theme: 'outline', size: 'large', width: '100%' });
      }

      const interval = setInterval(() => {
        if (window.google && window.google.accounts && window.google.accounts.id) { clearInterval(interval); initGoogle(); }
      }, 150);
      setTimeout(() => clearInterval(interval), 5000);

      // show on page load
      open();

      refreshAuthUI();

      // refresh UI on changes
      function refreshAuthUI() {
        const session = getSession();
        const btn = document.getElementById('authBtn');
        if (!btn) return;
        if (session) {
          btn.textContent = session.name ? `Hi, ${session.name.split(' ')[0]}` : (session.email || 'Account');
          btn.classList.remove('btn-outline');
        } else {
          btn.textContent = 'Sign In';
          btn.classList.add('btn-outline');
        }
      }
    }

    // helpers
    function saveUser(u) {
      try {
        const raw = localStorage.getItem(USERS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        arr.push(u);
        localStorage.setItem(USERS_KEY, JSON.stringify(arr));
      } catch (err) { console.error(err); }
    }
    function findUserByEmail(email) {
      try {
        const raw = localStorage.getItem(USERS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return arr.find(x => x.email && x.email.toLowerCase() === email.toLowerCase());
      } catch (err) { return null; }
    }
    function setSession(s) {
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (err) {}
    }
    function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (err) { return null; } }
