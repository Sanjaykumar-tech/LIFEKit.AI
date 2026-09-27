/* ═══════════════════════════════════════════
   LIFEKit AI — Resume Maker
   Native jsPDF output (real text, no screenshots)
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  // ── STATE ─────────────────────────────
  const state = {
    template: 'classic',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    paid: false,
  };

  const preview   = $('preview');
  const watermark = $('watermark');

  // ── TEMPLATE SWITCH ───────────────────
  document.querySelectorAll('.template-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.template-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.template = btn.dataset.template;
      render();
    });
  });

  // ── SIMPLE FIELDS ─────────────────────
  ['name','jobTitle','email','phone','location','website','summary'].forEach(id => {
    $(id)?.addEventListener('input', render);
  });

  // ── LIST CONFIG ───────────────────────
  const listConfigs = {
    experience: {
      container: 'experienceList',
      fields: [
        { key: 'role',        placeholder: 'Job Title',      span: 1 },
        { key: 'company',     placeholder: 'Company',        span: 1 },
        { key: 'from',        placeholder: 'From (e.g. 2022)', span: 1 },
        { key: 'to',          placeholder: 'To (e.g. Present)', span: 1 },
        { key: 'description', placeholder: 'Describe your work (2–3 lines)', span: 2, textarea: true },
      ],
    },
    education: {
      container: 'educationList',
      fields: [
        { key: 'degree', placeholder: 'Degree / Course',    span: 1 },
        { key: 'school', placeholder: 'School / University', span: 1 },
        { key: 'from',   placeholder: 'From (e.g. 2018)',   span: 1 },
        { key: 'to',     placeholder: 'To (e.g. 2022)',     span: 1 },
        { key: 'score',  placeholder: 'Score (e.g. 8.5 CGPA)', span: 2 },
      ],
    },
    project: {
      container: 'projectList',
      fields: [
        { key: 'name',        placeholder: 'Project Name',    span: 1 },
        { key: 'tech',        placeholder: 'Tech Stack',      span: 1 },
        { key: 'description', placeholder: 'What it does + your role (2–3 lines)', span: 2, textarea: true },
      ],
    },
  };

  function makeItemHTML(config, index, item = {}) {
    const fieldsHTML = config.fields.map(f => {
      const value = item[f.key] || '';
      const span = f.span === 2 ? ' rs-span-2' : '';
      const tag = f.textarea ? 'textarea' : 'input';
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
    const container = $(config.container);
    if (!container) return;

    container.innerHTML = state[type].map((item, i) =>
      makeItemHTML(config, i, item)
    ).join('');

    container.querySelectorAll('.rs-item').forEach(el => {
      const idx = +el.dataset.index;
      el.querySelectorAll('.rs-item-input').forEach(input => {
        input.addEventListener('input', () => {
          state[type][idx][input.dataset.key] = input.value;
          render();
        });
      });
      el.querySelector('.rs-item-remove')?.addEventListener('click', () => {
        state[type].splice(idx, 1);
        renderList(type);
        render();
      });
    });
  }

  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.add;
      const empty = {};
      listConfigs[type].fields.forEach(f => { empty[f.key] = ''; });
      state[type].push(empty);
      renderList(type);
      render();
      const container = $(listConfigs[type].container);
      container.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // ── SKILLS ────────────────────────────
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

  // ── HELPERS ───────────────────────────
  const esc = str => String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // ── RENDER PREVIEW ────────────────────
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

    const expHTML = state.experience
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

    const eduHTML = state.education
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

    const projHTML = state.projects
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

      ${summary ? `
        <div class="rs-doc-section"><h2>Summary</h2>
          <div class="rs-doc-summary">${esc(summary).replace(/\n/g, '<br>')}</div>
        </div>` : ''}

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

  // ── WATERMARK ─────────────────────────
  $('previewBtn')?.addEventListener('click', () => watermark.classList.toggle('hidden'));

  // ── FULLSCREEN ────────────────────────
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

  // ── RESET ─────────────────────────────
  $('resetBtn')?.addEventListener('click', () => {
    if (!confirm('Clear everything?')) return;
    ['name','jobTitle','email','phone','location','website','summary','skillInput'].forEach(id => {
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
  });

  // ═══════════════════════════════════════════
  //   PDF GENERATION — native jsPDF
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

    // Background
    doc.setFillColor(...c.bg);
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

    // Top accent bar
    doc.setFillColor(...c.primary);
    doc.rect(0, 0, PAGE_W, 3, 'F');

    let y = M + 6;

    // ── HEADER ──
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

    // Contact line
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

    // Divider
    doc.setDrawColor(...c.primary);
    doc.setLineWidth(0.4);
    doc.line(M, y, PAGE_W - M, y);
    y += 7;

    // ── Helpers ──
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

    // ── SUMMARY ──
    if ($('summary')?.value?.trim()) {
      sectionHead('Summary');
      para($('summary').value.trim());
      y += 4;
    }

    // ── EXPERIENCE ──
    const exps = state.experience.filter(e => e.role || e.company);
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

        if (e.description) {
          para(e.description, 9.5, [70, 70, 80], 3);
        }

        y += 3;
      });
    }

    // ── EDUCATION ──
    const edus = state.education.filter(e => e.degree || e.school);
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

    // ── SKILLS ──
    if (state.skills.length) {
      sectionHead('Skills');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...c.dark);

      // Wrap chips as a comma list — cleaner than manual chips in PDF
      const skillsText = state.skills.join('   •   ');
      para(skillsText, 10);
      y += 4;
    }

    // ── PROJECTS ──
    const projs = state.projects.filter(p => p.name);
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

        if (p.description) {
          para(p.description, 9.5, [70, 70, 80], 3);
        }
        y += 3;
      });
    }

    // ── FOOTER ──
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

    // ── SAVE ──
    const safeName = ($('name')?.value || 'lifekit').trim().replace(/\s+/g, '-').toLowerCase();
    doc.save(`resume-${safeName}.pdf`);
  }

  // ── DOWNLOAD BUTTON ───────────────────
    // ── DOWNLOAD BUTTON ───────────────────
  function handleDownload() {
    if (state.paid || window.LIFEKitPayment.isPaid('resume')) {
      state.paid = true;
      setButtonState('paid');
      return downloadPDF();
    }

    const customerName = $('name')?.value || '';

    window.LIFEKitPayment.openCheckout('resume', customerName, {
      onSuccess: () => {
        state.paid = true;
        setButtonState('paid');
        setTimeout(() => downloadPDF(), 600);
      },
      onCancel: () => {
        setButtonState('default');
      },
    });

    setButtonState('processing');
  }

  function setButtonState(stateName) {
    const btn = $('downloadBtn');
    const navBtn = $('navDownload');
    if (!btn) return;

    if (stateName === 'processing') {
      btn.disabled = true;
      btn.textContent = 'Opening payment…';
    } else if (stateName === 'paid') {
      btn.disabled = false;
      btn.textContent = '⬇ Download PDF';
      if (navBtn) navBtn.textContent = 'Download PDF';
    } else {
      btn.disabled = false;
      btn.textContent = '🔓 Unlock HD PDF — ₹49';
    }
  }

  window.addEventListener('lifekit:paid', (e) => {
    if (e.detail.product === 'resume') {
      state.paid = true;
      setButtonState('paid');
      setTimeout(() => downloadPDF(), 800);
    }
  });

  if (window.LIFEKitPayment?.isPaid('resume')) {
    state.paid = true;
    setButtonState('paid');
  }

  $('downloadBtn')?.addEventListener('click', handleDownload);
  $('navDownload')?.addEventListener('click', e => {
    e.preventDefault();
    handleDownload();
  });
  
  // ── KEYBOARD ──────────────────────────
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleDownload(); }
    if (e.key === 'Escape') document.querySelector('.preview-fullscreen')?.remove();
  });

  // ── INIT ──────────────────────────────
  state.experience.push({ role: '', company: '', from: '', to: '', description: '' });
  state.education.push({ degree: '', school: '', from: '', to: '', score: '' });
  state.projects.push({ name: '', tech: '', description: '' });

  renderList('experience');
  renderList('education');
  renderList('project');
  renderSkills();
  render();

})();