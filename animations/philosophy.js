import SplitType from 'split-type';

/**
 * Philosophy Section Motion Engine (Mobile-Optimized Architecture)
 */
export function initPhilosophy() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof gsap === 'undefined') return null;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const philosophySection = document.querySelector('#philosophy, .philosophy-section');
  if (!philosophySection) return null;

  // 1. Section Header & Heading
  const mainHeading = philosophySection.querySelector('.philosophy-heading');
  const sectionTag = philosophySection.querySelector('.philosophy-tag');

  if (mainHeading && !prefersReducedMotion) {
    const tlHeader = gsap.timeline({
      scrollTrigger: {
        trigger: philosophySection,
        start: 'top 80%',
        once: true
      }
    });

    if (sectionTag) {
      tlHeader.fromTo(sectionTag, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0);
    }

    if (!isMobile) {
      try {
        const splitMain = new SplitType(mainHeading, { types: 'lines' });
        if (splitMain.lines && splitMain.lines.length > 0) {
          tlHeader.fromTo(splitMain.lines, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, sectionTag ? 0.2 : 0);
        } else {
          tlHeader.fromTo(mainHeading, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, sectionTag ? 0.2 : 0);
        }
      } catch (e) {
        tlHeader.fromTo(mainHeading, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, sectionTag ? 0.2 : 0);
      }
    } else {
      tlHeader.fromTo(mainHeading, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, sectionTag ? 0.15 : 0);
    }
  } else if (mainHeading) {
    gsap.set(mainHeading, { opacity: 1 });
  }

  // 2. Pillars Individual Reveal (Transform & Opacity Only)
  const pillars = gsap.utils.toArray('.pillar-block', philosophySection);

  pillars.forEach((pillar) => {
    const divider = pillar.querySelector('.pillar-divider');
    const num = pillar.querySelector('.pillar-num');
    const svgImg = pillar.querySelector('.pillar-svg, svg, img');
    const title = pillar.querySelector('.pillar-title');
    const goldUnderline = pillar.querySelector('.gold-underline');
    const quoteDesc = pillar.querySelector('.pillar-desc');

    if (prefersReducedMotion) {
      gsap.set([pillar, divider, num, svgImg, title, goldUnderline, quoteDesc].filter(Boolean), {
        opacity: 1,
        scale: 1,
        scaleX: 1,
        y: 0
      });
      return;
    }

    const tlPillar = gsap.timeline({
      scrollTrigger: {
        trigger: pillar,
        start: 'top 82%',
        once: true
      }
    });

    if (divider) {
      tlPillar.fromTo(divider, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: isMobile ? 0.6 : 0.85, ease: 'power3.out' }, 0);
    }

    if (num) {
      tlPillar.fromTo(num, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: isMobile ? 0.5 : 0.7, ease: 'power3.out' }, 0.1);
    }

    if (svgImg) {
      tlPillar.fromTo(svgImg, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: isMobile ? 0.6 : 0.85, ease: 'power3.out' }, 0.1);
    }

    if (title) {
      if (!isMobile) {
        try {
          const splitTitle = new SplitType(title, { types: 'lines' });
          if (splitTitle.lines && splitTitle.lines.length > 0) {
            tlPillar.fromTo(splitTitle.lines, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.2);
          } else {
            tlPillar.fromTo(title, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.2);
          }
        } catch (e) {
          tlPillar.fromTo(title, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.2);
        }
      } else {
        tlPillar.fromTo(title, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.15);
      }
    }

    if (goldUnderline) {
      tlPillar.fromTo(goldUnderline, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.5, ease: 'power3.out' }, 0.25);
    }

    if (quoteDesc) {
      tlPillar.fromTo(quoteDesc, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: isMobile ? 0.6 : 0.8, ease: 'power3.out' }, 0.3);
    }
  });

  return philosophySection;
}
