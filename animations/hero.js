import SplitType from 'split-type';

/**
 * Mobile-Optimized Hero Section Entrance Motion
 *
 * Performance Strategy:
 * • Mobile (<= 768px):
 *   - Immediately renders critical LCP/FCP elements: logo, navigation, headline, supporting copy, and CTAs (0ms delay, opacity: 1).
 *   - Skips synchronous SplitType DOM line splitting to prevent layout thrashing and forced reflows.
 *   - Gracefully delays secondary animations (illustration visual, parallax elements) until after FCP/LCP.
 * • Desktop (> 768px):
 *   - Maintains full premium editorial entrance sequence.
 */
export function initHeroAnimations() {
  if (window._heroAnimInitialized) return null;
  window._heroAnimInitialized = true;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return null;

  if (typeof gsap === 'undefined') return null;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const header = document.querySelector('#header, .header');
  const eyebrow = document.querySelector('#hero .hero-eyebrow, #hero .eyebrow, #hero [class*="eyebrow"], .hero-eyebrow, .eyebrow');
  const headline = document.querySelector('.hero-headline');
  const paragraph = document.querySelector('.hero-paragraph');
  const ctaBtn = document.querySelectorAll('.hero-btn-group .btn-primary, .hero-btn-group .btn-secondary, .hero-btn-group > *');
  const heroVisual = document.querySelector('#parallax-browser, .hero-visual');

  // MOBILE OPTIMIZATION PATH (Instant FCP & LCP for critical text + UI)
  if (isMobile) {
    const criticalElements = [header, eyebrow, headline, paragraph].filter(Boolean);
    if (ctaBtn && ctaBtn.length > 0) criticalElements.push(...ctaBtn);

    // Immediately render critical logo, navigation, headline, paragraph & CTA
    gsap.set(criticalElements, { opacity: 1, clearProps: 'opacity,transform' });

    // Delay secondary illustration visual by 600ms so network/LCP renders first
    if (heroVisual) {
      gsap.set(heroVisual, { opacity: 0, y: 15 });
      setTimeout(() => {
        gsap.to(heroVisual, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          clearProps: 'opacity,transform'
        });
      }, 600);
    }

    return null;
  }

  // DESKTOP ENTRANCE TIMELINE
  const elementsToClean = [header, eyebrow, headline, paragraph, heroVisual].filter(Boolean);
  if (ctaBtn && ctaBtn.length > 0) elementsToClean.push(...ctaBtn);

  const tl = gsap.timeline({
    defaults: {
      ease: 'power3.out',
      duration: 0.9
    },
    onComplete: () => {
      gsap.set(elementsToClean, { opacity: 1, clearProps: 'opacity,transform' });
    }
  });

  // 1. Navbar fades down
  if (header) {
    tl.fromTo(header, { opacity: 0, y: -25 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' });
  }

  // 2. Eyebrow fades up
  if (eyebrow) {
    tl.fromTo(eyebrow, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4');
  }

  // 3. Heading reveals line by line using SplitType
  if (headline) {
    try {
      const splitHeadline = new SplitType(headline, { types: 'lines' });
      if (splitHeadline.lines && splitHeadline.lines.length > 0) {
        tl.fromTo(splitHeadline.lines, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.95, stagger: 0.12, ease: 'power3.out' }, '-=0.4');
      } else {
        tl.fromTo(headline, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out' }, '-=0.4');
      }
    } catch (e) {
      tl.fromTo(headline, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out' }, '-=0.4');
    }
  }

  // 4. Paragraph fades upward
  if (paragraph) {
    tl.fromTo(paragraph, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, '-=0.5');
  }

  // 5. CTA button scales
  if (ctaBtn && ctaBtn.length > 0) {
    tl.fromTo(ctaBtn, { opacity: 0, scale: 0.95, y: 15 }, { opacity: 1, scale: 1, y: 0, duration: 0.75, stagger: 0.1, ease: 'back.out(1.4)' }, '-=0.4');
  }

  // 6. Hero image/illustration fades in with delay
  if (heroVisual) {
    tl.fromTo(heroVisual, { opacity: 0, x: 35 }, { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' }, '-=0.75');
  }

  return tl;
}
