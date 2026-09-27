/* ═══════════════════════════════════════════
   LIFEKit AI — Main JS
   Search · Nav · Scroll reveal · Parallax · Hints
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ── SEARCH ROUTER ────────────────────────
  const ROUTES = {
    biodata:     'tools/biodata.html',
    marriage:    'tools/biodata.html',
    wedding:     'tools/biodata.html',
    shaadi:      'tools/biodata.html',
    resume:      'tools/resume.html',
    cv:          'tools/resume.html',
    job:         'tools/resume.html',
    wishes:      'tools/wishes.html',
    wish:        'tools/wishes.html',
    card:        'tools/wishes.html',
    birthday:    'tools/wishes.html',
    love:        'tools/wishes.html',
    anniversary: 'tools/wishes.html',
  };

  const searchInput = document.getElementById('searchInput');
  const searchBtn   = document.getElementById('searchBtn');

  function doSearch() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    if (!q) {
      searchInput?.focus();
      return;
    }
    for (const key in ROUTES) {
      if (q.includes(key)) {
        window.location.href = ROUTES[key];
        return;
      }
    }
    // No match — subtle shake feedback
    if (searchInput) {
      searchInput.style.transition = 'transform .08s ease';
      let n = 0;
      const shake = setInterval(() => {
        searchInput.style.transform = n % 2 ? 'translateX(6px)' : 'translateX(-6px)';
        if (++n > 6) {
          clearInterval(shake);
          searchInput.style.transform = 'translateX(0)';
        }
      }, 60);
    }
  }

  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
  searchBtn?.addEventListener('click', doSearch);

  // ── NAV SCROLL SHADOW ────────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }, { passive: true });
  }

  // ── SCROLL REVEAL ────────────────────────
  const revealTargets = document.querySelectorAll('.card, .cta-banner, .stat-num, .badge');

  if ('IntersectionObserver' in window && revealTargets.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealTargets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1)';
      io.observe(el);
    });
  }

  // ── PARALLAX GLOW ON MOUSE MOVE ──────────
  let pMouseX = 0, pMouseY = 0;
  let pCurrentX = 0, pCurrentY = 0;

  document.addEventListener('mousemove', e => {
    pMouseX = (e.clientX / window.innerWidth  - 0.5) * 20;
    pMouseY = (e.clientY / window.innerHeight - 0.5) * 20;
  }, { passive: true });

  function animateGlow() {
    pCurrentX += (pMouseX - pCurrentX) * 0.06;
    pCurrentY += (pMouseY - pCurrentY) * 0.06;
    document.body.style.backgroundPosition = `${pCurrentX}px ${pCurrentY}px`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  // ── SMOOTH ANCHOR SCROLL ─────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ── TYPE-WRITER IN SEARCH (hint cycle) ───
  const HINTS = ['biodata', 'resume', 'wishes', 'birthday'];
  let hintIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function typeHint() {
    if (!searchInput) return;
    if (document.activeElement === searchInput) return;
    if (searchInput.value) return;

    const word = HINTS[hintIdx];
    const current = word.slice(0, charIdx);
    searchInput.setAttribute(
      'placeholder',
      `Search tools… try '${current}${deleting ? '' : '|'}'`
    );

    if (!deleting && charIdx < word.length) {
      charIdx++;
      setTimeout(typeHint, 110);
    } else if (!deleting) {
      deleting = true;
      setTimeout(typeHint, 1400);
    } else if (charIdx > 0) {
      charIdx--;
      setTimeout(typeHint, 50);
    } else {
      deleting = false;
      hintIdx = (hintIdx + 1) % HINTS.length;
      setTimeout(typeHint, 300);
    }
  }

  setTimeout(typeHint, 1000);

})();