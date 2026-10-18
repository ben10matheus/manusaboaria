/* Manu Saboaria — fotos da nossa história, com controles de movimento. */
(() => {
  'use strict';

  function initCarousel(root) {
    if (root.dataset.storyInitialized === 'true') return;
    const slides = Array.from(root.querySelectorAll('.story-slide'));
    const controls = root.querySelector('[data-story-controls]');
    const previous = root.querySelector('[data-story-prev]');
    const next = root.querySelector('[data-story-next]');
    const toggle = root.querySelector('[data-story-toggle]');
    const count = root.querySelector('[data-story-count]');
    const status = root.querySelector('[data-story-status]');
    if (slides.length < 2 || !controls || !previous || !next || !toggle) return;
    root.dataset.storyInitialized = 'true';

    const section = root.closest('#essencia') || root;
    const motion = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    const toggleLabel = toggle.querySelector('[data-story-toggle-label]') || toggle;
    let index = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
    let explicitlyPaused = Boolean(motion && motion.matches);
    let hovered = root.matches(':hover');
    let focused = root.contains(document.activeElement);
    let sectionVisible = false;
    let timer = null;

    if (count) count.setAttribute('aria-live', 'off');

    function mayRotate() {
      return !explicitlyPaused && !hovered && !focused && !document.hidden && sectionVisible;
    }

    function stopTimer() {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
    }

    function schedule() {
      stopTimer();
      if (!mayRotate()) return;
      timer = window.setTimeout(() => {
        timer = null;
        if (mayRotate()) show(index + 1, false);
      }, 6000);
    }

    function syncToggle() {
      const label = explicitlyPaused ? 'Retomar fotos' : 'Pausar fotos';
      toggleLabel.textContent = label;
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('aria-pressed', String(explicitlyPaused));
    }

    function prepareNextImage() {
      const image = slides[(index + 1) % slides.length].querySelector('img');
      if (image) image.loading = 'eager';
    }

    function show(requestedIndex, manual) {
      index = ((requestedIndex % slides.length) + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.inert = !active;
      });
      const position = (index + 1) + ' de ' + slides.length;
      if (count) count.textContent = position;
      if (manual) {
        explicitlyPaused = true;
        if (status) {
          const image = slides[index].querySelector('img');
          const description = image && image.alt ? ': ' + image.alt : '.';
          status.textContent = 'Foto ' + position + description;
        }
      }
      syncToggle();
      prepareNextImage();
      schedule();
    }

    previous.addEventListener('click', () => show(index - 1, true));
    next.addEventListener('click', () => show(index + 1, true));
    toggle.addEventListener('click', () => {
      explicitlyPaused = !explicitlyPaused;
      syncToggle();
      schedule();
    });
    root.addEventListener('mouseenter', () => {
      hovered = true;
      schedule();
    });
    root.addEventListener('mouseleave', () => {
      hovered = false;
      schedule();
    });
    root.addEventListener('focusin', () => {
      focused = true;
      schedule();
    });
    root.addEventListener('focusout', event => {
      focused = Boolean(event.relatedTarget && root.contains(event.relatedTarget));
      schedule();
    });
    document.addEventListener('visibilitychange', schedule);
    window.addEventListener('pagehide', stopTimer);
    window.addEventListener('pageshow', schedule);

    if (motion) {
      const onMotionChange = () => {
        // An opt-out takes effect immediately; its reversal never starts playback by itself.
        if (motion.matches) explicitlyPaused = true;
        syncToggle();
        schedule();
      };
      if (typeof motion.addEventListener === 'function') motion.addEventListener('change', onMotionChange);
      else if (typeof motion.addListener === 'function') motion.addListener(onMotionChange);
    }

    if (typeof window.IntersectionObserver === 'function') {
      const observer = new window.IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.target === section) {
            sectionVisible = entry.isIntersecting && entry.intersectionRatio > 0;
          }
        });
        schedule();
      }, { threshold: [0, 0.01] });
      observer.observe(section);
    } else {
      // Older browsers still pause off screen without a continuous polling timer.
      const measureVisibility = () => {
        const bounds = section.getBoundingClientRect();
        const height = window.innerHeight || document.documentElement.clientHeight;
        const width = window.innerWidth || document.documentElement.clientWidth;
        const visible = bounds.bottom > 0 && bounds.top < height && bounds.right > 0 && bounds.left < width;
        if (visible !== sectionVisible) {
          sectionVisible = visible;
          schedule();
        }
      };
      window.addEventListener('scroll', measureVisibility, { passive: true });
      window.addEventListener('resize', measureVisibility);
      window.addEventListener('pageshow', measureVisibility);
      measureVisibility();
    }

    controls.hidden = false;
    show(index, false);
  }

  function init() {
    document.querySelectorAll('[data-story-carousel]').forEach(initCarousel);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
