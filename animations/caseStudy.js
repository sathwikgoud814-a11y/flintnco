/**
 * Case Study & Showcase Motion Engine
 *
 * Requirements:
 * Left text:
 * • stagger reveal
 * Image:
 * • subtle scale
 * • fade
 * Statistics:
 * • count up
 * CTA:
 * • underline animation on hover
 * Before/After slider:
 * • initialize after images finish loading
 * • never leave opacity at zero
 * • clear temporary transforms after intro
 * Export as initCaseStudy().
 */
export function initCaseStudy() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return null;

  gsap.registerPlugin(ScrollTrigger);

  const workSection = document.querySelector('#work, .case-study-section');
  if (!workSection) return null;

  // 1. Left Text Stagger Reveal
  const leftTextElements = workSection.querySelectorAll(
    '.case-header > *, .case-story-nav, .mock-split-left > *, .breakdown-col, .narrative-col'
  );

  if (leftTextElements.length > 0 && !prefersReducedMotion) {
    gsap.fromTo(
      leftTextElements,
      { opacity: 0, y: 25 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: workSection,
          start: 'top 80%',
          once: true
        },
        onComplete: () => {
          gsap.set(leftTextElements, { clearProps: 'transform,opacity' });
        }
      }
    );
  } else {
    gsap.set(leftTextElements, { opacity: 1 });
  }

  // 2. Image Subtle Scale & Fade
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
          const current = targetNum % 1 === 0 ? Math.round(proxy.val) : proxy.val.toFixed(1);
          statEl.textContent = `${prefix}${current}${suffix}`;
        }
      });
    }
  });

  // 4. CTA Underline Animation on Hover
  const ctaButtons = workSection.querySelectorAll('.mock-btn-cta, .btn-primary, .btn-secondary, a[href="#inquire"]');
  ctaButtons.forEach((cta) => {
    let underline = cta.querySelector('.cta-underline');
    if (!underline) {
      underline = document.createElement('span');
      underline.className = 'cta-underline';
      underline.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1.5px;
        background-color: currentColor;
        transform: scaleX(0);
        transform-origin: left center;
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      `;
      if (getComputedStyle(cta).position === 'static') {
        cta.style.position = 'relative';
      }
      cta.appendChild(underline);
    }

    cta.addEventListener('mouseenter', () => {
      if (underline) gsap.to(underline, { scaleX: 1, transformOrigin: 'left center', duration: 0.35, ease: 'power2.out' });
    });

    cta.addEventListener('mouseleave', () => {
      if (underline) gsap.to(underline, { scaleX: 0, transformOrigin: 'right center', duration: 0.35, ease: 'power2.out' });
    });
  });

  // 5. Before/After Slider & Showcase Reveal
  const baShowcase = document.querySelectorAll('.ba-showcase, .ba-panel');
  if (baShowcase.length > 0) {
    const allImages = Array.from(document.querySelectorAll('#work img, .ba-showcase img'));

    // Initialize after images finish loading
    const imagePromises = allImages.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    });

    Promise.all(imagePromises).then(() => {
      baShowcase.forEach((el) => {
        if (!prefersReducedMotion) {
          gsap.fromTo(
            el,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true
              },
              // Never leave opacity at zero & clear temporary transforms after intro
              onComplete: () => {
                gsap.set(el, { opacity: 1, clearProps: 'transform' });
              }
            }
          );
        } else {
          // Never leave opacity at zero
          gsap.set(el, { opacity: 1, clearProps: 'transform' });
        }
      });
    });
  }

  return workSection;
}
