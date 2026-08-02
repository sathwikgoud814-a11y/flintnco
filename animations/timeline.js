/**
 * Process Timeline Animation Engine
 *
 * Requirements:
 * Each timeline card:
 * • fades upward
 * • moves 30px upward
 * • fades in
 * • dot grows from 0.4 to 1
 * • connecting line fills smoothly
 * • only activates once
 *
 * Desktop:
 * Animate cards independently.
 *
 * Mobile:
 * Animate sequentially without pinning.
 *
 * Export as initTimeline().
 */
export function initTimeline() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return null;

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return null;

  gsap.registerPlugin(ScrollTrigger);

  const timelineSection = document.querySelector('#process, .timeline-section');
  if (!timelineSection) return null;

  const timelineRight = timelineSection.querySelector('.timeline-right');
  const trackLine = timelineSection.querySelector('.timeline-track-line');
  const steps = gsap.utils.toArray('.timeline-step', timelineSection);

  if (steps.length === 0) return null;

  const isMobile = window.matchMedia('(max-width: 860px)').matches;

  if (!isMobile) {
    // --- DESKTOP MODE: Animate cards independently ---

    // Left info reveal
    const leftCol = timelineSection.querySelector('.timeline-left');
    if (leftCol) {
      gsap.fromTo(
        leftCol,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: leftCol,
            start: 'top 85%',
            once: true
          }
        }
      );
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

    // Each timeline step card animates independently
    steps.forEach((step) => {
      const dot = step.querySelector('.step-dot');

      gsap.set(step, { opacity: 0, y: 30 });
      if (dot) {
        gsap.set(dot, { scale: 0.4, opacity: 0.4 });
      }

      const tlStep = gsap.timeline({
        scrollTrigger: {
          trigger: step,
          start: 'top 85%',
          once: true
        }
      });

      // Card fades upward (30px) and fades in
      tlStep.to(
        step,
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          onStart: () => {
            step.classList.add('active');
          },
          onComplete: () => {
            gsap.set(step, { clearProps: 'transform' });
          }
        },
        0
      );

      // Dot grows from 0.4 to 1
      if (dot) {
        tlStep.to(
          dot,
          {
            scale: 1,
            opacity: 1,
            duration: 0.85,
            ease: 'back.out(1.7)',
            onStart: () => {
              dot.classList.add('active');
            }
          },
          0
        );
      }
    });

  } else {
    // --- MOBILE MODE: Animate sequentially without pinning ---

    const leftCol = timelineSection.querySelector('.timeline-left');
    if (leftCol) gsap.set(leftCol, { opacity: 0, y: 30 });
    if (trackLine) gsap.set(trackLine, { scaleY: 0, transformOrigin: 'top center' });

    steps.forEach((step) => {
      const dot = step.querySelector('.step-dot');
      gsap.set(step, { opacity: 0, y: 30 });
      if (dot) gsap.set(dot, { scale: 0.4, opacity: 0.4 });
    });

    const tlMobile = gsap.timeline({
      scrollTrigger: {
        trigger: timelineSection,
        start: 'top 80%',
        once: true
      }
    });

    if (leftCol) {
      tlMobile.to(leftCol, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'power3.out'
      });
    }

    // Connecting line fills smoothly in sequence
    if (trackLine) {
      tlMobile.to(
        trackLine,
        {
          scaleY: 1,
          duration: steps.length * 0.4,
          ease: 'power1.inOut'
        },
        '-=0.3'
      );
    }

    // Cards animate sequentially
    steps.forEach((step, i) => {
      const dot = step.querySelector('.step-dot');
      const position = i === 0 ? '-=0.3' : '-=0.25';

      tlMobile.to(
        step,
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          onStart: () => {
            step.classList.add('active');
          },
          onComplete: () => {
            gsap.set(step, { clearProps: 'transform' });
          }
        },
        position
      );

      if (dot) {
        tlMobile.to(
          dot,
          {
            scale: 1,
            opacity: 1,
            duration: 0.75,
            ease: 'back.out(1.7)',
            onStart: () => {
              dot.classList.add('active');
            }
          },
          '<'
        );
      }
    });
  }

  return timelineSection;
}
