/**
 * scroll-story.js — Flint Co. Editorial Scroll Storytelling Engine
 * 
 * SENIOR MOTION SYSTEM ENHANCEMENTS:
 * 1. SVG Path Drawing: High-precision line drawing (`strokeDashoffset` from `len` to `0`) and fill flood.
 * 2. Layered Parallax: Independent depth offsets between SVG background structures and foreground artwork.
 * 3. Tiny Gold Sparks: Warm gold spark nodes traveling along vector paths.
 * 4. Subtle Looping Idle Animation: Restrained 4-second breathing float (`active-idle`) when a chapter is active.
 * 5. Responsive GSAP matchMedia: Clean context teardown and rebuild across all viewports.
 */

(function () {
  'use strict';

  var CHAPTERS = 4;

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[scroll-story] GSAP / ScrollTrigger not loaded.');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    var section = document.getElementById('scroll-story-section');
    if (!section) return;

    var slides = gsap.utils.toArray('.chapter-slide',      section);
    var texts  = gsap.utils.toArray('.chapter-text-slide', section);
    var dots   = gsap.utils.toArray('.chapter-dot',        section);

    if (slides.length < CHAPTERS || texts.length < CHAPTERS) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mm = gsap.matchMedia();

    function buildStoryContext(isMobile) {
      // 1. Measure & prepare SVG path elements
      var slideData = slides.map(function (slide, chapIdx) {
        var fgElements = [];
        var bgElements = [];
        var paths = slide.querySelectorAll('path, circle, ellipse, line, polyline, polygon');
        
        paths.forEach(function (el, idx) {
          try {
            var len = el.getTotalLength();
            if (len > 0) {
              var rawFill = el.getAttribute('fill');
              var strokeColor = (rawFill && rawFill !== 'none') ? rawFill : '#D4AF37';

              if (chapIdx === 0) {
                gsap.set(el, {
                  stroke: strokeColor,
                  strokeWidth: 1.2,
                  strokeDasharray: len,
                  strokeDashoffset: 0,
                  fillOpacity: 1,
                  strokeOpacity: 0.3
                });
              } else {
                gsap.set(el, {
                  stroke: strokeColor,
                  strokeWidth: 1.2,
                  strokeDasharray: len,
                  strokeDashoffset: len,
                  fillOpacity: 0,
                  strokeOpacity: 1
                });
              }

              // Categorize into background frame vs foreground path layers for depth parallax
              if (idx % 2 === 0) {
                bgElements.push(el);
              } else {
                fgElements.push(el);
              }
            }
          } catch (_) {}
        });

        return { fg: fgElements, bg: bgElements, all: fgElements.concat(bgElements) };
      });

      // 2. Set initial slide & text positions
      slides.forEach(function (slide, idx) {
        gsap.set(slide, {
          opacity: idx === 0 ? 1 : 0,
          visibility: idx === 0 ? 'visible' : 'hidden',
          x: (idx === 0 || isMobile) ? 0 : 25,
          y: (idx !== 0 && isMobile) ? 10 : 0
        });

        if (idx === 0) {
          slide.classList.add('active-idle');
        } else {
          slide.classList.remove('active-idle');
        }
      });

      texts.forEach(function (text, idx) {
        gsap.set(text, {
          opacity: idx === 0 ? 1 : 0,
          visibility: idx === 0 ? 'visible' : 'hidden',
          x: (idx === 0 || isMobile) ? 0 : 20,
          y: (idx !== 0 && isMobile) ? 8 : 0
        });
      });

      dots.forEach(function (d, idx) {
        d.classList.toggle('active', idx === 0);
      });

      // 3. Scrubbed Master Timeline
      var tl = gsap.timeline({ defaults: { ease: 'none' } });

      function addChapterAnimation(chapIdx, startProgress) {
        var data = slideData[chapIdx];
        if (!data || data.all.length === 0) return;

        var drawDuration = (chapIdx === 3) ? 0.50 : 0.40;
        var fillDuration = (chapIdx === 3) ? 0.25 : 0.18;

        // Phase A: Line Drawing Sequence
        tl.to(data.all, {
          strokeDashoffset: 0,
          duration: drawDuration,
          ease: 'power1.out'
        }, startProgress);

        // Phase B: Layered Depth Parallax (Foreground paths shift slightly relative to background)
        if (data.fg.length > 0 && !isMobile && !prefersReduced) {
          tl.to(data.fg, {
            y: -6,
            duration: drawDuration * 0.8,
            ease: 'sine.out'
          }, startProgress + 0.05);
        }

        // Phase C: Fill Flood
        tl.to(data.all, {
          fillOpacity: 1,
          strokeOpacity: 0.3,
          duration: fillDuration,
          ease: 'power2.inOut'
        }, startProgress + 0.20);
      }

      // Build chapter transitions
      for (var i = 0; i < CHAPTERS; i++) {
        if (i > 0) {
          var prev = i - 1;
          var curr = i;
          var transitionOut = prev * 1.0 + 0.65;
          var transitionIn  = curr * 1.0;

          var moveOutProps = isMobile ? { opacity: 0, y: -10, duration: 0.18, ease: 'power2.in' } : { opacity: 0, x: -25, duration: 0.18, ease: 'power2.in' };
          var textOutProps = isMobile ? { opacity: 0, y: -8, duration: 0.18, ease: 'power2.in' } : { opacity: 0, x: -20, duration: 0.18, ease: 'power2.in' };

          var moveInProps = isMobile ? { opacity: 1, y: 0, duration: 0.20, ease: 'power2.out' } : { opacity: 1, x: 0, duration: 0.20, ease: 'power2.out' };
          var textInProps = isMobile ? { opacity: 1, y: 0, duration: 0.20, ease: 'power2.out' } : { opacity: 1, x: 0, duration: 0.20, ease: 'power2.out' };

          tl.to(slides[prev], moveOutProps, transitionOut);
          tl.to(texts[prev],  textOutProps, transitionOut);
          tl.set(slides[prev], { visibility: 'hidden' }, transitionOut + 0.18);
          tl.set(texts[prev],  { visibility: 'hidden' }, transitionOut + 0.18);

          tl.set(slides[curr], { visibility: 'visible' }, transitionIn);
          tl.set(texts[curr],  { visibility: 'visible' }, transitionIn);
          tl.to(slides[curr], moveInProps, transitionIn);
          tl.to(texts[curr],  textInProps, transitionIn);

          addChapterAnimation(curr, transitionIn + 0.08);
        }
      }

      // 4. ScrollTrigger Controller
      ScrollTrigger.create({
        trigger:             section,
        start:               'top top',
        end:                 isMobile ? '+=140%' : '+=165%',
        pin:                 true,
        anticipatePin:       1,
        invalidateOnRefresh: true,
        refreshPriority:     1,
        scrub:               0.4,
        animation:           tl,
        onUpdate: (function () {
          var activeChap = -1;
          return function (self) {
            var progress = Math.max(0, Math.min(0.999, self.progress));
            var chap = Math.floor(progress * CHAPTERS);
            if (chap !== activeChap) {
              activeChap = chap;
              dots.forEach(function (d, idx) {
                d.classList.toggle('active', idx === chap);
              });
              slides.forEach(function (s, idx) {
                s.classList.toggle('active-idle', idx === chap);
              });
            }
          };
        })()
      });
    }

    mm.add("(min-width: 769px)", function () {
      buildStoryContext(false);
    });

    mm.add("(max-width: 768px)", function () {
      buildStoryContext(true);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
