import { initHeroAnimations } from './hero.js';
import { initScrollStory } from './scrollStory.js';
import { initTimeline } from './timeline.js';
import { initCaseStudy } from './caseStudy.js';
import { initServices } from './services.js';
import { initPhilosophy } from './philosophy.js';
import { initTestimonials } from './testimonials.js';
import { initFAQ } from './faq.js';
import { initClosing } from './closing.js';

function runMasterAnimations() {
  initHeroAnimations();
  initScrollStory();
  initTimeline();
  initCaseStudy();
  initServices();
  initPhilosophy();
  initTestimonials();
  initFAQ();
  initClosing();

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", () => {
    runMasterAnimations();
  });
} else {
  runMasterAnimations();
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
