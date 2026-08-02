import SplitType from 'split-type';

/**
 * Closing CTA Motion Engine
 *
 * Requirements:
 * Heading:
 * • SplitType reveal.
 * Button:
 * • fade
 * • scale
 * • glow
 * Background particles:
 * • very subtle.
 * Grain:
 * • continuous.
 * Never animate opacity to zero permanently.
 * Export initClosing().
 */
export function initClosing() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof gsap === 'undefined') return null;

  const ctaSection = document.querySelector('#inquire, .cta-section');
  if (!ctaSection) return null;

  const eyebrow = ctaSection.querySelector('.cta-eyebrow, .cta-anim-eyebrow');
  const headline = ctaSection.querySelector('.cta-headline');
  const subtext = ctaSection.querySelector('.cta-subtext, .cta-anim-subtext');
  const button = ctaSection.querySelector('.cta-btn-primary, .btn-primary');
  const friction = ctaSection.querySelector('.cta-friction');
  const grainOverlay = ctaSection.querySelector('.cta-grain-overlay');
  const particleCanvas = ctaSection.querySelector('#cta-particle-canvas');

  // 1. Continuous Grain Motion
  if (grainOverlay && !prefersReducedMotion) {
    gsap.to(grainOverlay, {
      x: 'random(-3%, 3%)',
      y: 'random(-3%, 3%)',
      duration: 2.5,
      repeat: -1,
      repeatRefresh: true,
      ease: 'none'
    });
  }

  // 2. Very Subtle Background Particles Engine
  if (particleCanvas && !prefersReducedMotion) {
    const ctx = particleCanvas.getContext('2d');
    let width = (particleCanvas.width = particleCanvas.offsetWidth || window.innerWidth);
    let height = (particleCanvas.height = particleCanvas.offsetHeight || 600);

    const resize = () => {
      width = particleCanvas.width = particleCanvas.offsetWidth || window.innerWidth;
      height = particleCanvas.height = particleCanvas.offsetHeight || 600;
    };
    window.addEventListener('resize', resize, { passive: true });

    const NUM_PARTICLES = 14;
    const particles = [];

    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2 + 0.5,
        alpha: Math.random() * 0.18 + 0.05,
        speedY: Math.random() * 0.25 + 0.08,
        sineOffset: Math.random() * Math.PI * 2,
        sineSpeed: Math.random() * 0.01 + 0.003
      });
    }

    let isVisible = false;
    let rafId = null;

    const drawParticles = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.sineOffset += p.sineSpeed;
        p.x += Math.sin(p.sineOffset) * 0.2;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        ctx.fill();
      });

      rafId = requestAnimationFrame(drawParticles);
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(drawParticles);
        }
      }, { threshold: 0 });
      obs.observe(ctaSection);
    } else {
      isVisible = true;
      drawParticles();
    }
  }

  // 3. Entrance Reveal & Motion Timeline
  if (typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ctaSection,
        start: 'top 82%',
        once: true
      }
    });

    // Eyebrow
    if (eyebrow) {
      tl.fromTo(
        eyebrow,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        0
      );
    }

    // Heading: SplitType reveal
    if (headline) {
      try {
        const splitHeading = new SplitType(headline, { types: 'lines' });
        if (splitHeading.lines && splitHeading.lines.length > 0) {
          tl.fromTo(
            splitHeading.lines,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.12,
              ease: 'power3.out'
            },
            0.15
          );
        } else {
          tl.fromTo(
            headline,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
            0.15
          );
        }
      } catch (e) {
        tl.fromTo(
          headline,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          0.15
        );
      }
    }

    // Subtext
    if (subtext) {
      tl.fromTo(
        subtext,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        0.35
      );
    }

    // Button: fade, scale, glow
    if (button) {
      tl.fromTo(
        button,
        { opacity: 0, scale: 0.94, y: 15 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: 'back.out(1.5)',
          onStart: () => {
            gsap.fromTo(
              button,
              { boxShadow: '0 0 0 rgba(212, 175, 55, 0)' },
              {
                boxShadow: '0 8px 32px rgba(212, 175, 55, 0.35)',
                duration: 0.8,
                ease: 'power2.out'
              }
            );
          },
          onComplete: () => {
            gsap.set(button, { opacity: 1, clearProps: 'transform' });
          }
        },
        0.45
      );
    }

    // Friction text
    if (friction) {
      tl.fromTo(
        friction,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        0.6
      );
    }

    // Ensure opacity is NEVER left at zero
    tl.add(() => {
      const elements = [eyebrow, headline, subtext, button, friction].filter(Boolean);
      gsap.set(elements, { opacity: 1 });
    });

  } else {
    // Fallback: Ensure opacity is never left at zero
    const elements = [eyebrow, headline, subtext, button, friction].filter(Boolean);
    gsap.set(elements, { opacity: 1, clearProps: 'transform' });
  }

  return ctaSection;
}
