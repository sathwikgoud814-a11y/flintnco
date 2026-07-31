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
  const IR = { immediateRender: false };

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

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Drive Lenis ONLY through GSAP ticker — no separate RAF loop
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      // Keep ScrollTrigger in sync with Lenis scroll position
      lenis.on('scroll', ScrollTrigger.update);
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
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ONE source of truth observer attached ONLY to the CTA section wrapper (#inquire)
  if (ctaSection && header && 'IntersectionObserver' in window) {
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Starts when ~25% of CTA section enters viewport
        if (entry.isIntersecting) {
          header.classList.add('navbar-dark');
        } else {
          // If scrolled down past CTA into Footer (top < 0), stay BLACK.
          // If scrolled back UP past CTA into upper sections (top > 0), return to WHITE.
          const top = entry.boundingClientRect.top;
          if (top < 0) {
            header.classList.add('navbar-dark');
          } else {
            header.classList.remove('navbar-dark');
          }
        }
      });
    }, { threshold: 0.25 });

    ctaObserver.observe(ctaSection);
  }

  // Active Section Indicator Tracking (IntersectionObserver - Zero Layout Thrashing)
  const sectionsForNav = document.querySelectorAll('section[id], footer[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-link');

  if (sectionsForNav.length > 0 && desktopNavLinks.length > 0 && 'IntersectionObserver' in window) {
    const navLinkMap = {};
    desktopNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        navLinkMap[href.substring(1)] = link;
      }
    });

    const activeSectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          desktopNavLinks.forEach(l => l.classList.remove('active'));
          if (navLinkMap[id]) {
            navLinkMap[id].classList.add('active');
          }
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

    sectionsForNav.forEach(sec => activeSectionObserver.observe(sec));
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
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      mouseX = 0;
      mouseY = 0;
    }, { passive: true });

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
      gsap.globalTimeline.timeScale(100);
      return;
    }

    // immediateRender: false is CRITICAL on every fromTo from-vars.
    // Without it, GSAP applies opacity:0 to ALL elements immediately at
    // DOMContentLoaded — before any ScrollTrigger fires. Elements remain
    // invisible and create blank whitespace voids throughout the page.
    const IR = { immediateRender: false };

    // A. HERO SECTION REVEAL
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top 85%',
        toggleActions: 'play reverse play reverse'
      }
    });

    heroTl.fromTo('.hero-headline',
      { ...IR, opacity: 0, y: 35 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power4.out' }
    ).fromTo('.hero-headline em',
      { ...IR, opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' },
      '-=0.7'
    ).fromTo('.hero-paragraph',
      { ...IR, opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.85, ease: 'power4.out' },
      '-=0.6'
    ).fromTo('.btn-primary',
      { ...IR, opacity: 0, scale: 0.96, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.75, ease: 'power4.out' },
      '-=0.5'
    ).fromTo('.btn-secondary',
      { ...IR, opacity: 0, scale: 0.96, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.75, ease: 'power4.out' },
      '-=0.62'
    ).fromTo('#parallax-browser',
      { ...IR, opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' },
      '-=0.7'
    ).fromTo('.hero-scroll-indicator',
      { ...IR, opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' },
      '-=0.4'
    );

    // B. TRUST TICKER SECTION REVEAL
    const trustElements = gsap.utils.toArray('.trust-item, .trust-label');
    if (trustElements.length > 0) {
      gsap.fromTo(trustElements,
        { ...IR, opacity: 0, y: 25 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power4.out',
          scrollTrigger: {
            trigger: '.trust-section',
            start: 'top 85%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }

    // C. PROCESS / TIMELINE SECTION REVEAL
    const timelineLeft = document.querySelector('.timeline-left');
    const trackLine = document.querySelector('.timeline-track-line');
    const timelineSteps = gsap.utils.toArray('.timeline-step');

    if (timelineLeft) {
      gsap.fromTo(timelineLeft,
        { ...IR, opacity: 0, y: 35 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power4.out',
          scrollTrigger: { trigger: '#process', start: 'top 80%', toggleActions: 'play reverse play reverse' }
        }
      );
    }

    if (trackLine) {
      gsap.fromTo(trackLine,
        { ...IR, scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1, duration: 1.2, ease: 'power2.inOut',
          scrollTrigger: { trigger: '.timeline-right', start: 'top 80%', toggleActions: 'play reverse play reverse' }
        }
      );
    }

    if (timelineSteps.length > 0) {
      const setActiveStep = (activeStep) => {
        timelineSteps.forEach((step) => {
          const dot = step.querySelector('.step-dot');
          if (step === activeStep) {
            step.classList.add('active');
            if (dot) dot.classList.add('active');
          } else {
            step.classList.remove('active');
            if (dot) dot.classList.remove('active');
          }
        });
      };

      // Set first step active initially
      setActiveStep(timelineSteps[0]);

      timelineSteps.forEach((step) => {
        const stepNum   = step.querySelector('.step-meta');
        const stepTitle = step.querySelector('.step-title');
        const stepDesc  = step.querySelector('.step-desc');

        ScrollTrigger.create({
          trigger: step,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter:     () => setActiveStep(step),
          onEnterBack: () => setActiveStep(step)
        });

        const stepTl = gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            toggleActions: 'play reverse play reverse'
          }
        });

        if (stepNum)   stepTl.fromTo(stepNum,   { ...IR, opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power4.out' });
        if (stepTitle) stepTl.fromTo(stepTitle, { ...IR, opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power4.out' }, '-=0.35');
        if (stepDesc)  stepTl.fromTo(stepDesc,  { ...IR, opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power4.out' }, '-=0.45');
      });
    }

    // D. CASE STUDY SECTION REVEAL
    const caseSection = document.getElementById('work');
    if (caseSection) {
      const caseTl = gsap.timeline({
        scrollTrigger: { trigger: caseSection, start: 'top 80%', toggleActions: 'play reverse play reverse' }
      });
      caseTl.fromTo(['.case-header', '.case-story-nav', '.case-visual-wrapper'],
        { ...IR, opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out' }
      );

      const narrativeCols = gsap.utils.toArray('.narrative-col');
      if (narrativeCols.length > 0) {
        gsap.fromTo(narrativeCols,
          { ...IR, opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power4.out',
            scrollTrigger: { trigger: '.case-narrative-grid', start: 'top 85%', toggleActions: 'play reverse play reverse' }
          }
        );
      }
    }

    // E. SERVICES SECTION — Per-card layered reveal
    const serviceCards = gsap.utils.toArray('.service-card');
    if (serviceCards.length > 0) {
      gsap.fromTo('.services-header',
        { ...IR, opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.85, ease: 'power4.out',
          scrollTrigger: { trigger: '.services-section', start: 'top 80%', toggleActions: 'play reverse play reverse' }
        }
      );

      serviceCards.forEach((card) => {
        const idx   = card.querySelector('.service-index');
        const title = card.querySelector('.service-title');
        const desc  = card.querySelector('.service-desc');
        const tags  = gsap.utils.toArray('.outcome-tag', card);
        const link  = card.querySelector('.service-link');

        const cardTl = gsap.timeline({
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play reverse play reverse' }
        });

        cardTl.fromTo(card,  { ...IR, opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' });
        if (idx)   cardTl.fromTo(idx,   { ...IR, opacity: 0 },         { opacity: 1, duration: 0.45, ease: 'power2.out' }, '-=0.6');
        if (title) cardTl.fromTo(title, { ...IR, opacity: 0, y: 22 },  { opacity: 1, y: 0, duration: 0.65, ease: 'power4.out' }, '-=0.35');
        if (desc)  cardTl.fromTo(desc,  { ...IR, opacity: 0, y: 14 },  { opacity: 1, y: 0, duration: 0.55, ease: 'power4.out' }, '-=0.4');
        if (tags.length > 0) cardTl.fromTo(tags, { ...IR, opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.07, ease: 'power3.out' }, '-=0.3');
        if (link)  cardTl.fromTo(link,  { ...IR, opacity: 0, y: 8 },   { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.25');
      });
    }

    // F. PHILOSOPHY / VALUE PROP SECTION — Per-pillar card reveal
    const pillarBlocks = gsap.utils.toArray('.pillar-block');
    if (pillarBlocks.length > 0) {
      gsap.fromTo('.valprop-header',
        { ...IR, opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.85, ease: 'power4.out',
          scrollTrigger: { trigger: '#philosophy', start: 'top 80%', toggleActions: 'play reverse play reverse' }
        }
      );

      pillarBlocks.forEach((pillar) => {
        const divider   = pillar.querySelector('.pillar-divider');
        const num       = pillar.querySelector('.pillar-num');
        const svg       = pillar.querySelector('.pillar-svg');
        const title     = pillar.querySelector('.pillar-title');
        const underline = pillar.querySelector('.gold-underline');
        const desc      = pillar.querySelector('.pillar-desc');

        const pillarTl = gsap.timeline({
          scrollTrigger: { trigger: pillar, start: 'top 85%', toggleActions: 'play reverse play reverse' }
        });

        // 1. Editorial divider grows horizontally
        if (divider) {
          pillarTl.fromTo(divider,
            { ...IR, scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 0.8, ease: 'power3.out' }
          );
        }

        // 2. Pillar number slides up & fades
        if (num) {
          pillarTl.fromTo(num,
            { ...IR, opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power4.out' },
            divider ? '-=0.55' : '+=0'
          );
        }

        // 3. Vector SVG icon scales gently
        if (svg) {
          pillarTl.fromTo(svg,
            { ...IR, opacity: 0, scale: 0.85 },
            { opacity: 0.55, scale: 1, duration: 0.5, ease: 'power2.out' },
            '-=0.4'
          );
        }

        // 4. Headline text reveals
        if (title) {
          pillarTl.fromTo(title,
            { ...IR, opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power4.out' },
            '-=0.35'
          );
        }

        // 5. Gold underline reveals
        if (underline) {
          pillarTl.fromTo(underline,
            { ...IR, scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 0.6, ease: 'expo.out' },
            '-=0.45'
          );
        }

        // 6. Description text fades in
        if (desc) {
          pillarTl.fromTo(desc,
            { ...IR, opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power4.out' },
            '-=0.35'
          );
        }
      });
    }

    // G. TESTIMONIALS & BEFORE/AFTER SHOWCASE REVEAL
    const testimonialsSection = document.querySelector('.testimonials-section');
    if (testimonialsSection) {
      gsap.fromTo(['.testimonials-header', '.ba-showcase'],
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'expo.out',
          scrollTrigger: { trigger: testimonialsSection, start: 'top 80%', once: true },
          onComplete: () => {
            gsap.set(['.testimonials-header', '.ba-showcase'], {
              opacity: 1,
              clearProps: 'opacity,transform'
            });
          }
        }
      );
    }

    // H. FAQ SECTION REVEAL
    const faqSection = document.getElementById('faq');
    const faqItemsArr = gsap.utils.toArray('.faq-item');
    if (faqSection) {
      gsap.fromTo('.faq-left',
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power4.out',
          scrollTrigger: { trigger: faqSection, start: 'top 80%', once: true },
          onComplete: () => {
            gsap.set('.faq-left', { opacity: 1, clearProps: 'opacity,transform' });
          }
        }
      );
      if (faqItemsArr.length > 0) {
        gsap.fromTo(faqItemsArr,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: 'power4.out',
            scrollTrigger: { trigger: faqSection, start: 'top 80%', once: true },
            onComplete: () => {
              gsap.set(faqItemsArr, { opacity: 1, clearProps: 'opacity,transform' });
            }
          }
        );
      }
    }

    // I. CTA SECTION REVEAL & EMBER SEQUENCE
    if (ctaSection) {
      const fractureTl = gsap.timeline({
        scrollTrigger: { trigger: ctaSection, start: 'top 92%', end: 'top 40%', scrub: 0.6 }
      });
      fractureTl
        .fromTo('.flint-crack-base',      { immediateRender: false, strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power1.out' })
        .fromTo('.flint-crack-highlight', { immediateRender: false, strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power1.out' }, '-=0.3')
        .to('.flint-gap-reveal',          { height: 12, duration: 0.35, ease: 'power2.out' }, '-=0.15');

      gsap.fromTo(
        ['.cta-anim-eyebrow', '.cta-white-text', '.cta-gold-text', '.cta-anim-subtext', '.closing-friction', '.flint-spark', '#cta-particle-canvas'],
        { opacity: 0, y: 15 },
        {
          opacity: 1, y: 0, duration: 0.85, stagger: 0.08, ease: 'power4.out',
          scrollTrigger: { trigger: ctaSection, start: 'top 88%', once: true }
        }
      );

      const ctaBtn = document.querySelector('.cta-btn-primary');
      if (ctaBtn) {
        gsap.fromTo(ctaBtn,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: ctaSection, start: 'top 88%', once: true },
            onComplete: () => {
              gsap.set(ctaBtn, {
                opacity: 1,
                clearProps: 'transform',
                pointerEvents: 'auto'
              });
            }
          }
        );
      }
    }

    // J. FOOTER REVEAL
    const footer = document.querySelector('.main-footer');
    if (footer) {
      gsap.fromTo(['.footer-brand-statement', '.footer-nav-group'],
        { ...IR, opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power4.out',
          scrollTrigger: { trigger: footer, start: 'top 90%', toggleActions: 'play reverse play reverse' }
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

  // -------------------------------------------------------------
  // 7. Tiny Drifting Embers inside Footer Canvas (Extension of Forge)
  // -------------------------------------------------------------
  const footerCanvas = document.getElementById('footer-embers-canvas');
  if (footerCanvas && !prefersReducedMotion) {
    const fCtx = footerCanvas.getContext('2d');
    let fWidth = (footerCanvas.width = footerCanvas.offsetWidth || window.innerWidth);
    let fHeight = (footerCanvas.height = footerCanvas.offsetHeight || 300);

    const fResize = () => {
      fWidth = footerCanvas.width = footerCanvas.offsetWidth || window.innerWidth;
      fHeight = footerCanvas.height = footerCanvas.offsetHeight || 300;
    };
    window.addEventListener('resize', fResize);

    const NUM_FOOTER_EMBERS = 12;
    const footerEmbers = [];

    for (let i = 0; i < NUM_FOOTER_EMBERS; i++) {
      footerEmbers.push({
        x: Math.random() * fWidth,
        y: Math.random() * fHeight,
        radius: Math.random() * 1.2 + 0.5,
        alpha: Math.random() * 0.25 + 0.05,
        speedY: Math.random() * 0.25 + 0.08,
        sineOffset: Math.random() * Math.PI * 2,
        sineSpeed: Math.random() * 0.01 + 0.003
      });
    }

    const drawFooterEmbers = () => {
      fCtx.clearRect(0, 0, fWidth, fHeight);

      footerEmbers.forEach(p => {
        p.y -= p.speedY;
        p.sineOffset += p.sineSpeed;
        p.x += Math.sin(p.sineOffset) * 0.2;

        if (p.y < -10) {
          p.y = fHeight + 10;
          p.x = Math.random() * fWidth;
        }

        fCtx.beginPath();
        fCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        fCtx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        fCtx.fill();
      });

      requestAnimationFrame(drawFooterEmbers);
    };

    drawFooterEmbers();
  }
});
