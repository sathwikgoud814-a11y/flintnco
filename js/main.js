import Lenis from 'lenis';
import './scroll-story.js';

/**
 * Flint Co. Senior Motion System (GSAP + ScrollTrigger + Lenis)
 * 
 * DESIGN PRINCIPLES:
 * 1. Handcrafted, restrained editorial feel (Never generic or flashy).
 * 2. 60 FPS smooth scrolling powered by Lenis driving GSAP ScrollTrigger ticker.
 * 3. Bidirectional reveals (`toggleActions: "play reverse play reverse"`):
 *    Elements animate smoothly on scroll down and reverse cleanly when scrolling back up.
 * 4. Precise Y-translations (20-40px), opacity fades (0 -> 1), and `power4.out` / `expo.out` easings.
 * 5. Full support for `prefers-reduced-motion`.
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 0. Prefers-Reduced-Motion Check
  // -------------------------------------------------------------
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------------------------------------------------------------
  // 1. Lenis Smooth Scroll Engine + GSAP Ticker Synchronization
  // -------------------------------------------------------------
  let lenis = null;

  if (!prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      smoothTouch: false,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Connect Lenis scroll updates to GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      // Synchronize GSAP high-precision ticker with Lenis RAF
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // -------------------------------------------------------------
  // 2. Navigation Bar (Adaptive Dark / Light Intersection Observer)
  // -------------------------------------------------------------
  const header = document.getElementById('header');
  const ctaSection = document.getElementById('inquire');
  
  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  if (ctaSection && header && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          header.classList.add('navbar-dark');
        } else {
          header.classList.remove('navbar-dark');
        }
      });
    }, { threshold: 0.45 });

    navObserver.observe(ctaSection);
  }

  // Active Section Indicator Tracking
  const sectionsForNav = document.querySelectorAll('section[id], footer[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-link');

  if (sectionsForNav.length > 0 && desktopNavLinks.length > 0) {
    const updateActiveNavLink = () => {
      let currentId = '';
      const scrollPos = window.scrollY + 180;

      sectionsForNav.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentId = sec.getAttribute('id');
        }
      });

      desktopNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentId && href === `#${currentId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink();
  }


  // Mobile Navigation Drawer Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle && mobileMenu) {
    const toggleMenu = () => {
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();
      } else {
        document.body.style.overflow = '';
        if (lenis) lenis.start();
      }
    };

    mobileToggle.addEventListener('click', toggleMenu);

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
      });
    });
  }

  // 3D Parallax Mouse Spring Effect on Hero Browser
  const hero = document.getElementById('hero');
  const browser = document.getElementById('parallax-browser');

  if (hero && browser && !prefersReducedMotion) {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const visualGlow = document.querySelector('.visual-glow');

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      mouseX = x * 8;
      mouseY = y * 8;
    });

    hero.addEventListener('mouseleave', () => {
      mouseX = 0;
      mouseY = 0;
    });

    const animateParallax = () => {
      currentX += (mouseX - currentX) * 0.045;
      currentY += (mouseY - currentY) * 0.045;
      const rotateY = currentX * 0.18;
      const rotateX = -currentY * 0.18;
      browser.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      if (visualGlow) {
        visualGlow.style.transform = `translate(-50%, -50%) translate3d(${currentX * 0.6}px, ${currentY * 0.6}px, 0)`;
      }
      requestAnimationFrame(animateParallax);
    };

    animateParallax();
  }

  // -------------------------------------------------------------
  // 3. GSAP Section-by-Section Handcrafted Reveal Motion System
  // -------------------------------------------------------------
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion) {
      // Bypasses all motion timelines for users requesting reduced motion
      gsap.globalTimeline.timeScale(100);
      return;
    }

    // A. HERO SECTION REVEAL
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top 85%',
        toggleActions: 'play reverse play reverse'
      }
    });

    heroTl.fromTo('.hero-headline',
      { opacity: 0, y: 35 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power4.out' }
    ).fromTo('.hero-headline em',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' },
      '-=0.7'
    ).fromTo('.hero-paragraph',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.85, ease: 'power4.out' },
      '-=0.6'
    ).fromTo('.btn-primary',
      { opacity: 0, scale: 0.96, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.75, ease: 'power4.out' },
      '-=0.5'
    ).fromTo('.btn-secondary',
      { opacity: 0, scale: 0.96, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.75, ease: 'power4.out' },
      '-=0.62'
    ).fromTo('#parallax-browser',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' },
      '-=0.7'
    ).fromTo('.hero-scroll-indicator',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' },
      '-=0.4'
    );


    // B. TRUST TICKER SECTION REVEAL
    const trustElements = gsap.utils.toArray('.trust-item, .trust-label');
    if (trustElements.length > 0) {
      gsap.fromTo(trustElements,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.trust-section',
            start: 'top 85%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }

    // C. PROCESS / TIMELINE SECTION REVEAL (Individual Phase Card Micro-Animations)
    const timelineLeft = document.querySelector('.timeline-left');
    const trackLine = document.querySelector('.timeline-track-line');
    const timelineSteps = gsap.utils.toArray('.timeline-step');

    if (timelineLeft) {
      gsap.fromTo(timelineLeft,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '#process',
            start: 'top 80%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }

    if (trackLine) {
      gsap.fromTo(trackLine,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          duration: 1.2,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: '.timeline-right',
            start: 'top 80%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }

    if (timelineSteps.length > 0) {
      timelineSteps.forEach((step) => {
        const stepNum = step.querySelector('.step-meta, .step-num');
        const stepTitle = step.querySelector('.step-title');
        const stepDesc = step.querySelector('.step-desc');
        const stepDot = step.querySelector('.step-dot');

        const stepTl = gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            toggleActions: 'play reverse play reverse',
            onEnter: () => step.classList.add('revealed'),
            onLeaveBack: () => step.classList.remove('revealed')
          }
        });

        if (stepDot) {
          stepTl.fromTo(stepDot,
            { scale: 0.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
          );
        }

        if (stepNum) {
          stepTl.fromTo(stepNum,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power4.out' },
            '-=0.2'
          );
        }

        if (stepTitle) {
          stepTl.fromTo(stepTitle,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.75, ease: 'power4.out' },
            '-=0.35'
          );
        }

        if (stepDesc) {
          stepTl.fromTo(stepDesc,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power4.out' },
            '-=0.45'
          );
        }
      });
    }


    // D. CASE STUDY SECTION REVEAL
    const caseSection = document.getElementById('work');
    if (caseSection) {
      const caseTl = gsap.timeline({
        scrollTrigger: {
          trigger: caseSection,
          start: 'top 80%',
          toggleActions: 'play reverse play reverse'
        }
      });

      caseTl.fromTo(['.case-header', '.case-story-nav', '.case-visual-wrapper'],
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out' }
      );

      const narrativeCols = gsap.utils.toArray('.narrative-col');
      if (narrativeCols.length > 0) {
        gsap.fromTo(narrativeCols,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: '.case-narrative-grid',
              start: 'top 85%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      }
    }

    // E. SERVICES SECTION — Per-card layered reveal
    const serviceCards = gsap.utils.toArray('.service-card');
    if (serviceCards.length > 0) {

      // Header reveal first
      gsap.fromTo('.services-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.85, ease: 'power4.out',
          scrollTrigger: {
            trigger: '.services-section',
            start: 'top 80%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );

      // Each card: sequential sub-timeline triggered individually
      serviceCards.forEach((card, i) => {
        const idx    = card.querySelector('.service-index');
        const title  = card.querySelector('.service-title');
        const desc   = card.querySelector('.service-desc');
        const tags   = gsap.utils.toArray('.outcome-tag', card);
        const link   = card.querySelector('.service-link');

        const cardTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play reverse play reverse'
          }
        });

        // 1. Card container lifts into view
        cardTl.fromTo(card,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }
        );

        // 2. Index label fades
        if (idx) {
          cardTl.fromTo(idx,
            { opacity: 0 },
            { opacity: 1, duration: 0.45, ease: 'power2.out' },
            '-=0.6'
          );
        }

        // 3. Title slides up
        if (title) {
          cardTl.fromTo(title,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.65, ease: 'power4.out' },
            '-=0.35'
          );
        }

        // 4. Description fades
        if (desc) {
          cardTl.fromTo(desc,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power4.out' },
            '-=0.4'
          );
        }

        // 5. Outcome tags stagger in
        if (tags.length > 0) {
          cardTl.fromTo(tags,
            { opacity: 0, x: -8 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.07, ease: 'power3.out' },
            '-=0.3'
          );
        }

        // 6. CTA link fades up last
        if (link) {
          cardTl.fromTo(link,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
            '-=0.25'
          );
        }
      });
    }


    // F. PHILOSOPHY / VALUE PROP SECTION REVEAL
    const valpropRows = gsap.utils.toArray('.valprop-row');
    if (valpropRows.length > 0) {
      const valpropTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#philosophy',
          start: 'top 80%',
          toggleActions: 'play reverse play reverse'
        }
      });

      valpropTl.fromTo('.valprop-header',
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' }
      ).fromTo(valpropRows,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.85, stagger: 0.12, ease: 'power4.out' },
        '-=0.4'
      );
    }

    // G. TESTIMONIALS & BEFORE/AFTER SHOWCASE REVEAL
    const testimonialsSection = document.querySelector('.testimonials-section');
    if (testimonialsSection) {
      const testTl = gsap.timeline({
        scrollTrigger: {
          trigger: testimonialsSection,
          start: 'top 80%',
          toggleActions: 'play reverse play reverse'
        }
      });

      testTl.fromTo(['.testimonials-header', '.ba-showcase', '.testimonial-card'],
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out' }
      );
    }

    // H. FAQ SECTION REVEAL
    const faqSection = document.getElementById('faq');
    const faqItemsArr = gsap.utils.toArray('.faq-item');
    if (faqSection) {
      const faqTl = gsap.timeline({
        scrollTrigger: {
          trigger: faqSection,
          start: 'top 80%',
          toggleActions: 'play reverse play reverse'
        }
      });

      faqTl.fromTo('.faq-left',
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' }
      );

      if (faqItemsArr.length > 0) {
        faqTl.fromTo(faqItemsArr,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.08, ease: 'power4.out' },
          '-=0.5'
        );
      }
    }

    // I. "FORGED FLINT" FRACTURE TRANSITION & STAGGERED CTA REVEAL
    if (ctaSection) {
      const fractureTl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaSection,
          start: 'top 88%',
          end: 'top 40%',
          scrub: 0.6
        }
      });

      fractureTl.fromTo('.flint-crack-base',
        { strokeDashoffset: 1000 },
        { strokeDashoffset: 0, duration: 0.4, ease: 'power1.out' }
      );

      fractureTl.fromTo('.flint-crack-highlight',
        { strokeDashoffset: 1000 },
        { strokeDashoffset: 0, duration: 0.4, ease: 'power1.out' },
        '-=0.3'
      );

      fractureTl.fromTo('.flint-spark',
        { opacity: 0, x: -10 },
        { opacity: 0.9, x: 20, duration: 0.25, stagger: 0.05, ease: 'power2.out' },
        '-=0.2'
      ).to('.flint-spark',
        { opacity: 0, duration: 0.2 },
        '-=0.05'
      );

      fractureTl.to('.flint-gap-reveal',
        { height: 12, duration: 0.35, ease: 'power2.out' },
        '-=0.15'
      );

      // Staggered CTA Reveal (Reverses when scrolling back up!)
      const ctaTl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaSection,
          start: 'top 35%',
          toggleActions: 'play reverse play reverse'
        }
      });

      ctaTl.fromTo('.cta-anim-eyebrow',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power4.out' }
      ).fromTo('.cta-white-text',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' },
        '-=0.3'
      ).fromTo('.cta-gold-text',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' },
        '-=0.65'
      ).fromTo('.cta-anim-subtext',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power4.out' },
        '-=0.4'
      ).fromTo('.cta-anim-btn',
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)' },
        '-=0.3'
      );
    }

    // J. FOOTER REVEAL
    const footer = document.querySelector('.main-footer');
    if (footer) {
      gsap.fromTo(['.footer-brand-statement', '.footer-nav-group'],
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 90%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }
  }

  // -------------------------------------------------------------
  // 4. FAQ Accordion Click Handler
  // -------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      });
    }
  });

  // -------------------------------------------------------------
  // 5. Interactive Case Study Visual Storyteller
  // -------------------------------------------------------------
  const storyBtns = document.querySelectorAll('.case-story-btn');
  const caseMockup = document.getElementById('case-mockup');

  if (storyBtns.length > 0 && caseMockup) {
    storyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const stage = btn.getAttribute('data-stage');
        storyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        caseMockup.className = 'case-browser-mockup stage-' + stage;
      });
    });
  }

  // -------------------------------------------------------------
  // 6. Warm Gold Particles inside CTA Surface Canvas
  // -------------------------------------------------------------
  const particleCanvas = document.getElementById('cta-particle-canvas');
  if (particleCanvas && !prefersReducedMotion) {
    const ctx = particleCanvas.getContext('2d');
    let width = (particleCanvas.width = particleCanvas.offsetWidth || window.innerWidth);
    let height = (particleCanvas.height = particleCanvas.offsetHeight || 600);

    const resize = () => {
      width = particleCanvas.width = particleCanvas.offsetWidth || window.innerWidth;
      height = particleCanvas.height = particleCanvas.offsetHeight || 600;
    };
    window.addEventListener('resize', resize);

    const NUM_PARTICLES = 16;
    const particles = [];

    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.22 + 0.08,
        speedY: Math.random() * 0.30 + 0.10,
        sineOffset: Math.random() * Math.PI * 2,
        sineSpeed: Math.random() * 0.012 + 0.004
      });
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y -= p.speedY;
        p.sineOffset += p.sineSpeed;
        p.x += Math.sin(p.sineOffset) * 0.25;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(drawParticles);
    };

    drawParticles();
  }
});
