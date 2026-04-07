/**
 * LUZÉ Pelotero & Eventos — gallery.js
 * Responsabilidades:
 *   - Click en item de galería → abre lightbox
 *   - Navegar entre imágenes (prev / next)
 *   - Cerrar lightbox (click en backdrop, botón X, Escape)
 *   - Swipe táctil para mobile
 *   - Preload de imágenes adyacentes
 */

(function () {
  'use strict';

  /* ── Datos de la galería ───────────────────────────────── */
  // Cuando tengas imágenes reales, reemplazá `gradient` por la ruta de imagen
  // y cambiá `type` a 'image'. El lightbox mostrará la imagen con <img />.
  const GALLERY_DATA = [
    {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #FF6B5B 0%, #F5C842 50%, #7B5EA7 100%)',
      title: 'Carrusel infantil',
      description: 'Nuestro diferencial exclusivo. El único en San Luis.'
    },
    {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #7B5EA7 0%, #FF6B5B 100%)',
      title: 'Pelotero gigante',
      description: 'Enorme, colorido y seguro para todos los chicos.'
    },
    {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #F5C842 0%, #FF6B5B 100%)',
      title: 'Show de animación',
      description: 'Animadores profesionales que mantienen la fiesta encendida.'
    },
    {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #25D366 0%, #7B5EA7 100%)',
      title: 'Inflables grandes',
      description: 'Toboganes y castillos de primera línea para todos.'
    },
    {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #1A1025 0%, #7B5EA7 30%, #FF6B5B 70%, #F5C842 100%)',
      title: 'El momento especial',
      description: 'Ese instante único que todos recuerdan para siempre.'
    },
    {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #FF6B5B 0%, #F5C842 100%)',
      title: 'Sector adultos',
      description: 'Cómodo y equipado para que los papás también disfruten.'
    }
  ];

  /* ── DOM refs ──────────────────────────────────────────── */
  const galleryGrid   = document.getElementById('gallery-grid');
  const lightbox      = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxContent = document.getElementById('lightbox-content');
  const lightboxBackdrop = lightbox.querySelector('.lightbox-backdrop');

  let currentIndex = -1;

  /* ── Construir contenido lightbox ──────────────────────── */
  function buildLightboxContent(index) {
    const item = GALLERY_DATA[index];
    if (!item) return;

    if (item.type === 'image') {
      // Imagen real
      lightboxContent.innerHTML = `
        <img
          src="${item.src}"
          alt="${item.title}"
          class="w-full h-auto block rounded-2xl"
          loading="lazy"
        />
        <div class="lightbox-caption">
          <p class="font-display font-bold text-xl text-white">${item.title}</p>
          <p class="text-white/60 text-sm mt-1">${item.description}</p>
        </div>
      `;
    } else {
      // Placeholder con gradiente
      lightboxContent.innerHTML = `
        <div class="lightbox-placeholder" style="background: ${item.gradient}">
          <div class="lightbox-placeholder-inner">
            <div class="lightbox-placeholder-orb"></div>
            <div class="lightbox-placeholder-frame">
              <p class="font-display font-bold text-2xl text-white">${item.title}</p>
              <p class="text-white/72 mt-2 text-base">${item.description}</p>
            </div>
          </div>
        </div>
        <div class="lightbox-caption">
          <p class="font-display font-bold text-lg text-white">${item.title}</p>
          <p class="text-white/50 text-sm mt-1">${item.description}</p>
        </div>
      `;
    }

    // Nav arrows si hay más de 1 elemento
    if (GALLERY_DATA.length > 1) {
      const prevBtn = createNavButton('prev', index === 0);
      const nextBtn = createNavButton('next', index === GALLERY_DATA.length - 1);

      lightboxContent.prepend(prevBtn);
      lightboxContent.appendChild(nextBtn);

      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate(-1);
      });

      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate(1);
      });
    }

    // Indicador de posición
    const indicator = document.createElement('div');
    indicator.className = 'lightbox-indicator';
    indicator.innerHTML = GALLERY_DATA.map((_, i) => `
      <span class="lb-dot ${i === index ? 'lb-dot--active' : ''}"></span>
    `).join('');
    lightboxContent.appendChild(indicator);
  }

  function createNavButton(direction, disabled) {
    const btn = document.createElement('button');
    btn.className = `lightbox-nav lightbox-nav--${direction} ${disabled ? 'opacity-30 pointer-events-none' : ''}`;
    btn.setAttribute('aria-label', direction === 'prev' ? 'Anterior' : 'Siguiente');
    btn.innerHTML = direction === 'prev'
      ? `<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>`
      : `<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`;
    return btn;
  }

  /* ── Abrir / cerrar lightbox ───────────────────────────── */
  function openLightbox(index) {
    currentIndex = index;
    buildLightboxContent(index);

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus trap
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    currentIndex = -1;

    // Limpiar contenido después de la transición
    setTimeout(() => {
      lightboxContent.innerHTML = '';
    }, 300);
  }

  function navigate(direction) {
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= GALLERY_DATA.length) return;

    // Animación de salida
    lightboxContent.style.opacity = '0';
    lightboxContent.style.transform = `translateX(${direction * 40}px)`;

    setTimeout(() => {
      buildLightboxContent(newIndex);
      currentIndex = newIndex;

      lightboxContent.style.transition = 'none';
      lightboxContent.style.opacity = '0';
      lightboxContent.style.transform = `translateX(${-direction * 40}px)`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          lightboxContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          lightboxContent.style.opacity = '1';
          lightboxContent.style.transform = 'translateX(0)';
        });
      });
    }, 250);
  }

  /* ── Event listeners ───────────────────────────────────── */
  // Cerrar con botón X
  lightboxClose.addEventListener('click', closeLightbox);

  // Cerrar al click en backdrop
  lightboxBackdrop.addEventListener('click', closeLightbox);

  // Teclado
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        navigate(-1);
        break;
      case 'ArrowRight':
        navigate(1);
        break;
    }
  });

  /* ── Swipe táctil (mobile) ─────────────────────────────── */
  let touchStartX = 0;
  let touchEndX = 0;
  const SWIPE_THRESHOLD = 50;

  lightboxContent.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightboxContent.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const delta = touchStartX - touchEndX;

    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      navigate(delta > 0 ? 1 : -1);
    }
  }, { passive: true });

  /* ── Bind gallery items ────────────────────────────────── */
  function bindGalleryItems() {
    const items = galleryGrid.querySelectorAll('.gallery-item');

    items.forEach((item, index) => {
      // Make keyboard-accessible
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `Ver imagen: ${GALLERY_DATA[index]?.title || 'imagen ' + (index + 1)}`);

      item.addEventListener('click', () => {
        openLightbox(index);
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });
  }

  /* ── Inyectar estilos del lightbox placeholder ─────────── */
  function injectLightboxStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .lightbox-placeholder {
        width: 100%;
        min-height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 1.5rem 1.5rem 0 0;
        position: relative;
        overflow: hidden;
      }

      .lightbox-placeholder-inner {
        position: relative;
        text-align: center;
        padding: 3rem;
        display: grid;
        place-items: center;
        gap: 1rem;
        width: 100%;
        min-height: 400px;
      }

      .lightbox-placeholder-orb {
        position: absolute;
        inset: auto auto 2rem 50%;
        transform: translateX(-50%);
        width: 12rem;
        height: 12rem;
        border-radius: 9999px;
        background:
          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.1) 24%, transparent 62%),
          linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02));
        filter: blur(0.2px);
        opacity: 0.85;
        box-shadow:
          0 0 0 1px rgba(255,255,255,0.12),
          0 24px 60px rgba(0,0,0,0.2);
      }

      .lightbox-placeholder-frame {
        position: relative;
        z-index: 1;
        max-width: 32rem;
        padding: 1.5rem 1.75rem;
        border-radius: 1.25rem;
        background: rgba(0, 0, 0, 0.22);
        border: 1px solid rgba(255, 255, 255, 0.16);
        backdrop-filter: blur(12px);
      }

      .lightbox-caption {
        background: rgba(26, 16, 37, 0.95);
        padding: 1.25rem 1.5rem;
        border-radius: 0 0 1.5rem 1.5rem;
        border-top: 1px solid rgba(255,255,255,0.06);
      }

      .lightbox-nav {
        position: absolute;
        top: 45%;
        transform: translateY(-50%);
        width: 2.75rem;
        height: 2.75rem;
        background: rgba(255,255,255,0.12);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 50%;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 10;
      }

      .lightbox-nav:hover {
        background: rgba(245, 200, 66, 0.2);
        border-color: rgba(245, 200, 66, 0.4);
        transform: translateY(-50%) scale(1.1);
      }

      .lightbox-nav--prev {
        left: -1.5rem;
      }

      .lightbox-nav--next {
        right: -1.5rem;
      }

      .lightbox-indicator {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem 0 0;
      }

      .lb-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        transition: all 0.2s ease;
      }

      .lb-dot--active {
        background: #F5C842;
        width: 20px;
        border-radius: 3px;
      }

      #lightbox-content {
        position: relative;
        transition: opacity 0.3s ease, transform 0.3s ease;
        border-radius: 1.5rem;
        overflow: visible;
      }

      @media (max-width: 640px) {
        .lightbox-nav--prev { left: 0.5rem; }
        .lightbox-nav--next { right: 0.5rem; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Init ──────────────────────────────────────────────── */
  function init() {
    if (!galleryGrid || !lightbox) {
      console.warn('Gallery elements not found');
      return;
    }

    injectLightboxStyles();
    bindGalleryItems();

    console.log('🖼️ LUZÉ gallery.js loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
