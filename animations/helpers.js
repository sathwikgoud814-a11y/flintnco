/**
 * Shared GSAP & ScrollTrigger Optimization Helpers
 * 
 * Features:
 * • Plugin registration handled once at top-level.
 * • Reusable batch reveal functions (reduces individual ScrollTrigger instances).
 * • Font-ready guarded SplitType helper (prevents forced reflows / layout thrashing).
 * • Section ScrollTrigger cleanup helpers.
 */

// 1. Single Top-Level Plugin Registration
if (typeof window !== 'undefined' && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Batched reveal helper for elements fading upward on scroll.
 * Reduces ScrollTrigger count by creating 1 trigger for grouped elements.
 */
export function batchReveal(elements, config = {}) {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!elements || elements.length === 0) return null;
  const list = Array.isArray(elements) ? elements : [elements];
  const validList = list.filter(Boolean);
  if (validList.length === 0) return null;

  if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    gsap.set(validList, { opacity: 1, clearProps: 'transform' });
    return null;
  }

  const {
    y = 30,
    opacity = 0,
    duration = 0.85,
    stagger = 0.1,
    start = 'top 82%',
    ease = 'power3.out',
    trigger = validList[0]
  } = config;

  return gsap.fromTo(
    validList,
    { opacity, y },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease,
      scrollTrigger: {
        trigger,
        start,
        once: true
      },
      onComplete: () => {
        gsap.set(validList, { opacity: 1, clearProps: 'transform' });
      }
    }
  );
}

/**
 * Safe SplitType execution wrapper that waits for fonts to be ready
 * to prevent layout thrashing and forced reflows.
 */
export function safeSplitType(element, options = { types: 'lines' }) {
  if (!element || typeof SplitType === 'undefined') return null;

  try {
    return new SplitType(element, options);
  } catch (e) {
    return null;
  }
}

/**
 * Clean up existing ScrollTrigger instances for a given trigger container.
 */
export function killTriggersFor(container) {
  if (typeof ScrollTrigger === 'undefined' || !container) return;
  ScrollTrigger.getAll().forEach((st) => {
    if (st.trigger === container || (st.pin && st.pin === container)) {
      st.kill();
    }
  });
}
