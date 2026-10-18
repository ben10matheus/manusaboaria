/* Manu Saboaria — agenda pública e pontos fixos. Sem consultas externas. */
(() => {
  'use strict';

  const timeZone = 'America/Sao_Paulo';
  const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });

  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T12:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function saoPauloDay(now = new Date()) {
    const parts = dayFormatter.formatToParts(now);
    const part = name => parts.find(value => value.type === name).value;
    return part('year') + '-' + part('month') + '-' + part('day');
  }

  function classifyFair(fair, today) {
    if (!fair || fair.publicar !== true || !validDate(fair.inicio) || !validDate(fair.fim) || fair.fim < fair.inicio) return null;
    return fair.fim < today ? 'past' : fair.inicio <= today ? 'current' : 'upcoming';
  }

  function dateLabel(value) {
    return validDate(value) ? dateFormatter.format(new Date(value + 'T12:00:00Z')) : '';
  }

  function sourceURL(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim());
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
    } catch (_) {
      return null;
    }
  }

  function init() {
    const data = window.MANU_LOCAIS || {};
    const fixed = Array.isArray(data.fixos) ? data.fixos.filter(item => item && typeof item === 'object') : [];
    const fairs = Array.isArray(data.feiras) ? data.feiras : [];
    const $ = id => document.getElementById(id);
    let renderedDay = null;
    let dayTimer;

    function text(value) {
      return typeof value === 'string' ? value.trim() : '';
    }

    function element(tag, className, value) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (value !== undefined) node.textContent = value;
      return node;
    }

    function detail(label, value) {
      const group = element('div', 'place-detail');
      group.append(element('dt', '', label), element('dd', '', value));
      return group;
    }

    function externalLink(className, label, href) {
      const hasArrow = /\s*↗$/.test(label);
      const link = element('a', className, hasArrow ? label.replace(/\s*↗$/, '') : label);
      if (hasArrow) {
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        arrow.setAttribute('class', 'site-arrow');
        arrow.setAttribute('viewBox', '0 0 24 24');
        arrow.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M7 17 17 7M7 7h10v10');
        arrow.append(path);
        link.append(arrow);
      }
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      return link;
    }

    function placeCard(item, options = {}) {
      const card = element('article', 'place-card' + (options.fixed ? ' place-card-fixed' : ' place-card-fair'));
      const top = element('div', 'place-card-top');
      top.append(element('p', 'place-card-kind', options.fixed ? 'PONTO FIXO ' + String(options.number).padStart(2, '0') : 'FEIRA & ENCONTRO'));
      if (options.fixed && text(item.frequencia)) top.append(element('p', 'place-frequency', text(item.frequencia)));
      if (!options.fixed) {
        const label = options.status === 'current' ? 'Acontecendo hoje' : options.status === 'past' ? 'Encerrada' : 'Agendada';
        top.append(element('p', 'place-status place-status-' + options.status, label));
      }
      card.append(top, element('h3', '', text(item.nome) || (options.fixed ? 'Ponto de encontro' : 'Encontro especial')));
      if (!options.fixed) {
        const dates = item.inicio === item.fim ? dateLabel(item.inicio) : dateLabel(item.inicio) + ' a ' + dateLabel(item.fim);
        card.append(element('p', 'place-dates', dates));
        if (text(item.local)) card.append(element('p', 'place-venue', text(item.local)));
      }
      const details = element('dl', 'place-details');
      if (text(item.endereco)) details.append(detail('ENDEREÇO', text(item.endereco)));
      details.append(detail('HORÁRIOS', text(item.horarios) || 'Confirme os horários com o Manu.'));
      card.append(details);
      if (text(item.observacao)) card.append(element('p', 'place-note', text(item.observacao)));
      const links = element('div', 'place-card-links');
      const mapQuery = text(item.mapa) || text(item.endereco);
      if (mapQuery) {
        const map = externalLink('place-map', 'Ver no mapa ↗', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapQuery));
        map.setAttribute('aria-label', 'Ver ' + (text(item.nome) || 'o endereço') + ' no Google Maps, em uma nova aba');
        links.append(map);
      }
      const source = sourceURL(item.fonte);
      if (source) links.append(externalLink('place-source', 'Conferir informações ↗', source));
      if (links.childElementCount) card.append(links);
      return card;
    }

    function renderFixed() {
      const target = $('locations-fixed');
      if (!target) return;
      const fragment = document.createDocumentFragment();
      fixed.forEach((item, index) => fragment.append(placeCard(item, { fixed: true, number: index + 1 })));
      target.replaceChildren(fragment);
      if ($('locations-fixed-empty')) $('locations-fixed-empty').hidden = fixed.length > 0;
    }

    function renderFairs(force = false) {
      const today = saoPauloDay();
      if (!force && today === renderedDay) return;
      renderedDay = today;
      const classified = fairs.map(item => ({ item, status: classifyFair(item, today) })).filter(entry => entry.status);
      const current = classified.filter(entry => entry.status !== 'past').sort((a, b) => {
        const priority = Number(a.status !== 'current') - Number(b.status !== 'current');
        return priority || a.item.inicio.localeCompare(b.item.inicio) || a.item.fim.localeCompare(b.item.fim) || text(a.item.nome).localeCompare(text(b.item.nome), 'pt-BR');
      });
      const past = classified.filter(entry => entry.status === 'past').sort((a, b) => b.item.fim.localeCompare(a.item.fim) || b.item.inicio.localeCompare(a.item.inicio));
      const target = $('locations-current');
      if (target) {
        const fragment = document.createDocumentFragment();
        current.forEach(entry => fragment.append(placeCard(entry.item, { status: entry.status })));
        target.replaceChildren(fragment);
      }
      if ($('locations-empty')) $('locations-empty').hidden = current.length > 0;
      const history = $('locations-history');
      if (history) {
        history.hidden = past.length === 0;
        if (!past.length) history.open = false;
      }
      if ($('locations-history-count')) $('locations-history-count').textContent = '(' + past.length + ')';
      if ($('locations-past')) {
        const fragment = document.createDocumentFragment();
        past.forEach(entry => fragment.append(placeCard(entry.item, { status: entry.status })));
        $('locations-past').replaceChildren(fragment);
      }
    }

    function scheduleDayCheck() {
      window.clearTimeout(dayTimer);
      // São Paulo changes calendar day on a minute boundary. Check at each
      // boundary, and again when the page becomes visible after backgrounding.
      dayTimer = window.setTimeout(() => {
        renderFairs();
        scheduleDayCheck();
      }, 60000 - (Date.now() % 60000) + 20);
    }

    const updated = $('locations-updated');
    if (updated && validDate(data.atualizadoEm)) {
      updated.textContent = 'Agenda atualizada em ' + dateLabel(data.atualizadoEm) + '.';
      updated.hidden = false;
    }
    const phone = text(data.whatsapp).replace(/\D/g, '') || '5541999863000';
    const message = 'Olá, Manu! 💙 Quero saber onde encontrar os produtos e confirmar os horários. Pode me ajudar?';
    document.querySelectorAll('[data-locations-contact]').forEach(link => {
      link.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
    if ($('current-year')) $('current-year').textContent = String(new Date().getFullYear());

    const toggle = $('menu-toggle');
    const mobileNav = $('mobile-nav');
    function closeMenu() {
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu');
      }
      if (mobileNav) mobileNav.hidden = true;
    }
    if (toggle && mobileNav) {
      toggle.addEventListener('click', () => {
        const wasExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!wasExpanded));
        toggle.setAttribute('aria-label', wasExpanded ? 'Abrir menu' : 'Fechar menu');
        mobileNav.hidden = wasExpanded;
      });
      mobileNav.addEventListener('click', event => {
        if (event.target.closest('a')) closeMenu();
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !mobileNav.hidden) {
          closeMenu();
          toggle.focus();
        }
      });
      document.addEventListener('click', event => {
        if (!mobileNav.hidden && !mobileNav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
      });
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        renderFairs(true);
        scheduleDayCheck();
      }
    });

    renderFixed();
    renderFairs(true);
    scheduleDayCheck();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
