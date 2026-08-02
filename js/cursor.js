/**
 * Flint Co. Handcrafted Luxury Custom Cursor Engine
 * 
 * Features:
 * - Deterministic, race-condition-free state switching.
 * - Enhanced contrast rim & champagne gold hairline crack (#C8A03A) for 100% visibility on both light & dark sections.
 * - 4 States: Default, Hover Button (1.12x + 400ms shimmer sweep), Scrolling Compress (0.95x), Text I-Beam Caret.
 * - Click Micro-Physics: MouseDown 0.92x compress -> Crack illuminate -> 2-3 micro sparks -> Soft spring release.
 * - Desktop fine-pointer isolation, prefers-reduced-motion check, 60 FPS GPU transform.
 */

export function initFlintCursor() {
  // 1. Accessibility & Device Environment Guard (Disable entirely on touch devices)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;

  if (prefersReducedMotion || !isFinePointer || isTouchDevice || typeof gsap === 'undefined') {
    document.documentElement.classList.remove('has-custom-cursor');
    document.body.classList.remove('has-custom-cursor');
    const existing = document.getElementById('flint-cursor');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
    return null;
  }

  // 2. Strict Singleton Instance Cleanup
  const existingCursor = document.getElementById('flint-cursor');
  if (existingCursor && existingCursor.parentNode) {
    existingCursor.parentNode.removeChild(existingCursor);
  }

  // 3. Inject Cursor Container
  const cursorContainer = document.createElement('div');
  cursorContainer.id = 'flint-cursor';
  cursorContainer.className = 'flint-cursor-wrapper';
  cursorContainer.setAttribute('aria-hidden', 'true');

  cursorContainer.innerHTML = `
    <div class="flint-cursor-inner">
      <svg class="flint-cursor-svg" width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
        <defs>
          <!-- Slate Stone Facet Gradients with High-Contrast Edge Bevels -->
          <linearGradient id="flintSlateMain" x1="0" y1="0" x2="18" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#2D2D2D" />
            <stop offset="50%" stop-color="#222222" />
            <stop offset="100%" stop-color="#181818" />
          </linearGradient>

          <linearGradient id="flintSlateLight" x1="0" y1="0" x2="11.5" y2="7.5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#444444" />
            <stop offset="100%" stop-color="#2A2A2A" />
          </linearGradient>

          <!-- Luxury Watch Gold Sweep Gradient (#C8A03A) -->
          <linearGradient id="flintLuxuryGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop id="shimmerStop1" offset="0%" stop-color="#C8A03A" stop-opacity="0.85" />
            <stop id="shimmerStop2" offset="40%" stop-color="#E2BE66" stop-opacity="1" />
            <stop id="shimmerStop3" offset="85%" stop-color="#C8A03A" stop-opacity="0.85" />
          </linearGradient>
        </defs>

        <!-- State 1, 2, 3: Chipped Flint Pointer Silhouette with Crisp Contrast Rim (#666666) -->
        <g class="flint-pointer-group">
          <!-- Main Slate Body with High-Contrast Outer Rim Stroke -->
          <path class="flint-main-body" d="M 0 0 L 11.5 7.5 L 11 8.2 L 7.5 9.8 L 12.5 13 L 9.2 13.8 L 6.5 19.5 L 5 13.2 L 0 13.5 Z" fill="url(#flintSlateMain)" stroke="#666666" stroke-width="0.65" stroke-linejoin="round" />
          <!-- Upper Bevel Facet -->
          <path d="M 0 0 L 11.5 7.5 L 7.5 9.8 Z" fill="url(#flintSlateLight)" opacity="0.9" />
          <!-- Left Rear Chipped Shadow Facet -->
          <path d="M 0 0 L 7.5 9.8 L 5 13.2 L 0 13.5 Z" fill="#141414" opacity="0.9" />
          <!-- Inset Depth Line -->
          <path d="M 7.5 9.8 L 5 13.2 L 9.2 13.8" stroke="#101010" stroke-width="0.6" fill="none" opacity="0.75" />
          <!-- Top Edge Matte Highlight Line (Crisp White-Gold Contrast Edge) -->
          <path class="flint-top-edge" d="M 0 0 L 11.5 7.5" stroke="#7A7A7A" stroke-width="0.75" stroke-linecap="round" />

          <!-- Asymmetrical Hairline Fracture (#C8A03A) + Micro Branch -->
          <path class="flint-crack-main" d="M 3 5 L 5.5 8.5 L 5 9.5 L 8.5 11.5" stroke="url(#flintLuxuryGoldGrad)" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85" />
          <path class="flint-crack-branch" d="M 5.5 8.5 L 8 8" stroke="url(#flintLuxuryGoldGrad)" stroke-width="0.65" stroke-linecap="round" fill="none" opacity="0.75" />
        </g>

        <!-- State 4: Slim Flint I-Beam Caret -->
        <g class="flint-ibeam-group" style="display: none; opacity: 0;">
          <!-- Top Serif Bar -->
          <path d="M 6.5 1 L 11.5 1" stroke="#777777" stroke-width="0.85" stroke-linecap="round" />
          <!-- Center Slate Stem -->
          <path d="M 9 1 L 9 17" stroke="url(#flintSlateMain)" stroke-width="2.0" stroke-linecap="square" />
          <path d="M 8.1 1 L 8.1 17" stroke="#555555" stroke-width="0.5" />
          <!-- Gold Hairline Fracture Running Down Stem -->
          <path d="M 9 3 L 9 15" stroke="url(#flintLuxuryGoldGrad)" stroke-width="0.75" stroke-linecap="round" opacity="0.9" />
          <!-- Bottom Serif Bar -->
          <path d="M 6.5 17 L 11.5 17" stroke="#777777" stroke-width="0.85" stroke-linecap="round" />
        </g>
      </svg>
    </div>

    <!-- Sparks Container -->
    <div class="flint-sparks-container"></div>
  `;

  document.body.appendChild(cursorContainer);
  document.documentElement.classList.add('has-custom-cursor');
  document.body.classList.add('has-custom-cursor');

  // 4. State Variables & Elements
  const cursorInner = cursorContainer.querySelector('.flint-cursor-inner');
  const pointerGroup = cursorContainer.querySelector('.flint-pointer-group');
  const ibeamGroup = cursorContainer.querySelector('.flint-ibeam-group');
  const crackMain = cursorContainer.querySelector('.flint-crack-main');
  const crackBranch = cursorContainer.querySelector('.flint-crack-branch');
  const sparkContainer = cursorContainer.querySelector('.flint-sparks-container');
  const shimmerStop1 = cursorContainer.querySelector('#shimmerStop1');
  const shimmerStop2 = cursorContainer.querySelector('#shimmerStop2');
  const shimmerStop3 = cursorContainer.querySelector('#shimmerStop3');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  let currentState = 'default';
  let isScrolling = false;
  let isMouseDown = false;
  let scrollTimer = null;
  let shimmerTween = null;

  // 5. GSAP Position Interpolation (0.42 lerp factor for instant mouse tracking)
  const xSetter = gsap.quickSetter(cursorContainer, 'x', 'px');
  const ySetter = gsap.quickSetter(cursorContainer, 'y', 'px');

  function updatePosition() {
    const lerpFactor = 0.42;
    currentX += (mouseX - currentX) * lerpFactor;
    currentY += (mouseY - currentY) * lerpFactor;

    xSetter(currentX);
    ySetter(currentY);
  }

  gsap.ticker.add(updatePosition);

  const onMouseMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  gsap.set(cursorContainer, {
    x: mouseX,
    y: mouseY,
    force3D: true,
    rotation: 0
  });

  // 6. Target State Classifier & Deterministic Renderer
  function getTargetState(target) {
    if (isScrolling) return 'scroll';
    if (!target || !target.closest) return 'default';

    if (target.closest('button, .btn, .cta-button, [role="button"], input[type="submit"], input[type="button"], .mobile-menu-btn')) {
      return 'button';
    }

    if (target.closest('a, .nav-link, .footer-nav-link')) {
      return 'button';
    }

    if (target.closest('p, h1, h2, h3, h4, h5, h6, label, input[type="text"], input[type="email"], textarea')) {
      return 'text';
    }

    return 'default';
  }

  function renderState(nextState) {
    if (currentState === nextState && !isMouseDown) return;
    currentState = nextState;

    // Synchronous, race-condition-free group switching
    if (nextState === 'text') {
      pointerGroup.style.display = 'none';
      pointerGroup.style.opacity = '0';
      ibeamGroup.style.display = 'block';
      ibeamGroup.style.opacity = '1';
    } else {
      ibeamGroup.style.display = 'none';
      ibeamGroup.style.opacity = '0';
      pointerGroup.style.display = 'block';
      pointerGroup.style.opacity = '1';
    }

    let targetScale = 1.0;
    let crackOpacity = 0.85;

    switch (nextState) {
      case 'button':
        targetScale = 1.12;
        crackOpacity = 1.0;

        if (shimmerStop1 && shimmerStop2 && shimmerStop3) {
          if (shimmerTween) shimmerTween.kill();
          const shimmerObj = { pos: -30 };
          shimmerTween = gsap.to(shimmerObj, {
            pos: 130,
            duration: 0.4,
            repeat: 0,
            ease: 'power1.inOut',
            onUpdate: () => {
              const p = shimmerObj.pos;
              shimmerStop1.setAttribute('offset', `${Math.max(0, p - 30)}%`);
              shimmerStop2.setAttribute('offset', `${Math.min(100, Math.max(0, p))}%`);
              shimmerStop3.setAttribute('offset', `${Math.min(100, p + 30)}%`);
            }
          });
        }
        break;

      case 'scroll':
        targetScale = 0.95;
        crackOpacity = 0.75;
        break;

      case 'text':
        targetScale = 1.0;
        crackOpacity = 0.85;
        break;

      case 'default':
      default:
        targetScale = 1.0;
        crackOpacity = 0.85;
        break;
    }

    if (!isMouseDown) {
      gsap.to(cursorInner, {
        scale: targetScale,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      gsap.to([crackMain, crackBranch], {
        opacity: crackOpacity,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  }

  // Mouse Over / Out Handlers
  const onMouseOver = (e) => {
    const nextState = getTargetState(e.target);
    renderState(nextState);
  };

  const onMouseOut = (e) => {
    const nextState = getTargetState(e.relatedTarget);
    renderState(nextState);
  };

  document.addEventListener('mouseover', onMouseOver, { passive: true });
  document.addEventListener('mouseout', onMouseOut, { passive: true });

  // 7. Scroll / Drag Event Detection (Compresses 5%)
  const onScroll = () => {
    isScrolling = true;
    renderState('scroll');

    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      isScrolling = false;
      const elemUnderPoint = document.elementFromPoint(mouseX, mouseY);
      renderState(getTargetState(elemUnderPoint));
    }, 140);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('wheel', onScroll, { passive: true });

  // 8. Click Micro-Interaction (Compress 0.92x -> Sparks -> Release Spring)
  const onMouseDown = () => {
    isMouseDown = true;

    let targetScale = 1.0;
    if (currentState === 'button') targetScale = 1.12;
    else if (currentState === 'scroll') targetScale = 0.95;

    gsap.to(cursorInner, {
      scale: targetScale * 0.92,
      duration: 0.08,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    gsap.to([crackMain, crackBranch], {
      opacity: 1.0,
      duration: 0.08,
      overwrite: 'auto'
    });

    const sparkCount = Math.floor(Math.random() * 2) + 2;
    const originX = currentState === 'text' ? 9 : 6;
    const originY = currentState === 'text' ? 9 : 8;

    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('span');
      spark.className = 'flint-spark-particle';

      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() * 0.4 - 0.2);
      const distance = 10 + Math.random() * 5;
      const targetDx = Math.cos(angle) * distance;
      const targetDy = Math.sin(angle) * distance;

      sparkContainer.appendChild(spark);

      gsap.set(spark, {
        x: originX,
        y: originY,
        scale: 1,
        opacity: 1
      });

      gsap.to(spark, {
        x: originX + targetDx,
        y: originY + targetDy,
        scale: 0.1,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out',
        onComplete: () => {
          if (spark.parentNode) {
            spark.parentNode.removeChild(spark);
          }
        }
      });
    }
  };

  const onMouseUp = () => {
    if (!isMouseDown) return;
    isMouseDown = false;

    let targetScale = 1.0;
    if (currentState === 'button') targetScale = 1.12;
    else if (currentState === 'scroll') targetScale = 0.95;

    gsap.to(cursorInner, {
      scale: targetScale,
      duration: 0.25,
      ease: 'back.out(1.6)',
      overwrite: 'auto'
    });

    gsap.to([crackMain, crackBranch], {
      opacity: currentState === 'button' ? 1.0 : 0.85,
      duration: 0.2,
      overwrite: 'auto'
    });
  };

  window.addEventListener('mousedown', onMouseDown, { passive: true });
  window.addEventListener('mouseup', onMouseUp, { passive: true });

  // 9. Lifecycle Destruction
  return () => {
    gsap.ticker.remove(updatePosition);
    window.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mouseout', onMouseOut);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('wheel', onScroll);
    window.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mouseup', onMouseUp);
    if (scrollTimer) clearTimeout(scrollTimer);
    if (cursorContainer.parentNode) {
      cursorContainer.parentNode.removeChild(cursorContainer);
    }
    document.documentElement.classList.remove('has-custom-cursor');
    document.body.classList.remove('has-custom-cursor');
  };
}
