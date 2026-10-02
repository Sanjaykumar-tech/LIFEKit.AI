/* ═══════════════════════════════════════════
   LIFEKit AI — Payment Module (Final v4)
   Razorpay + Cloudflare Worker verification
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ═══════════════════════════════════════════
  //   CONFIG
  // ═══════════════════════════════════════════

  const PAYMENT_LINKS = {
    biodata: 'https://rzp.io/rzp/two4ho0',
    resume:  'https://rzp.io/rzp/GoDZGs2',
    wishes:  'https://rzp.io/rzp/rAMaqsm3',
  };

  const WORKER_URL = 'https://lifekit-worker.lifekitai.workers.dev';

  const PRICES = {
    biodata: 99,
    resume:  49,
    wishes:  19,
  };

  const TITLES = {
    biodata: 'Marriage Biodata PDF',
    resume:  'Resume PDF',
    wishes:  'Wish Card PNG',
  };

  // ═══════════════════════════════════════════
  //   MAIN ENTRY
  // ═══════════════════════════════════════════

  function openCheckout(product, name, callbacks = {}) {
    const { onSuccess = () => {}, onCancel = () => {} } = callbacks;

    const link = PAYMENT_LINKS[product];
    if (!link) {
      alert('Payment link not configured.');
      onCancel({ reason: 'unknown_product' });
      return;
    }

    const price = PRICES[product] || 0;

    showPayModal({
      title: TITLES[product],
      price,
      onConfirm: () => {
        const win = window.open(link, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          location.href = link;
          return;
        }
        waitForReturn(product, price, onSuccess, onCancel);
      },
      onCancel,
    });
  }

  // ═══════════════════════════════════════════
  //   MODAL — REDIRECT
  // ═══════════════════════════════════════════

  function showPayModal({ title, price, onConfirm, onCancel }) {
    const modal = document.createElement('div');
    modal.className = 'lk-pay-modal';
    modal.innerHTML = `
      <div class="lk-pay-backdrop"></div>
      <div class="lk-pay-dialog">
        <div class="lk-pay-icon">💳</div>
        <h3>Redirecting to Razorpay</h3>
        <p class="lk-pay-product">${title}</p>
        <div class="lk-pay-amount">₹${price}</div>
        <p class="lk-pay-note">You'll be taken to a secure Razorpay page. After payment, you'll return here automatically.</p>
        <div class="lk-pay-actions">
          <button class="lk-pay-cancel">Cancel</button>
          <button class="lk-pay-go">Continue →</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    injectModalStyles();

    const close = () => modal.remove();
    modal.querySelector('.lk-pay-backdrop').onclick = () => { close(); onCancel?.(); };
    modal.querySelector('.lk-pay-cancel').onclick = () => { close(); onCancel?.(); };
    modal.querySelector('.lk-pay-go').onclick = () => { close(); onConfirm?.(); };

    setTimeout(() => modal.querySelector('.lk-pay-go')?.focus(), 50);

    const esc = (e) => {
      if (e.key === 'Escape') { close(); onCancel?.(); document.removeEventListener('keydown', esc); }
    };
    document.addEventListener('keydown', esc);
  }

  // ═══════════════════════════════════════════
  //   WAIT FOR RETURN
  // ═══════════════════════════════════════════

  function waitForReturn(product, price, onSuccess, onCancel) {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', onVisible);
        setTimeout(() => {
          if (!isPaid(product)) {
            showConfirmModal(product, price, onSuccess, onCancel);
          }
        }, 1500);
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    setTimeout(() => {
      document.removeEventListener('visibilitychange', onVisible);
      if (!isPaid(product)) {
        showConfirmModal(product, price, onSuccess, onCancel);
      }
    }, 180000);
  }

  // ═══════════════════════════════════════════
  //   MODAL — CONFIRM (with worker verification)
  // ═══════════════════════════════════════════

  function showConfirmModal(product, price, onSuccess, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'lk-pay-modal';
    modal.innerHTML = `
      <div class="lk-pay-backdrop"></div>
      <div class="lk-pay-dialog">
        <div class="lk-pay-icon">✅</div>
        <h3>Did you complete the payment?</h3>
        <p class="lk-pay-product">₹${price} · ${product}</p>
        <p class="lk-pay-note">Enter your email or phone used for payment. We'll verify with our server.</p>
        <div class="lk-pay-actions lk-pay-actions-3">
          <button class="lk-pay-not-yet">Not yet</button>
          <button class="lk-pay-trouble">I had trouble</button>
          <button class="lk-pay-success">Verify & Unlock ✓</button>
        </div>
        <p class="lk-pay-fineprint">We check our secure server for your purchase.</p>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('.lk-pay-backdrop').onclick = () => { close(); onCancel?.(); };
    modal.querySelector('.lk-pay-not-yet').onclick = () => { close(); onCancel?.(); };
    modal.querySelector('.lk-pay-trouble').onclick = () => {
      close();
      alert('Sorry! Please retry or email sanjaykumarnov12@gmail.com');
      onCancel?.({ reason: 'payment_trouble' });
    };
    modal.querySelector('.lk-pay-success').onclick = async () => {
      const input = prompt(
        'Enter the email or phone number you used for payment:\n\n' +
        '(We\'ll check our server — if you paid, we\'ll unlock it.)'
      );
      if (!input || input.trim().length < 3) {
        alert('Email or phone required. Please check your Razorpay receipt.');
        return;
      }
      const trimmed = input.trim();
      const isEmail = trimmed.includes('@');
      const email = isEmail ? trimmed : '';
      const phone = !isEmail ? trimmed : '';

      const btn = modal.querySelector('.lk-pay-success');
      btn.textContent = 'Verifying…';
      btn.disabled = true;

      const result = await verifyWithWorker(product, email, phone);

      if (result.paid) {
        close();
        markPaid(product, price, 'worker-verified');
        try {
          localStorage.setItem(`lifekit_paid_${product}`, JSON.stringify({
            product,
            amount: price,
            ts: Date.now(),
            verified: true,
            source: 'worker',
            identity: trimmed,
          }));
        } catch (e) {}
        onSuccess({ product, amount: price, method: 'worker' });
      } else {
        btn.textContent = 'Verify & Unlock ✓';
        btn.disabled = false;
        alert(
          'We couldn\'t find a payment for that email/phone.\n\n' +
          'If you paid, please:\n' +
          '1. Wait 30 seconds for the server to process\n' +
          '2. Double-check your email/phone\n' +
          '3. Try again\n\n' +
          'Or email sanjaykumarnov12@gmail.com with your Payment ID.'
        );
      }
    };
  }

  // ═══════════════════════════════════════════
  //   STATE
  // ═══════════════════════════════════════════

  function markPaid(product, amount, paymentId) {
    try {
      localStorage.setItem(`lifekit_paid_${product}`, JSON.stringify({
        product,
        amount,
        ts: Date.now(),
        paymentId: paymentId || null,
        verified: false,
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
    } catch (e) {
      return false;
    }
  }

  function resetPaid(product) {
    try { localStorage.removeItem(`lifekit_paid_${product}`); } catch (e) {}
  }

  // ═══════════════════════════════════════════
  //   WORKER VERIFICATION
  // ═══════════════════════════════════════════

  async function verifyWithWorker(product, email, phone) {
    try {
      const url = `${WORKER_URL}/verify?product=${encodeURIComponent(product)}&email=${encodeURIComponent(email || '')}&phone=${encodeURIComponent(phone || '')}`;
      const res = await fetch(url);
      if (!res.ok) return { paid: false };
      const data = await res.json();
      console.log('[Worker] Verify result:', data);
      return data;
    } catch (err) {
      console.error('[Worker] Verify error:', err);
      return { paid: false };
    }
  }

  async function isPaidAsync(product) {
    // 1. Fast path — localStorage
    if (isPaid(product)) return true;

    // 2. Ask user for email/phone
    const input = prompt(
      'Enter the email or phone number you used for payment:\n\n' +
      '(We\'ll check our server — if you paid, we\'ll unlock it.)'
    );
    if (!input || input.trim().length < 3) return false;
    const trimmed = input.trim();
    const isEmail = trimmed.includes('@');
    const email = isEmail ? trimmed : '';
    const phone = !isEmail ? trimmed : '';

    // 3. Query worker
    const result = await verifyWithWorker(product, email, phone);

    if (result.paid) {
      try {
        localStorage.setItem(`lifekit_paid_${product}`, JSON.stringify({
          product,
          ts: Date.now(),
          verified: true,
          source: 'worker',
          identity: trimmed,
        }));
      } catch (e) {}
      return true;
    }

    return false;
  }

  // ═══════════════════════════════════════════
  //   URL RETURN AUTO-UNLOCK
  // ═══════════════════════════════════════════

  function checkReturnUrl() {
    const params = new URLSearchParams(location.search);
    const paid = params.get('paid');
    if (paid && ['biodata', 'resume', 'wishes'].includes(paid)) {
      markPaid(paid, PRICES[paid], 'url_return');
      const clean = location.pathname + location.hash;
      history.replaceState({}, '', clean);
      window.dispatchEvent(new CustomEvent('lifekit:paid', { detail: { product: paid } }));
    }
  }
  checkReturnUrl();

  // ═══════════════════════════════════════════
  //   MODAL STYLES
  // ═══════════════════════════════════════════

  function injectModalStyles() {
    if (document.getElementById('lk-pay-styles')) return;
    const style = document.createElement('style');
    style.id = 'lk-pay-styles';
    style.textContent = `
      .lk-pay-modal { position: fixed; inset: 0; z-index: 2147483646; display: grid; place-items: center; padding: 20px; font-family: 'Inter', system-ui, sans-serif; }
      .lk-pay-backdrop { position: absolute; inset: 0; background: rgba(8, 6, 15, 0.75); backdrop-filter: blur(12px); animation: lkFade .25s ease; }
      @keyframes lkFade { from { opacity: 0; } to { opacity: 1; } }
      .lk-pay-dialog { position: relative; background: linear-gradient(180deg, #131022, #1a1530); border: 1px solid #332a52; border-radius: 20px; padding: 36px 32px 28px; max-width: 460px; width: 100%; text-align: center; color: #f8fafc; box-shadow: 0 40px 100px rgba(0,0,0,0.6); animation: lkSlide .35s cubic-bezier(.2,.8,.2,1); }
      @keyframes lkSlide { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .lk-pay-icon { font-size: 2.5rem; margin-bottom: 12px; }
      .lk-pay-dialog h3 { font-size: 1.3rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; color: #fff; }
      .lk-pay-product { font-size: 0.9rem; color: #9a95b8; margin-bottom: 6px; }
      .lk-pay-amount { font-size: 2.4rem; font-weight: 900; letter-spacing: -0.03em; background: linear-gradient(135deg, #c026d3, #a855f7, #22d3ee); -webkit-background-clip: text; background-clip: text; color: transparent; line-height: 1; margin: 10px 0 18px; }
      .lk-pay-note { font-size: 0.88rem; color: #9a95b8; line-height: 1.55; margin-bottom: 22px; max-width: 360px; margin-left: auto; margin-right: auto; }
      .lk-pay-actions { display: grid; grid-template-columns: 1fr 1.4fr; gap: 10px; margin-bottom: 14px; }
      .lk-pay-actions-3 { grid-template-columns: 1fr 1fr; }
      .lk-pay-actions-3 .lk-pay-success { grid-column: span 2; }
      .lk-pay-actions button { padding: 13px 18px; border-radius: 12px; font-family: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: transform .15s; border: 1px solid transparent; }
      .lk-pay-cancel, .lk-pay-not-yet, .lk-pay-trouble { background: #1a1530; color: #9a95b8; border-color: #332a52; }
      .lk-pay-cancel:hover, .lk-pay-not-yet:hover, .lk-pay-trouble:hover { color: #f8fafc; border-color: #a855f7; }
      .lk-pay-go, .lk-pay-success { background: linear-gradient(135deg, #a855f7, #c026d3); color: #fff; box-shadow: 0 6px 24px rgba(192,38,211,0.4); }
      .lk-pay-go:hover, .lk-pay-success:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(192,38,211,0.6); }
      .lk-pay-fineprint { font-size: 0.72rem; color: #6b6880; margin-top: 6px; line-height: 1.5; }
    `;
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════
  //   EXPOSE
  // ═══════════════════════════════════════════

  window.LIFEKitPayment = {
    openCheckout,
    isPaid,
    isPaidAsync,
    verifyWithWorker,
    resetPaid,
    markPaid,
    PRICES,
    PAYMENT_LINKS,
    WORKER_URL,
  };

})();