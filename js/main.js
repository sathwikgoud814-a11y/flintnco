import Lenis from 'lenis';
import SplitType from 'split-type';
import '../animations/index.js';
import { initFlintCursor } from './cursor.js';

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
  // Initialize Flint Co. Premium Custom Cursor
  initFlintCursor();

  // -------------------------------------------------------------
  // 0. Prefers-Reduced-Motion Check
  // -------------------------------------------------------------
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IR = { immediateRender: false };

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // -------------------------------------------------------------
  // 1. Lenis Smooth Scroll Engine + GSAP Ticker Synchronization (Desktop Only)
  // -------------------------------------------------------------
  let lenis = null;

  if (!prefersReducedMotion && !isMobile) {
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

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  // -------------------------------------------------------------
  // 2. Navigation Bar (Adaptive Dark / Light Intersection Observer)
  // -------------------------------------------------------------
  const header = document.getElementById('header');
  const ctaSection = document.getElementById('inquire');
  
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 30) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
        mobileToggle.focus();
      }
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

      const triggerEl = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
      if (!triggerEl) return null;

      // Prevent duplicate initialization on same trigger
      if (triggerEl._revealInitialized) return null;
      triggerEl._revealInitialized = true;

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
          trigger: triggerEl,
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

    // A. HERO SECTION REVEAL (Page Load Timeline)
    initHeroAnimations();

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
    initTimeline();

    // D. CASE STUDY SECTION REVEAL
    initCaseStudy();

    // E. SERVICES SECTION REVEAL
    initServices();

    // F. PHILOSOPHY SECTION REVEAL
    initPhilosophy();

    // G. TESTIMONIALS & BEFORE/AFTER SHOWCASE REVEAL
    initTestimonials();

    // H. FAQ SECTION REVEAL & ACCORDION (GSAP Only)
    initFAQ();

    // I. CLOSING CTA SECTION MOTION
    initClosing();

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

/**
 * Hero Section Entrance Motion (GSAP Timeline)
 *
 * Requirements:
 * • Animate on first page load only.
 * • Navbar fades down first.
 * • Eyebrow fades up.
 * • Heading reveals line by line using SplitType.
 * • Paragraph fades upward with slight delay.
 * • CTA button scales from 0.95 to 1.
 * • Hero image/illustration fades in with a slight horizontal movement.
 * • Scroll indicator loops subtly.
 * • Duration should feel premium, not flashy.
 * • Use GSAP timelines.
 * • Respect prefers-reduced-motion.
 * • No ScrollTrigger.
 * • No Lenis changes.
 * • Export everything as initHeroAnimations().
 * • Never use gsap.set() to permanently overwrite transforms or opacity outside the animation timeline.
 */
export function initHeroAnimations() {
  if (window._heroAnimInitialized) return null;
  window._heroAnimInitialized = true;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return null;

  if (typeof gsap === 'undefined') return null;

  const header = document.querySelector('#header, .header');
  const eyebrow = document.querySelector('#hero .hero-eyebrow, #hero .eyebrow, #hero [class*="eyebrow"], .hero-eyebrow, .eyebrow');
  const headline = document.querySelector('.hero-headline');
  const paragraph = document.querySelector('.hero-paragraph');
  const ctaBtn = document.querySelectorAll('.hero-btn-group .btn-primary, .hero-btn-group .btn-secondary, .hero-btn-group > *');
  const heroVisual = document.querySelector('#parallax-browser, .hero-visual');
  const elementsToClean = [header, eyebrow, headline, paragraph, heroVisual].filter(Boolean);
  if (ctaBtn && ctaBtn.length > 0) elementsToClean.push(...ctaBtn);

  const tl = gsap.timeline({
    defaults: {
      ease: 'power3.out',
      duration: 0.9
    },
    onComplete: () => {
      gsap.set(elementsToClean, { opacity: 1, clearProps: 'opacity,transform' });
    }
  });

  // 1. Navbar fades down first
  if (header) {
    tl.fromTo(header, { opacity: 0, y: -25 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' });
  }

  // 2. Eyebrow fades up (if present in Hero)
  if (eyebrow) {
    tl.fromTo(eyebrow, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4');
  }

  // 3. Heading reveals line by line using SplitType
  if (headline) {
    try {
      const splitHeadline = new SplitType(headline, { types: 'lines' });
      if (splitHeadline.lines && splitHeadline.lines.length > 0) {
        tl.fromTo(splitHeadline.lines, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.95, stagger: 0.12, ease: 'power3.out' }, '-=0.4');
      } else {
        tl.fromTo(headline, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out' }, '-=0.4');
      }
    } catch (e) {
      tl.fromTo(headline, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out' }, '-=0.4');
    }
  }

  // 4. Paragraph fades upward with slight delay
  if (paragraph) {
    tl.fromTo(paragraph, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, '-=0.5');
  }

  // 5. CTA button scales from 0.95 to 1
  if (ctaBtn && ctaBtn.length > 0) {
    tl.fromTo(ctaBtn, { opacity: 0, scale: 0.95, y: 15 }, { opacity: 1, scale: 1, y: 0, duration: 0.75, stagger: 0.1, ease: 'back.out(1.4)' }, '-=0.4');
  }

  // 6. Hero image/illustration fades in with a slight horizontal movement
  if (heroVisual) {
    tl.fromTo(heroVisual, { opacity: 0, x: 35 }, { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' }, '-=0.75');
  }



  return tl;
}

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

/**
 * Services Section Motion Engine
 *
 * Requirements:
 * Each service card:
 * • opacity 0 → 1
 * • y 40 → 0
 * • stagger 0.15s
 *
 * On hover:
 * • lift 8px
 * • soft shadow
 * • icon rotates 8 degrees
 * • CTA underline expands
 *
 * Do not use ScrollTrigger scrub.
 * Only reveal once.
 * Export initServices().
 */
export function initServices() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return null;

  gsap.registerPlugin(ScrollTrigger);

  const servicesSection = document.querySelector('#services, .services-section');
  if (!servicesSection) return null;

  const header = servicesSection.querySelector('.services-header');
  const cardsGrid = servicesSection.querySelector('.services-grid');
  const cards = gsap.utils.toArray('.service-card', servicesSection);

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
        }
      }
    );
  }

  // 2. Service Cards Reveal (opacity 0 -> 1, y 40 -> 0, stagger 0.15s, no scrub, reveal once)
  if (cards.length > 0) {
    if (!prefersReducedMotion) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsGrid || cards[0],
            start: 'top 80%',
            once: true
          }
        }
      );
    } else {
      gsap.set(cards, { opacity: 1, y: 0 });
    }

    // 3. Hover Micro-Interactions
    cards.forEach((card) => {
      const icon = card.querySelector('.service-arrow, svg, [class*="icon"]');
      const ctaLink = card.querySelector('.service-link');

      // Create CTA underline span if missing
      let underline = ctaLink ? ctaLink.querySelector('.service-cta-underline') : null;
      if (ctaLink && !underline) {
        underline = document.createElement('span');
        underline.className = 'service-cta-underline';
        underline.style.cssText = `
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1.5px;
          background-color: var(--accent, #D4AF37);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        `;
        if (getComputedStyle(ctaLink).position === 'static') {
          ctaLink.style.position = 'relative';
        }
        ctaLink.appendChild(underline);
      }

      card.addEventListener('mouseenter', () => {
        if (prefersReducedMotion) return;

        // Lift 8px & soft shadow
        gsap.to(card, {
          y: -8,
          boxShadow: '0 18px 44px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(212, 175, 55, 0.1)',
          borderColor: 'rgba(212, 175, 55, 0.5)',
          duration: 0.35,
          ease: 'power2.out'
        });

        // Icon rotates 8 degrees
        if (icon) {
          gsap.to(icon, {
            rotation: 8,
            x: 4,
            duration: 0.35,
            ease: 'power2.out'
          });
        }

        // CTA underline expands
        if (underline) {
          gsap.to(underline, {
            scaleX: 1,
            transformOrigin: 'left center',
            duration: 0.35,
            ease: 'power2.out'
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        if (prefersReducedMotion) return;

        // Reset lift & shadow
        gsap.to(card, {
          y: 0,
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          borderColor: '',
          duration: 0.35,
          ease: 'power2.out'
        });

        // Reset icon rotation
        if (icon) {
          gsap.to(icon, {
            rotation: 0,
            x: 0,
            duration: 0.35,
            ease: 'power2.out'
          });
        }

        // Reset CTA underline
        if (underline) {
          gsap.to(underline, {
            scaleX: 0,
            transformOrigin: 'right center',
            duration: 0.35,
            ease: 'power2.out'
          });
        }
      });
    });
  }

  return servicesSection;
}

/**
 * Philosophy Section Motion Engine
 *
 * Requirements:
 * SplitType headings.
 * Each pillar:
 * • reveal individually
 * • image scales slightly
 * • divider grows
 * • quote fades in
 * Keep motion elegant.
 * Do not pin.
 * Export initPhilosophy().
 */
export function initPhilosophy() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return null;

  gsap.registerPlugin(ScrollTrigger);

  const philosophySection = document.querySelector('#philosophy, .philosophy-section');
  if (!philosophySection) return null;

  // 1. Section Header & Heading with SplitType
  const mainHeading = philosophySection.querySelector('.philosophy-heading');
  const sectionTag = philosophySection.querySelector('.philosophy-tag');

  if (mainHeading && !prefersReducedMotion) {
    const tlHeader = gsap.timeline({
      scrollTrigger: {
        trigger: philosophySection,
        start: 'top 80%',
        once: true
      }
    });

    if (sectionTag) {
      tlHeader.fromTo(
        sectionTag,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        0
      );
    }

    try {
      const splitMain = new SplitType(mainHeading, { types: 'lines' });
      if (splitMain.lines && splitMain.lines.length > 0) {
        tlHeader.fromTo(
          splitMain.lines,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: 'power3.out'
          },
          sectionTag ? 0.2 : 0
        );
      } else {
        tlHeader.fromTo(
          mainHeading,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          sectionTag ? 0.2 : 0
        );
      }
    } catch (e) {
      tlHeader.fromTo(
        mainHeading,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
        sectionTag ? 0.2 : 0
      );
    }
  } else if (mainHeading) {
    gsap.set(mainHeading, { opacity: 1 });
  }

  // 2. Each Pillar Revealed Individually (No Pinning)
  const pillars = gsap.utils.toArray('.pillar-block', philosophySection);

  pillars.forEach((pillar) => {
    const divider = pillar.querySelector('.pillar-divider');
    const num = pillar.querySelector('.pillar-num');
    const svgImg = pillar.querySelector('.pillar-svg, svg, img');
    const title = pillar.querySelector('.pillar-title');
    const goldUnderline = pillar.querySelector('.gold-underline');
    const quoteDesc = pillar.querySelector('.pillar-desc');

    if (prefersReducedMotion) {
      gsap.set([pillar, divider, num, svgImg, title, goldUnderline, quoteDesc].filter(Boolean), {
        opacity: 1,
        scale: 1,
        scaleX: 1,
        y: 0
      });
      return;
    }

    const tlPillar = gsap.timeline({
      scrollTrigger: {
        trigger: pillar,
        start: 'top 82%',
        once: true
      }
    });

    // Divider grows (scaleX: 0 -> 1)
    if (divider) {
      tlPillar.fromTo(
        divider,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.85, ease: 'power3.out' },
        0
      );
    }

    // Number & Image scale slightly (opacity 0 -> 1, scale 0.9 -> 1)
    if (num) {
      tlPillar.fromTo(
        num,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        0.1
      );
    }

    if (svgImg) {
      tlPillar.fromTo(
        svgImg,
        { opacity: 0, scale: 0.9, transformOrigin: 'center center' },
        { opacity: 1, scale: 1, duration: 0.85, ease: 'power3.out' },
        0.1
      );
    }

    // Pillar Title with SplitType lines
    if (title) {
      try {
        const splitTitle = new SplitType(title, { types: 'lines' });
        if (splitTitle.lines && splitTitle.lines.length > 0) {
          tlPillar.fromTo(
            splitTitle.lines,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: 'power3.out'
            },
            0.2
          );
        } else {
          tlPillar.fromTo(
            title,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            0.2
          );
        }
      } catch (e) {
        tlPillar.fromTo(
          title,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          0.2
        );
      }
    }

    // Gold underline grows
    if (goldUnderline) {
      tlPillar.fromTo(
        goldUnderline,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.6, ease: 'power3.out' },
        0.35
      );
    }

    // Quote / Description fades in
    if (quoteDesc) {
      tlPillar.fromTo(
        quoteDesc,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        0.4
      );
    }
  });

  return philosophySection;
}

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

/**
 * Closing CTA Motion Engine
 *
 * Requirements:
 * Heading:
 * • SplitType reveal.
 * Button:
 * • fade
 * • scale
 * • glow
 * Background particles:
 * • very subtle.
 * Grain:
 * • continuous.
 * Never animate opacity to zero permanently.
 * Export initClosing().
 */
export function initClosing() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof gsap === 'undefined') return null;

  const ctaSection = document.querySelector('#inquire, .cta-section');
  if (!ctaSection) return null;

  const eyebrow = ctaSection.querySelector('.cta-eyebrow, .cta-anim-eyebrow');
  const headline = ctaSection.querySelector('.cta-headline');
  const subtext = ctaSection.querySelector('.cta-subtext, .cta-anim-subtext');
  const button = ctaSection.querySelector('.cta-btn-primary, .btn-primary');
  const friction = ctaSection.querySelector('.cta-friction');
  const grainOverlay = ctaSection.querySelector('.cta-grain-overlay');
  const particleCanvas = ctaSection.querySelector('#cta-particle-canvas');

  // 1. Continuous Grain Motion
  if (grainOverlay && !prefersReducedMotion) {
    gsap.to(grainOverlay, {
      x: 'random(-3%, 3%)',
      y: 'random(-3%, 3%)',
      duration: 2.5,
      repeat: -1,
      repeatRefresh: true,
      ease: 'none'
    });
  }

  // 2. Very Subtle Background Particles Engine
  if (particleCanvas && !prefersReducedMotion) {
    const ctx = particleCanvas.getContext('2d');
    let width = (particleCanvas.width = particleCanvas.offsetWidth || window.innerWidth);
    let height = (particleCanvas.height = particleCanvas.offsetHeight || 600);

    const resize = () => {
      width = particleCanvas.width = particleCanvas.offsetWidth || window.innerWidth;
      height = particleCanvas.height = particleCanvas.offsetHeight || 600;
    };
    window.addEventListener('resize', resize, { passive: true });

    const NUM_PARTICLES = 14;
    const particles = [];

    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2 + 0.5,
        alpha: Math.random() * 0.18 + 0.05,
        speedY: Math.random() * 0.25 + 0.08,
        sineOffset: Math.random() * Math.PI * 2,
        sineSpeed: Math.random() * 0.01 + 0.003
      });
    }

    let isVisible = false;
    let rafId = null;

    const drawParticles = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.sineOffset += p.sineSpeed;
        p.x += Math.sin(p.sineOffset) * 0.2;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        ctx.fill();
      });

      rafId = requestAnimationFrame(drawParticles);
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(drawParticles);
        }
      }, { threshold: 0 });
      obs.observe(ctaSection);
    } else {
      isVisible = true;
      drawParticles();
    }
  }

  // 3. Entrance Reveal & Motion Timeline
  if (typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ctaSection,
        start: 'top 82%',
        once: true
      }
    });

    // Eyebrow
    if (eyebrow) {
      tl.fromTo(
        eyebrow,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        0
      );
    }

    // Heading: SplitType reveal
    if (headline) {
      try {
        const splitHeading = new SplitType(headline, { types: 'lines' });
        if (splitHeading.lines && splitHeading.lines.length > 0) {
          tl.fromTo(
            splitHeading.lines,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.12,
              ease: 'power3.out'
            },
            0.15
          );
        } else {
          tl.fromTo(
            headline,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
            0.15
          );
        }
      } catch (e) {
        tl.fromTo(
          headline,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          0.15
        );
      }
    }

    // Subtext
    if (subtext) {
      tl.fromTo(
        subtext,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        0.35
      );
    }

    // Button: fade, scale, glow
    if (button) {
      tl.fromTo(
        button,
        { opacity: 0, scale: 0.94, y: 15 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: 'back.out(1.5)',
          onStart: () => {
            gsap.fromTo(
              button,
              { boxShadow: '0 0 0 rgba(212, 175, 55, 0)' },
              {
                boxShadow: '0 8px 32px rgba(212, 175, 55, 0.35)',
                duration: 0.8,
                ease: 'power2.out'
              }
            );
          },
          onComplete: () => {
            gsap.set(button, { opacity: 1, clearProps: 'transform' });
          }
        },
        0.45
      );
    }

    // Friction text
    if (friction) {
      tl.fromTo(
        friction,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        0.6
      );
    }

    // Ensure opacity is NEVER left at zero
    tl.add(() => {
      const elements = [eyebrow, headline, subtext, button, friction].filter(Boolean);
      gsap.set(elements, { opacity: 1 });
    });

  } else {
    // Fallback: Ensure opacity is never left at zero
    const elements = [eyebrow, headline, subtext, button, friction].filter(Boolean);
    gsap.set(elements, { opacity: 1, clearProps: 'transform' });
  }

  return ctaSection;
}








