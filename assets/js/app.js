/* Manu Saboaria — catálogo, sacola e pedidos pelo WhatsApp. */
(() => {
  'use strict';

  function init() {
    const source = window.MANU || {};
    const products = Array.isArray(source.products) ? source.products.filter(product => product && typeof product.id === 'string') : [];
    const productMap = new Map(products.map(product => [product.id, product]));
    const phone = String(source.phone || '5541999863000').replace(/\D/g, '');
    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const storageKey = 'manu-cart-v1';
    const pageSize = 12;
    const state = { filter: 'all', search: '', sort: 'featured', visible: pageSize, cart: [], notes: '' };
    const $ = id => document.getElementById(id);
    const grid = $('product-grid');
    const productDialog = $('product-dialog');
    const cartDialog = $('cart-dialog');
    const productContent = $('product-content');
    const toast = $('toast');
    let toastTimer;
    let previousOverflow = null;
    let selectedProduct = null;
    let selectedQuantity = 1;

    function element(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined && text !== null) node.textContent = String(text);
      return node;
    }

    function icon(name) {
      const span = element('span', 'icon');
      span.setAttribute('aria-hidden', 'true');
      const paths = {
        plus: '<path d="M12 5v14M5 12h14"/>',
        minus: '<path d="M5 12h14"/>',
        bag: '<path d="M6 7h12l1 14H5L6 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
        trash: '<path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6"/>',
        whatsapp: '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4.1Z"/><path d="M8.4 7.6c.4-.3.9.6 1.2 1.1.2.4-.3.8-.5 1 .5 1.2 1.3 2 2.6 2.7.3-.2.7-.8 1-.7.5.2 1.6.7 1.7 1.1.1.5-.5 1.4-1.1 1.5-2.6.5-6.8-3.6-6.1-5.8.1-.4.6-.8 1.2-.9Z"/>'
      };
      // Every path is a fixed application asset; product content uses textContent.
      span.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" focusable="false">' + (paths[name] || paths.plus) + '</svg>';
      return span;
    }

    function isPriced(product) {
      return typeof product.price === 'number' && Number.isFinite(product.price) && product.price >= 0;
    }

    function priceLabel(product) {
      return isPriced(product) ? currency.format(product.price) : 'Sob consulta';
    }

    function normalized(value) {
      return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    function boundedQuantity(value) {
      const number = Number(value);
      return Number.isFinite(number) ? Math.max(1, Math.min(99, Math.trunc(number))) : 1;
    }

    function whatsappURL(message) {
      return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
    }

    function consultationMessage(product, quantity = 1) {
      return 'Olá, Manu! Gostaria de saber mais sobre ' + product.name + (quantity > 1 ? ' (' + quantity + ' unidades)' : '') + '. Pode me passar o valor e as opções disponíveis?';
    }

    function notify(message) {
      if (!toast) return;
      window.clearTimeout(toastTimer);
      toast.textContent = message;
      toast.hidden = false;
      toast.classList.add('visible');
      toastTimer = window.setTimeout(() => {
        toast.classList.remove('visible');
        toast.hidden = true;
      }, 3200);
    }

    function saveCart() {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({ items: state.cart, notes: state.notes }));
      } catch (_) {
        // The catalogue remains usable when the browser blocks local storage.
      }
    }

    function restoreCart(raw) {
      try {
        const saved = JSON.parse(raw === undefined ? window.localStorage.getItem(storageKey) : raw);
        const items = Array.isArray(saved) ? saved : saved && Array.isArray(saved.items) ? saved.items : [];
        const quantities = new Map();
        items.forEach(item => {
          if (!item || !productMap.has(item.id) || !isPriced(productMap.get(item.id))) return;
          const quantity = Number(item.quantity);
          if (!Number.isFinite(quantity) || quantity < 1) return;
          quantities.set(item.id, boundedQuantity((quantities.get(item.id) || 0) + quantity));
        });
        state.cart = Array.from(quantities, ([id, quantity]) => ({ id, quantity }));
        state.notes = saved && !Array.isArray(saved) && typeof saved.notes === 'string' ? saved.notes.slice(0, 1500) : '';
      } catch (_) {
        state.cart = [];
        state.notes = '';
      }
    }

    function syncDialogScroll() {
      const open = Boolean((productDialog && productDialog.open) || (cartDialog && cartDialog.open));
      if (open && previousOverflow === null) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      } else if (!open && previousOverflow !== null) {
        document.body.style.overflow = previousOverflow;
        previousOverflow = null;
      }
    }

    function openDialog(dialog) {
      if (!dialog || dialog.open) return;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      syncDialogScroll();
    }

    function closeDialog(dialog) {
      if (!dialog) return;
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      syncDialogScroll();
    }

    [productDialog, cartDialog].forEach(dialog => {
      if (!dialog) return;
      dialog.addEventListener('close', syncDialogScroll);
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
      });
    });

    function productImage(product, className, lazy = true) {
      const img = element('img', className);
      img.src = product.image;
      img.alt = product.name;
      img.width = 720;
      img.height = 720;
      img.decoding = 'async';
      img.loading = lazy ? 'lazy' : 'eager';
      return img;
    }

    function makeCard(product) {
      const article = element('article', 'product-card');
      const imageButton = element('button', 'product-image');
      imageButton.type = 'button';
      imageButton.dataset.productId = product.id;
      imageButton.dataset.action = 'view';
      imageButton.setAttribute('aria-label', 'Ver detalhes de ' + product.name);
      imageButton.append(productImage(product, 'product-photo'));
      const imageWrap = element('div', 'product-image-wrap');
      imageWrap.append(imageButton);
      const body = element('div', 'product-card-body');
      body.append(element('p', 'product-category', product.categoryLabel || product.category));
      const name = element('h3', 'product-name');
      const nameButton = element('button', 'product-name-button', product.name);
      nameButton.type = 'button';
      nameButton.dataset.action = 'view';
      nameButton.dataset.productId = product.id;
      name.append(nameButton);
      body.append(name, element('p', 'product-desc', product.description));
      const footer = element('div', 'product-card-footer');
      footer.append(element('p', 'product-price', priceLabel(product)));
      const add = element('button', 'add-product');
      add.type = 'button';
      add.dataset.action = isPriced(product) ? 'add' : 'view';
      add.dataset.productId = product.id;
      add.setAttribute('aria-label', isPriced(product) ? 'Adicionar ' + product.name + ' à sacola' : 'Consultar ' + product.name);
      add.title = isPriced(product) ? 'Adicionar à sacola' : 'Consultar produto';
      add.append(icon(isPriced(product) ? 'plus' : 'whatsapp'));
      footer.append(add);
      body.append(footer);
      article.append(imageWrap, body);
      return article;
    }

    function filteredProducts() {
      const query = normalized(state.search).trim();
      const matches = products.filter(product => {
        const matchesCategory = state.filter === 'all' || state.filter === 'todos' || product.category === state.filter;
        const haystack = normalized([product.name, product.description, product.detail, product.categoryLabel].join(' '));
        return matchesCategory && (!query || haystack.includes(query));
      });
      if (state.sort === 'price-low') matches.sort((a, b) => (isPriced(a) ? a.price : Infinity) - (isPriced(b) ? b.price : Infinity));
      if (state.sort === 'price-high') matches.sort((a, b) => (isPriced(b) ? b.price : -Infinity) - (isPriced(a) ? a.price : -Infinity));
      if (state.sort === 'name') matches.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      return matches;
    }

    function renderCatalog() {
      if (!grid) return;
      const matches = filteredProducts();
      const shown = matches.slice(0, state.visible);
      const fragment = document.createDocumentFragment();
      shown.forEach(product => fragment.append(makeCard(product)));
      grid.replaceChildren(fragment);
      if ($('catalog-count')) $('catalog-count').textContent = matches.length === 0 ? 'Nenhum produto encontrado' : 'Mostrando ' + shown.length + ' de ' + matches.length + ' produtos';
      if ($('no-results')) $('no-results').hidden = matches.length > 0;
      if ($('load-more')) $('load-more').hidden = shown.length >= matches.length;
      document.querySelectorAll('[data-filter]').forEach(button => {
        const active = button.dataset.filter === state.filter;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    function quantityButton(action, label, productId) {
      const button = element('button', 'quantity-button');
      button.type = 'button';
      button.dataset.quantityAction = action;
      if (productId) button.dataset.productId = productId;
      button.setAttribute('aria-label', label);
      button.append(icon(action === 'decrease' ? 'minus' : 'plus'));
      return button;
    }

    function showProduct(product) {
      if (!productContent) return;
      selectedProduct = product;
      selectedQuantity = 1;
      const layout = element('div', 'dialog-product-layout');
      const imageWrap = element('div', 'dialog-product-image-wrap');
      imageWrap.append(productImage(product, 'dialog-product-image', false));
      const info = element('div', 'dialog-product-info');
      info.append(element('p', 'dialog-product-category', product.categoryLabel || product.category));
      const title = element('h2', 'dialog-product-title', product.name);
      title.id = 'product-dialog-title';
      info.append(title);
      info.append(element('p', 'dialog-product-detail', product.detail || product.description));
      if (product.size) info.append(element('p', 'dialog-product-size', product.size));
      if (Array.isArray(product.scents) && product.scents.length) {
        info.append(element('p', 'dialog-product-scents-label', 'Aromas disponíveis'));
        const scents = element('ul', 'dialog-product-scents');
        product.scents.forEach(scent => scents.append(element('li', 'scent-chip', scent)));
        info.append(scents);
      }
      info.append(element('p', 'dialog-product-price', priceLabel(product)));
      const purchase = element('div', 'product-purchase');
      const quantity = element('div', 'quantity-control');
      quantity.setAttribute('role', 'group');
      quantity.setAttribute('aria-label', 'Quantidade');
      const decrease = quantityButton('decrease', 'Diminuir quantidade');
      decrease.disabled = true;
      const value = element('output', 'quantity-value', '1');
      value.id = 'product-quantity';
      value.setAttribute('aria-live', 'polite');
      quantity.append(decrease, value, quantityButton('increase', 'Aumentar quantidade'));
      purchase.append(quantity);
      if (isPriced(product)) {
        const add = element('button', 'button button-primary product-dialog-add', 'Adicionar à sacola');
        add.type = 'button';
        add.prepend(icon('bag'));
        add.addEventListener('click', () => {
          closeDialog(productDialog);
          addProduct(product.id, selectedQuantity);
        });
        purchase.append(add);
      } else {
        const consult = element('a', 'button button-primary product-dialog-consult', 'Consultar no WhatsApp');
        consult.id = 'product-consult-link';
        consult.href = whatsappURL(consultationMessage(product));
        consult.target = '_blank';
        consult.rel = 'noopener noreferrer';
        consult.prepend(icon('whatsapp'));
        purchase.append(consult);
      }
      info.append(purchase);
      if (isPriced(product)) info.append(element('p', 'dialog-product-note', 'Seu pedido será combinado com o Manu pelo WhatsApp.'));
      layout.append(imageWrap, info);
      productContent.replaceChildren(layout);
      if (productDialog) productDialog.setAttribute('aria-labelledby', title.id);
      closeDialog(cartDialog);
      openDialog(productDialog);
    }

    function addProduct(id, quantity = 1) {
      const product = productMap.get(id);
      if (!product || !isPriced(product)) return;
      const current = state.cart.find(item => item.id === id);
      const previous = current ? current.quantity : 0;
      const next = boundedQuantity(previous + boundedQuantity(quantity));
      if (current) current.quantity = next;
      else state.cart.push({ id, quantity: next });
      saveCart();
      renderCart();
      notify(next === previous ? 'Limite de 99 unidades por produto.' : product.name + ' adicionado à sacola.');
    }

    function cartTotal() {
      return state.cart.reduce((total, item) => total + productMap.get(item.id).price * item.quantity, 0);
    }

    function orderMessage() {
      const lines = ['Olá, Manu! Gostaria de fazer este pedido:', ''];
      state.cart.forEach(item => {
        const product = productMap.get(item.id);
        lines.push('• ' + item.quantity + ' × ' + product.name + ' — ' + priceLabel(product) + ' cada = ' + currency.format(product.price * item.quantity));
      });
      lines.push('', 'Subtotal dos produtos: ' + currency.format(cartTotal()));
      const notes = state.notes.trim();
      if (notes) lines.push('', 'Observações: ' + notes);
      lines.push('', 'Pode confirmar a disponibilidade, o prazo, a entrega e a forma de pagamento?');
      return lines.join('\n');
    }

    function updateCheckout() {
      const checkout = $('checkout');
      if (!checkout) return;
      if (state.cart.length) {
        checkout.href = whatsappURL(orderMessage());
        checkout.setAttribute('aria-disabled', 'false');
        checkout.removeAttribute('tabindex');
      } else {
        checkout.removeAttribute('href');
        checkout.setAttribute('aria-disabled', 'true');
        checkout.setAttribute('tabindex', '-1');
      }
      checkout.target = '_blank';
      checkout.rel = 'noopener noreferrer';
    }

    function renderCart() {
      const itemContainer = $('cart-items');
      const active = document.activeElement;
      const activeId = active && active.dataset ? active.dataset.productId : null;
      const activeAction = active && active.dataset ? active.dataset.quantityAction || active.dataset.cartAction : null;
      const count = state.cart.reduce((total, item) => total + item.quantity, 0);
      ['cart-count', 'cart-count-mobile'].forEach(id => {
        const counter = $(id);
        if (counter) {
          counter.textContent = String(count);
          counter.setAttribute('aria-label', count + (count === 1 ? ' item na sacola' : ' itens na sacola'));
        }
      });
      ['open-cart', 'open-cart-mobile'].forEach(id => {
        if ($(id)) $(id).setAttribute('aria-label', 'Abrir sacola com ' + count + (count === 1 ? ' item' : ' itens'));
      });
      if ($('cart-empty')) $('cart-empty').hidden = state.cart.length > 0;
      if ($('cart-filled')) $('cart-filled').hidden = state.cart.length === 0;
      if ($('cart-subtotal')) $('cart-subtotal').textContent = currency.format(cartTotal());
      const notes = $('cart-notes');
      if (notes && notes.value !== state.notes) notes.value = state.notes;
      if (itemContainer) {
        const fragment = document.createDocumentFragment();
        state.cart.forEach(item => {
          const product = productMap.get(item.id);
          const row = element('div', 'cart-item');
          row.append(productImage(product, 'cart-item-image'));
          const info = element('div', 'cart-item-info');
          info.append(element('h3', 'cart-item-name', product.name), element('p', 'cart-item-unit', priceLabel(product) + ' / un.'));
          const controls = element('div', 'cart-item-controls');
          const quantity = element('div', 'quantity-control cart-item-quantity');
          quantity.setAttribute('role', 'group');
          quantity.setAttribute('aria-label', 'Quantidade de ' + product.name);
          const decrease = quantityButton('decrease', 'Diminuir quantidade de ' + product.name, item.id);
          decrease.disabled = item.quantity <= 1;
          const value = element('span', 'quantity-value', item.quantity);
          const increase = quantityButton('increase', 'Aumentar quantidade de ' + product.name, item.id);
          increase.disabled = item.quantity >= 99;
          quantity.append(decrease, value, increase);
          const remove = element('button', 'cart-item-remove');
          remove.type = 'button';
          remove.dataset.cartAction = 'remove';
          remove.dataset.productId = item.id;
          remove.setAttribute('aria-label', 'Remover ' + product.name + ' da sacola');
          remove.title = 'Remover produto';
          remove.append(icon('trash'));
          controls.append(quantity, remove);
          info.append(controls);
          row.append(info, element('p', 'cart-item-total', currency.format(product.price * item.quantity)));
          fragment.append(row);
        });
        itemContainer.replaceChildren(fragment);
        if (cartDialog && cartDialog.open && activeId && activeAction) {
          const replacement = Array.from(itemContainer.querySelectorAll('button')).find(button => button.dataset.productId === activeId && (button.dataset.quantityAction || button.dataset.cartAction) === activeAction && !button.disabled);
          if (replacement) replacement.focus({ preventScroll: true });
          else if (state.cart.length && $('checkout')) $('checkout').focus({ preventScroll: true });
          else if ($('close-cart')) $('close-cart').focus({ preventScroll: true });
        }
      }
      updateCheckout();
    }

    if (grid) grid.addEventListener('click', event => {
      const button = event.target.closest('button[data-product-id]');
      if (!button || !grid.contains(button)) return;
      const product = productMap.get(button.dataset.productId);
      if (!product) return;
      if (button.dataset.action === 'add') addProduct(product.id);
      else showProduct(product);
    });

    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      state.filter = button.dataset.filter || 'all';
      state.visible = pageSize;
      renderCatalog();
    }));

    document.querySelectorAll('[data-category-link]').forEach(link => link.addEventListener('click', event => {
      const category = link.dataset.categoryLink;
      if (!category) return;
      event.preventDefault();
      state.filter = category;
      state.search = '';
      state.visible = pageSize;
      if ($('catalog-search')) $('catalog-search').value = '';
      renderCatalog();
      const collection = $('colecao');
      if (collection) {
        const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        collection.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    }));

    if ($('catalog-search')) $('catalog-search').addEventListener('input', event => {
      state.search = event.target.value;
      state.visible = pageSize;
      renderCatalog();
    });

    if ($('catalog-sort')) $('catalog-sort').addEventListener('change', event => {
      state.sort = event.target.value;
      state.visible = pageSize;
      renderCatalog();
    });

    if ($('load-more')) $('load-more').addEventListener('click', () => {
      const previousVisible = state.visible;
      state.visible += pageSize;
      renderCatalog();
      const firstNew = grid && grid.children[previousVisible];
      const target = firstNew && firstNew.querySelector('button');
      if (target) target.focus({ preventScroll: true });
    });

    if (productContent) productContent.addEventListener('click', event => {
      const button = event.target.closest('[data-quantity-action]');
      if (!button || !selectedProduct) return;
      selectedQuantity = boundedQuantity(selectedQuantity + (button.dataset.quantityAction === 'increase' ? 1 : -1));
      const output = $('product-quantity');
      if (output) output.textContent = String(selectedQuantity);
      const decrease = productContent.querySelector('[data-quantity-action="decrease"]');
      const increase = productContent.querySelector('[data-quantity-action="increase"]');
      if (decrease) decrease.disabled = selectedQuantity <= 1;
      if (increase) increase.disabled = selectedQuantity >= 99;
      const consultation = $('product-consult-link');
      if (consultation) consultation.href = whatsappURL(consultationMessage(selectedProduct, selectedQuantity));
    });

    if ($('close-product')) $('close-product').addEventListener('click', () => closeDialog(productDialog));
    if ($('close-cart')) $('close-cart').addEventListener('click', () => closeDialog(cartDialog));
    ['open-cart', 'open-cart-mobile'].forEach(id => {
      if ($(id)) $(id).addEventListener('click', () => {
        closeMobileMenu();
        closeDialog(productDialog);
        renderCart();
        openDialog(cartDialog);
      });
    });

    if ($('cart-items')) $('cart-items').addEventListener('click', event => {
      const button = event.target.closest('button[data-product-id]');
      if (!button) return;
      const item = state.cart.find(entry => entry.id === button.dataset.productId);
      if (!item) return;
      if (button.dataset.cartAction === 'remove') state.cart = state.cart.filter(entry => entry.id !== item.id);
      else if (button.dataset.quantityAction) item.quantity = boundedQuantity(item.quantity + (button.dataset.quantityAction === 'increase' ? 1 : -1));
      saveCart();
      renderCart();
    });

    if ($('clear-cart')) $('clear-cart').addEventListener('click', () => {
      state.cart = [];
      state.notes = '';
      saveCart();
      renderCart();
      notify('Sua sacola foi esvaziada.');
    });

    if ($('cart-notes')) $('cart-notes').addEventListener('input', event => {
      state.notes = event.target.value.slice(0, 1500);
      saveCart();
      updateCheckout();
    });

    if ($('checkout')) $('checkout').addEventListener('click', event => {
      if (!state.cart.length) event.preventDefault();
      else updateCheckout();
    });

    const menuToggle = $('menu-toggle');
    const mobileNav = $('mobile-nav');
    function closeMobileMenu() {
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      if (mobileNav) mobileNav.hidden = true;
    }
    if (menuToggle && mobileNav) {
      menuToggle.setAttribute('aria-controls', 'mobile-nav');
      menuToggle.addEventListener('click', () => {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!expanded));
        mobileNav.hidden = expanded;
      });
      mobileNav.addEventListener('click', event => {
        if (event.target.closest('a')) closeMobileMenu();
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !mobileNav.hidden) {
          closeMobileMenu();
          menuToggle.focus();
        }
      });
      document.addEventListener('click', event => {
        if (!mobileNav.hidden && !mobileNav.contains(event.target) && !menuToggle.contains(event.target)) closeMobileMenu();
      });
    }

    document.querySelectorAll('[data-close-cart]').forEach(button => button.addEventListener('click', () => closeDialog(cartDialog)));
    window.addEventListener('storage', event => {
      if (event.key !== storageKey) return;
      restoreCart(event.newValue);
      renderCart();
    });

    restoreCart();
    renderCatalog();
    renderCart();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
