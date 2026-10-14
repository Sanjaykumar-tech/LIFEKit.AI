/* ═══════════════════════════════════════════
   LIFEKit AI — Payment Module v8 (FREE MODE)
   No payment — everything is free
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ═══════════════════════════════════════════
  //   🎁 FREE MODE ACTIVE
  //   Set FREE_MODE = false when you want pricing back
  // ═══════════════════════════════════════════
  const FREE_MODE = true;

  if (FREE_MODE) {
    // Auto-mark all products as paid on page load
    ['biodata', 'resume', 'wishes'].forEach(p => {
      try {
        localStorage.setItem(`lifekit_paid_${p}`, JSON.stringify({
          product: p,
          amount: 0,
          ts: Date.now(),
          source: 'free-launch',
          verified: true,
        }));
      } catch (e) {}
    });
  }
  // ═══════════════════════════════════════════

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
      .lkp-title{font-size:1.45rem;font-weight:800;letter-spacing:-0.025em;margin-bottom:8px;color:#fff;line-height:1.2;}
      .lkp-subtitle{font-size:0.93rem;color:#9a95b8;line-height:1.55;margin-bottom:24px;max-width:340px;margin-left:auto;margin-right:auto;}
      .lkp-actions{display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:18px;}
      .lkp-btn{padding:15px 22px;border-radius:16px;font-family:inherit;font-size:0.95rem;font-weight:700;cursor:pointer;border:1.5px solid transparent;transition:all .2s cubic-bezier(.2,.9,.3,1.3);}
      .lkp-btn-primary{background:linear-gradient(135deg,#a855f7 0%,#c026d3 100%);color:#fff;box-shadow:0 8px 32px rgba(192,38,211,0.45),inset 0 1px 0 rgba(255,255,255,0.15);}
      .lkp-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(192,38,211,0.6);}
      @media(max-width:480px){.lkp-dialog{padding:32px 22px 24px;border-radius:22px;}.lkp-title{font-size:1.2rem;}.lkp-icon-badge{width:68px;height:68px;font-size:1.8rem;border-radius:22px;}}
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }

  // ═══════════════════════════════════════════
  //   CONFIG
  // ═══════════════════════════════════════════
  const WORKER_URL = 'https://lifekit-worker.lifekitai.workers.dev';
  const PRICES = { biodata: 0, resume: 0, wishes: 0 };

  // ═══════════════════════════════════════════
  //   MAIN ENTRY — Skip payment, direct success
  // ═══════════════════════════════════════════
  function openCheckout(product, name, callbacks = {}) {
    const { onSuccess = () => {}, onCancel = () => {} } = callbacks;

    // 🎁 FREE MODE — Skip payment, call success immediately
    if (FREE_MODE) {
      markPaid(product, 0, 'free', name);
      // Small delay for smooth UX
      setTimeout(() => onSuccess({ product, amount: 0, method: 'free' }), 100);
      return;
    }

    // ── Payment mode (only if FREE_MODE = false) ──
    const PAYMENT_LINKS = {
      biodata: 'https://payments-test.cashfree.com/links?code=Xb434uba83ig_AAAAAACsHIU',
      resume:  'https://payments-test.cashfree.com/links?code=db437osg83ig_AAAAAACsHIU',
      wishes:  'https://payments-test.cashfree.com/links?code=pb436t67e3ig_AAAAAACsHIU',
    };
    const link = PAYMENT_LINKS[product];
    if (!link) { onCancel({ reason: 'unknown_product' }); return; }

    // Open Cashfree in new tab
    const win = window.open(link, '_blank');
    if (!win) { location.href = link; return; }

    // Poll for return
    let stopped = false;
    let checks = 0;
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => {
          if (isPaid(product)) {
            stopped = true;
            onSuccess({ product, method: 'return' });
          } else if (++checks >= 10) {
            stopped = true;
            onCancel({ reason: 'timeout' });
          }
        }, 1500);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    setTimeout(() => {
      document.removeEventListener('visibilitychange', onVisible);
      if (!stopped && isPaid(product)) onSuccess({ product });
    }, 60000);
  }

  // ═══════════════════════════════════════════
  //   STATE HELPERS
  // ═══════════════════════════════════════════
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
    if (FREE_MODE) return true;   // 🎁 Always paid in free mode
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

  async function isPaidAsync(product) {
    return isPaid(product);
  }

  async function checkExistingPayment(product) {
    return isPaid(product);
  }

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

  // ═══════════════════════════════════════════
  //   URL RETURN (handles ?paid=biodata)
  // ═══════════════════════════════════════════
  function checkReturnUrl() {
    const params = new URLSearchParams(location.search);
    const paid = params.get('paid');
    if (paid && ['biodata', 'resume', 'wishes'].includes(paid)) {
      const clean = location.pathname + location.hash;
      history.replaceState({}, '', clean);
      markPaid(paid, 0, 'url-return');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lifekit:paid', {
          detail: { product: paid }
        }));
      }, 300);
    }
  }
  checkReturnUrl();

  // ═══════════════════════════════════════════
  //   EXPOSE
  // ═══════════════════════════════════════════
  window.LIFEKitPayment = {
    openCheckout,
    isPaid,
    isPaidAsync,
    checkExistingPayment,
    verifyWithWorker,
    resetPaid,
    markPaid,
    PRICES,
    WORKER_URL,
    FREE_MODE,
  };

})();