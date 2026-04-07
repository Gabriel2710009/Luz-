/**
 * LUZÉ Pelotero & Eventos — main.js
 * Responsabilidades:
 *   - Navbar sticky + estado scrolled
 *   - Toggle menú mobile
 *   - Scroll suave para anchor links
 *   - Cierre del menú al hacer click en links
 */

(function () {
  'use strict';

  /* ── DOM refs ──────────────────────────────────────────── */
  const navbar      = document.getElementById('navbar');
  const menuToggle  = document.getElementById('menu-toggle');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('a');
  const navLinks    = document.querySelectorAll('a[href^="#"]');

  /* ── Navbar: scroll state ──────────────────────────────── */
  const SCROLL_THRESHOLD = 80;
  let lastScrollY = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;

    if (scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // Run once on load
  updateNavbar();

  /* ── Mobile menu toggle ────────────────────────────────── */
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    mobileMenu.classList.add('open');
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when clicking a mobile link
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (menuOpen && !navbar.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) {
      closeMenu();
      menuToggle.focus();
    }
  });

  /* ── Smooth scroll for anchor links ───────────────────── */
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Only handle internal anchors
      if (!href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Offset for fixed navbar height
      const navHeight = navbar.offsetHeight;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });

      // Update URL without jumping
      history.pushState(null, '', href);
    });
  });

  /* ── Active nav link highlight ─────────────────────────── */
  const sections = document.querySelectorAll('section[id]');

  function setActiveLink() {
    const scrollY = window.scrollY + navbar.offsetHeight + 60;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector(`.nav-link[href="#${id}"]`);

      if (!link) return;

      if (scrollY >= top && scrollY < bottom) {
        link.style.color = 'white';
      } else {
        link.style.color = '';
      }
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* ── WhatsApp float: hide on mobile keyboard ────────────── */
  // Hides the float button slightly after scroll starts, reveals on stop
  const waFloat = document.getElementById('whatsapp-float');
  let scrollTimer;

  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      waFloat.style.opacity = '1';
    }, 150);
  }, { passive: true });

  console.log('🎉 LUZÉ main.js loaded');
})();
