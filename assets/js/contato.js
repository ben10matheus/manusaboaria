/* Contato — navegação local; as dúvidas usam o acordeão nativo do navegador. */
(() => {
  'use strict';

  function init() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('mobile-nav');
    const year = document.getElementById('current-year');
    if (year) year.textContent = String(new Date().getFullYear());
    if (!toggle || !nav) return;

    function closeMenu() {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      nav.hidden = true;
    }

    toggle.setAttribute('aria-controls', 'mobile-nav');
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu');
      nav.hidden = expanded;
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !nav.hidden) {
        closeMenu();
        toggle.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!nav.hidden && !nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
    if (typeof window.matchMedia === 'function') {
      const desktop = window.matchMedia('(min-width: 1181px)');
      if (typeof desktop.addEventListener === 'function') desktop.addEventListener('change', event => {
        if (event.matches) closeMenu();
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
