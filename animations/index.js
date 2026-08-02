import { initHeroAnimations } from './hero.js';
import { initScrollStory } from './scrollStory.js';
import { initTimeline } from './timeline.js';
import { initCaseStudy } from './caseStudy.js';
import { initServices } from './services.js';
import { initPhilosophy } from './philosophy.js';
import { initTestimonials } from './testimonials.js';
import { initFAQ } from './faq.js';
import { initClosing } from './closing.js';

// Top-Level Plugin Registration (Executes ONCE)
if (typeof window !== 'undefined' && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function runMasterAnimations() {
  // 1. Immediately initialize Critical Above-the-Fold Hero Section
  initHeroAnimations();

  // 2. Defer Below-the-Fold animation initializations to browser idle time
  // Minimizes startup main thread work and eliminates TBT (Total Blocking Time)
  const loadBelowFoldAnimations = () => {
    initScrollStory();
    initTimeline();
    initCaseStudy();
    initServices();
    initPhilosophy();
    initTestimonials();
    initFAQ();
    initClosing();
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => loadBelowFoldAnimations(), { timeout: 1000 });
  } else {
    setTimeout(loadBelowFoldAnimations, 150);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", runMasterAnimations);
  } else {
    runMasterAnimations();
  }
}

export {
  initHeroAnimations,
  initScrollStory,
  initTimeline,
  initCaseStudy,
  initServices,
  initPhilosophy,
  initTestimonials,
  initFAQ,
  initClosing
};
