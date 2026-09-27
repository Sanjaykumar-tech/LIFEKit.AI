/* ═══════════════════════════════════════════
   LIFEKit AI — Premium Cursor (Smooth)
   Crystal gradient arrow · pixel-perfect · no lag
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Skip on touch devices ─────────────
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
    const a = document.getElementById('cursorArrow');
    if (a) a.style.display = 'none';
    return;
  }

  const arrow = document.getElementById('cursorArrow');
  if (!arrow) return;

  // ── Styles ────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* Hide native cursor everywhere */
    html, body, *, *::before, *::after {
      cursor: none !important;
    }
    input, textarea, [contenteditable="true"] {
      cursor: text !important;
    }

    /* ══ CRYSTAL ARROW ══ */
    .cursor-arrow {
      position: fixed;
      top: 0;
      left: 0;
      width: 22px;
      height: 26px;
      pointer-events: none;
      z-index: 2147483647;
      opacity: 0;
      will-change: transform;
      transform: translate3d(-100px, -100px, 0);
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }

    .cursor-arrow svg {
      width: 100%;
      height: 100%;
      display: block;
      filter:
        drop-shadow(0 0 6px rgba(192, 38, 211, 0.9))
        drop-shadow(0 0 14px rgba(168, 85, 247, 0.5));
      transition: transform .18s cubic-bezier(.2,.8,.2,1),
                  filter .18s ease;
      transform-origin: 2px 2px;
    }

    body.cursor-hover .cursor-arrow svg {
      transform: scale(1.18);
      filter:
        drop-shadow(0 0 8px rgba(34, 211, 238, 1))
        drop-shadow(0 0 20px rgba(34, 211, 238, 0.6));
    }

    body.cursor-click .cursor-arrow svg {
      transform: scale(0.82);
    }

    body.cursor-text .cursor-arrow {
      opacity: 0;
    }
  `;
  document.head.appendChild(style);

  // ── Position ──────────────────────────
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let moved = false;
  let ticking = false;

  // ── Render (called only when needed) ──
  function render() {
    currentX = targetX;
    currentY = targetY;
    arrow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    ticking = false;
  }

  // ── Mouse move ────────────────────────
  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;

    if (!moved) {
      moved = true;
      currentX = targetX;
      currentY = targetY;
      arrow.style.opacity = '1';
      arrow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      return;
    }

    // Batch DOM updates to next frame
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }, { passive: true });

  // ── Click ─────────────────────────────
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));

  // ── Hover / text detection ────────────
  const HOVER = 'a, button, .btn-primary, .btn-ghost, .card, .tool-card, .filter-pill, .template-card, .occ-card, .style-card, [role="button"]';
  const TEXT  = 'input, textarea, [contenteditable="true"]';

  document.addEventListener('mouseover', (e) => {
    if (!(e.target instanceof Element)) return;
    if (e.target.closest(TEXT)) {
      document.body.classList.add('cursor-text');
      document.body.classList.remove('cursor-hover');
    } else if (e.target.closest(HOVER)) {
      document.body.classList.add('cursor-hover');
      document.body.classList.remove('cursor-text');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (!(e.target instanceof Element)) return;
    if (e.target.closest(TEXT)) document.body.classList.remove('cursor-text');
    if (e.target.closest(HOVER)) document.body.classList.remove('cursor-hover');
  });

  // ── Leave window ──────────────────────
  document.addEventListener('mouseleave', () => { arrow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { if (moved) arrow.style.opacity = '1'; });

})();