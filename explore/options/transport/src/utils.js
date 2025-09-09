export function formatPrice(n, currency = '€') {
      if (typeof n !== 'number') return '-';
      return currency + n.toFixed(0);
    }

    export function clamp(v, a, b) {
      return Math.max(a, Math.min(b, v));
    }

    export function timeFromMinutes(mins) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m`;
    }

    export function createEl(tag, attrs = {}, children = []) {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k.startsWith('data-')) el.setAttribute(k, v);
        else el[k] = v;
      });
      (Array.isArray(children) ? children : [children]).forEach(child => {
        if (!child) return;
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else el.appendChild(child);
      });
      return el;
    }

    export function uid(prefix = '') {
      return prefix + Math.random().toString(36).slice(2, 9);
    }
