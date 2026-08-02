/**
 * Services Section Motion Engine
 *
 * Requirements:
 * Each service card:
 * • opacity 0 → 1
 * • y 40 → 0
 * • stagger 0.15s
 *
 * On hover:
 * • lift 8px
 * • soft shadow
 * • icon rotates 8 degrees
 * • CTA underline expands
 *
 * Do not use ScrollTrigger scrub.
 * Only reveal once.
 * Export initServices().
 */
export function initServices() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return null;

  gsap.registerPlugin(ScrollTrigger);

  const servicesSection = document.querySelector('#services, .services-section');
  if (!servicesSection) return null;

  const header = servicesSection.querySelector('.services-header');
  const cardsGrid = servicesSection.querySelector('.services-grid');
  const cards = gsap.utils.toArray('.service-card', servicesSection);

  // 1. Header Reveal
  if (header && !prefersReducedMotion) {
    gsap.fromTo(
      header,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 80%',
          once: true
        }
      }
    );
  }

  // 2. Service Cards Reveal (opacity 0 -> 1, y 40 -> 0, stagger 0.15s, no scrub, reveal once)
  if (cards.length > 0) {
    if (!prefersReducedMotion) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsGrid || cards[0],
            start: 'top 80%',
            once: true
          }
        }
      );
    } else {
      gsap.set(cards, { opacity: 1, y: 0 });
    }

    // 3. Hover Micro-Interactions
    cards.forEach((card) => {
      const icon = card.querySelector('.service-arrow, svg, [class*="icon"]');
      const ctaLink = card.querySelector('.service-link');

      // Create CTA underline span if missing
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

        // Lift 8px & soft shadow
        gsap.to(card, {
          y: -8,
          boxShadow: '0 18px 44px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(212, 175, 55, 0.1)',
          borderColor: 'rgba(212, 175, 55, 0.5)',
          duration: 0.35,
          ease: 'power2.out'
        });

        // Icon rotates 8 degrees
        if (icon) {
          gsap.to(icon, {
            rotation: 8,
            x: 4,
            duration: 0.35,
            ease: 'power2.out'
          });
        }

        // CTA underline expands
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

        // Reset lift & shadow
        gsap.to(card, {
          y: 0,
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          borderColor: '',
          duration: 0.35,
          ease: 'power2.out'
        });

        // Reset icon rotation
        if (icon) {
          gsap.to(icon, {
            rotation: 0,
            x: 0,
            duration: 0.35,
            ease: 'power2.out'
          });
        }

        // Reset CTA underline
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
