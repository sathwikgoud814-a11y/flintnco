/**
 * Testimonials & Work Showcase Motion Engine
 *
 * Requirements:
 * Cards:
 * • stagger upward
 * • opacity
 * • rotate 1 degree to 0
 * Stars:
 * • stagger fade
 * Author:
 * • slide upward
 * Before/After slider:
 * • Initialize safely.
 * • Never leave opacity or transform values permanently applied.
 * Export initTestimonials().
 */
export function initTestimonials() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return null;

  gsap.registerPlugin(ScrollTrigger);

  const testimonialsSection = document.querySelector('#testimonials, .testimonials-section');
  if (!testimonialsSection) return null;

  const header = testimonialsSection.querySelector('.testimonials-header');
  const cards = gsap.utils.toArray('.testimonial-card, .testimonials-grid > *', testimonialsSection);
  const baShowcase = testimonialsSection.querySelectorAll('.ba-showcase, .ba-panel');

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
        },
        onComplete: () => {
          gsap.set(header, { opacity: 1, clearProps: 'transform' });
        }
      }
    );
  } else if (header) {
    gsap.set(header, { opacity: 1, clearProps: 'transform' });
  }

  // 2. Before/After Slider (Initialize safely, never leave opacity at 0, clearProps)
  if (baShowcase.length > 0) {
    const images = Array.from(testimonialsSection.querySelectorAll('img'));
    const imgPromises = images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    });

    Promise.all(imgPromises).then(() => {
      baShowcase.forEach((baEl) => {
        if (!prefersReducedMotion) {
          gsap.fromTo(
            baEl,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: baEl,
                start: 'top 82%',
                once: true
              },
              onComplete: () => {
                // Never leave opacity at 0 & clear temporary transforms
                gsap.set(baEl, { opacity: 1, clearProps: 'transform' });
              }
            }
          );
        } else {
          gsap.set(baEl, { opacity: 1, clearProps: 'transform' });
        }
      });
    });
  }

  // 3. Testimonial Cards Animation
  if (cards.length > 0) {
    cards.forEach((card, index) => {
      const stars = card.querySelectorAll('.star, [class*="star"], svg.star, .star-rating span');
      const author = card.querySelectorAll('.testimonial-profile, .testimonial-author, .testimonial-name, .testimonial-meta, .testimonial-role');

      if (prefersReducedMotion) {
        gsap.set([card, ...stars, ...author], { opacity: 1, y: 0, rotation: 0, clearProps: 'transform' });
        return;
      }

      const tlCard = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        }
      });

      // Cards: stagger upward, opacity 0 -> 1, rotate 1 degree to 0
      tlCard.fromTo(
        card,
        { opacity: 0, y: 35, rotation: 1 },
        {
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 0.85,
          ease: 'power3.out',
          onComplete: () => {
            gsap.set(card, { opacity: 1, clearProps: 'transform' });
          }
        },
        index * 0.12
      );

      // Stars: stagger fade
      if (stars.length > 0) {
        tlCard.fromTo(
          stars,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out',
            onComplete: () => {
              gsap.set(stars, { opacity: 1 });
            }
          },
          0.2
        );
      }

      // Author: slide upward
      if (author.length > 0) {
        tlCard.fromTo(
          author,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.06,
            ease: 'power3.out',
            onComplete: () => {
              gsap.set(author, { opacity: 1, clearProps: 'transform' });
            }
          },
          0.3
        );
      }
    });
  }

  return testimonialsSection;
}
