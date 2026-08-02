import { batchReveal } from './helpers.js';

/**
 * Services Section Motion Engine (Optimized GSAP Architecture)
 */
export function initServices() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof gsap === 'undefined') return null;

  const servicesSection = document.querySelector('#services, .services-section');
  if (!servicesSection) return null;

  const header = servicesSection.querySelector('.services-header');
  const cardsGrid = servicesSection.querySelector('.services-grid');
  const cards = gsap.utils.toArray('.service-card', servicesSection);

  // 1. Batched Header Reveal
  if (header) {
    batchReveal([header], { y: 30, duration: 0.85, start: 'top 80%' });
  }

  // 2. Batched Service Cards Reveal (opacity 0 -> 1, y 40 -> 0, stagger 0.15s)
  if (cards.length > 0) {
    batchReveal(cards, {
      y: 40,
      duration: 0.9,
      stagger: 0.15,
      start: 'top 80%',
      trigger: cardsGrid || cards[0]
    });

    // 3. Hover Micro-Interactions
    cards.forEach((card) => {
      const icon = card.querySelector('.service-arrow, svg, [class*="icon"]');
      const ctaLink = card.querySelector('.service-link');

      let underline = ctaLink ? ctaLink.querySelector('.service-cta-underline') : null;
      if (ctaLink && !underline) {
        underline = document.createElement('span');
        underline.className = 'service-cta-underline';
        underline.style.cssText = `
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1.5px;
          background-color: var(--accent, #D4AF37);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        `;
        if (getComputedStyle(ctaLink).position === 'static') {
          ctaLink.style.position = 'relative';
        }
        ctaLink.appendChild(underline);
      }

      card.addEventListener('mouseenter', () => {
        if (prefersReducedMotion) return;

        gsap.to(card, {
          y: -8,
          boxShadow: '0 18px 44px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(212, 175, 55, 0.1)',
          borderColor: 'rgba(212, 175, 55, 0.5)',
          duration: 0.35,
          ease: 'power2.out'
        });

        if (icon) {
          gsap.to(icon, {
            rotation: 8,
            x: 4,
            duration: 0.35,
            ease: 'power2.out'
          });
        }

        if (underline) {
          gsap.to(underline, {
            scaleX: 1,
            transformOrigin: 'left center',
            duration: 0.35,
            ease: 'power2.out'
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        if (prefersReducedMotion) return;

        gsap.to(card, {
          y: 0,
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          borderColor: '',
          duration: 0.35,
          ease: 'power2.out'
        });

        if (icon) {
          gsap.to(icon, {
            rotation: 0,
            x: 0,
            duration: 0.35,
            ease: 'power2.out'
          });
        }

        if (underline) {
          gsap.to(underline, {
            scaleX: 0,
            transformOrigin: 'right center',
            duration: 0.35,
            ease: 'power2.out'
          });
        }
      });
    });
  }

  return servicesSection;
}
