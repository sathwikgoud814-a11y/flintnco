/**
 * scroll-story.js — Flint Co. Scroll Storytelling Engine
 *
 * ROOT-CAUSE ARCHITECTURE:
 * Uses GSAP `matchMedia()` to bind desktop & mobile contexts separately.
 * When the window resizes or crosses breakpoints, GSAP automatically reverts inline styles,
 * purges stale timelines, re-measures SVG path lengths, and rebuilds fresh timelines.
 */

(function () {
  'use strict';

  var CHAPTERS = 4;
  var SCRUB    = 0.85;

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

    // Use GSAP's native responsive matchMedia engine
    var mm = gsap.matchMedia();

    // Helper: Build timeline & ScrollTrigger for a specific mobile/desktop context
    function buildStoryContext(isMobile) {
      // 1. Measure SVG path lengths dynamically for current screen width
      var slideData = slides.map(function (slide, chapIdx) {
        var elements = [];
        var paths = slide.querySelectorAll('path, circle, ellipse, line, polyline, polygon');
        paths.forEach(function (el) {
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

              elements.push(el);
            }
          } catch (_) {}
        });
        return elements;
      });

      // 2. Set initial slide states
      slides.forEach(function (slide, idx) {
        gsap.set(slide, {
          opacity: idx === 0 ? 1 : 0,
          visibility: idx === 0 ? 'visible' : 'hidden',
          x: (idx === 0 || isMobile) ? 0 : 30,
          y: (idx !== 0 && isMobile) ? 12 : 0
        });
      });

      texts.forEach(function (text, idx) {
        gsap.set(text, {
          opacity: idx === 0 ? 1 : 0,
          visibility: idx === 0 ? 'visible' : 'hidden',
          x: (idx === 0 || isMobile) ? 0 : 25,
          y: (idx !== 0 && isMobile) ? 10 : 0
        });
      });

      dots.forEach(function (d, idx) {
        d.classList.toggle('active', idx === 0);
      });

      // 3. Master Scrubbed Timeline
      var tl = gsap.timeline({ defaults: { ease: 'none' } });

      function addChapterAnimation(chapIdx, startProgress) {
        var pathEls = slideData[chapIdx];
        if (!pathEls || pathEls.length === 0) return;

        var drawDuration = (chapIdx === 3) ? 0.55 : 0.45;
        var fillDuration = (chapIdx === 3) ? 0.30 : 0.20;

        tl.to(pathEls, {
          strokeDashoffset: 0,
          duration: drawDuration,
          ease: 'power1.out'
        }, startProgress);

        tl.to(pathEls, {
          fillOpacity: 1,
          strokeOpacity: 0.3,
          duration: fillDuration,
          ease: 'power2.inOut'
        }, startProgress + 0.25);
      }

      for (var i = 0; i < CHAPTERS; i++) {
        if (i > 0) {
          var prev = i - 1;
          var curr = i;
          var transitionOut = prev * 1.0 + 0.70;
          var transitionIn  = curr * 1.0;

          var moveOutProps = isMobile ? { opacity: 0, y: -12, duration: 0.20, ease: 'power2.in' } : { opacity: 0, x: -30, duration: 0.20, ease: 'power2.in' };
          var textOutProps = isMobile ? { opacity: 0, y: -10, duration: 0.20, ease: 'power2.in' } : { opacity: 0, x: -25, duration: 0.20, ease: 'power2.in' };

          var moveInProps = isMobile ? { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' } : { opacity: 1, x: 0, duration: 0.22, ease: 'power2.out' };
          var textInProps = isMobile ? { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' } : { opacity: 1, x: 0, duration: 0.22, ease: 'power2.out' };

          tl.to(slides[prev], moveOutProps, transitionOut);
          tl.to(texts[prev],  textOutProps, transitionOut);
          tl.set(slides[prev], { visibility: 'hidden' }, transitionOut + 0.20);
          tl.set(texts[prev],  { visibility: 'hidden' }, transitionOut + 0.20);

          tl.set(slides[curr], { visibility: 'visible' }, transitionIn);
          tl.set(texts[curr],  { visibility: 'visible' }, transitionIn);
          tl.to(slides[curr], moveInProps, transitionIn);
          tl.to(texts[curr],  textInProps, transitionIn);

          addChapterAnimation(curr, transitionIn + 0.10);
        }
      }

      // 4. ScrollTrigger Controller
      ScrollTrigger.create({
        trigger:             section,
        start:               'top top',
        end:                 '+=280%',
        pin:                 true,
        anticipatePin:       1,
        invalidateOnRefresh: true,
        refreshPriority:     1,
        scrub:               SCRUB,
        animation:           tl,
        onUpdate: function (self) {
          var progress = Math.max(0, Math.min(0.999, self.progress));
          var chap = Math.floor(progress * CHAPTERS);
          dots.forEach(function (d, idx) {
            d.classList.toggle('active', idx === chap);
          });
        }
      });
    }

    // Register Desktop Match
    mm.add("(min-width: 769px)", function () {
      buildStoryContext(false);
    });

    // Register Mobile Match
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
