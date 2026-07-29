/**
 * scroll-story.js — Flint Co. Scroll Storytelling Engine
 *
 * PERFECT EDITORIAL RHYTHM:
 * 1. Pacing & Distance: Reduced pin scroll distance from +=280% to +=165% (desktop) and +=140% (mobile).
 *    Transitions flow briskly and naturally with scroll momentum rather than trapping the user.
 * 2. Snappy Responsiveness: Reduced scrub smoothing from 0.85s to 0.4s for immediate tactile control.
 * 3. Responsive matchMedia: Clean context teardown and rebuild across all screen sizes.
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

    var mm = gsap.matchMedia();

    function buildStoryContext(isMobile) {
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

      slides.forEach(function (slide, idx) {
        gsap.set(slide, {
          opacity: idx === 0 ? 1 : 0,
          visibility: idx === 0 ? 'visible' : 'hidden',
          x: (idx === 0 || isMobile) ? 0 : 25,
          y: (idx !== 0 && isMobile) ? 10 : 0
        });
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

      var tl = gsap.timeline({ defaults: { ease: 'none' } });

      function addChapterAnimation(chapIdx, startProgress) {
        var pathEls = slideData[chapIdx];
        if (!pathEls || pathEls.length === 0) return;

        var drawDuration = (chapIdx === 3) ? 0.50 : 0.40;
        var fillDuration = (chapIdx === 3) ? 0.25 : 0.18;

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
        }, startProgress + 0.20);
      }

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
        onUpdate: function (self) {
          var progress = Math.max(0, Math.min(0.999, self.progress));
          var chap = Math.floor(progress * CHAPTERS);
          dots.forEach(function (d, idx) {
            d.classList.toggle('active', idx === chap);
          });
        }
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
