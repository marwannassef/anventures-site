// AN Ventures Labs — shared site behavior (no dependencies)
(function () {
  const root = document.documentElement;
  root.classList.remove('no-js');

  // ---- Theme (dark default, remembers choice) ----
  const THEME_KEY = 'anv-theme';
  const stored = (() => { try { return localStorage.getItem(THEME_KEY); } catch { return null; } })();
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  setTheme(stored || (prefersLight ? 'light' : 'dark'));

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f8fafc' : '#090d16');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.querySelector('.theme-toggle');
    themeBtn?.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      setTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch {}
    });

    // ---- Mobile menu ----
    const menuBtn = document.querySelector('.menu-toggle');
    const links = document.querySelector('.nav-links');
    menuBtn?.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    links?.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        links.classList.remove('open');
        menuBtn?.setAttribute('aria-expanded', 'false');
      })
    );

    // ---- Footer year ----
    document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

    // ---- Scroll reveal ----
    const items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        }),
        { threshold: 0.12 }
      );
      items.forEach((el) => io.observe(el));
    } else {
      items.forEach((el) => el.classList.add('in'));
    }

    // ---- Support form → opens the user's email client ----
    // Static hosting has no backend, so the form composes a pre-filled email.
    // To collect submissions server-side instead, point the form's action at a
    // service like Formspree/Netlify Forms and remove this handler.
    const form = document.querySelector('#support-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const to = form.dataset.to;
      const subject = `[${data.get('topic')}] ${data.get('app') || 'General'} — ${data.get('name')}`;
      const body = [
        `Name: ${data.get('name')}`,
        `Reply-to: ${data.get('email')}`,
        `App: ${data.get('app') || 'N/A'}`,
        `Device / OS: ${data.get('device') || 'N/A'}`,
        '',
        data.get('message'),
      ].join('\n');
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast('Opening your email app… If nothing happens, email ' + to);
    });

    // ---- Copy email buttons ----
    document.querySelectorAll('[data-copy]').forEach((btn) =>
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(btn.dataset.copy);
          toast('Email address copied');
        } catch {
          toast(btn.dataset.copy);
        }
      })
    );
  });

  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3200);
  }
})();
