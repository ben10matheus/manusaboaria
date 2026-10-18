/* Sugestões locais de produtos. O envio do formulário sempre abre a busca completa. */
(() => {
  'use strict';

  function init() {
    const forms = Array.from(document.querySelectorAll('form[data-site-search]'));
    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const states = [];
    let active = null;

    function element(tag, className, value) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (value !== undefined) node.textContent = value;
      return node;
    }

    function searchURL(query, productId) {
      const params = new URLSearchParams();
      params.set('q', query);
      if (productId !== undefined) params.set('produto', String(productId));
      return 'pesquisa.html?' + params.toString();
    }

    function syncInputs(query) {
      states.forEach(state => {
        if (state.input.value !== query) state.input.value = query;
      });
    }

    function closePanel(state) {
      if (!state) return;
      state.panel.hidden = true;
      state.input.setAttribute('aria-expanded', 'false');
      if (active === state) active = null;
    }

    function closeAll() {
      states.forEach(closePanel);
    }

    function positionPanel(state) {
      if (!state || state.panel.hidden) return;
      if (typeof state.form.getClientRects === 'function' && !state.form.getClientRects().length) {
        closePanel(state);
        return;
      }
      const rect = state.form.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewportHeight) {
        closePanel(state);
        return;
      }
      const width = Math.min(380, Math.max(0, viewportWidth - 32));
      const left = Math.max(16, Math.min(rect.left, viewportWidth - width - 16));
      const below = viewportHeight - rect.bottom - 24;
      const above = rect.top - 24;
      const useAbove = below < 190 && above > below;
      state.panel.style.width = width + 'px';
      state.panel.style.left = left + 'px';
      state.panel.style.maxHeight = Math.max(80, Math.min(360, useAbove ? above : below)) + 'px';
      state.panel.style.top = useAbove ? 'auto' : Math.max(16, Math.min(rect.bottom + 8, viewportHeight - 96)) + 'px';
      state.panel.style.bottom = useAbove ? Math.max(16, viewportHeight - rect.top + 8) + 'px' : 'auto';
    }

    function matchesFor(query) {
      const engine = window.ManuSearch;
      if (!engine || typeof engine.search !== 'function') return null;
      const products = window.MANU && Array.isArray(window.MANU.products) ? window.MANU.products : [];
      try {
        const result = engine.search(products, query);
        return result && Array.isArray(result.matches)
          ? result.matches.filter(product => product && product.id !== undefined && product.id !== null)
          : [];
      } catch (_) {
        return null;
      }
    }

    function productLink(product, query) {
      const link = element('a', 'site-autocomplete-result');
      link.href = searchURL(query, product.id);
      if (typeof product.image === 'string' && product.image) {
        const photo = element('img', 'site-autocomplete-thumb');
        photo.src = product.image;
        photo.alt = '';
        photo.width = 48;
        photo.height = 48;
        photo.loading = 'lazy';
        photo.decoding = 'async';
        link.append(photo);
      } else {
        const placeholder = element('span', 'site-autocomplete-thumb site-autocomplete-placeholder', 'Manu');
        placeholder.setAttribute('aria-hidden', 'true');
        link.append(placeholder);
      }
      const copy = element('span', 'site-autocomplete-product');
      const price = typeof product.price === 'number' && Number.isFinite(product.price) && product.price >= 0
        ? currency.format(product.price) : 'Sob consulta';
      copy.append(element('span', 'site-autocomplete-name', String(product.name || 'Produto')));
      copy.append(element('span', 'site-autocomplete-price', price));
      link.append(copy);
      return link;
    }

    function openPanel(state) {
      const query = state.input.value.trim();
      if (!query) {
        closeAll();
        return;
      }
      states.forEach(other => {
        if (other !== state) closePanel(other);
      });
      const matches = matchesFor(query);
      const fragment = document.createDocumentFragment();
      const heading = element('p', 'site-autocomplete-heading', matches && matches.length
        ? (matches.length === 1 ? '1 produto encontrado' : matches.length + ' produtos encontrados')
        : 'Sua busca');
      heading.setAttribute('role', 'status');
      heading.setAttribute('aria-live', 'polite');
      fragment.append(heading);
      if (matches && matches.length) {
        const list = element('ul', 'site-autocomplete-list');
        matches.slice(0, 3).forEach(product => {
          const item = element('li', 'site-autocomplete-item');
          item.append(productLink(product, query));
          list.append(item);
        });
        fragment.append(list);
        if (matches.length > 3) {
          const more = element('a', 'site-autocomplete-more', 'Mostrar mais (' + matches.length + ')');
          more.href = searchURL(query);
          fragment.append(more);
        }
      } else {
        fragment.append(element('p', 'site-autocomplete-empty', matches === null
          ? 'Continue para ver os resultados da busca.'
          : 'Nenhum produto encontrado para “' + query + '”.'));
        const search = element('a', 'site-autocomplete-more', 'Pesquisar “' + query + '”');
        search.href = searchURL(query);
        fragment.append(search);
      }
      state.panel.replaceChildren(fragment);
      state.links = Array.from(state.panel.querySelectorAll('a'));
      state.panel.hidden = false;
      state.input.setAttribute('aria-expanded', 'true');
      active = state;
      positionPanel(state);
    }

    forms.forEach((form, index) => {
      const input = form.querySelector('input[name="q"]');
      if (!input) return;
      const panel = element('div', 'site-autocomplete');
      panel.id = 'site-autocomplete-' + (index + 1);
      panel.hidden = true;
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-label', 'Sugestões de produtos');
      // A body-level panel avoids clipping inside the mobile menu and prevents
      // the navigation's link styles from changing the product suggestions.
      document.body.append(panel);
      input.setAttribute('aria-controls', panel.id);
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('autocomplete', 'off');
      const state = { form, input, panel, links: [] };
      states.push(state);

      input.addEventListener('input', () => {
        syncInputs(input.value);
        openPanel(state);
      });
      input.addEventListener('focus', () => openPanel(state));
      input.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !panel.hidden) {
          event.preventDefault();
          event.stopPropagation();
          closePanel(state);
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          if (panel.hidden) openPanel(state);
          if (state.links.length && !panel.hidden) {
            event.preventDefault();
            const next = event.key === 'ArrowDown' ? state.links[0] : state.links[state.links.length - 1];
            next.focus();
          }
        } else if (event.key === 'Tab' && !event.shiftKey && !panel.hidden && state.links.length) {
          event.preventDefault();
          state.links[0].focus();
        }
        // Enter keeps the form's native GET submission for all results.
      });
      panel.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          input.focus({ preventScroll: true });
          closePanel(state);
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          const current = state.links.indexOf(document.activeElement);
          if (current < 0 || !state.links.length) return;
          event.preventDefault();
          const step = event.key === 'ArrowDown' ? 1 : -1;
          state.links[(current + step + state.links.length) % state.links.length].focus();
        } else if (event.key === 'Tab') {
          const current = state.links.indexOf(document.activeElement);
          if (event.shiftKey && current === 0) {
            event.preventDefault();
            input.focus({ preventScroll: true });
          } else if (!event.shiftKey && current === state.links.length - 1) {
            const submit = form.querySelector('button[type="submit"], input[type="submit"]');
            event.preventDefault();
            if (submit) submit.focus();
            else input.focus({ preventScroll: true });
            closePanel(state);
          }
        }
      });
      form.addEventListener('submit', () => {
        syncInputs(input.value.trim());
        closeAll();
      });
    });

    if (!states.length) return;
    try {
      const query = new URLSearchParams(window.location.search).get('q');
      if (query !== null) syncInputs(query);
    } catch (_) {
      // Existing field values and native GET submission remain usable.
    }
    document.addEventListener('pointerdown', event => {
      if (active && !active.form.contains(event.target) && !active.panel.contains(event.target)) closeAll();
    });
    document.addEventListener('focusin', event => {
      if (active && !active.form.contains(event.target) && !active.panel.contains(event.target)) closeAll();
    });
    window.addEventListener('resize', () => positionPanel(active));
    window.addEventListener('scroll', () => positionPanel(active), true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
