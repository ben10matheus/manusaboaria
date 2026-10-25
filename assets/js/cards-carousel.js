/* Navegação manual dos carrosséis de notícias e coleções. */
(() => {
  'use strict';
  document.querySelectorAll('[data-card-carousel]').forEach(root => {
    const track = root.querySelector('[data-carousel-track]');
    const controls = root.querySelector('[data-carousel-controls]');
    const previous = root.querySelector('[data-carousel-prev]');
    const next = root.querySelector('[data-carousel-next]');
    if (!track || !controls || !previous || !next) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function update() {
      const end = Math.max(0, track.scrollWidth - track.clientWidth);
      controls.hidden = end <= 2;
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= end - 2;
    }
    function move(direction) {
      const card = track.firstElementChild;
      const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      const step = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
      track.scrollBy({ left: direction * step, behavior: motion.matches ? 'auto' : 'smooth' });
    }
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', update, { passive: true });
    track.addEventListener('keydown', event => {
      if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    });
    if (typeof ResizeObserver === 'function') new ResizeObserver(update).observe(track);
    else window.addEventListener('resize', update);
    update();
  });
})();
