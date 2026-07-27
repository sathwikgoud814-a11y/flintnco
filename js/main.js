document.addEventListener('DOMContentLoaded', () => {
  // 1. Floating Header Glass Effect on Scroll
  const header = document.getElementById('header');
  
  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  // Trigger initially in case page loads scrolled down
  handleScroll();

  // 2. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle && mobileMenu) {
    const toggleMenu = () => {
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden'; // Lock background scrolling
      } else {
        document.body.style.overflow = '';
      }
    };

    mobileToggle.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
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

    // Detect mouse move in hero area
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      
      // Calculate normalized coordinates (-1 to 1) from container center
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      
      // Max displacement parameters (12px shift in X/Y)
      mouseX = x * 12;
      mouseY = y * 12;
    });

    // Reset translation when mouse leaves hero
    hero.addEventListener('mouseleave', () => {
      mouseX = 0;
      mouseY = 0;
    });

    // High performance spring interpolation animation loop
    const animate = () => {
      // Linear interpolation (lerp) for spring dampening
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;
      
      // Rotations are proportional to translational offset
      const rotateY = currentX * 0.25;  // Max 3deg rotation
      const rotateX = -currentY * 0.25; // Max -3deg rotation
      
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
          // Once revealed, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15, // Trigger when 15% of the element is visible
      rootMargin: '0px 0px -50px 0px' // Slightly offset trigger point
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver isn't supported (force show)
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // 5. FAQ Accordion Click Handler
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close other active items to preserve layout whitespace
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        // Toggle the clicked item
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
    }
  });

  // 6. Adaptive Dark / Light Mode Switcher
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const htmlElement = document.documentElement;

  const setTheme = (isLight) => {
    if (isLight) {
      htmlElement.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
      if (themeToggleMobile) {
        const textSpan = themeToggleMobile.querySelector('.toggle-theme-text-mobile');
        if (textSpan) textSpan.textContent = 'Dark Mode';
      }
    } else {
      htmlElement.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
      if (themeToggleMobile) {
        const textSpan = themeToggleMobile.querySelector('.toggle-theme-text-mobile');
        if (textSpan) textSpan.textContent = 'Light Mode';
      }
    }
  };

  // Read initial preference
  const savedTheme = localStorage.getItem('theme');
  const userPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  
  if (savedTheme === 'light' || (!savedTheme && userPrefersLight)) {
    setTheme(true);
  } else {
    setTheme(false);
  }

  // Bind click handlers
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isCurrentlyLight = htmlElement.classList.contains('light-theme');
      setTheme(!isCurrentlyLight);
    });
  }

  if (themeToggleMobile) {
    themeToggleMobile.addEventListener('click', () => {
      const isCurrentlyLight = htmlElement.classList.contains('light-theme');
      setTheme(!isCurrentlyLight);
    });
  }
});
