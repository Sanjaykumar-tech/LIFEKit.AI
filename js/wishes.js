/* ═══════════════════════════════════════════
   LIFEKit AI — Wishes Maker
   PNG export + form validation
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  // ── STATE ─────────────────────────────
  const state = {
    occasion: 'birthday',
    style: 'gradient',
    paid: false,
  };

  const preview = $('preview');
  const watermark = $('watermark');

  const occasionEmoji = {
    birthday:    '🎂',
    love:        '❤️',
    anniversary: '💕',
  };

  const occasionDefaultHeadline = {
    birthday:    'Happy Birthday!',
    love:        'I Love You',
    anniversary: 'Happy Anniversary',
  };

  // ═══════════════════════════════════════════
  //   FORM VALIDATION
  // ═══════════════════════════════════════════

  function isFormValid() {
    const toName = ($('toName')?.value || '').trim();
    const headline = ($('headline')?.value || '').trim();
    const message = ($('message')?.value || '').trim();
    return toName.length >= 2 && (headline.length > 0 || message.length > 0);
  }

  function updateUnlockButton() {
    const btn = $('downloadBtn');
    const navBtn = $('navDownload');
    if (!btn) return;

    const paid = state.paid || (window.LIFEKitPayment && window.LIFEKitPayment.isPaid('wishes'));
    const valid = isFormValid();

    if (paid) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.textContent = '⬇ Download Image';
      if (navBtn) navBtn.textContent = 'Download';
    } else if (!valid) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      btn.textContent = '✏️ Fill card details to unlock';
      if (navBtn) navBtn.textContent = 'Fill details first';
    } else {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.textContent = '🔓 Unlock HD Image — ₹19';
      if (navBtn) navBtn.textContent = 'Download ₹19';
    }
  }

  // ═══════════════════════════════════════════
  //   QUICK TEMPLATES
  // ═══════════════════════════════════════════

  const quickTemplates = {
    birthday: [
      { title: 'Warm',  headline: 'Happy Birthday!',        message: 'Wishing you a day filled with love, laughter, and everything that makes you smile. May this year bring you endless joy and beautiful moments.' },
      { title: 'Fun',   headline: 'Another Year Awesome!',  message: 'Cheers to another year of being absolutely amazing. Keep shining, keep laughing, keep being you!' },
      { title: 'Short', headline: 'Happy Birthday 🎉',      message: 'May your day be as wonderful as you are. Have the best one yet!' },
    ],
    love: [
      { title: 'Sweet',  headline: 'I Love You',      message: 'Every day with you feels like a beautiful dream. You are my sunshine, my heart, my everything. Thank you for being you.' },
      { title: 'Poetic', headline: 'You & Me',        message: 'In a world of billions, my heart chose you. And it would choose you again, and again, in every lifetime.' },
      { title: 'Short',  headline: 'Always You ❤️',   message: 'No matter where life takes us, my heart will always find its way back to you.' },
    ],
    anniversary: [
      { title: 'Romantic', headline: 'Happy Anniversary',     message: 'Another year of laughter, love, and endless memories. Thank you for walking this journey with me. Here\'s to forever.' },
      { title: 'Classic',  headline: 'To Us',                 message: 'Through every season, every storm, every sunrise — we chose each other. And I would choose you all over again.' },
      { title: 'Fun',      headline: 'Still Going Strong!',   message: 'We survived another year of my terrible jokes. That alone deserves a celebration! Here\'s to many more.' },
    ],
  };

  function renderQuickTemplates() {
    const container = $('quickTemplates');
    if (!container) return;
    const tpls = quickTemplates[state.occasion] || [];
    container.innerHTML = tpls.map((t, i) => `
      <button class="quick-tpl" data-tpl-index="${i}">
        <strong>${t.title}</strong>
        ${t.message.slice(0, 80)}…
      </button>
    `).join('');

    container.querySelectorAll('.quick-tpl').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = tpls[+btn.dataset.tplIndex];
        if ($('headline')) $('headline').value = t.headline;
        if ($('message')) $('message').value = t.message;
        render();
        updateUnlockButton();
      });
    });
  }

  // ═══════════════════════════════════════════
  //   OCCASION SWITCH
  // ═══════════════════════════════════════════

  document.querySelectorAll('.occ-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.occ-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.occasion = btn.dataset.occasion;

      const headlineInput = $('headline');
      if (headlineInput && (!headlineInput.value || Object.values(occasionDefaultHeadline).includes(headlineInput.value))) {
        headlineInput.value = occasionDefaultHeadline[state.occasion];
      }
      renderQuickTemplates();
      render();
      updateUnlockButton();
    });
  });

  // ═══════════════════════════════════════════
  //   STYLE SWITCH
  // ═══════════════════════════════════════════

  document.querySelectorAll('.style-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.style-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.style = btn.dataset.style;
      render();
    });
  });

  // ═══════════════════════════════════════════
  //   LIVE INPUTS
  // ═══════════════════════════════════════════

  ['toName','fromName','headline','message','extra'].forEach(id => {
    $(id)?.addEventListener('input', () => {
      render();
      updateUnlockButton();
    });
  });

  // ═══════════════════════════════════════════
  //   HELPERS
  // ═══════════════════════════════════════════

  const esc = str => String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // ═══════════════════════════════════════════
  //   RENDER
  // ═══════════════════════════════════════════

  function render() {
    const to       = ($('toName')?.value || '').trim();
    const from     = ($('fromName')?.value || '').trim();
    const headline = ($('headline')?.value || '').trim() || occasionDefaultHeadline[state.occasion];
    const message  = ($('message')?.value || '').trim();
    const extra    = ($('extra')?.value || '').trim();

    preview.className = `wish-card ${state.style}`;
    preview.innerHTML = `
      <div class="wc-occasion">${occasionEmoji[state.occasion]}</div>
      ${to ? `<div class="wc-to">Dear ${esc(to)},</div>` : ''}
      <div class="wc-headline">${esc(headline)}</div>
      <div class="wc-divider"></div>
      ${message ? `<div class="wc-message">${esc(message)}</div>` : ''}
      ${extra ? `<div class="wc-extra">${esc(extra)}</div>` : ''}
      ${from ? `<div class="wc-from">${esc(from)}</div>` : ''}
      <div class="wc-brand">LIFEKit AI</div>
    `;
  }

  // ═══════════════════════════════════════════
  //   WATERMARK TOGGLE
  // ═══════════════════════════════════════════

  $('previewBtn')?.addEventListener('click', () => watermark?.classList.toggle('hidden'));

  // ═══════════════════════════════════════════
  //   FULLSCREEN
  // ═══════════════════════════════════════════

  $('fullscreenBtn')?.addEventListener('click', () => {
    const clone = preview.cloneNode(true);
    const fs = document.createElement('div');
    fs.className = 'preview-fullscreen';
    fs.innerHTML = `<button class="close-btn" aria-label="Close">✕</button><div class="ws-preview-wrap"></div>`;
    fs.querySelector('.ws-preview-wrap').appendChild(clone);
    document.body.appendChild(fs);
    fs.querySelector('.close-btn').onclick = () => fs.remove();
    fs.addEventListener('click', e => { if (e.target === fs) fs.remove(); });
  });

  // ═══════════════════════════════════════════
  //   RANDOMIZE
  // ═══════════════════════════════════════════

  $('randomizeBtn')?.addEventListener('click', () => {
    const occasions = ['birthday','love','anniversary'];
    const styles = ['gradient','dark','elegant','romantic'];
    const randOcc = occasions[Math.floor(Math.random() * occasions.length)];
    const randStyle = styles[Math.floor(Math.random() * styles.length)];

    state.occasion = randOcc;
    state.style = randStyle;

    document.querySelectorAll('.occ-card').forEach(b =>
      b.classList.toggle('active', b.dataset.occasion === randOcc));
    document.querySelectorAll('.style-card').forEach(b =>
      b.classList.toggle('active', b.dataset.style === randStyle));

    const tpls = quickTemplates[randOcc];
    const t = tpls[Math.floor(Math.random() * tpls.length)];
    if ($('headline')) $('headline').value = t.headline;
    if ($('message')) $('message').value = t.message;

    renderQuickTemplates();
    render();
    updateUnlockButton();
  });

  // ═══════════════════════════════════════════
  //   RESET
  // ═══════════════════════════════════════════

  $('resetBtn')?.addEventListener('click', () => {
    if (!confirm('Clear everything?')) return;
    ['toName','fromName','headline','message','extra'].forEach(id => {
      const el = $(id); if (el) el.value = '';
    });
    render();
    updateUnlockButton();
  });

  // ═══════════════════════════════════════════
  //   PNG EXPORT
  // ═══════════════════════════════════════════

  async function downloadImage() {
    const wasHidden = watermark?.classList.contains('hidden');
    watermark?.classList.add('hidden');

    const clone = preview.cloneNode(true);
    const EXPORT_W = 1080;
    const EXPORT_H = 1350;

    Object.assign(clone.style, {
      position: 'fixed',
      top: '0', left: '-99999px',
      width: EXPORT_W + 'px',
      height: EXPORT_H + 'px',
      aspectRatio: 'auto', maxWidth: 'none', maxHeight: 'none',
      padding: '80px 60px', margin: '0', borderRadius: '0',
      boxShadow: 'none', transform: 'none', fontSize: '22px', zIndex: '1',
    });

    clone.querySelectorAll('.wc-occasion').forEach(el => el.style.fontSize = '90px');
    clone.querySelectorAll('.wc-to').forEach(el => el.style.fontSize = '56px');
    clone.querySelectorAll('.wc-headline').forEach(el => el.style.fontSize = '68px');
    clone.querySelectorAll('.wc-message').forEach(el => { el.style.fontSize = '26px'; el.style.maxWidth = '800px'; });
    clone.querySelectorAll('.wc-extra').forEach(el => el.style.fontSize = '40px');
    clone.querySelectorAll('.wc-from').forEach(el => el.style.fontSize = '44px');
    clone.querySelectorAll('.wc-brand').forEach(el => el.style.fontSize = '18px');
    clone.querySelectorAll('.wc-divider').forEach(el => { el.style.width = '120px'; el.style.margin = '28px 0'; });

    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 1, useCORS: true, allowTaint: false,
        backgroundColor: null, logging: false,
        width: EXPORT_W, height: EXPORT_H,
        scrollX: 0, scrollY: 0,
        windowWidth: EXPORT_W, windowHeight: EXPORT_H,
        onclone: (doc) => doc.querySelectorAll('.watermark').forEach(w => w.remove()),
      });

      const filename = `wish-${state.occasion}-${(($('toName')?.value || 'card').replace(/\s+/g, '-').toLowerCase())}.png`;
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('[PNG] generation failed:', err);
      alert('Image generation failed. Please try again.');
    } finally {
      clone.remove();
      if (!wasHidden) watermark?.classList.remove('hidden');
    }
  }

  // ═══════════════════════════════════════════
  //   SHARE
  // ═══════════════════════════════════════════

  async function shareCard() {
    const wasHidden = watermark?.classList.contains('hidden');
    watermark?.classList.add('hidden');

    const clone = preview.cloneNode(true);
    const EXPORT_W = 1080;
    const EXPORT_H = 1350;

    Object.assign(clone.style, {
      position: 'fixed', top: '0', left: '-99999px',
      width: EXPORT_W + 'px', height: EXPORT_H + 'px',
      aspectRatio: 'auto', maxWidth: 'none', maxHeight: 'none',
      padding: '80px 60px', margin: '0', borderRadius: '0',
      boxShadow: 'none', transform: 'none', fontSize: '22px', zIndex: '1',
    });
    clone.querySelectorAll('.wc-occasion').forEach(el => el.style.fontSize = '90px');
    clone.querySelectorAll('.wc-to').forEach(el => el.style.fontSize = '56px');
    clone.querySelectorAll('.wc-headline').forEach(el => el.style.fontSize = '68px');
    clone.querySelectorAll('.wc-message').forEach(el => { el.style.fontSize = '26px'; el.style.maxWidth = '800px'; });
    clone.querySelectorAll('.wc-extra').forEach(el => el.style.fontSize = '40px');
    clone.querySelectorAll('.wc-from').forEach(el => el.style.fontSize = '44px');
    clone.querySelectorAll('.wc-brand').forEach(el => el.style.fontSize = '18px');
    clone.querySelectorAll('.wc-divider').forEach(el => { el.style.width = '120px'; el.style.margin = '28px 0'; });

    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 1, useCORS: true, allowTaint: false,
        backgroundColor: null, logging: false,
        width: EXPORT_W, height: EXPORT_H,
        scrollX: 0, scrollY: 0,
        windowWidth: EXPORT_W, windowHeight: EXPORT_H,
        onclone: (doc) => doc.querySelectorAll('.watermark').forEach(w => w.remove()),
      });

      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'wish.png', { type: 'image/png' });
        const shareData = { title: 'A wish for you ❤️', text: 'Made with LIFEKit AI', files: [file] };

        if (navigator.canShare && navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
          } catch (e) {
            if (e.name !== 'AbortError') fallbackDownload(blob);
          }
        } else {
          fallbackDownload(blob);
        }
      });
    } catch (err) {
      console.error('[Share] failed:', err);
      alert('Share failed. Please try downloading instead.');
    } finally {
      clone.remove();
      if (!wasHidden) watermark?.classList.remove('hidden');
    }
  }

  function fallbackDownload(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'wish.png';
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ═══════════════════════════════════════════
  //   DOWNLOAD BUTTON
  // ═══════════════════════════════════════════

    async function handleDownload() {
    if (state.paid || (window.LIFEKitPayment && window.LIFEKitPayment.isPaid('wishes'))) {
      state.paid = true;
      updateUnlockButton();
      return downloadImage();
    }

    if (window.LIFEKitPayment && window.LIFEKitPayment.isPaidAsync) {
      const alreadyPaid = await window.LIFEKitPayment.isPaidAsync('wishes');
      if (alreadyPaid) {
        state.paid = true;
        updateUnlockButton();
        return downloadImage();
      }
    }

    if (!isFormValid()) {
      alert('Please fill in the recipient name and a message or headline.');
      $('toName')?.focus();
      return;
    }

    const customerName = $('fromName')?.value || $('toName')?.value || '';

    if (!window.LIFEKitPayment) {
      alert('Payment system not loaded. Please refresh.');
      return;
    }

    window.LIFEKitPayment.openCheckout('wishes', customerName, {
      onSuccess: () => {
        state.paid = true;
        updateUnlockButton();
        setTimeout(() => downloadImage(), 600);
      },
      onCancel: () => updateUnlockButton(),
    });
  }

  $('downloadBtn')?.addEventListener('click', handleDownload);
  $('navDownload')?.addEventListener('click', e => { e.preventDefault(); handleDownload(); });

  $('shareBtn')?.addEventListener('click', async () => {
    if (!state.paid && !(window.LIFEKitPayment && window.LIFEKitPayment.isPaid('wishes'))) {
      const ok = confirm('Share will include a small LIFEKit AI watermark.\n\nUnlock HD for ₹19 to remove it.\n\nContinue?');
      if (!ok) return;
    }
    await shareCard();
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleDownload(); }
    if (e.key === 'Escape') document.querySelector('.preview-fullscreen')?.remove();
  });

  window.addEventListener('lifekit:paid', (e) => {
    if (e.detail.product === 'wishes') {
      state.paid = true;
      updateUnlockButton();
      setTimeout(() => downloadImage(), 800);
    }
  });

  // ═══════════════════════════════════════════
  //   INIT
  // ═══════════════════════════════════════════

  const hl = $('headline');
  if (hl) hl.value = occasionDefaultHeadline[state.occasion];
  renderQuickTemplates();
  render();

  if (window.LIFEKitPayment && window.LIFEKitPayment.isPaid('wishes')) {
    state.paid = true;
  }
  updateUnlockButton();

})();