/**
 * scrollStory.js — Flint Co. Editorial Storytelling Engine
 *
 * Desktop (> 860px): Pinned 400vh sticky crossfade timeline.
 * Mobile (<= 860px): Clean, continuous unpinned vertical editorial flow with zero extra whitespace, zero duplicate pinning, and no stuck scenes.
 */

export function initScrollStory() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return null;
  }

  gsap.registerPlugin(ScrollTrigger);

  const wrapper = document.getElementById('scroll-story-section');
  if (!wrapper) return null;

  const stickyStage = wrapper.querySelector('.story-sticky-stage') || wrapper;

  // Clean up existing ScrollTriggers on this section
  ScrollTrigger.getAll().forEach((st) => {
    if (st.trigger === wrapper || st.trigger === stickyStage) {
      st.kill();
    }
  });

  const scenes = gsap.utils.toArray('.story-scene', wrapper);
  if (scenes.length === 0) return null;

  const isMobile = window.matchMedia('(max-width: 860px)').matches;

  // MOBILE: Unpinned clean vertical flow (eliminates 400vh white space & scene 4 repeating bug)
  if (isMobile) {
    gsap.set(wrapper, { clearProps: 'height' });
    gsap.set(stickyStage, { clearProps: 'all' });
    scenes.forEach((scene) => {
      gsap.set(scene, { autoAlpha: 1, clearProps: 'transform,opacity,visibility' });
      const illus = scene.querySelector('.story-illus-container');
      const eyebrow = scene.querySelector('.story-eyebrow');
      const heading = scene.querySelector('.story-heading');
      const body = scene.querySelector('.story-body');
      if (illus) gsap.set(illus, { autoAlpha: 1, clearProps: 'transform,opacity,visibility' });
      if (eyebrow) gsap.set(eyebrow, { autoAlpha: 1, clearProps: 'transform,opacity,visibility' });
      if (heading) gsap.set(heading, { autoAlpha: 1, clearProps: 'transform,opacity,visibility' });
      if (body) gsap.set(body, { autoAlpha: 1, clearProps: 'transform,opacity,visibility' });
    });
    return null;
  }

  // DESKTOP: Initial State Setup using autoAlpha (no display:none)
  scenes.forEach((scene, i) => {
    const illus = scene.querySelector('.story-illus-container');
    const eyebrow = scene.querySelector('.story-eyebrow');
    const heading = scene.querySelector('.story-heading');
    const body = scene.querySelector('.story-body');

    if (i === 0) {
      gsap.set(scene, { autoAlpha: 1 });
      if (illus) gsap.set(illus, { autoAlpha: 1, y: 0, scale: 1 });
      if (eyebrow) gsap.set(eyebrow, { autoAlpha: 1, y: 0 });
      if (heading) gsap.set(heading, { autoAlpha: 1, y: 0 });
      if (body) gsap.set(body, { autoAlpha: 1, y: 0 });
    } else {
      gsap.set(scene, { autoAlpha: 0 });
      if (illus) gsap.set(illus, { autoAlpha: 0, y: 24, scale: 1.02 });
      if (eyebrow) gsap.set(eyebrow, { autoAlpha: 0, y: 16 });
      if (heading) gsap.set(heading, { autoAlpha: 0, y: 20 });
      if (body) gsap.set(body, { autoAlpha: 0, y: 20 });
    }
  });

  // Timeline mapped across scrubbed scroll progress
  const tl = gsap.timeline({
    defaults: { ease: 'power1.inOut' }
  });

  const totalScenes = scenes.length;
  const holdDuration = 1.0;
  const transDuration = 0.8;

  for (let i = 0; i < totalScenes - 1; i++) {
    const currScene = scenes[i];
    const nextScene = scenes[i + 1];

    const currIllus = currScene.querySelector('.story-illus-container');
    const currEyebrow = currScene.querySelector('.story-eyebrow');
    const currHeading = currScene.querySelector('.story-heading');
    const currBody = currScene.querySelector('.story-body');

    const nextIllus = nextScene.querySelector('.story-illus-container');
    const nextEyebrow = nextScene.querySelector('.story-eyebrow');
    const nextHeading = nextScene.querySelector('.story-heading');
    const nextBody = nextScene.querySelector('.story-body');

    // Hold current scene
    tl.to({}, { duration: holdDuration });

    const transTime = tl.duration();

    // Crossfade Out Outgoing Scene Components
    if (currIllus) {
      tl.to(currIllus, { autoAlpha: 0, y: -20, scale: 0.98, duration: transDuration }, transTime);
    }
    if (currHeading) {
      tl.to(currHeading, { autoAlpha: 0, y: -15, duration: transDuration }, transTime);
    }
    if (currBody) {
      tl.to(currBody, { autoAlpha: 0, y: -15, duration: transDuration }, transTime);
    }
    if (currEyebrow) {
      tl.to(currEyebrow, { autoAlpha: 0, y: -10, duration: transDuration }, transTime);
    }
    tl.to(currScene, { autoAlpha: 0, duration: transDuration }, transTime);

    // Crossfade In Incoming Scene Components
    tl.to(nextScene, { autoAlpha: 1, duration: transDuration }, transTime);
    if (nextIllus) {
      tl.to(nextIllus, { autoAlpha: 1, y: 0, scale: 1, duration: transDuration }, transTime);
    }
    if (nextEyebrow) {
      tl.to(nextEyebrow, { autoAlpha: 1, y: 0, duration: transDuration }, transTime);
    }
    if (nextHeading) {
      tl.to(nextHeading, { autoAlpha: 1, y: 0, duration: transDuration }, transTime + 0.08);
    }
    if (nextBody) {
      tl.to(nextBody, { autoAlpha: 1, y: 0, duration: transDuration }, transTime + 0.15);
    }
  }

  // Hold final scene
  tl.to({}, { duration: holdDuration });

  // ScrollTrigger Controller
  ScrollTrigger.create({
    trigger: wrapper,
    start: 'top top',
    end: 'bottom bottom',
    pin: stickyStage,
    scrub: 1,
    animation: tl,
    invalidateOnRefresh: true
  });

  return tl;
}
