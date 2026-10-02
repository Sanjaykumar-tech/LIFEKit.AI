/* ═══════════════════════════════════════════
   LIFEKit AI — Resume Maker (v7 — Final)
   Native jsPDF + form validation + full fixes
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  // ═══════════════════════════════════════════
  //   STATE
  // ═══════════════════════════════════════════

  const state = {
    template: 'classic',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    paid: false,
  };

  const preview = $('preview');
  const watermark = $('watermark');

  // Map config keys (singular) → state keys (plural)
  const TYPE_TO_STATE = {
    experience: 'experience',
    education: 'education',
    project: 'projects',
  };

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

    const paid = state.paid || (window.LIFEKitPayment && window.LIFEKitPayment.isPaid('resume'));
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
      btn.textContent = '🔓 Unlock HD PDF — ₹49';
      if (navBtn) navBtn.textContent = 'Download ₹49';
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
  //   SIMPLE FIELDS
  // ═══════════════════════════════════════════

  ['name', 'jobTitle', 'email', 'phone', 'location', 'website', 'summary'].forEach(id => {
    $(id)?.addEventListener('input', () => {
      render();
      updateUnlockButton();
    });
  });

  // ═══════════════════════════════════════════
  //   DYNAMIC LISTS
  // ═══════════════════════════════════════════

  const listConfigs = {
    experience: {
      container: 'experienceList',
      fields: [
        { key: 'role',        placeholder: 'Job Title',              span: 1 },
        { key: 'company',     placeholder: 'Company',                span: 1 },
        { key: 'from',        placeholder: 'From (e.g. 2022)',       span: 1 },
        { key: 'to',          placeholder: 'To (e.g. Present)',      span: 1 },
        { key: 'description', placeholder: 'Describe your work (2–3 lines)', span: 2, textarea: true },
      ],
    },
    education: {
      container: 'educationList',
      fields: [
        { key: 'degree', placeholder: 'Degree / Course',         span: 1 },
        { key: 'school', placeholder: 'School / University',     span: 1 },
        { key: 'from',   placeholder: 'From (e.g. 2018)',        span: 1 },
        { key: 'to',     placeholder: 'To (e.g. 2022)',          span: 1 },
        { key: 'score',  placeholder: 'Score (e.g. 8.5 CGPA)',   span: 2 },
      ],
    },
    project: {
      container: 'projectList',
      fields: [
        { key: 'name',        placeholder: 'Project Name',                              span: 1 },
        { key: 'tech',        placeholder: 'Tech Stack',                                span: 1 },
        { key: 'description', placeholder: 'What it does + your role (2–3 lines)',      span: 2, textarea: true },
      ],
    },
  };

  function makeItemHTML(config, index, item = {}) {
    const fieldsHTML = config.fields.map(f => {
      const value = item[f.key] || '';
      const span = f.span === 2 ? ' rs-span-2' : '';

      if (f.textarea) {
        return `<textarea class="rs-item-input${span}" data-key="${f.key}" rows="2"
                          placeholder="${f.placeholder}">${value}</textarea>`;
      }
      return `<input class="rs-item-input${span}" data-key="${f.key}"
                     placeholder="${f.placeholder}" value="${value}" />`;
    }).join('');

    return `
      <div class="rs-item" data-index="${index}">
        <button class="rs-item-remove" title="Remove">✕</button>
        ${fieldsHTML}
      </div>
    `;
  }

  function renderList(type) {
    const config = listConfigs[type];
    if (!config) return;

    const container = $(config.container);
    if (!container) return;

    const stateKey = TYPE_TO_STATE[type] || type;
    const items = state[stateKey] || [];

    container.innerHTML = items.map((item, i) => makeItemHTML(config, i, item)).join('');

    container.querySelectorAll('.rs-item').forEach(el => {
      const idx = +el.dataset.index;

      el.querySelectorAll('.rs-item-input').forEach(input => {
        input.addEventListener('input', () => {
          if (!state[stateKey][idx]) return;
          state[stateKey][idx][input.dataset.key] = input.value;
          render();
        });
      });

      el.querySelector('.rs-item-remove')?.addEventListener('click', () => {
        state[stateKey].splice(idx, 1);
        renderList(type);
        render();
      });
    });
  }

  // ── Add buttons ─────────────────────────
  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const configKey = btn.dataset.add;                  // 'experience' | 'education' | 'project'
      const stateKey  = TYPE_TO_STATE[configKey] || configKey;

      console.log('[Resume] Add clicked:', configKey, '→', stateKey);

      const config = listConfigs[configKey];
      if (!config) {
        console.error('[Resume] Unknown config:', configKey);
        return;
      }

      if (!state[stateKey]) state[stateKey] = [];

      const empty = {};
      config.fields.forEach(f => { empty[f.key] = ''; });
      state[stateKey].push(empty);

      renderList(configKey);
      render();

      const container = $(config.container);
      container?.lastElementChild?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  });

  // ═══════════════════════════════════════════
  //   SKILLS
  // ═══════════════════════════════════════════

  const skillInput = $('skillInput');
  const skillsChips = $('skillsChips');

  skillInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const v = e.target.value.trim().replace(/,$/, '');
      if (v && !state.skills.includes(v)) {
        state.skills.push(v);
        e.target.value = '';
        renderSkills();
        render();
      }
    }
  });

  function renderSkills() {
    if (!skillsChips) return;

    skillsChips.innerHTML = state.skills.map((s, i) => `
      <span class="skill-chip">
        ${s}
        <button data-skill-index="${i}" title="Remove">✕</button>
      </span>
    `).join('');

    skillsChips.querySelectorAll('[data-skill-index]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.skills.splice(+btn.dataset.skillIndex, 1);
        renderSkills();
        render();
      });
    });
  }

  // ═══════════════════════════════════════════
  //   HELPERS
  // ═══════════════════════════════════════════

  const esc = str => String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // ═══════════════════════════════════════════
  //   RENDER PREVIEW
  // ═══════════════════════════════════════════

  function render() {
    const v = id => ($(id)?.value || '').trim();

    const name     = v('name') || 'Your Name';
    const title    = v('jobTitle') || 'Job Title';
    const email    = v('email');
    const phone    = v('phone');
    const location = v('location');
    const website  = v('website');
    const summary  = v('summary');

    const contacts = [];
    if (email)    contacts.push(`✉ ${esc(email)}`);
    if (phone)    contacts.push(`☎ ${esc(phone)}`);
    if (location) contacts.push(`📍 ${esc(location)}`);
    if (website)  contacts.push(`🔗 ${esc(website)}`);

    const expHTML = (state.experience || [])
      .filter(e => e.role || e.company)
      .map(e => `
        <div class="rs-doc-item">
          <div class="rs-doc-item-head">
            <strong>${esc(e.role)}</strong>
            <span class="rs-doc-date">${esc(e.from)}${e.from && e.to ? ' – ' : ''}${esc(e.to)}</span>
          </div>
          ${e.company ? `<div class="rs-doc-item-sub">${esc(e.company)}</div>` : ''}
          ${e.description ? `<div class="rs-doc-item-body">${esc(e.description).replace(/\n/g, '<br>')}</div>` : ''}
        </div>
      `).join('');

    const eduHTML = (state.education || [])
      .filter(e => e.degree || e.school)
      .map(e => `
        <div class="rs-doc-item">
          <div class="rs-doc-item-head">
            <strong>${esc(e.degree)}</strong>
            <span class="rs-doc-date">${esc(e.from)}${e.from && e.to ? ' – ' : ''}${esc(e.to)}</span>
          </div>
          ${e.school ? `<div class="rs-doc-item-sub">${esc(e.school)}</div>` : ''}
          ${e.score ? `<div class="rs-doc-item-body">${esc(e.score)}</div>` : ''}
        </div>
      `).join('');

    const projHTML = (state.projects || [])
      .filter(p => p.name)
      .map(p => `
        <div class="rs-doc-item">
          <div class="rs-doc-item-head">
            <strong>${esc(p.name)}</strong>
            ${p.tech ? `<span class="rs-doc-date">${esc(p.tech)}</span>` : ''}
          </div>
          ${p.description ? `<div class="rs-doc-item-body">${esc(p.description).replace(/\n/g, '<br>')}</div>` : ''}
        </div>
      `).join('');

    const skillsHTML = state.skills.length
      ? state.skills.map(s => `<span class="rs-doc-skill">${esc(s)}</span>`).join('')
      : '';

    preview.className = `resume-doc ${state.template}`;
    preview.innerHTML = `
      <div class="rs-doc-header">
        <h1>${esc(name)}</h1>
        <div class="rs-doc-title">${esc(title)}</div>
        ${contacts.length ? `<div class="rs-doc-contact">${contacts.map(c => `<span>${c}</span>`).join('')}</div>` : ''}
      </div>

      ${summary ? `<div class="rs-doc-section"><h2>Summary</h2><div class="rs-doc-summary">${esc(summary).replace(/\n/g, '<br>')}</div></div>` : ''}
      ${expHTML ? `<div class="rs-doc-section"><h2>Experience</h2>${expHTML}</div>` : ''}
      ${eduHTML ? `<div class="rs-doc-section"><h2>Education</h2>${eduHTML}</div>` : ''}
      ${skillsHTML ? `<div class="rs-doc-section"><h2>Skills</h2><div class="rs-doc-skills">${skillsHTML}</div></div>` : ''}
      ${projHTML ? `<div class="rs-doc-section"><h2>Projects</h2>${projHTML}</div>` : ''}

      <div class="rs-doc-footer">
        <span>Generated by <strong>LIFEKit AI</strong></span>
        <span>lifekit.ai</span>
      </div>
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
    fs.innerHTML = `<button class="close-btn" aria-label="Close">✕</button><div class="rs-preview-wrap"></div>`;
    fs.querySelector('.rs-preview-wrap').appendChild(clone);
    document.body.appendChild(fs);
    fs.querySelector('.close-btn').onclick = () => fs.remove();
    fs.addEventListener('click', e => { if (e.target === fs) fs.remove(); });
  });

  // ═══════════════════════════════════════════
  //   RESET
  // ═══════════════════════════════════════════

  $('resetBtn')?.addEventListener('click', () => {
    if (!confirm('Clear everything?')) return;

    ['name', 'jobTitle', 'email', 'phone', 'location', 'website', 'summary', 'skillInput'].forEach(id => {
      const el = $(id); if (el) el.value = '';
    });

    state.skills = [];
    state.experience = [];
    state.education = [];
    state.projects = [];

    renderSkills();
    renderList('experience');
    renderList('education');
    renderList('project');
    render();
    updateUnlockButton();
  });

  // ═══════════════════════════════════════════
  //   PDF GENERATION
  // ═══════════════════════════════════════════

  async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const palettes = {
      classic: { primary: [168, 85, 247], dark: [17, 17, 17], muted: [120, 120, 130], bg: [255, 255, 255], accent: [109, 40, 217] },
      modern:  { primary: [34, 211, 238], dark: [15, 23, 42], muted: [100, 116, 139], bg: [255, 255, 255], accent: [8, 145, 178] },
      minimal: { primary: [17, 17, 17],   dark: [17, 17, 17], muted: [120, 120, 130], bg: [255, 255, 255], accent: [50, 50, 50] },
    };
    const c = palettes[state.template] || palettes.classic;

    const PAGE_W = 210, PAGE_H = 297;
    const M = 16;
    const CONTENT_W = PAGE_W - M * 2;

    doc.setFillColor(...c.bg);
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

    doc.setFillColor(...c.primary);
    doc.rect(0, 0, PAGE_W, 3, 'F');

    let y = M + 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...c.dark);
    doc.text($('name')?.value || 'Your Name', M, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...c.accent);
    doc.text($('jobTitle')?.value || '', M, y);
    y += 5;

    const contacts = [];
    if ($('email')?.value)    contacts.push($('email').value);
    if ($('phone')?.value)    contacts.push($('phone').value);
    if ($('location')?.value) contacts.push($('location').value);
    if ($('website')?.value)  contacts.push($('website').value);

    if (contacts.length) {
      doc.setFontSize(9);
      doc.setTextColor(...c.muted);
      doc.text(contacts.join('   ·   '), M, y);
      y += 5;
    }

    doc.setDrawColor(...c.primary);
    doc.setLineWidth(0.4);
    doc.line(M, y, PAGE_W - M, y);
    y += 7;

    function checkOverflow(needed = 20) {
      if (y + needed > PAGE_H - 15) {
        doc.addPage();
        doc.setFillColor(...c.bg);
        doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
        doc.setFillColor(...c.primary);
        doc.rect(0, 0, PAGE_W, 3, 'F');
        y = M + 6;
      }
    }

    function sectionHead(title) {
      checkOverflow(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...c.accent);
      doc.text(title.toUpperCase(), M, y);
      y += 2;
      doc.setDrawColor(...c.primary);
      doc.setLineWidth(0.25);
      doc.line(M, y, M + 25, y);
      y += 6;
    }

    function para(text, size = 10, color = c.dark, xOffset = 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const wrapped = doc.splitTextToSize(text, CONTENT_W - xOffset);
      wrapped.forEach(line => {
        checkOverflow(6);
        doc.text(line, M + xOffset, y);
        y += 4.6;
      });
    }

    // Summary
    if ($('summary')?.value?.trim()) {
      sectionHead('Summary');
      para($('summary').value.trim());
      y += 4;
    }

    // Experience
    const exps = (state.experience || []).filter(e => e.role || e.company);
    if (exps.length) {
      sectionHead('Experience');
      exps.forEach(e => {
        checkOverflow(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...c.dark);
        doc.text(e.role || '', M, y);
        if (e.from || e.to) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(...c.muted);
          const range = `${e.from || ''}${e.from && e.to ? ' – ' : ''}${e.to || ''}`;
          doc.text(range, PAGE_W - M, y, { align: 'right' });
        }
        y += 4.6;
        if (e.company) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9.5);
          doc.setTextColor(...c.accent);
          doc.text(e.company, M, y);
          y += 4.5;
        }
        if (e.description) para(e.description, 9.5, [70, 70, 80], 3);
        y += 3;
      });
    }

    // Education
    const edus = (state.education || []).filter(e => e.degree || e.school);
    if (edus.length) {
      sectionHead('Education');
      edus.forEach(e => {
        checkOverflow(18);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...c.dark);
        doc.text(e.degree || '', M, y);
        if (e.from || e.to) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(...c.muted);
          const range = `${e.from || ''}${e.from && e.to ? ' – ' : ''}${e.to || ''}`;
          doc.text(range, PAGE_W - M, y, { align: 'right' });
        }
        y += 4.6;
        if (e.school) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9.5);
          doc.setTextColor(...c.accent);
          doc.text(e.school, M, y);
          y += 4.5;
        }
        if (e.score) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(...c.muted);
          doc.text(e.score, M, y);
          y += 4.5;
        }
        y += 3;
      });
    }

    // Skills
    if (state.skills.length) {
      sectionHead('Skills');
      para(state.skills.join('   •   '), 10);
      y += 4;
    }

    // Projects
    const projs = (state.projects || []).filter(p => p.name);
    if (projs.length) {
      sectionHead('Projects');
      projs.forEach(p => {
        checkOverflow(18);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...c.dark);
        doc.text(p.name || '', M, y);
        if (p.tech) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(...c.muted);
          doc.text(p.tech, PAGE_W - M, y, { align: 'right' });
        }
        y += 4.6;
        if (p.description) para(p.description, 9.5, [70, 70, 80], 3);
        y += 3;
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(M, PAGE_H - 12, PAGE_W - M, PAGE_H - 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 155);
      doc.text('Generated by LIFEKit AI', M, PAGE_H - 7);
      doc.text(`Page ${i} / ${pageCount}`, PAGE_W - M, PAGE_H - 7, { align: 'right' });
    }

    const safeName = ($('name')?.value || 'lifekit').trim().replace(/\s+/g, '-').toLowerCase();
    doc.save(`resume-${safeName}.pdf`);
  }

  // ═══════════════════════════════════════════
  //   DOWNLOAD BUTTON
  // ═══════════════════════════════════════════

  async function handleDownload() {
    // 1. Fast path — localStorage
    if (state.paid || (window.LIFEKitPayment && window.LIFEKitPayment.isPaid('resume'))) {
      state.paid = true;
      updateUnlockButton();
      return downloadPDF();
    }

    // 2. Form validation
    if (!isFormValid()) {
      alert('Please enter your full name first.');
      $('name')?.focus();
      return;
    }

    // 3. Fresh payment
    const customerName = $('name')?.value || '';

    if (!window.LIFEKitPayment) {
      alert('Payment system not loaded. Please refresh.');
      return;
    }

    window.LIFEKitPayment.openCheckout('resume', customerName, {
      onSuccess: () => {
        state.paid = true;
        updateUnlockButton();
        setTimeout(() => downloadPDF(), 600);
      },
      onCancel: () => updateUnlockButton(),
    });
  }

  $('downloadBtn')?.addEventListener('click', handleDownload);
  $('navDownload')?.addEventListener('click', e => {
    e.preventDefault();
    handleDownload();
  });

  // "Already paid?" button
  $('alreadyPaidBtn')?.addEventListener('click', async () => {
    if (!window.LIFEKitPayment) return;
    const found = await window.LIFEKitPayment.checkExistingPayment('resume');
    if (found) {
      state.paid = true;
      updateUnlockButton();
      setTimeout(() => downloadPDF(), 600);
    } else {
      alert('No payment found for that email/phone.\n\nIf you just paid, wait 20 seconds and try again.');
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleDownload();
    }
    if (e.key === 'Escape') {
      document.querySelector('.preview-fullscreen')?.remove();
    }
  });

  // Return from payment
  window.addEventListener('lifekit:paid', (e) => {
    if (e.detail.product === 'resume') {
      state.paid = true;
      updateUnlockButton();
      setTimeout(() => downloadPDF(), 800);
    }
  });

  // ═══════════════════════════════════════════
  //   INIT
  // ═══════════════════════════════════════════

  // Seed one empty item for each list so users see the form pattern
  state.experience.push({ role: '', company: '', from: '', to: '', description: '' });
  state.education.push({ degree: '', school: '', from: '', to: '', score: '' });
  state.projects.push({ name: '', tech: '', description: '' });

  renderList('experience');
  renderList('education');
  renderList('project');
  renderSkills();
  render();

  if (window.LIFEKitPayment && window.LIFEKitPayment.isPaid('resume')) {
    state.paid = true;
  }
  updateUnlockButton();

})();