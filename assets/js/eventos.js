/* Manu Saboaria — imagens de referência e navegação de coleções especiais. */
(() => {
  'use strict';

  function init() {
    const config = window.MANU_EVENTOS || {};
    const images = Array.isArray(config.images) ? config.images : [];
    const configuredPath = typeof config.basePath === 'string' ? config.basePath.trim() : '';
    const basePath = /^assets\/eventos-especiais(?:\/[A-Za-z0-9_-]+)*\/?$/.test(configuredPath)
      ? configuredPath.replace(/\/?$/, '/')
      : 'assets/eventos-especiais/';
    const phone = String(config.phone || '5541999863000').replace(/\D/g, '');
    const $ = id => document.getElementById(id);
    const dialog = $('event-dialog');
    const modalImage = $('event-modal-image');
    const modalTitle = $('event-modal-title');
    const position = $('event-position');
    const previous = $('event-prev');
    const next = $('event-next');
    let selectedIndex = 0;
    let previousOverflow = null;

    function titleFor(image) {
      return String(image.title || 'Produtos e presentes do Manu');
    }

    function altFor(image) {
      return String(image.alt || 'Referência de produtos e presentes da marca Manu Saboaria.');
    }

    function validIndex(value) {
      const index = Number(value);
      return Number.isInteger(index) && index >= 0 && index < images.length ? index : null;
    }

    function syncDialogScroll() {
      if (dialog && dialog.open && previousOverflow === null) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      } else if ((!dialog || !dialog.open) && previousOverflow !== null) {
        document.body.style.overflow = previousOverflow;
        previousOverflow = null;
      }
    }

    function closeLightbox() {
      if (!dialog) return;
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      syncDialogScroll();
    }

    function updateLightbox() {
      if (!images.length) return;
      selectedIndex = ((selectedIndex % images.length) + images.length) % images.length;
      const image = images[selectedIndex];
      if (modalImage) {
        modalImage.src = basePath + image.file;
        modalImage.alt = altFor(image);
        modalImage.loading = 'eager';
        modalImage.decoding = 'async';
      }
      if (modalTitle) modalTitle.textContent = titleFor(image);
      if (position) position.textContent = (selectedIndex + 1) + ' de ' + images.length;
      if (previous) previous.disabled = images.length < 2;
      if (next) next.disabled = images.length < 2;
    }

    function openLightbox(index) {
      if (!dialog || index === null || !images[index]) return;
      selectedIndex = index;
      updateLightbox();
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      }
      syncDialogScroll();
    }

    function changeImage(step) {
      selectedIndex += step;
      updateLightbox();
    }

    document.querySelectorAll('img[data-event-slot]').forEach(image => {
      const index = validIndex(image.dataset.eventSlot);
      if (index === null) return;
      const entry = images[index];
      image.src = basePath + entry.file;
      image.alt = altFor(entry);
      image.decoding = 'async';
    });

    document.querySelectorAll('[data-event-caption]').forEach(caption => {
      const index = validIndex(caption.dataset.eventCaption);
      if (index !== null) caption.textContent = titleFor(images[index]);
    });

    document.querySelectorAll('[data-event-image]').forEach(trigger => {
      const index = validIndex(trigger.dataset.eventImage);
      if (index === null) return;
      trigger.setAttribute('aria-label', 'Ampliar imagem: ' + titleFor(images[index]));
      trigger.setAttribute('aria-haspopup', 'dialog');
      if (dialog) trigger.setAttribute('aria-controls', 'event-dialog');
      if (trigger.tagName !== 'BUTTON' && trigger.tagName !== 'A') {
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openLightbox(index);
          }
        });
      }
      trigger.addEventListener('click', event => {
        event.preventDefault();
        openLightbox(index);
      });
    });

    document.querySelectorAll('[data-event-title]').forEach(element => {
      if (typeof config.title === 'string') element.textContent = config.title;
    });
    document.querySelectorAll('[data-event-subtitle]').forEach(element => {
      if (typeof config.subtitle === 'string') element.textContent = config.subtitle;
    });

    const message = typeof config.contactMessage === 'string' && config.contactMessage.trim()
      ? config.contactMessage.trim()
      : 'Olá, Manu! Gostaria de conversar sobre presentes e lembrancinhas para um evento especial. Pode me ajudar com opções, quantidades, valores e prazos?';
    document.querySelectorAll('#event-contact, [data-event-contact]').forEach(contact => {
      contact.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
      contact.target = '_blank';
      contact.rel = 'noopener noreferrer';
    });

    if (dialog) {
      dialog.setAttribute('aria-labelledby', 'event-modal-title');
      if (position) {
        position.setAttribute('aria-live', 'polite');
        position.setAttribute('aria-atomic', 'true');
      }
      dialog.addEventListener('close', syncDialogScroll);
      dialog.addEventListener('keydown', event => {
        if (!dialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          changeImage(event.key === 'ArrowLeft' ? -1 : 1);
        }
      });
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeLightbox();
      });
    }
    if ($('event-close')) $('event-close').addEventListener('click', closeLightbox);
    if (previous) previous.addEventListener('click', () => changeImage(-1));
    if (next) next.addEventListener('click', () => changeImage(1));

    const menuToggle = $('menu-toggle');
    const mobileNav = $('mobile-nav');
    function closeMenu() {
      if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
      }
      if (mobileNav) mobileNav.hidden = true;
    }
    if (menuToggle && mobileNav) {
      menuToggle.setAttribute('aria-controls', 'mobile-nav');
      menuToggle.addEventListener('click', () => {
        const wasExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!wasExpanded));
        menuToggle.setAttribute('aria-label', wasExpanded ? 'Abrir menu' : 'Fechar menu');
        mobileNav.hidden = wasExpanded;
      });
      mobileNav.addEventListener('click', event => {
        if (event.target.closest('a')) closeMenu();
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !mobileNav.hidden) {
          closeMenu();
          menuToggle.focus();
        }
      });
      document.addEventListener('click', event => {
        if (!mobileNav.hidden && !mobileNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
      });
    }

    if ($('current-year')) $('current-year').textContent = String(new Date().getFullYear());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
