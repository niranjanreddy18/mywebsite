// small header interactions (sticky shadow)
    export function initHeader() {
      const header = document.querySelector('.site-header');
      window.addEventListener('scroll', () => {
        if (window.scrollY > 14) header.style.boxShadow = '0 8px 30px rgba(6,20,30,0.06)';
        else header.style.boxShadow = 'none';
      }, { passive: true });

      // optional keyboard focus styles for nav
      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('focus', () => link.classList.add('focus'));
        link.addEventListener('blur', () => link.classList.remove('focus'));
      });
    }
