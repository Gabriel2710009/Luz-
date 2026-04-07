/**
 * LUZÉ Pelotero & Eventos — main.js
 * Responsabilidades:
 *   - Navbar sticky + estado scrolled
 *   - Toggle menú mobile
 *   - Scroll suave para anchor links
 *   - Cierre del menú al hacer click en links
 *   - Formulario de contacto a WhatsApp
 *   - Banner de cookies
 */

(function () {
  'use strict';

  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const contactForm = document.getElementById('contact-form');
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAccept = document.getElementById('cookie-accept');
  const waFloat = document.getElementById('whatsapp-float');
  const customSelects = document.querySelectorAll('.custom-select');
  const legalCards = document.querySelectorAll('.legal-card');

  const WHATSAPP_NUMBER = '5492664202046';
  const COOKIE_KEY = 'luze_cookie_consent';

  const SCROLL_THRESHOLD = 80;
  let menuOpen = false;
  let ticking = false;
  let scrollTimer;

  function updateNavbar() {
    const scrollY = window.scrollY;
    navbar?.classList.toggle('scrolled', scrollY > SCROLL_THRESHOLD);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });
  updateNavbar();

  const fechaInput = document.getElementById('fecha');
  if (fechaInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    fechaInput.min = `${yyyy}-${mm}-${dd}`;
  }

  function openMenu() {
    menuOpen = true;
    mobileMenu?.classList.add('open');
    mobileMenu?.setAttribute('aria-hidden', 'false');
    menuToggle?.classList.add('open');
    menuToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    mobileMenu?.classList.remove('open');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    menuToggle?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  menuToggle?.addEventListener('click', () => {
    if (menuOpen) closeMenu();
    else openMenu();
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (menuOpen && navbar && !navbar.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) {
      closeMenu();
      menuToggle?.focus();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
      history.pushState(null, '', href);
    });
  });

  function closeAllCustomSelects(except = null) {
    customSelects.forEach((select) => {
      if (select === except) return;
      const trigger = select.querySelector('.select-trigger');
      const panel = select.querySelector('.select-panel');
      trigger?.classList.remove('open');
      trigger?.setAttribute('aria-expanded', 'false');
      panel?.classList.remove('open');
    });
  }

  customSelects.forEach((select) => {
    const trigger = select.querySelector('.select-trigger');
    const valueNode = select.querySelector('.select-trigger-value');
    const panel = select.querySelector('.select-panel');
    const hiddenInput = select.querySelector('input[type="hidden"]');
    const options = select.querySelectorAll('.select-option');

    if (!trigger || !valueNode || !panel || !hiddenInput) return;

    trigger.addEventListener('click', () => {
      const willOpen = !panel.classList.contains('open');
      closeAllCustomSelects(select);
      trigger.classList.toggle('open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
      panel.classList.toggle('open', willOpen);
    });

    options.forEach((option) => {
      option.addEventListener('click', () => {
        const label = option.getAttribute('data-value') || option.textContent.trim();
        hiddenInput.value = label;
        valueNode.textContent = label;

        options.forEach((item) => item.classList.toggle('is-selected', item === option));
        trigger.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.classList.remove('open');
      });
    });
  });

  document.addEventListener('click', (event) => {
    const clickedInsideSelect = event.target.closest?.('.custom-select');
    if (!clickedInsideSelect) {
      closeAllCustomSelects();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllCustomSelects();
    }
  });

  const sections = document.querySelectorAll('section[id]');

  function setActiveLink() {
    if (!navbar) return;
    const scrollY = window.scrollY + navbar.offsetHeight + 60;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (!link) return;
      link.style.color = (scrollY >= top && scrollY < bottom) ? 'white' : '';
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });

  function formatDate(value) {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  legalCards.forEach((card) => {
    const summary = card.querySelector('.legal-summary');
    if (!summary) return;

    summary.addEventListener('click', (event) => {
      event.preventDefault();

      const shouldOpen = !card.open;
      legalCards.forEach((other) => {
        other.open = false;
      });

      card.open = shouldOpen;
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const salon = (document.getElementById('salon')?.value || 'LUZE EVENTOS').trim();
      const telefono = (document.getElementById('telefono-form')?.value || WHATSAPP_NUMBER).trim();
      const cliente = document.getElementById('cliente')?.value.trim();
      const fecha = formatDate(document.getElementById('fecha')?.value || '');
      const tipo = document.getElementById('tipo')?.value.trim();
      const edad = document.getElementById('edad')?.value.trim();
      const invitados = document.getElementById('invitados')?.value.trim();
      const invitadosAdultos = document.getElementById('invitadosadultos')?.value.trim();
      const consulta = document.getElementById('consulta')?.value.trim();

      if (!cliente || !fecha || !tipo || !edad || !invitados || !invitadosAdultos) {
        window.alert('Faltan datos obligatorios.');
        return;
      }

      const message = [
        `*CONSULTA ${salon}*`,
        'LUZE Eventos',
        '',
        '*¿Cuál es tu nombre?*',
        cliente,
        '',
        '*Fecha del Evento*',
        fecha,
        '',
        '*Tipo de Evento*',
        tipo,
        '',
        '*Edad del Agasajado/a*',
        edad,
        '',
        '*Invitados*',
        `${invitados} niños y ${invitadosAdultos} adultos`,
        '',
        '*Comentarios*',
        consulta || 'Sin comentarios',
        '',
        '*Enviar la Consulta*'
      ].join('\n');

      const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  if (waFloat) {
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        waFloat.style.opacity = '1';
      }, 150);
    }, { passive: true });
  }

  function hideCookieBanner() {
    if (!cookieBanner) return;
    cookieBanner.hidden = true;
    localStorage.setItem(COOKIE_KEY, 'accepted');
  }

  if (cookieBanner && localStorage.getItem(COOKIE_KEY) !== 'accepted') {
    cookieBanner.hidden = false;
  }

  cookieAccept?.addEventListener('click', hideCookieBanner);

  console.log('🎉 LUZÉ main.js loaded');
})();
