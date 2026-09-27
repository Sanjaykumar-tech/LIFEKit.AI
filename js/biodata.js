/* ═══════════════════════════════════════════
   LIFEKit AI — Biodata Maker
   Native jsPDF output + form validation
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  // ── STATE ─────────────────────────────
  const state = {
    template: 'classic',
    photoData: null,
    paid: false,
  };

  const preview    = $('preview');
  const watermark  = $('watermark');
  const photoInput = $('photoInput');
  const photoDrop  = $('photoDrop');

  const FIELDS = [
    'name','dob','height','religion','language','marital',
    'education','college','job','income',
    'father','fatherJob','mother','motherJob','siblings',
    'phone','email','address'
  ];

  // ═══════════════════════════════════════════
  //   FORM VALIDATION
  // ═══════════════════════════════════════════

  function isFormValid() {
    const name = ($('name')?.value || '').trim();
    return name.length >= 2;
  }

  function updateUnlockButton() {
    const btn = $('downloadBtn');
    const navBtn = $('navDownload');
    if (!btn) return;

    const paid = state.paid || (window.LIFEKitPayment && window.LIFEKitPayment.isPaid('biodata'));
    const valid = isFormValid();

    if (paid) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.textContent = '⬇ Download PDF';
      if (navBtn) navBtn.textContent = 'Download PDF';
    } else if (!valid) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      btn.textContent = '✏️ Enter name to unlock';
      if (navBtn) navBtn.textContent = 'Enter name first';
    } else {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.textContent = '🔓 Unlock HD PDF — ₹99';
      if (navBtn) navBtn.textContent = 'Download ₹99';
    }
  }

  // ═══════════════════════════════════════════
  //   TEMPLATE SWITCH
  // ═══════════════════════════════════════════

  document.querySelectorAll('.template-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.template-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.template = btn.dataset.template;
      render();
    });
  });

  // ═══════════════════════════════════════════
  //   PHOTO UPLOAD
  // ═══════════════════════════════════════════

  photoInput?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      state.photoData = ev.target.result;
      photoDrop?.classList.add('has-photo');
      const strong = photoDrop?.querySelector('strong');
      const small = photoDrop?.querySelector('small');
      if (strong) strong.textContent = 'Photo uploaded ✓';
      if (small) small.textContent = file.name;
      render();
    };
    reader.readAsDataURL(file);
  });

  ['dragenter', 'dragover'].forEach(ev =>
    photoDrop?.addEventListener(ev, e => {
      e.preventDefault();
      photoDrop.classList.add('dragover');
    })
  );
  ['dragleave', 'drop'].forEach(ev =>
    photoDrop?.addEventListener(ev, e => {
      e.preventDefault();
      photoDrop.classList.remove('dragover');
    })
  );
  photoDrop?.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      photoInput.files = e.dataTransfer.files;
      photoInput.dispatchEvent(new Event('change'));
    }
  });

  // ═══════════════════════════════════════════
  //   LIVE UPDATE
  // ═══════════════════════════════════════════

  FIELDS.forEach(id => {
    $(id)?.addEventListener('input', () => {
      render();
      updateUnlockButton();
    });
  });

  // ═══════════════════════════════════════════
  //   HELPERS
  // ═══════════════════════════════════════════

  const val = (id, fallback = '—') => {
    const el = $(id);
    if (!el) return fallback;
    const v = (el.value || '').trim();
    return v || fallback;
  };

  const esc = str => String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // ═══════════════════════════════════════════
  //   RENDER PREVIEW
  // ═══════════════════════════════════════════

  function render() {
    const photoHTML = state.photoData
      ? `<img src="${state.photoData}" class="bd-doc-photo" alt="Photo" />`
      : `<div class="bd-doc-photo">👤</div>`;

    preview.className = `biodata-doc ${state.template}`;
    preview.innerHTML = `
      <div class="bd-doc-header">
        <div class="bd-doc-name-block">
          <h1>${esc(val('name', 'Your Name'))}</h1>
          <div class="bd-doc-sub">Marriage Biodata</div>
        </div>
        ${photoHTML}
      </div>

      <div class="bd-doc-section">
        <h2>Personal</h2>
        <div class="bd-doc-rows">
          <div class="bd-doc-row"><strong>Date of Birth</strong><span>${esc(val('dob'))}</span></div>
          <div class="bd-doc-row"><strong>Height</strong><span>${esc(val('height'))}</span></div>
          <div class="bd-doc-row"><strong>Religion</strong><span>${esc(val('religion'))}</span></div>
          <div class="bd-doc-row"><strong>Language</strong><span>${esc(val('language'))}</span></div>
          <div class="bd-doc-row"><strong>Marital Status</strong><span>${esc(val('marital', 'Never Married'))}</span></div>
        </div>
      </div>

      <div class="bd-doc-section">
        <h2>Education &amp; Career</h2>
        <div class="bd-doc-rows">
          <div class="bd-doc-row"><strong>Education</strong><span>${esc(val('education'))}</span></div>
          <div class="bd-doc-row"><strong>Institute</strong><span>${esc(val('college'))}</span></div>
          <div class="bd-doc-row"><strong>Occupation</strong><span>${esc(val('job'))}</span></div>
          <div class="bd-doc-row"><strong>Income</strong><span>${esc(val('income'))}</span></div>
        </div>
      </div>

      <div class="bd-doc-section">
        <h2>Family</h2>
        <div class="bd-doc-rows">
          <div class="bd-doc-row"><strong>Father</strong><span>${esc(val('father'))}</span></div>
          <div class="bd-doc-row"><strong>Occupation</strong><span>${esc(val('fatherJob'))}</span></div>
          <div class="bd-doc-row"><strong>Mother</strong><span>${esc(val('mother'))}</span></div>
          <div class="bd-doc-row"><strong>Occupation</strong><span>${esc(val('motherJob'))}</span></div>
          <div class="bd-doc-row full"><strong>Siblings</strong><span>${esc(val('siblings'))}</span></div>
        </div>
      </div>

      <div class="bd-doc-section">
        <h2>Contact</h2>
        <div class="bd-doc-rows">
          <div class="bd-doc-row"><strong>Phone</strong><span>${esc(val('phone'))}</span></div>
          <div class="bd-doc-row"><strong>Email</strong><span>${esc(val('email'))}</span></div>
          <div class="bd-doc-row full"><strong>Address</strong><span>${esc(val('address'))}</span></div>
        </div>
      </div>

      <div class="bd-doc-footer">
        <span>Generated by <strong>LIFEKit AI</strong></span>
        <span>lifekit.ai</span>
      </div>
    `;
  }

  // ═══════════════════════════════════════════
  //   WATERMARK TOGGLE
  // ═══════════════════════════════════════════

  $('previewBtn')?.addEventListener('click', () => {
    watermark?.classList.toggle('hidden');
  });

  // ═══════════════════════════════════════════
  //   FULLSCREEN
  // ═══════════════════════════════════════════

  $('fullscreenBtn')?.addEventListener('click', () => {
    const wrap = preview.cloneNode(true);
    const fs = document.createElement('div');
    fs.className = 'preview-fullscreen';
    fs.innerHTML = `<button class="close-btn" aria-label="Close">✕</button><div class="bd-preview-wrap"></div>`;
    fs.querySelector('.bd-preview-wrap').appendChild(wrap);
    document.body.appendChild(fs);
    fs.querySelector('.close-btn').onclick = () => fs.remove();
    fs.addEventListener('click', e => { if (e.target === fs) fs.remove(); });
  });

  // ═══════════════════════════════════════════
  //   RESET
  // ═══════════════════════════════════════════

  $('resetBtn')?.addEventListener('click', () => {
    if (!confirm('Clear all fields?')) return;
    FIELDS.forEach(id => { const el = $(id); if (el) el.value = ''; });
    state.photoData = null;
    if (photoInput) photoInput.value = '';
    photoDrop?.classList.remove('has-photo');
    const strong = photoDrop?.querySelector('strong');
    const small = photoDrop?.querySelector('small');
    if (strong) strong.textContent = 'Click to upload photo';
    if (small) small.textContent = 'JPG, PNG · up to 5MB';
    render();
    updateUnlockButton();
  });

  // ═══════════════════════════════════════════
  //   PDF GENERATION — native jsPDF
  // ═══════════════════════════════════════════

  async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const palettes = {
      classic: { primary: [168, 85, 247], dark: [17, 17, 17], muted: [120, 120, 130], bg: [255, 255, 255], accent: [168, 85, 247] },
      modern:  { primary: [34, 211, 238], dark: [15, 23, 42], muted: [100, 116, 139], bg: [255, 255, 255], accent: [8, 145, 178] },
      royal:   { primary: [212, 175, 55], dark: [139, 105, 20], muted: [140, 120, 80], bg: [255, 253, 245], accent: [212, 175, 55] },
    };
    const c = palettes[state.template] || palettes.classic;

    const PAGE_W = 210;
    const PAGE_H = 297;
    const M = 18;
    const CONTENT_W = PAGE_W - M * 2;

    doc.setFillColor(...c.bg);
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

    doc.setFillColor(...c.primary);
    doc.rect(0, 0, PAGE_W, 4, 'F');

    let y = M + 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(...c.dark);
    doc.text(val('name', 'Your Name'), M, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...c.muted);
    doc.text('MARRIAGE BIODATA', M, y);

    if (state.photoData) {
      try {
        const imgW = 30;
        const imgH = 38;
        doc.addImage(state.photoData, 'JPEG', PAGE_W - M - imgW, M, imgW, imgH, undefined, 'FAST');
        doc.setDrawColor(...c.primary);
        doc.setLineWidth(0.6);
        doc.rect(PAGE_W - M - imgW, M, imgW, imgH);
      } catch (e) {
        console.warn('Photo embed failed', e);
      }
    }

    y += 6;
    doc.setDrawColor(...c.primary);
    doc.setLineWidth(0.6);
    doc.line(M, y, PAGE_W - M, y);

    y += 10;

    const lineH = 6;

    function section(title, rows) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...c.accent);
      doc.text(title.toUpperCase(), M, y);
      y += 2;
      doc.setDrawColor(...c.primary);
      doc.setLineWidth(0.2);
      doc.line(M, y, M + 30, y);
      y += 6;

      rows.forEach(([label, value]) => {
        const isFull = label.length > 0 && value.length > 60;
        if (isFull) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(80, 80, 90);
          doc.text(label, M, y);
          y += lineH;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...c.dark);
          const wrapped = doc.splitTextToSize(value, CONTENT_W - 4);
          doc.text(wrapped, M + 4, y);
          y += wrapped.length * 5 + 3;
        } else {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(80, 80, 90);
          doc.text(label, M, y);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...c.dark);
          const valueX = M + 50;
          const wrapped = doc.splitTextToSize(value, CONTENT_W - 50);
          doc.text(wrapped, valueX, y);
          y += Math.max(lineH, wrapped.length * 5);
        }

        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.15);
        doc.line(M, y - 1.5, PAGE_W - M, y - 1.5);

        if (y > PAGE_H - 30) {
          doc.addPage();
          doc.setFillColor(...c.bg);
          doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
          doc.setFillColor(...c.primary);
          doc.rect(0, 0, PAGE_W, 4, 'F');
          y = M + 4;
        }
      });

      y += 4;
    }

    section('Personal', [
      ['Date of Birth', val('dob')],
      ['Height', val('height')],
      ['Religion', val('religion')],
      ['Mother Tongue', val('language')],
      ['Marital Status', val('marital', 'Never Married')],
    ]);

    section('Education & Career', [
      ['Education', val('education')],
      ['Institute', val('college')],
      ['Occupation', val('job')],
      ['Annual Income', val('income')],
    ]);

    section('Family', [
      ['Father', val('father')],
      ['Father\'s Work', val('fatherJob')],
      ['Mother', val('mother')],
      ['Mother\'s Work', val('motherJob')],
      ['Siblings', val('siblings')],
    ]);

    section('Contact', [
      ['Phone', val('phone')],
      ['Email', val('email')],
      ['Address', val('address')],
    ]);

    const footerY = PAGE_H - 12;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(M, footerY - 3, PAGE_W - M, footerY - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 155);
    doc.text('Generated by LIFEKit AI', M, footerY);
    doc.text('lifekit.ai', PAGE_W - M, footerY, { align: 'right' });

    const safeName = val('name', 'lifekit').trim().replace(/\s+/g, '-').toLowerCase();
    doc.save(`biodata-${safeName}.pdf`);
  }

  // ═══════════════════════════════════════════
  //   DOWNLOAD BUTTON
  // ═══════════════════════════════════════════

  function handleDownload() {
    // Block if form not valid AND user hasn't paid
    if (!state.paid && !(window.LIFEKitPayment && window.LIFEKitPayment.isPaid('biodata'))) {
      if (!isFormValid()) {
        alert('Please enter your full name first.');
        $('name')?.focus();
        return;
      }
    }

    if (state.paid || (window.LIFEKitPayment && window.LIFEKitPayment.isPaid('biodata'))) {
      state.paid = true;
      updateUnlockButton();
      return downloadPDF();
    }

    const customerName = $('name')?.value || '';

    if (!window.LIFEKitPayment) {
      alert('Payment system not loaded. Please refresh the page.');
      return;
    }

    window.LIFEKitPayment.openCheckout('biodata', customerName, {
      onSuccess: () => {
        state.paid = true;
        updateUnlockButton();
        setTimeout(() => downloadPDF(), 600);
      },
      onCancel: () => {
        updateUnlockButton();
      },
    });
  }

  $('downloadBtn')?.addEventListener('click', handleDownload);
  $('navDownload')?.addEventListener('click', e => {
    e.preventDefault();
    handleDownload();
  });

  // ═══════════════════════════════════════════
  //   KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleDownload();
    }
    if (e.key === 'Escape') {
      document.querySelector('.preview-fullscreen')?.remove();
    }
  });

  // ═══════════════════════════════════════════
  //   RETURN FROM PAYMENT
  // ═══════════════════════════════════════════

  window.addEventListener('lifekit:paid', (e) => {
    if (e.detail.product === 'biodata') {
      state.paid = true;
      updateUnlockButton();
      setTimeout(() => downloadPDF(), 800);
    }
  });

  // ═══════════════════════════════════════════
  //   PREFILL FROM URL
  // ═══════════════════════════════════════════

  const params = new URLSearchParams(location.search);
  FIELDS.forEach(id => {
    const v = params.get(id);
    if (v && $(id)) $(id).value = v;
  });

  // ═══════════════════════════════════════════
  //   INIT
  // ═══════════════════════════════════════════

  if (window.LIFEKitPayment && window.LIFEKitPayment.isPaid('biodata')) {
    state.paid = true;
  }

  render();
  updateUnlockButton();

})();