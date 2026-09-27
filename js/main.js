/* ═══════════════════════════════════════════
   LIFEKit AI — Main JS
   ═══════════════════════════════════════════ */

// ── SEARCH ROUTER ────────────────────────
const routes = {
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
  for (const key in routes) {
    if (q.includes(key)) {
      window.location.href = routes[key];
      return;
    }
  }
  // No match — subtle shake feedback
  if (searchInput) {
    searchInput.style.transition = 'transform .08s';
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
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 20) nav?.classList.add('scrolled');
  else nav?.classList.remove('scrolled');
  lastScroll = y;
}, { passive: true });

// ── SCROLL REVEAL ────────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.card, .cta-banner, .stat-num, .badge').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1)';
  io.observe(el);
});

// ── PARALLAX GLOW ON MOUSE MOVE ──────────
// Moves the background glow subtly with the cursor for a "living" feel
let mouseX = 0, mouseY = 0;
let currentX = 0, currentY = 0;

document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth  - 0.5) * 20;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
}, { passive: true });

function animateGlow() {
  currentX += (mouseX - currentX) * 0.06;
  currentY += (mouseY - currentY) * 0.06;
  document.body.style.backgroundPosition = `${currentX}px ${currentY}px`;
  requestAnimationFrame(animateGlow);
}
animateGlow();

// ── SMOOTH ANCHOR SCROLL ─────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// ── TYPE-WRITER IN SEARCH (hint cycle) ───
const hints = ['biodata', 'resume', 'wishes', 'birthday'];
let hintIdx = 0, charIdx = 0, deleting = false;

function typeHint() {
  if (!searchInput || document.activeElement === searchInput || searchInput.value) return;

  const word = hints[hintIdx];
  const current = word.slice(0, charIdx);
  searchInput.setAttribute('placeholder', `Search tools… try '${current}${deleting ? '' : '|'}'`);

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
    hintIdx = (hintIdx + 1) % hints.length;
    setTimeout(typeHint, 300);
  }
}
setTimeout(typeHint, 1000);