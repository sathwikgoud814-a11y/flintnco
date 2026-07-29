/**
 * svg-animation.js — Flint Co. Premium Editorial SVG Animations
 *
 * Handles 4 inline SVG illustrations, each with:
 *  1. Scroll-triggered stroke-dashoffset hand-draw reveal (GSAP + ScrollTrigger)
 *  2. A unique, subtle idle animation that plays after drawing completes
 *
 * SVG1 (#storefront-svg-wrapper) — Storefront
 *   Idle: Door opens 4° → holds → closes, repeats every 7s
 *
 * SVG2 (#svg2-wrapper) — Confusion / Browser Windows
 *   Idle: Question marks fade in + float 2px up/down; one browser drifts 3px; loops every 8s
 *
 * SVG3 (#svg3-wrapper) — CTA / Hand + Button
 *   Idle: Hand advances 8px, button slides 12px, gold spark appears (0.25s); plays once
 *
 * SVG4 (#svg4-wrapper) — Performance / Clock + Loading Bar + Person
 *   Idle: Clock hand rotates; loading bar fills 20% then resets; person blinks every 8s
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     SHARED CONSTANTS
  ═══════════════════════════════════════════════════════════ */
  var DRAW_DURATION  = 1.8;    // total draw sequence duration (s)
  var STAGGER_EACH   = 0.016;  // seconds between each path's start
  var DRAW_EASE      = 'power2.out';
  var SVG_W          = 1536;
  var SVG_H          = 1024;

  /* ═══════════════════════════════════════════════════════════
     UTILITY HELPERS
  ═══════════════════════════════════════════════════════════ */

  function safeLength(path) {
    try { return path.getTotalLength() || 1; } catch (e) { return 1; }
  }

  function safeBBox(path) {
    try {
      var b = path.getBBox();
      return (b && b.width >= 0) ? b : { x: 0, y: 0, width: 0, height: 0 };
    } catch (e) { return { x: 0, y: 0, width: 0, height: 0 }; }
  }

  function bboxCenter(bb) {
    return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
  }

  /* Filter paths whose bbox centre falls within a normalised zone [0–1] */
  function pathsInZone(paths, x0, x1, y0, y1, minW, maxW, minH) {
    minW = minW || 0; maxW = maxW || SVG_W; minH = minH || 0;
    return paths.filter(function (p) {
      var bb = safeBBox(p);
      var c  = bboxCenter(bb);
      return (c.x / SVG_W) >= x0 && (c.x / SVG_W) <= x1
          && (c.y / SVG_H) >= y0 && (c.y / SVG_H) <= y1
          && bb.width  >= minW && bb.width  <= maxW
          && bb.height >= minH;
    });
  }

  /* Wrap a set of paths in a <g> element for grouped transforms */
  function wrapInGroup(paths, className) {
    if (!paths || paths.length === 0) return null;
    var svg = paths[0].closest('svg');
    if (!svg) return null;
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    if (className) g.setAttribute('class', className);
    paths[0].parentNode.insertBefore(g, paths[0]);
    paths.forEach(function (p) { g.appendChild(p); });
    return g;
  }

  /* Compute the union bounding box of a <g> element */
  function groupBBox(g) {
    try { return g.getBBox(); } catch (e) { return { x: 0, y: 0, width: 0, height: 0 }; }
  }

  /* ═══════════════════════════════════════════════════════════
     CORE DRAW ANIMATION
     Called for every SVG wrapper on ScrollTrigger.
  ═══════════════════════════════════════════════════════════ */

  function initDrawAnimation(wrapperId, onComplete) {
    var wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;

    var svg = wrapper.querySelector('svg');
    if (!svg) return;

    var paths = Array.from(svg.querySelectorAll('path'));
    if (paths.length === 0) return;

    /* Pre-set all paths invisible via dashoffset */
    paths.forEach(function (p) {
      p.style.fill = 'none';
      var len = safeLength(p);
      gsap.set(p, {
        strokeDasharray:  len,
        strokeDashoffset: len,
        willChange: 'stroke-dashoffset',
      });
    });

    /* ScrollTrigger — fires once when section reaches 70% of viewport */
    var fired = false;
    ScrollTrigger.create({
      trigger: wrapper,
      start:   'top 70%',
      end:     'bottom 40%',
      once:    true,
      onEnter: function () {
        if (fired) return;
        fired = true;

        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: DRAW_DURATION,
          ease:     DRAW_EASE,
          stagger: { each: STAGGER_EACH, from: 'start' },
          onComplete: function () {
            if (typeof onComplete === 'function') {
              gsap.delayedCall(0.5, onComplete.bind(null, paths, svg));
            }
          },
        });
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SVG1 — STOREFRONT: Door Hinge Idle
  ═══════════════════════════════════════════════════════════ */

  function idleSVG1(paths, svg) {
    /* Identify door: central-lower, tall & narrow paths */
    var doorCandidates = pathsInZone(paths, 0.10, 0.58, 0.28, 0.82, 20, SVG_W * 0.30, 60);
    if (doorCandidates.length === 0) {
      /* Fallback: tallest narrow paths in lower-center */
      doorCandidates = paths
        .map(function (p) { var b = safeBBox(p); return { p: p, b: b }; })
        .filter(function (o) {
          var c = bboxCenter(o.b);
          return c.x > SVG_W * 0.15 && c.x < SVG_W * 0.55
              && c.y > SVG_H * 0.35  && c.y < SVG_H * 0.80
              && o.b.height > 60 && o.b.width < SVG_W * 0.25;
        })
        .sort(function (a, b) { return b.b.height - a.b.height; })
        .slice(0, 5)
        .map(function (o) { return o.p; });
    }

    if (doorCandidates.length === 0) return;

    var doorGroup = wrapInGroup(doorCandidates, 'svg-door-group');
    if (!doorGroup) return;

    var bb  = groupBBox(doorGroup);
    var pX  = bb.x;
    var pY  = bb.y + bb.height * 0.5;
    var org = pX + 'px ' + pY + 'px';

    function cycle() {
      gsap.timeline()
        .to(doorGroup, { rotation: 4, svgOrigin: org, duration: 0.85, ease: 'power2.inOut' })
        .to(doorGroup, { rotation: 0, svgOrigin: org, duration: 0.70, ease: 'power2.inOut', delay: 1.4 });
      gsap.delayedCall(7, cycle);
    }
    gsap.delayedCall(1, cycle);
  }

  /* ═══════════════════════════════════════════════════════════
     SVG2 — CONFUSION: Browser Windows + Question Marks
  ═══════════════════════════════════════════════════════════ */

  function idleSVG2(paths, svg) {
    /*
     * Heuristic splits:
     * — Browser windows: medium-large rectangular paths in the upper-center band
     * — Question marks: smaller curved paths, scattered across the illustration
     */

    /* Browser windows: wider paths (> 15% SVG_W), mid-height, upper half */
    var browserPaths = pathsInZone(paths, 0.05, 0.95, 0.04, 0.70, SVG_W * 0.10, SVG_W * 0.55, SVG_H * 0.06);

    /* Question marks: narrow, taller-than-wide, anywhere */
    var qPaths = paths.filter(function (p) {
      var b = safeBBox(p);
      return b.width > 5 && b.width < SVG_W * 0.08
          && b.height > 15 && b.height < SVG_H * 0.15
          && !browserPaths.includes(p);
    });

    /* Fallback: split top paths vs smaller paths */
    if (qPaths.length < 3) {
      qPaths = paths.filter(function (p) {
        var b = safeBBox(p);
        return b.width < SVG_W * 0.06 && b.height > 20;
      }).slice(0, 8);
    }

    /* Pick one browser window to drift — prefer the center-most */
    var driftTarget = null;
    if (browserPaths.length > 0) {
      var sorted = browserPaths.slice().sort(function (a, b) {
        var ca = bboxCenter(safeBBox(a));
        var cb = bboxCenter(safeBBox(b));
        return Math.abs(ca.x - SVG_W / 2) - Math.abs(cb.x - SVG_W / 2);
      });
      /* Wrap the largest browser-window candidate */
      var largest = sorted.reduce(function (acc, p) {
        var bb = safeBBox(p);
        var accBB = safeBBox(acc);
        return (bb.width * bb.height) > (accBB.width * accBB.height) ? p : acc;
      }, sorted[0]);
      var bGroup = wrapInGroup([largest], 'svg-browser-drift');
      driftTarget = bGroup;
    }

    /* Wrap question marks */
    var qGroup = (qPaths.length > 0) ? wrapInGroup(qPaths, 'svg-qmarks') : null;

    function cycle() {
      var tl = gsap.timeline();

      /* 1. Question marks: fade in if they were invisible, then float */
      if (qGroup) {
        tl.to(qGroup, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0)
          .to(qGroup, { y: -2, duration: 2.5, ease: 'sine.inOut' }, 0.6)
          .to(qGroup, { y: 0,  duration: 2.5, ease: 'sine.inOut' }, 3.1);
      }

      /* 2. One browser window drifts 3px to the right, returns */
      if (driftTarget) {
        tl.to(driftTarget, { x: 3,  duration: 2.5, ease: 'sine.inOut' }, 0.3)
          .to(driftTarget, { x: 0,  duration: 2.5, ease: 'sine.inOut' }, 2.8);
      }

      /* Repeat every 8s */
      gsap.delayedCall(8, cycle);
    }

    /* Set initial opacity on question marks to 0 so they fade in */
    if (qGroup) gsap.set(qGroup, { opacity: 0 });

    gsap.delayedCall(0.8, cycle);
  }

  /* ═══════════════════════════════════════════════════════════
     SVG3 — CTA: Hand Forward + Button Retreat + Gold Spark
  ═══════════════════════════════════════════════════════════ */

  function idleSVG3(paths, svg) {
    /*
     * Heuristic:
     * — Hand paths: organic/curved, right-of-center, mid-height
     * — Button paths: simpler, rectangular, left-of-center or right
     *   (depends on illustration — we'll pick the densest cluster on each side)
     */

    var midX = SVG_W / 2;
    var midY = SVG_H / 2;

    /* Right side: likely the hand */
    var rightPaths = pathsInZone(paths, 0.45, 1.0, 0.25, 0.85, 10, SVG_W * 0.4, 20);

    /* Left side: likely the button or CTA element */
    var leftPaths  = pathsInZone(paths, 0.0,  0.55, 0.25, 0.85, 30, SVG_W * 0.35, 20);

    /* If both sides are empty, split by X median */
    var allX = paths.map(function (p) { return bboxCenter(safeBBox(p)).x; });
    allX.sort(function (a, b) { return a - b; });
    var medX = allX[Math.floor(allX.length / 2)] || midX;

    if (rightPaths.length < 3) {
      rightPaths = paths.filter(function (p) { return bboxCenter(safeBBox(p)).x > medX; });
    }
    if (leftPaths.length < 3) {
      leftPaths  = paths.filter(function (p) { return bboxCenter(safeBBox(p)).x <= medX; });
    }

    var handGroup   = wrapInGroup(rightPaths, 'svg-hand-group');
    var buttonGroup = wrapInGroup(leftPaths,  'svg-button-group');

    /* Find the gap between hand and button for spark placement */
    var sparkX = SVG_W / 2, sparkY = SVG_H * 0.55;
    if (handGroup && buttonGroup) {
      var hbb = groupBBox(handGroup);
      var bbb = groupBBox(buttonGroup);
      sparkX = (hbb.x + bbb.x + bbb.width) / 2;
      sparkY = (hbb.y + hbb.height / 2 + bbb.y + bbb.height / 2) / 2;
    } else if (handGroup) {
      var hbb2 = groupBBox(handGroup);
      sparkX = hbb2.x;
      sparkY = hbb2.y + hbb2.height / 2;
    }

    /* Create spark element (tiny circle) */
    var spark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    spark.setAttribute('cx', sparkX);
    spark.setAttribute('cy', sparkY);
    spark.setAttribute('r', '4');
    spark.setAttribute('class', 'svg-gold-spark');
    svg.appendChild(spark);

    /* Apply spark styles */
    spark.style.fill            = 'var(--accent, #D4AF37)';
    spark.style.stroke          = 'none';
    spark.style.opacity         = '0';
    spark.style.pointerEvents   = 'none';

    /* One-shot animation: plays once, then stops */
    var tl = gsap.timeline({ delay: 0.3 });

    /* Hand moves forward */
    if (handGroup) {
      tl.to(handGroup, { x: 8, duration: 0.45, ease: 'power2.out' }, 0);
    }

    /* Button slides away at the same time */
    if (buttonGroup) {
      tl.to(buttonGroup, { x: 12, duration: 0.45, ease: 'power2.out' }, 0);
    }

    /* Gold spark: scale up then fade out in 0.25s */
    tl.fromTo(spark,
      { opacity: 0, scale: 0,   transformOrigin: '50% 50%' },
      { opacity: 1, scale: 1.6, duration: 0.1, ease: 'power3.out' },
      0.2
    )
    .to(spark,
      { opacity: 0, scale: 0,   duration: 0.15, ease: 'power2.in' },
      0.3
    );

    /* After spark: everything stays still — no loop */
  }

  /* ═══════════════════════════════════════════════════════════
     SVG4 — PERFORMANCE: Clock + Loading Bar + Person Blink
  ═══════════════════════════════════════════════════════════ */

  function idleSVG4(paths, svg) {
    /*
     * Heuristics:
     * — Clock face: circular cluster of paths in a mid-left or mid zone
     * — Clock hand: thin/short path that passes near a circular center
     * — Loading bar: very wide, very thin path in lower portion
     * — Eyes/face: tiny paths clustered together (for blink)
     */

    /* ─ Clock identification ─────────────────────────────────
       Sort paths by how "centred" they are around a focal point.
       The clock occupies a roughly circular zone.
    */
    var clockZone = pathsInZone(paths, 0.03, 0.55, 0.08, 0.80, 2, SVG_W * 0.25, 2);

    /* Clock hand: the thinnest/shortest path near the clock center */
    var clockHand = null;
    if (clockZone.length > 0) {
      /* find the center of the clock cluster */
      var clusterCx = 0, clusterCy = 0;
      clockZone.forEach(function (p) {
        var c = bboxCenter(safeBBox(p));
        clusterCx += c.x; clusterCy += c.y;
      });
      clusterCx /= clockZone.length;
      clusterCy /= clockZone.length;

      /* Hand: path whose bbox is narrow (both dims < 20% SVG_W) and close to cluster center */
      var handCandidates = clockZone.filter(function (p) {
        var b  = safeBBox(p);
        var c  = bboxCenter(b);
        var dx = c.x - clusterCx;
        var dy = c.y - clusterCy;
        return b.width < SVG_W * 0.12 && b.height < SVG_H * 0.35
            && Math.sqrt(dx * dx + dy * dy) < SVG_W * 0.12;
      });
      if (handCandidates.length > 0) {
        clockHand = handCandidates.reduce(function (acc, p) {
          return (safeBBox(p).width < safeBBox(acc).width) ? p : acc;
        });
      }
    }

    /* Loading bar: very wide (> 25% SVG_W), thin (< 5% SVG_H), lower portion */
    var loadingBarPath = null;
    var barCandidates = pathsInZone(paths, 0.05, 0.95, 0.55, 1.0, SVG_W * 0.25, SVG_W * 0.90, 2);
    if (barCandidates.length > 0) {
      /* pick the thinnest one */
      loadingBarPath = barCandidates.reduce(function (acc, p) {
        return (safeBBox(p).height < safeBBox(acc).height) ? p : acc;
      });
    }

    /* Eye paths: tiny paths in a face-zone (upper-center or wherever the person is) */
    var eyePaths = pathsInZone(paths, 0.45, 0.95, 0.10, 0.55, 2, SVG_W * 0.06, 2)
      .filter(function (p) {
        var b = safeBBox(p);
        return b.width < SVG_W * 0.05 && b.height < SVG_H * 0.06;
      })
      .slice(0, 4);

    /* ─ Clock hand rotation ───────────────────────────────── */
    if (clockHand) {
      var hBB  = safeBBox(clockHand);
      var pivX = hBB.x;                    // hinge at base of hand
      var pivY = hBB.y + hBB.height;       // bottom of hand = clock center
      var handOrg = pivX + 'px ' + pivY + 'px';

      var handGroup = wrapInGroup([clockHand], 'svg-clock-hand');
      if (handGroup) {
        gsap.to(handGroup, {
          rotation: 360,
          svgOrigin: handOrg,
          duration: 8,
          ease: 'none',
          repeat: -1,
        });
      }
    }

    /* ─ Loading bar fill loop ─────────────────────────────── */
    if (loadingBarPath) {
      var barBB  = safeBBox(loadingBarPath);
      var barLen = safeLength(loadingBarPath);

      /* We'll simulate a fill by animating dashoffset backward */
      gsap.set(loadingBarPath, {
        strokeDasharray:  barLen,
        strokeDashoffset: barLen,
      });

      function fillLoop() {
        gsap.timeline()
          .to(loadingBarPath, {
            strokeDashoffset: barLen * 0.80,  /* fill ~20% */
            duration: 1.8,
            ease: 'power1.out',
          })
          .to(loadingBarPath, {
            strokeDashoffset: barLen,
            duration: 0.6,
            ease: 'power2.in',
            delay: 1.2,
          })
          .call(function () { gsap.delayedCall(1, fillLoop); });
      }
      gsap.delayedCall(0.8, fillLoop);
    }

    /* ─ Eye blink every 8 seconds ────────────────────────── */
    if (eyePaths.length > 0) {
      var eyeGroup = wrapInGroup(eyePaths, 'svg-eye-group');
      if (eyeGroup) {
        function blink() {
          gsap.timeline()
            .to(eyeGroup, { scaleY: 0.05, transformOrigin: '50% 50%', duration: 0.07, ease: 'power2.in' })
            .to(eyeGroup, { scaleY: 1,    transformOrigin: '50% 50%', duration: 0.10, ease: 'power2.out' });
          gsap.delayedCall(8, blink);
        }
        gsap.delayedCall(3, blink);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════
     REGISTRY & BOOT
  ═══════════════════════════════════════════════════════════ */

  var SVG_REGISTRY = [
    { id: 'storefront-svg-wrapper', idle: idleSVG1 },
    { id: 'svg2-wrapper',           idle: idleSVG2 },
    { id: 'svg3-wrapper',           idle: idleSVG3 },
    { id: 'svg4-wrapper',           idle: idleSVG4 },
  ];

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[svg-animation] GSAP or ScrollTrigger not available.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    SVG_REGISTRY.forEach(function (entry) {
      initDrawAnimation(entry.id, entry.idle);
    });
  }

  /* Boot */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
