/**
 * FAQ Accordion Motion Engine (GSAP Only)
 *
 * Requirements:
 * • Answer expands with height animation.
 * • Chevron rotates.
 * • Question changes color.
 * • Close other items when opening a new one.
 * • Use GSAP only.
 * • Do not change HTML.
 * • Export initFAQ().
 */
export function initFAQ() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof gsap === 'undefined') return null;

  const faqSection = document.querySelector('#faq, .faq-section');
  if (!faqSection) return null;

  // Reveal entrance for FAQ section
  const faqLeft = faqSection.querySelector('.faq-left');
  const faqRight = faqSection.querySelector('.faq-right');
  const faqItems = gsap.utils.toArray('.faq-item', faqSection);

  if (typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    if (faqLeft) {
      gsap.fromTo(
        faqLeft,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: faqSection,
            start: 'top 80%',
            once: true
          }
        }
      );
    }

    if (faqItems.length > 0) {
      gsap.fromTo(
        faqItems,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: faqRight || faqSection,
            start: 'top 80%',
            once: true
          }
        }
      );
    }
  }

  // Accordion Item Interaction Logic (GSAP Only)
  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-question');
    const questionText = item.querySelector('.faq-question-text');
    const answer = item.querySelector('.faq-answer');
    const toggle = item.querySelector('.faq-toggle');
    const verticalLine = item.querySelector('.line-v');

    if (!button || !answer) return;

    // Override CSS grid transition to allow GSAP height control
    gsap.set(answer, {
      display: 'block',
      gridTemplateRows: 'none',
      height: 0,
      overflow: 'hidden'
    });

    item._isOpen = false;

    const openItem = () => {
      item._isOpen = true;
      item.classList.add('active');
      button.setAttribute('aria-expanded', 'true');

      // Answer expands with GSAP height animation
      gsap.to(answer, {
        height: 'auto',
        duration: 0.45,
        ease: 'power3.out',
        overwrite: 'auto'
      });

      // Question changes color
      if (questionText) {
        gsap.to(questionText, {
          color: 'var(--accent, #D4AF37)',
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      // Chevron / Toggle rotates 90 degrees
      const rotateTarget = verticalLine || toggle;
      if (rotateTarget) {
        gsap.to(rotateTarget, {
          rotation: 90,
          duration: 0.4,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    };

    const closeItem = () => {
      item._isOpen = false;
      item.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');

      // Answer collapses height with GSAP
      gsap.to(answer, {
        height: 0,
        duration: 0.4,
        ease: 'power3.inOut',
        overwrite: 'auto'
      });

      // Question resets color
      if (questionText) {
        gsap.to(questionText, {
          color: 'var(--text-primary, #171717)',
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      // Chevron / Toggle resets rotation
      const rotateTarget = verticalLine || toggle;
      if (rotateTarget) {
        gsap.to(rotateTarget, {
          rotation: 0,
          duration: 0.4,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    };

    button.addEventListener('click', (e) => {
      e.preventDefault();

      const currentlyOpen = item._isOpen;

      // Close other items when opening a new one
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem._isOpen) {
          if (otherItem._closeFn) otherItem._closeFn();
        }
      });

      if (currentlyOpen) {
        closeItem();
      } else {
        openItem();
      }
    });

    item._closeFn = closeItem;
    item._openFn = openItem;
  });

  return faqSection;
}
