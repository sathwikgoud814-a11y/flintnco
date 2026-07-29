import './scroll-story.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Adaptive Navigation Bar (Light Paper State & Dark CTA Transition)
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

  // IntersectionObserver: Toggles .navbar-dark smoothly when 45% of CTA section enters/leaves viewport
  if (ctaSection && header && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          header.classList.add('navbar-dark');
        } else {
          header.classList.remove('navbar-dark');
        }
      });
    }, {
      threshold: 0.45
    });

    navObserver.observe(ctaSection);
  }

  // 2. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle && mobileMenu) {
    const toggleMenu = () => {
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };

    mobileToggle.addEventListener('click', toggleMenu);

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // 3. Floating Mockup 3D Mouse Parallax (Apple/Linear spring effect)
  const hero = document.getElementById('hero');
  const browser = document.getElementById('parallax-browser');

  if (hero && browser) {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      mouseX = x * 12;
      mouseY = y * 12;
    });

    hero.addEventListener('mouseleave', () => {
      mouseX = 0;
      mouseY = 0;
    });

    const animate = () => {
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;
      const rotateY = currentX * 0.25;
      const rotateX = -currentY * 0.25;
      browser.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      requestAnimationFrame(animate);
    };

    animate();
  }

  // 4. Scroll Reveal Intersection Observer
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // 5. FAQ Accordion Click Handler
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
      });
    }
  });

  // 6. "FORGED FLINT" NATURAL FRACTURE TRANSITION & STAGGERED CTA REVEAL
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    if (ctaSection) {
      // Timeline 1: Forged Flint Fracture Line Draw & 8-16px Gap Separation (Scrubbed with Scroll)
      const fractureTl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaSection,
          start: 'top 88%',
          end: 'top 40%',
          scrub: 0.6
        }
      });

      // 1. Single Thin Fracture Line Draws Across 85% Viewport
      fractureTl.fromTo('.flint-crack-base',
        { strokeDashoffset: 1000 },
        { strokeDashoffset: 0, duration: 0.4, ease: 'power1.out' }
      );

      fractureTl.fromTo('.flint-crack-highlight',
        { strokeDashoffset: 1000 },
        { strokeDashoffset: 0, duration: 0.4, ease: 'power1.out' },
        '-=0.3'
      );

      // 2. Tiny Sparks (4 warm gold sparks) travel & fade naturally along fracture
      fractureTl.fromTo('.flint-spark',
        { opacity: 0, x: -10 },
        { opacity: 0.9, x: 20, duration: 0.25, stagger: 0.05, ease: 'power2.out' },
        '-=0.2'
      ).to('.flint-spark',
        { opacity: 0, duration: 0.2 },
        '-=0.05'
      );

      // 3. Controlled Fracture Separation (Max opening 12px)
      fractureTl.to('.flint-gap-reveal',
        { height: 12, duration: 0.35, ease: 'power2.out' },
        '-=0.15'
      );

      // Timeline 2: Staggered CTA Reveal (Triggers when ~70% of dark section is visible)
      const ctaTl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaSection,
          start: 'top 30%', // Triggers when ~70% of dark section enters
          toggleActions: 'play none none reverse'
        }
      });

      // READY TO START Eyebrow
      ctaTl.fromTo('.cta-anim-eyebrow',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );

      // Headline Text (Opacity 0->1, translateY 30px->0, 0.8s)
      ctaTl.fromTo('.cta-white-text',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
        '-=0.3'
      );

      // Gold Accent Words (120ms later)
      ctaTl.fromTo('.cta-gold-text',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
        '-=0.68'
      );

      // Supporting Copy
      ctaTl.fromTo('.cta-anim-subtext',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      );

      // CTA Button
      ctaTl.fromTo('.cta-anim-btn',
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)' },
        '-=0.3'
      );
    }
  }

  // 7. WARM GOLD PARTICLES DRIFTING INSIDE FORGED DARK SURFACE (#cta-particle-canvas)
  const particleCanvas = document.getElementById('cta-particle-canvas');
  if (particleCanvas) {
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

  // 8. INTERACTIVE CASE STUDY VISUAL STORYTELLER (Problem -> Strategy -> Execution -> Outcome)
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
});
