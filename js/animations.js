/**
 * LUZÉ Pelotero & Eventos — animations.js
 * Responsabilidades:
 *   - Animaciones al hacer scroll (IntersectionObserver)
 *   - Fade-in, slide-up, slide-left, slide-right
 *   - Staggered animations para grids de cards
 *   - Counter animations para stats
 */

(function () {
  'use strict';

  /* ── Configuración ─────────────────────────────────────── */
  const OBSERVER_OPTIONS = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.12
  };

  const STAGGER_DELAY = 120; // ms entre cada card en un grupo
  const heroSection = document.querySelector('#hero');

  /* ── Reveal Observer (fade + slide) ────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      // Calcular delay si es parte de un grupo staggered
      const parent = el.parentElement;
      const siblings = Array.from(parent.querySelectorAll('.reveal, .reveal-left, .reveal-right'));
      const index = siblings.indexOf(el);
      const delay = index * STAGGER_DELAY;

      setTimeout(() => {
        el.classList.add('revealed');
      }, delay);

      // Una vez revelado, dejar de observar
      revealObserver.unobserve(el);
    });
  }, OBSERVER_OPTIONS);

  /* ── Cards con stagger custom ───────────────────────────── */
  // Para grids donde queremos stagger forzado (diff-cards, plan-cards)
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const container = entry.target;
      const cards = container.querySelectorAll('.diff-card, .plan-card, .testimonial-card');

      cards.forEach((card, index) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 150);
      });

      staggerObserver.unobserve(container);
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  /* ── Animaciones de contadores ──────────────────────────── */
  function animateCounter(element, target, duration = 1500) {
    const startTime = performance.now();
    const startVal = 0;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);

      element.textContent = current + (element.dataset.suffix || '');

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);

      if (!isNaN(target)) {
        animateCounter(el, target);
      }

      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  /* ── Parallax suave en hero ─────────────────────────────── */
  const heroGlows = document.querySelectorAll('.hero-glow');
  const floatingEls = document.querySelectorAll('.float-el');

  let parallaxTicking = false;
  let pointerX = 0.5;
  let pointerY = 0.35;

  if (heroSection) {
    heroSection.addEventListener('pointermove', (event) => {
      const rect = heroSection.getBoundingClientRect();
      pointerX = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      pointerY = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    }, { passive: true });

    heroSection.addEventListener('pointerleave', () => {
      pointerX = 0.5;
      pointerY = 0.35;
    });
  }

  function updateParallax() {
    const scrollY = window.scrollY;
    const maxScroll = window.innerHeight;

    if (scrollY > maxScroll) {
      parallaxTicking = false;
      return;
    }

    const progress = scrollY / maxScroll;

    // Mover glows sutilmente
    heroGlows.forEach((glow, i) => {
      const direction = i % 2 === 0 ? 1 : -1;
      const speed = 0.3 + (i * 0.1);
      const driftX = (pointerX - 0.5) * (i === 0 ? 48 : -32);
      const driftY = (pointerY - 0.35) * (i === 0 ? 28 : 18);
      glow.style.transform = `translate3d(${driftX}px, ${scrollY * speed * direction + driftY}px, 0)`;
    });

    // Mover floating elements
    floatingEls.forEach((el, i) => {
      const speed = 0.2 + (i * 0.08);
      const driftX = (pointerX - 0.5) * (18 + i * 6);
      const driftY = (pointerY - 0.35) * (12 + i * 4);
      el.style.transform = `translate3d(${driftX}px, ${scrollY * speed + driftY}px, 0)`;
    });

    // Fade out hero content on scroll
    const heroContent = document.querySelector('#hero .relative.z-10');
    if (heroContent) {
      const opacity = Math.max(0, 1 - progress * 1.8);
      heroContent.style.opacity = opacity;
      heroContent.style.transform = `translate3d(0, ${scrollY * 0.08}px, 0)`;
    }

    parallaxTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
      requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  }, { passive: true });

  /* ── Hover tilt en diff-cards ───────────────────────────── */
  function addTiltEffect(card) {
    const inner = card.querySelector('.diff-card-inner');
    if (!inner) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  }

  /* ── Inicialización ─────────────────────────────────────── */
  function init() {
    // Observar elementos reveal
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      revealObserver.observe(el);
    });

    // Observar contenedores con cards
    document.querySelectorAll('#diferenciales > div, #planes > div, #testimonios > div').forEach(el => {
      // stagger solo si tiene children con cards
      if (el.querySelector('.diff-card, .plan-card, .testimonial-card')) {
        staggerObserver.observe(el);
      }
    });

    // Observar contadores
    document.querySelectorAll('[data-target]').forEach(el => {
      counterObserver.observe(el);
    });

    // Tilt effect en diff-cards (solo desktop)
    if (window.matchMedia('(min-width: 768px) and (pointer: fine)').matches) {
      document.querySelectorAll('.diff-card').forEach(addTiltEffect);
    }

    document.querySelectorAll('.contact-card, .map-card, .location-scene, .legal-card').forEach((el) => {
      el.style.willChange = 'transform';
    });

    // Inicializar estados de las cards para stagger
    document.querySelectorAll('.diff-card, .plan-card, .testimonial-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease';
    });

    console.log('✨ LUZÉ animations.js loaded');
  }

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
