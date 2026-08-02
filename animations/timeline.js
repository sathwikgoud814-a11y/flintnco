import { batchReveal } from './helpers.js';

/**
 * Process Timeline Animation Engine (Optimized Architecture)
 */
export function initTimeline() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof gsap === 'undefined') return null;

  const timelineSection = document.querySelector('#process, .timeline-section');
  if (!timelineSection) return null;

  const timelineRight = timelineSection.querySelector('.timeline-right');
  const trackLine = timelineSection.querySelector('.timeline-track-line');
  const steps = gsap.utils.toArray('.timeline-step', timelineSection);

  if (steps.length === 0) return null;

  const isMobile = window.matchMedia('(max-width: 860px)').matches;

  if (!isMobile) {
    // Left info reveal
    const leftCol = timelineSection.querySelector('.timeline-left');
    if (leftCol) {
      batchReveal([leftCol], { y: 30, duration: 0.85, start: 'top 85%' });
    }

    // Connecting line fills smoothly as user scrolls
    if (trackLine) {
      gsap.fromTo(
        trackLine,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: timelineRight || timelineSection,
            start: 'top 80%',
            end: 'bottom 65%',
            scrub: 0.5
          }
        }
      );
    }

    // Batched timeline step cards reveal
    batchReveal(steps, {
      y: 30,
      duration: 0.85,
      stagger: 0.12,
      start: 'top 85%',
      trigger: timelineRight || steps[0]
    });
  } else {
    // Mobile: Sequential reveal
    batchReveal(steps, {
      y: 20,
      duration: 0.7,
      stagger: 0.1,
      start: 'top 85%'
    });
  }

  return timelineSection;
}
