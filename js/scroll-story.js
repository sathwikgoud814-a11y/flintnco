/**
 * scroll-story.js — Flint Co. 400vh Sticky Editorial Storytelling Engine
 * 
 * Architecture:
 * 1. Wrapper height: 400vh (#scroll-story-section)
 * 2. Sticky container: .story-sticky-stage (position: sticky; top: 0; height: 100vh)
 * 3. ALL 4 scenes exist inside sticky container
 * 4. GSAP Timeline spans 0-100% of 400vh:
 *    - 0–25%: Scene 1
 *    - 25–50%: Scene 2
 *    - 50–75%: Scene 3
 *    - 75–100%: Scene 4
 * 5. Overlapping transitions between scenes
 * 6. Sticky container releases naturally after Scene 4 completes
 */

(function () {
  'use strict';

  function initScrollStory() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[scroll-story] GSAP or ScrollTrigger missing.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var wrapper = document.getElementById('scroll-story-section');
    if (!wrapper) return;

    var scenes = gsap.utils.toArray('.story-scene', wrapper);
    if (scenes.length < 4) return;

    // 1. Initial State Setup
    scenes.forEach(function (scene, i) {
      var illus = scene.querySelector('.story-illus-container');
      var text  = scene.querySelector('.story-text-block');

      gsap.set(scene, {
        visibility: 'visible',
        opacity: i === 0 ? 1 : 0
      });

      if (i === 0) {
        if (illus) gsap.set(illus, { opacity: 1, y: 0, scale: 1 });
        if (text)  gsap.set(text,  { opacity: 1, y: 0 });
      } else {
        if (illus) gsap.set(illus, { opacity: 0, y: 20, scale: 1.02 });
        if (text)  gsap.set(text,  { opacity: 0, y: 20 });
      }
    });

    // 2. GSAP Timeline mapped across 0% to 100% of 400vh scroll progress
    var tl = gsap.timeline({
      defaults: { ease: 'none' } // Continuous linear mapping for scroll scrub
    });

    var STAGGER = 0.02; // Stagger offset for text (~80ms equivalent)

    // --- SCENE 1 (0% to 25%) ---
    // Hold Scene 1 until 17% progress
    tl.to({}, { duration: 0.17 }, 0);

    // Transition Scene 1 -> Scene 2 (starts at 17%, ends at 27%)
    tl.to(scenes[0], { opacity: 0, duration: 0.10 }, 0.17);
    tl.to(scenes[0].querySelector('.story-illus-container'), { opacity: 0, y: -20, scale: 0.98, duration: 0.10 }, 0.17);
    tl.to(scenes[0].querySelector('.story-text-block'),      { opacity: 0, y: -20, scale: 0.98, duration: 0.10 }, 0.17 + STAGGER);

    // Incoming Scene 2 (starts at 21%, overlapping by 60% of transition)
    tl.to(scenes[1], { opacity: 1, duration: 0.10 }, 0.21);
    tl.to(scenes[1].querySelector('.story-illus-container'), { opacity: 1, y: 0, scale: 1.0, duration: 0.10 }, 0.21);
    tl.to(scenes[1].querySelector('.story-text-block'),      { opacity: 1, y: 0, scale: 1.0, duration: 0.10 }, 0.21 + STAGGER);

    // --- SCENE 2 (25% to 50%) ---
    // Hold Scene 2 until 42% progress
    tl.to({}, { duration: 0.11 }, 0.31);

    // Transition Scene 2 -> Scene 3 (starts at 42%, ends at 52%)
    tl.to(scenes[1], { opacity: 0, duration: 0.10 }, 0.42);
    tl.to(scenes[1].querySelector('.story-illus-container'), { opacity: 0, y: -20, scale: 0.98, duration: 0.10 }, 0.42);
    tl.to(scenes[1].querySelector('.story-text-block'),      { opacity: 0, y: -20, scale: 0.98, duration: 0.10 }, 0.42 + STAGGER);

    // Incoming Scene 3 (starts at 46%, overlapping)
    tl.to(scenes[2], { opacity: 1, duration: 0.10 }, 0.46);
    tl.to(scenes[2].querySelector('.story-illus-container'), { opacity: 1, y: 0, scale: 1.0, duration: 0.10 }, 0.46);
    tl.to(scenes[2].querySelector('.story-text-block'),      { opacity: 1, y: 0, scale: 1.0, duration: 0.10 }, 0.46 + STAGGER);

    // --- SCENE 3 (50% to 75%) ---
    // Hold Scene 3 until 67% progress
    tl.to({}, { duration: 0.11 }, 0.56);

    // Transition Scene 3 -> Scene 4 (starts at 67%, ends at 77%)
    tl.to(scenes[2], { opacity: 0, duration: 0.10 }, 0.67);
    tl.to(scenes[2].querySelector('.story-illus-container'), { opacity: 0, y: -20, scale: 0.98, duration: 0.10 }, 0.67);
    tl.to(scenes[2].querySelector('.story-text-block'),      { opacity: 0, y: -20, scale: 0.98, duration: 0.10 }, 0.67 + STAGGER);

    // Incoming Scene 4 (starts at 71%, overlapping)
    tl.to(scenes[3], { opacity: 1, duration: 0.10 }, 0.71);
    tl.to(scenes[3].querySelector('.story-illus-container'), { opacity: 1, y: 0, scale: 1.0, duration: 0.10 }, 0.71);
    tl.to(scenes[3].querySelector('.story-text-block'),      { opacity: 1, y: 0, scale: 1.0, duration: 0.10 }, 0.71 + STAGGER);

    // --- SCENE 4 (75% to 100%) ---
    // Hold Scene 4 visible for the remainder of the 400vh wrapper
    tl.to({}, { duration: 0.19 }, 0.81);

    // 3. ScrollTrigger Controller mapping the 400vh wrapper to timeline
    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      animation: tl,
      invalidateOnRefresh: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollStory);
  } else {
    initScrollStory();
  }
})();




