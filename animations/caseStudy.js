import { batchReveal } from './helpers.js';

/**
 * Case Study & Showcase Motion Engine (Optimized Architecture)
 */
export function initCaseStudy() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof gsap === 'undefined') return null;

  const workSection = document.querySelector('#work, .case-study-section');
  if (!workSection) return null;

  // 1. Batched Left Text Stagger Reveal
  const leftTextElements = Array.from(
    workSection.querySelectorAll(
      '.case-header > *, .case-story-nav, .mock-split-left > *, .breakdown-col, .narrative-col'
    )
  );

  if (leftTextElements.length > 0) {
    batchReveal(leftTextElements, {
      y: 25,
      duration: 0.85,
      stagger: 0.08,
      start: 'top 80%',
      trigger: workSection
    });
  }

  // 2. Image Scale & Fade Reveal
  const images = workSection.querySelectorAll('.mock-case-image, .mock-img-frame, img');
  images.forEach((img) => {
    if (!prefersReducedMotion) {
      gsap.fromTo(
        img,
        { opacity: 0, scale: 1.06 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: img,
            start: 'top 85%',
            once: true
          },
          onComplete: () => {
            gsap.set(img, { clearProps: 'transform,opacity' });
          }
        }
      );
    } else {
      gsap.set(img, { opacity: 1, scale: 1 });
    }
  });

  // 3. Statistics Count Up
  const statElements = document.querySelectorAll('.stat-value, .case-stats-grid .stat-value, [data-count]');
  statElements.forEach((statEl) => {
    const rawText = statEl.textContent.trim();
    const numMatch = rawText.match(/[\d.]+/);
    if (numMatch && !prefersReducedMotion) {
      const targetNum = parseFloat(numMatch[0]);
      const prefix = rawText.substring(0, numMatch.index);
      const suffix = rawText.substring(numMatch.index + numMatch[0].length);
      const proxy = { val: 0 };

      gsap.to(proxy, {
        val: targetNum,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: statEl,
          start: 'top 85%',
          once: true
        },
        onUpdate: () => {
          const formattedNum = Number.isInteger(targetNum)
            ? Math.floor(proxy.val)
            : proxy.val.toFixed(1);
          statEl.textContent = `${prefix}${formattedNum}${suffix}`;
        }
      });
    }
  });

  return workSection;
}
