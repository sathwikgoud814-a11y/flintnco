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
      const isExpanded = mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');

      if (isExpanded) {
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
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
      });
    });
  }

  // Smooth scroll delegation for in-page anchor links (Lenis + Native fallback)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href !== '#' && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(target);
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // 3D Parallax Mouse Spring Effect on Hero Browser (Viewport & Idle Optimized)
  const hero = document.getElementById('hero');
  const browser = document.getElementById('parallax-browser');

  if (hero && browser && !prefersReducedMotion) {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let isAnimating = false;
    let isHeroVisible = true;
    let heroRafId = null;

    const visualGlow = document.querySelector('.visual-glow');

    const animateParallax = () => {
      if (!isHeroVisible) {
        isAnimating = false;
        return;
      }

      currentX += (mouseX - currentX) * 0.045;
      currentY += (mouseY - currentY) * 0.045;
      const rotateY = currentX * 0.18;
      const rotateX = -currentY * 0.18;
      browser.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      if (visualGlow) {
        visualGlow.style.transform = `translate(-50%, -50%) translate3d(${currentX * 0.6}px, ${currentY * 0.6}px, 0)`;
      }

      // Stop RAF when equilibrium is reached and mouse is idle
      if (Math.abs(mouseX - currentX) < 0.005 && Math.abs(mouseY - currentY) < 0.005 && mouseX === 0 && mouseY === 0) {
        isAnimating = false;
        return;
      }

      heroRafId = requestAnimationFrame(animateParallax);
    };

    const startParallax = () => {
      if (!isAnimating && isHeroVisible) {
        isAnimating = true;
        heroRafId = requestAnimationFrame(animateParallax);
      }
    };

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      mouseX = x * 8;
      mouseY = y * 8;
      startParallax();
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      mouseX = 0;
      mouseY = 0;
      startParallax();
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        isHeroVisible = entry.isIntersecting;
        if (isHeroVisible) {
          startParallax();
        } else {
          if (heroRafId) cancelAnimationFrame(heroRafId);
          isAnimating = false;
        }
      }, { threshold: 0 });
      heroObserver.observe(hero);
    } else {
      startParallax();
    }
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
    // -------------------------------------------------------------
    // Unified Reusable Reveal Animation System
    // -------------------------------------------------------------
    function createReveal(target, config = {}) {
      const rawElements = typeof target === 'string' ? gsap.utils.toArray(target) : (Array.isArray(target) ? target : [target]);
      if (!rawElements || rawElements.length === 0) return null;
      const validElements = rawElements.filter(Boolean);
      if (validElements.length === 0) return null;

      const trigger = config.trigger || validElements[0];
      if (!trigger) return null;

      // Prevent duplicate initialization on same trigger
      if (trigger._revealInitialized) return null;
      trigger._revealInitialized = true;

      const start = config.start || 'top 85%';
      const duration = config.duration || 0.85;
      const ease = config.ease || 'power4.out';
      const y = config.y !== undefined ? config.y : 30;
      const scale = config.scale;
      const stagger = config.stagger || 0;

      const fromVars = { immediateRender: false, opacity: 0, y };
      if (scale !== undefined) fromVars.scale = scale;

      const toVars = {
        opacity: 1,
        y: 0,
        duration,
        ease,
        scrollTrigger: {
          trigger,
          start,
          once: true
        },
        onComplete: () => {
          gsap.set(validElements, { opacity: 1, clearProps: 'opacity,transform' });
          if (config.onComplete) config.onComplete();
        }
      };

      if (scale !== undefined) toVars.scale = 1;
      if (stagger > 0) toVars.stagger = stagger;

      return gsap.fromTo(validElements, fromVars, toVars);
    }

    // A. HERO SECTION REVEAL
    createReveal(['.hero-headline', '.hero-headline em', '.hero-paragraph', '.btn-primary', '.btn-secondary', '#parallax-browser', '.hero-scroll-indicator'], {
      trigger: '#hero',
      start: 'top 85%',
      duration: 0.9,
      stagger: 0.08,
      y: 35,
      ease: 'power4.out'
    });

    // B. TRUST TICKER SECTION REVEAL
    createReveal('.trust-item, .trust-label', {
      trigger: '.trust-section',
      start: 'top 85%',
      duration: 0.7,
      stagger: 0.06,
      y: 25,
      ease: 'power4.out'
    });

    // C. PROCESS / TIMELINE SECTION REVEAL
    createReveal('.timeline-left', {
      trigger: '#process',
      start: 'top 80%',
      duration: 0.9,
      y: 35,
      ease: 'power4.out'
    });

    createReveal('.timeline-track-line', {
      trigger: '.timeline-right',
      start: 'top 80%',
      duration: 1.2,
      ease: 'power2.inOut'
    });

    const timelineSteps = gsap.utils.toArray('.timeline-step');
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

      setActiveStep(timelineSteps[0]);

      timelineSteps.forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter:     () => setActiveStep(step),
          onEnterBack: () => setActiveStep(step)
        });

        const stepEls = [step.querySelector('.step-meta'), step.querySelector('.step-title'), step.querySelector('.step-desc')].filter(Boolean);
        createReveal(stepEls, {
          trigger: step,
          start: 'top 85%',
          duration: 0.7,
          stagger: 0.1,
          y: 20,
          ease: 'power4.out'
        });
      });
    }

    // D. CASE STUDY SECTION REVEAL
    createReveal(['.case-header', '.case-story-nav', '.case-visual-wrapper'], {
      trigger: '#work',
      start: 'top 80%',
      duration: 0.9,
      stagger: 0.1,
      y: 35,
      ease: 'expo.out'
    });

    createReveal('.narrative-col', {
      trigger: '.case-narrative-grid',
      start: 'top 85%',
      duration: 0.8,
      stagger: 0.08,
      y: 30,
      ease: 'power4.out'
    });

    // E. SERVICES SECTION REVEAL
    createReveal('.services-header', {
      trigger: '.services-section',
      start: 'top 80%',
      duration: 0.85,
      y: 30,
      ease: 'power4.out'
    });

    const serviceCards = gsap.utils.toArray('.service-card');
    if (serviceCards.length > 0) {
      serviceCards.forEach((card) => {
        const cardEls = [card, card.querySelector('.service-index'), card.querySelector('.service-title'), card.querySelector('.service-desc'), ...gsap.utils.toArray('.outcome-tag', card), card.querySelector('.service-link')].filter(Boolean);
        createReveal(cardEls, {
          trigger: card,
          start: 'top 88%',
          duration: 0.85,
          stagger: 0.06,
          y: 30,
          ease: 'expo.out'
        });
      });
    }

    // F. PHILOSOPHY / VALUE PROP SECTION REVEAL
    createReveal('.valprop-header', {
      trigger: '#philosophy',
      start: 'top 80%',
      duration: 0.85,
      y: 30,
      ease: 'power4.out'
    });

    const pillarBlocks = gsap.utils.toArray('.pillar-block');
    if (pillarBlocks.length > 0) {
      pillarBlocks.forEach((pillar) => {
        const pillarEls = [pillar, pillar.querySelector('.pillar-divider'), pillar.querySelector('.pillar-num'), pillar.querySelector('.pillar-svg'), pillar.querySelector('.pillar-title'), pillar.querySelector('.gold-underline'), pillar.querySelector('.pillar-desc')].filter(Boolean);
        createReveal(pillarEls, {
          trigger: pillar,
          start: 'top 85%',
          duration: 0.75,
          stagger: 0.06,
          y: 20,
          ease: 'power4.out'
        });
      });
    }

    // G. TESTIMONIALS & BEFORE/AFTER SHOWCASE REVEAL
    createReveal(['.testimonials-header', '.ba-showcase'], {
      trigger: '.testimonials-section',
      start: 'top 80%',
      duration: 0.9,
      stagger: 0.12,
      y: 35,
      ease: 'expo.out'
    });

    // H. FAQ SECTION REVEAL
    createReveal('.faq-left', {
      trigger: '#faq',
      start: 'top 80%',
      duration: 0.8,
      y: 35,
      ease: 'power4.out'
    });

    createReveal('.faq-item', {
      trigger: '#faq',
      start: 'top 80%',
      duration: 0.75,
      stagger: 0.08,
      y: 25,
      ease: 'power4.out'
    });

    // I. CTA SECTION REVEAL & EMBER SEQUENCE
    if (ctaSection) {
      const fractureTl = gsap.timeline({
        scrollTrigger: { trigger: ctaSection, start: 'top 92%', end: 'top 40%', scrub: 0.6 }
      });
      fractureTl
        .fromTo('.flint-crack-base',      { immediateRender: false, strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power1.out' })
        .fromTo('.flint-crack-highlight', { immediateRender: false, strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power1.out' }, '-=0.3')
        .to('.flint-gap-reveal',          { height: 12, duration: 0.35, ease: 'power2.out' }, '-=0.15');

      createReveal(['.cta-anim-eyebrow', '.cta-white-text', '.cta-gold-text', '.cta-anim-subtext', '.cta-friction', '.flint-spark', '#cta-particle-canvas'], {
        trigger: ctaSection,
        start: 'top 88%',
        duration: 0.85,
        stagger: 0.08,
        y: 15,
        ease: 'power4.out'
      });

      const ctaBtn = document.querySelector('.cta-btn-primary');
      if (ctaBtn) {
        createReveal(ctaBtn, {
          trigger: ctaSection,
          start: 'top 88%',
          duration: 0.6,
          y: 20,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(ctaBtn, { pointerEvents: 'auto' });
          }
        });
      }
    }

    // J. FOOTER REVEAL
    createReveal(['.footer-brand-statement', '.footer-nav-group'], {
      trigger: '.main-footer',
      start: 'top 90%',
      duration: 0.7,
      stagger: 0.08,
      y: 20,
      ease: 'power4.out'
    });
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
            const otherBtn = otherItem.querySelector('.faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });
        if (isActive) {
          item.classList.remove('active');
          question.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          question.setAttribute('aria-expanded', 'true');
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
      btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
      btn.addEventListener('click', () => {
        const stage = btn.getAttribute('data-stage');
        storyBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        caseMockup.className = 'case-browser-mockup stage-' + stage;
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
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
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('orientationchange', resize, { passive: true });

    if ('ResizeObserver' in window && particleCanvas.parentElement) {
      const ro = new ResizeObserver(resize);
      ro.observe(particleCanvas.parentElement);
    }

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

    let isCtaCanvasVisible = false;
    let particleRafId = null;

    const drawParticles = () => {
      if (!isCtaCanvasVisible) return;
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

      particleRafId = requestAnimationFrame(drawParticles);
    };

    if ('IntersectionObserver' in window) {
      const ctaObs = new IntersectionObserver(([entry]) => {
        isCtaCanvasVisible = entry.isIntersecting;
        if (isCtaCanvasVisible) {
          if (particleRafId) cancelAnimationFrame(particleRafId);
          particleRafId = requestAnimationFrame(drawParticles);
        }
      }, { threshold: 0 });
      ctaObs.observe(particleCanvas);
    } else {
      isCtaCanvasVisible = true;
      drawParticles();
    }
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
    window.addEventListener('resize', fResize, { passive: true });
    window.addEventListener('orientationchange', fResize, { passive: true });

    if ('ResizeObserver' in window && footerCanvas.parentElement) {
      const fRo = new ResizeObserver(fResize);
      fRo.observe(footerCanvas.parentElement);
    }

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

    let isFooterCanvasVisible = false;
    let footerRafId = null;

    const drawFooterEmbers = () => {
      if (!isFooterCanvasVisible) return;
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

      footerRafId = requestAnimationFrame(drawFooterEmbers);
    };

    if ('IntersectionObserver' in window) {
      const footerObs = new IntersectionObserver(([entry]) => {
        isFooterCanvasVisible = entry.isIntersecting;
        if (isFooterCanvasVisible) {
          if (footerRafId) cancelAnimationFrame(footerRafId);
          footerRafId = requestAnimationFrame(drawFooterEmbers);
        }
      }, { threshold: 0 });
      footerObs.observe(footerCanvas);
    } else {
      isFooterCanvasVisible = true;
      drawFooterEmbers();
    }
  }

  // -------------------------------------------------------------
  // 8. Global Viewport Resize & Orientation Change Observer
  // -------------------------------------------------------------
  let resizeTimer;
  const onViewportChange = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 150);
  };
  window.addEventListener('resize', onViewportChange, { passive: true });
  window.addEventListener('orientationchange', onViewportChange, { passive: true });
});
