/* Manu Saboaria — galeria completa, filtros e visualização das imagens. */
(() => {
  'use strict';

  function init() {
    const images = Array.isArray(window.MANU_GALLERY) ? window.MANU_GALLERY : [];
    const phone = String(window.MANU && window.MANU.phone || '5541999863000').replace(/\D/g, '');
    const $ = id => document.getElementById(id);
    const grid = $('gallery-grid');
    const more = $('gallery-more');
    const dialog = $('gallery-dialog');
    const fullImage = $('gallery-image');
    const title = $('gallery-title');
    const position = $('gallery-position');
    const contact = $('gallery-contact');
    const original = $('gallery-original');
    const filters = Array.from(document.querySelectorAll('[data-gallery-filter]'));
    const pageSize = 24;
    let category = 'all';
    let visible = pageSize;
    let selectedIndex = 0;
    let previousOverflow = null;

    if (!grid) return;

    function photoNumber(image) {
      return String(image.id).padStart(3, '0');
    }

    function filteredImages() {
      return category === 'all' ? images : images.filter(image => image.category === category);
    }

    function syncScroll() {
      if (dialog && dialog.open && previousOverflow === null) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      } else if ((!dialog || !dialog.open) && previousOverflow !== null) {
        document.body.style.overflow = previousOverflow;
        previousOverflow = null;
      }
    }

    function closeGallery() {
      if (!dialog) return;
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      syncScroll();
    }

    function contactURL(image) {
      const lines = ['Olá, Manu! Vi a foto ' + photoNumber(image) + ' da galeria do site: ' + image.title + '.', 'Pode me contar sobre as opções, os valores e a disponibilidade?'];
      try {
        const imageURL = new URL(image.src, window.location.href);
        if (imageURL.protocol === 'https:' || imageURL.protocol === 'http:') lines.push('', 'Foto de referência: ' + imageURL.href);
      } catch (_) {
        // A identificação numérica também funciona ao abrir a pasta localmente.
      }
      return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(lines.join('\n'));
    }

    function updateDialog() {
      const selection = filteredImages();
      if (!selection.length) return;
      selectedIndex = (selectedIndex + selection.length) % selection.length;
      const image = selection[selectedIndex];
      if (fullImage) {
        fullImage.src = image.src;
        fullImage.alt = image.title + ' — foto ' + photoNumber(image) + ' da marca Manu Saboaria';
        fullImage.width = image.width;
        fullImage.height = image.height;
        fullImage.loading = 'eager';
        fullImage.decoding = 'async';
      }
      if (title) title.textContent = image.title;
      if (position) {
        position.textContent = (selectedIndex + 1) + ' de ' + selection.length + ' · Foto ' + photoNumber(image);
        position.setAttribute('aria-live', 'polite');
        position.setAttribute('aria-atomic', 'true');
      }
      if (contact) {
        contact.href = contactURL(image);
        contact.target = '_blank';
        contact.rel = 'noopener noreferrer';
        contact.setAttribute('aria-label', 'Perguntar ao Manu sobre ' + image.title + ', foto ' + photoNumber(image));
      }
      if (original) {
        original.href = image.src;
        original.download = image.src.split('/').pop();
        original.setAttribute('aria-label', 'Baixar foto ' + photoNumber(image));
      }
      ['gallery-prev', 'gallery-next'].forEach(id => {
        const button = $(id);
        if (button) button.disabled = selection.length < 2;
      });
    }

    function showGallery(index) {
      if (!dialog) return;
      selectedIndex = index;
      updateDialog();
      dialog.setAttribute('aria-labelledby', 'gallery-title');
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      }
      syncScroll();
    }

    function moveGallery(step) {
      selectedIndex += step;
      updateDialog();
    }

    function render() {
      const selection = filteredImages();
      const shown = selection.slice(0, visible);
      const fragment = document.createDocumentFragment();
      shown.forEach((image, index) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'gallery-card';
        card.dataset.galleryIndex = String(index);
        card.setAttribute('aria-label', 'Ampliar ' + image.title + ', foto ' + photoNumber(image));
        card.setAttribute('aria-haspopup', 'dialog');
        const picture = document.createElement('img');
        picture.className = 'gallery-card-image';
        picture.src = image.src;
        picture.alt = image.title + ' — foto ' + photoNumber(image);
        picture.width = image.width;
        picture.height = image.height;
        picture.loading = 'lazy';
        picture.decoding = 'async';
        const caption = document.createElement('span');
        caption.className = 'gallery-caption';
        caption.textContent = image.title;
        card.append(picture, caption);
        fragment.append(card);
      });
      grid.replaceChildren(fragment);
      if ($('gallery-count')) $('gallery-count').textContent = 'Mostrando ' + shown.length + ' de ' + selection.length + ' imagens';
      if (more) more.hidden = shown.length >= selection.length;
      filters.forEach(button => {
        const active = button.dataset.galleryFilter === category;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    grid.addEventListener('click', event => {
      const card = event.target.closest('button[data-gallery-index]');
      if (!card || !grid.contains(card)) return;
      const index = Number(card.dataset.galleryIndex);
      if (Number.isInteger(index) && index >= 0 && index < filteredImages().length) showGallery(index);
    });

    filters.forEach(button => button.addEventListener('click', () => {
      category = button.dataset.galleryFilter || 'all';
      visible = pageSize;
      selectedIndex = 0;
      render();
    }));

    if (more) more.addEventListener('click', () => {
      const previousVisible = visible;
      visible += pageSize;
      render();
      const firstNew = grid.children[previousVisible];
      if (firstNew) firstNew.focus({ preventScroll: true });
    });

    if ($('gallery-close')) $('gallery-close').addEventListener('click', closeGallery);
    if ($('gallery-prev')) $('gallery-prev').addEventListener('click', () => moveGallery(-1));
    if ($('gallery-next')) $('gallery-next').addEventListener('click', () => moveGallery(1));
    if (dialog) {
      dialog.addEventListener('close', syncScroll);
      dialog.addEventListener('keydown', event => {
        if (!dialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          moveGallery(event.key === 'ArrowLeft' ? -1 : 1);
        }
      });
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeGallery();
      });
    }

    if ($('current-year')) $('current-year').textContent = String(new Date().getFullYear());
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

(() => {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('mobile-nav');
  if (!toggle || !nav) return;
  function close() { nav.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') === 'true'; nav.hidden = open; toggle.setAttribute('aria-expanded', String(!open)); });
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !nav.hidden) { close(); toggle.focus(); } });
  document.addEventListener('click', event => { if (!nav.hidden && !nav.contains(event.target) && !toggle.contains(event.target)) close(); });
})();
