/* ═══════════════════════════════════════════
   LIFEKit AI — Payment Module v8 (Cashfree)
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  const STYLE_ID = 'lkp-styles';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .lkp-modal{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;padding:20px;font-family:'Inter',system-ui,sans-serif;animation:lkpIn .35s ease;}
      .lkp-modal.lkp-closing{animation:lkpOut .25s ease forwards;}
      @keyframes lkpIn{from{opacity:0;}to{opacity:1;}}
      @keyframes lkpOut{to{opacity:0;}}
      .lkp-backdrop{position:absolute;inset:0;background:rgba(6,4,12,0.8);backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);}
      .lkp-dialog{position:relative;background:radial-gradient(circle at 50% 0%,rgba(168,85,247,0.12),transparent 60%),linear-gradient(180deg,#131022 0%,#0f0c1e 100%);border:1px solid rgba(168,85,247,0.25);border-radius:26px;padding:44px 34px 30px;max-width:440px;width:100%;text-align:center;color:#f8fafc;box-shadow:0 50px 120px rgba(0,0,0,0.8),0 0 100px rgba(192,38,211,0.18),inset 0 1px 0 rgba(255,255,255,0.06);animation:lkpPopIn .45s cubic-bezier(.2,.9,.3,1.15);overflow:hidden;}
      .lkp-modal.lkp-closing .lkp-dialog{animation:lkpPopOut .25s cubic-bezier(.4,.1,1,1) forwards;}
      @keyframes lkpPopIn{from{opacity:0;transform:translateY(40px) scale(0.9);}to{opacity:1;transform:translateY(0) scale(1);}}
      @keyframes lkpPopOut{to{opacity:0;transform:translateY(20px) scale(0.94);}}
      .lkp-dialog::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#c026d3 20%,#a855f7 50%,#22d3ee 80%,transparent);background-size:200% 100%;animation:lkpBorderFlow 3s linear infinite;}
      @keyframes lkpBorderFlow{to{background-position:200% 0;}}
      .lkp-icon-badge{width:84px;height:84px;border-radius:26px;display:grid;place-items:center;font-size:2.2rem;margin:0 auto 24px;animation:lkpFloat 3s ease-in-out infinite;}
      @keyframes lkpFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
      .lkp-gradient-biodata{background:linear-gradient(135deg,rgba(192,38,211,0.25),rgba(168,85,247,0.15));border:1.5px solid rgba(192,38,211,0.4);box-shadow:0 0 60px rgba(192,38,211,0.45);}
      .lkp-gradient-resume{background:linear-gradient(135deg,rgba(34,211,238,0.25),rgba(56,189,248,0.15));border:1.5px solid rgba(34,211,238,0.4);box-shadow:0 0 60px rgba(34,211,238,0.45);}
      .lkp-gradient-wishes{background:linear-gradient(135deg,rgba(236,72,153,0.25),rgba(192,38,211,0.15));border:1.5px solid rgba(236,72,153,0.4);box-shadow:0 0 60px rgba(236,72,153,0.45);}
      .lkp-verify-icon{width:88px;height:88px;margin:0 auto 22px;border-radius:50%;display:grid;place-items:center;color:#a855f7;background:radial-gradient(circle at 50% 50%,rgba(168,85,247,0.15),rgba(168,85,247,0.05));border:2px solid rgba(168,85,247,0.35);position:relative;transition:all .5s cubic-bezier(.2,.9,.3,1.2);}
      .lkp-verify-icon::before{content:'';position:absolute;inset:-8px;border-radius:50%;border:1px dashed rgba(168,85,247,0.2);animation:lkpOrbit 12s linear infinite;}
      @keyframes lkpOrbit{to{transform:rotate(360deg);}}
      .lkp-verify-icon svg{width:44px;height:44px;position:relative;z-index:1;}
      .lkp-check-path{stroke-dasharray:20;stroke-dashoffset:20;transition:stroke-dashoffset .6s ease .2s;}
      .lkp-verify-icon.lkp-success{color:#22c55e;background:radial-gradient(circle at 50% 50%,rgba(34,197,94,0.2),rgba(34,197,94,0.05));border-color:rgba(34,197,94,0.6);box-shadow:0 0 60px rgba(34,197,94,0.6);animation:lkpSuccessPop .6s cubic-bezier(.2,.9,.3,1.6);}
      .lkp-verify-icon.lkp-success .lkp-check-path{stroke-dashoffset:0;}
      @keyframes lkpSuccessPop{0%{transform:scale(1);}45%{transform:scale(1.18);}100%{transform:scale(1);}}
      .lkp-verify-icon.lkp-error{color:#ef4444;background:radial-gradient(circle at 50% 50%,rgba(239,68,68,0.18),rgba(239,68,68,0.05));border-color:rgba(239,68,68,0.6);animation:lkpErrorShake .5s ease;}
      @keyframes lkpErrorShake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-10px);}40%,80%{transform:translateX(10px);}}
      .lkp-title{font-size:1.45rem;font-weight:800;letter-spacing:-0.025em;margin-bottom:8px;color:#fff;line-height:1.2;}
      .lkp-subtitle{font-size:0.93rem;color:#9a95b8;line-height:1.55;margin-bottom:24px;max-width:340px;margin-left:auto;margin-right:auto;}
      .lkp-price{display:flex;align-items:baseline;justify-content:center;gap:3px;margin:6px 0 22px;}
      .lkp-price-currency{font-size:1.6rem;font-weight:700;color:#c026d3;text-shadow:0 0 20px rgba(192,38,211,0.5);}
      .lkp-price-value{font-size:3.2rem;font-weight:900;letter-spacing:-0.045em;line-height:1;background:linear-gradient(120deg,#c026d3 0%,#a855f7 45%,#22d3ee 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:lkpShine 3.5s linear infinite;filter:drop-shadow(0 0 30px rgba(168,85,247,0.4));}
      @keyframes lkpShine{to{background-position:200% center;}}
      .lkp-note{font-size:0.86rem;color:#9a95b8;line-height:1.6;margin-bottom:26px;max-width:320px;margin-left:auto;margin-right:auto;}
      .lkp-input-wrap{margin-bottom:22px;transition:transform .3s;}
      .lkp-input{width:100%;background:rgba(6,4,12,0.7);border:1.5px solid #332a52;border-radius:16px;padding:15px 20px;color:#f8fafc;font-family:inherit;font-size:1rem;outline:none;transition:all .3s;text-align:center;}
      .lkp-input::placeholder{color:#4b4a5c;font-size:0.9rem;}
      .lkp-input:focus{border-color:#a855f7;box-shadow:0 0 0 5px rgba(168,85,247,0.12),0 0 40px rgba(168,85,247,0.25);background:rgba(6,4,12,0.95);}
      .lkp-input-wrap.lkp-error .lkp-input{border-color:#ef4444;box-shadow:0 0 0 5px rgba(239,68,68,0.12);}
      .lkp-input-wrap.lkp-shake{animation:lkpErrorShake .5s ease;}
      .lkp-verifying{display:flex;flex-direction:column;align-items:center;gap:18px;padding:28px 0;margin-bottom:20px;}
      .lkp-spinner{width:50px;height:50px;border-radius:50%;background:conic-gradient(from 0deg,transparent 0deg,#c026d3 90deg,#a855f7 200deg,#22d3ee 320deg,transparent 360deg);-webkit-mask:radial-gradient(circle,transparent 20px,#000 21px);mask:radial-gradient(circle,transparent 20px,#000 21px);animation:lkpSpin 0.9s linear infinite;filter:drop-shadow(0 0 16px rgba(192,38,211,0.6));}
      @keyframes lkpSpin{to{transform:rotate(360deg);}}
      .lkp-verifying-text{font-size:0.92rem;color:#9a95b8;font-weight:500;animation:lkpTextPulse 1.6s ease-in-out infinite;}
      @keyframes lkpTextPulse{0%,100%{opacity:0.5;}50%{opacity:1;}}
      .lkp-actions{display:grid;grid-template-columns:1fr 1.5fr;gap:12px;margin-bottom:18px;}
      .lkp-btn{padding:15px 22px;border-radius:16px;font-family:inherit;font-size:0.95rem;font-weight:700;cursor:pointer;border:1.5px solid transparent;transition:all .2s cubic-bezier(.2,.9,.3,1.3);position:relative;overflow:hidden;}
      .lkp-btn-ghost{background:transparent;color:#9a95b8;border-color:#332a52;}
      .lkp-btn-ghost:hover{color:#f8fafc;border-color:#a855f7;background:rgba(168,85,247,0.06);}
      .lkp-btn-primary{background:linear-gradient(135deg,#a855f7 0%,#c026d3 100%);color:#fff;box-shadow:0 8px 32px rgba(192,38,211,0.45),inset 0 1px 0 rgba(255,255,255,0.15);}
      .lkp-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(192,38,211,0.6);}
      .lkp-btn:active{transform:translateY(0) scale(0.98);}
      .lkp-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none !important;}
      .lkp-secure{display:flex;align-items:center;justify-content:center;gap:7px;font-size:0.72rem;color:#6b6880;margin-top:6px;padding-top:18px;border-top:1px solid rgba(51,42,82,0.4);}
      .lkp-secure svg{width:12px;height:12px;opacity:0.6;}
      @media(max-width:480px){.lkp-dialog{padding:32px 22px 24px;border-radius:22px;}.lkp-price-value{font-size:2.6rem;}.lkp-title{font-size:1.2rem;}.lkp-icon-badge{width:68px;height:68px;font-size:1.8rem;border-radius:22px;}.lkp-verify-icon{width:76px;height:76px;}.lkp-verify-icon svg{width:38px;height:38px;}.lkp-actions{grid-template-columns:1fr;}.lkp-btn{padding:14px 18px;}}
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }

  // ── CONFIG ────────────────────────────
  const PAYMENT_LINKS = {
    biodata: 'https://payments-test.cashfree.com/links?code=Xb434uba83ig_AAAAAACsHIU',
    resume:  'https://payments-test.cashfree.com/links?code=db437osg83ig_AAAAAACsHIU',
    wishes:  'https://payments-test.cashfree.com/links?code=pb436t67e3ig_AAAAAACsHIU',
  };

  const WORKER_URL = 'https://lifekit-worker.lifekitai.workers.dev';
  const PRICES = { biodata: 99, resume: 49, wishes: 19 };
  const TITLES = {
    biodata: 'Marriage Biodata PDF',
    resume:  'Resume PDF',
    wishes:  'Wish Card PNG',
  };
  const ICONS = { biodata: '💍', resume: '💼', wishes: '❤️' };

  // ── MAIN ENTRY ────────────────────────
  function openCheckout(product, name, callbacks = {}) {
    const { onSuccess = () => {}, onCancel = () => {} } = callbacks;
    const link = PAYMENT_LINKS[product];
    if (!link) { onCancel({ reason: 'unknown_product' }); return; }

    showPayModal({
      product,
      price: PRICES[product],
      title: TITLES[product],
      icon: ICONS[product],
      onConfirm: () => {
        const win = window.open(link, '_blank');
        if (!win) { location.href = link; return; }
        waitForReturn(product, onSuccess, onCancel);
      },
      onCancel,
    });
  }

  // ── PAY MODAL ─────────────────────────
  function showPayModal({ product, price, title, icon, onConfirm, onCancel }) {
    const modal = createModal(`
      <div class="lkp-icon-badge lkp-gradient-${product}">${icon}</div>
      <h3 class="lkp-title">Ready to unlock?</h3>
      <p class="lkp-subtitle">${title}</p>
      <div class="lkp-price">
        <span class="lkp-price-currency">₹</span>
        <span class="lkp-price-value">${price}</span>
      </div>
      <p class="lkp-note">Secure Cashfree checkout.<br>After paying, come back here — we'll unlock your file.</p>
      <div class="lkp-actions">
        <button class="lkp-btn lkp-btn-ghost" data-action="cancel">Cancel</button>
        <button class="lkp-btn lkp-btn-primary" data-action="confirm">Pay ₹${price} →</button>
      </div>
      <div class="lkp-secure">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor"/></svg>
        Secured by Cashfree
      </div>
    `);
    modal.querySelector('[data-action="cancel"]').onclick = () => { closeModal(modal); onCancel?.(); };
    modal.querySelector('[data-action="confirm"]').onclick = () => { closeModal(modal); onConfirm?.(); };
  }

  // ── WAIT FOR RETURN ───────────────────
  function waitForReturn(product, onSuccess, onCancel) {
    let stopped = false;
    let checksDone = 0;
    const MAX_CHECKS = 10;

    async function tryCheck() {
      if (stopped) return;
      if (isPaid(product)) { stopped = true; onSuccess({ product, method: 'local' }); return; }
      checksDone++;
      if (checksDone >= MAX_CHECKS) {
        stopped = true;
        showVerifyModal(product, onSuccess, onCancel);
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') setTimeout(tryCheck, 1500);
    };
    document.addEventListener('visibilitychange', onVisible);

    const poll = setInterval(() => {
      if (stopped) return clearInterval(poll);
      tryCheck();
    }, 4000);

    setTimeout(() => {
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
      if (!stopped) {
        stopped = true;
        showVerifyModal(product, onSuccess, onCancel);
      }
    }, 40000);
  }

  // ── VERIFY MODAL ──────────────────────
  function showVerifyModal(product, onSuccess, onCancel) {
    const modal = createModal(`
      <div class="lkp-verify-icon" id="lkpIcon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" opacity="0.35"/>
          <path d="M8 12l3 3 6-6" class="lkp-check-path"/>
        </svg>
      </div>
      <h3 class="lkp-title" id="lkpTitle">Verify your payment</h3>
      <p class="lkp-subtitle" id="lkpSubtitle">Enter the email or phone you used while paying.</p>
      <div class="lkp-input-wrap" id="lkpInputWrap">
        <input type="text" class="lkp-input" id="lkpInput" placeholder="email@example.com or +91 98765 43210" autocomplete="email" autofocus />
      </div>
      <div class="lkp-verifying" id="lkpVerifying" style="display:none;">
        <div class="lkp-spinner"></div>
        <div class="lkp-verifying-text" id="lkpVerifyingText">Checking our servers…</div>
      </div>
      <div class="lkp-actions" id="lkpActions">
        <button class="lkp-btn lkp-btn-ghost" data-action="not-yet">Not yet</button>
        <button class="lkp-btn lkp-btn-primary" data-action="verify">Verify & Unlock</button>
      </div>
    `);

    const inputWrap = modal.querySelector('#lkpInputWrap');
    const input = modal.querySelector('#lkpInput');
    const verifying = modal.querySelector('#lkpVerifying');
    const actions = modal.querySelector('#lkpActions');
    const icon = modal.querySelector('#lkpIcon');
    const title = modal.querySelector('#lkpTitle');
    const subtitle = modal.querySelector('#lkpSubtitle');

    modal.querySelector('[data-action="not-yet"]').onclick = () => { closeModal(modal); onCancel?.(); };
    modal.querySelector('[data-action="verify"]').onclick = doVerify;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); doVerify(); }
    });

    async function doVerify() {
      const value = (input.value || '').trim();
      if (value.length < 3) {
        inputWrap.classList.add('lkp-error');
        setTimeout(() => inputWrap.classList.remove('lkp-error'), 500);
        input.focus();
        return;
      }
      inputWrap.style.display = 'none';
      actions.style.display = 'none';
      verifying.style.display = 'flex';

      const isEmail = value.includes('@');
      const email = isEmail ? value : '';
      const phone = !isEmail ? value : '';

      const result = await verifyWithWorker(product, email, phone);

      if (result.paid) {
        icon.classList.add('lkp-success');
        title.textContent = 'Payment verified! 🎉';
        subtitle.textContent = 'Unlocking your file now…';
        verifying.style.display = 'none';

        markPaid(product, PRICES[product], 'worker-verified', value);
        setTimeout(() => {
          closeModal(modal);
          setTimeout(() => onSuccess({ product, amount: PRICES[product], method: 'worker' }), 250);
        }, 1300);
      } else {
        verifying.style.display = 'none';
        inputWrap.style.display = 'block';
        actions.style.display = 'grid';
        title.textContent = 'Payment not found';
        subtitle.textContent = "We couldn't find a purchase for that email/phone.";
        icon.classList.add('lkp-error');
        setTimeout(() => icon.classList.remove('lkp-error'), 700);
        inputWrap.classList.add('lkp-shake');
        setTimeout(() => inputWrap.classList.remove('lkp-shake'), 600);
      }
    }
  }

  // ── MODAL HELPERS ─────────────────────
  function createModal(html) {
    injectStyles();
    const modal = document.createElement('div');
    modal.className = 'lkp-modal';
    modal.innerHTML = `<div class="lkp-backdrop"></div><div class="lkp-dialog">${html}</div>`;
    document.body.appendChild(modal);
    modal.querySelector('.lkp-backdrop').onclick = () => closeModal(modal);
    const escHandler = (e) => {
      if (e.key === 'Escape') { closeModal(modal); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);
    return modal;
  }

  function closeModal(modal) {
    if (!modal || !modal.parentNode) return;
    modal.classList.add('lkp-closing');
    setTimeout(() => modal.remove(), 250);
  }

  // ── STATE HELPERS ─────────────────────
  function markPaid(product, amount, source, identity) {
    try {
      localStorage.setItem(`lifekit_paid_${product}`, JSON.stringify({
        product, amount, ts: Date.now(),
        source: source || 'manual',
        identity: identity || null,
        verified: true,
      }));
    } catch (e) {}
  }

  function isPaid(product) {
    try {
      const raw = localStorage.getItem(`lifekit_paid_${product}`);
      if (!raw) return false;
      const data = JSON.parse(raw);
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - data.ts > THIRTY_DAYS) {
        localStorage.removeItem(`lifekit_paid_${product}`);
        return false;
      }
      return true;
    } catch (e) { return false; }
  }

  function resetPaid(product) {
    try { localStorage.removeItem(`lifekit_paid_${product}`); } catch (e) {}
  }

  // ── WORKER VERIFICATION ───────────────
  async function verifyWithWorker(product, email, phone, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const url = `${WORKER_URL}/verify?product=${encodeURIComponent(product)}&email=${encodeURIComponent(email || '')}&phone=${encodeURIComponent(phone || '')}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
          if (res.status === 400) return { paid: false, error: 'Invalid input' };
          throw new Error(`HTTP ${res.status}`);
        }
        return await res.json();
      } catch (err) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 500 * attempt));
        } else {
          return { paid: false, error: err.message };
        }
      }
    }
    return { paid: false };
  }

  // ── PUBLIC API ────────────────────────
  async function isPaidAsync(product) {
    return isPaid(product);
  }

  async function checkExistingPayment(product) {
    if (isPaid(product)) return true;
    return new Promise((resolve) => {
      showVerifyModal(product, () => resolve(true), () => resolve(false));
    });
  }

  // ── URL RETURN ────────────────────────
  function checkReturnUrl() {
    const params = new URLSearchParams(location.search);
    const paid = params.get('paid');
    if (paid && ['biodata', 'resume', 'wishes'].includes(paid)) {
      const clean = location.pathname + location.hash;
      history.replaceState({}, '', clean);
      setTimeout(() => {
        showVerifyModal(paid,
          () => window.dispatchEvent(new CustomEvent('lifekit:paid', { detail: { product: paid } })),
          () => {}
        );
      }, 500);
    }
  }
  checkReturnUrl();

  // ── EXPOSE ────────────────────────────
  window.LIFEKitPayment = {
    openCheckout,
    isPaid,
    isPaidAsync,
    checkExistingPayment,
    verifyWithWorker,
    resetPaid,
    markPaid,
    PRICES,
    PAYMENT_LINKS,
    WORKER_URL,
  };

})();