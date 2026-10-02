/* ═══════════════════════════════════════════
   LIFEKit AI — Payment Module (Animated v5)
   Razorpay + Cloudflare Worker + Premium UI
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

  const PRICES = { biodata: 99, resume: 49, wishes: 19 };

  const TITLES = {
    biodata: 'Marriage Biodata PDF',
    resume:  'Resume PDF',
    wishes:  'Wish Card PNG',
  };

  const ICONS = { biodata: '💍', resume: '💼', wishes: '❤️' };

  // ═══════════════════════════════════════════
  //   MAIN ENTRY
  // ═══════════════════════════════════════════

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
        const win = window.open(link, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          location.href = link;
          return;
        }
        waitForReturn(product, onSuccess, onCancel);
      },
      onCancel,
    });
  }

  // ═══════════════════════════════════════════
  //   MODAL — REDIRECT
  // ═══════════════════════════════════════════

  function showPayModal({ product, price, title, icon, onConfirm, onCancel }) {
    const modal = createModal(`
      <div class="lkp-icon-badge lkp-gradient-${product}">${icon}</div>
      <h3 class="lkp-title">Ready to unlock?</h3>
      <p class="lkp-subtitle">${title}</p>
      <div class="lkp-price">
        <span class="lkp-price-currency">₹</span>
        <span class="lkp-price-value">${price}</span>
      </div>
      <p class="lkp-note">
        You'll be taken to Razorpay — a secure payment page.<br>
        After paying, come back here to download.
      </p>
      <div class="lkp-actions">
        <button class="lkp-btn lkp-btn-ghost" data-action="cancel">Cancel</button>
        <button class="lkp-btn lkp-btn-primary" data-action="confirm">
          Pay ₹${price} →
        </button>
      </div>
      <div class="lkp-secure">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor" opacity="0.6"/>
        </svg>
        Secured by Razorpay
      </div>
    `);

    modal.querySelector('[data-action="cancel"]').onclick = () => { modal.remove(); onCancel?.(); };
    modal.querySelector('[data-action="confirm"]').onclick = () => { modal.remove(); onConfirm?.(); };

    injectStyles();
  }

  // ═══════════════════════════════════════════
  //   WAIT FOR RETURN + AUTO-CHECK
  // ═══════════════════════════════════════════

  function waitForReturn(product, onSuccess, onCancel) {
    let alreadyChecked = false;

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !alreadyChecked) {
        alreadyChecked = true;
        document.removeEventListener('visibilitychange', onVisible);
        setTimeout(() => {
          if (!isPaid(product)) {
            showVerifyModal(product, onSuccess, onCancel);
          }
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', onVisible);

    // Fallback after 3 min
    setTimeout(() => {
      document.removeEventListener('visibilitychange', onVisible);
      if (!isPaid(product)) {
        showVerifyModal(product, onSuccess, onCancel);
      }
    }, 180000);
  }

  // ═══════════════════════════════════════════
  //   MODAL — VERIFY PAYMENT (ANIMATED)
  // ═══════════════════════════════════════════

  function showVerifyModal(product, onSuccess, onCancel) {
    const modal = createModal(`
      <div class="lkp-success-icon" id="lkpIcon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10" opacity="0.3"/>
          <path d="M8 12l3 3 6-6" class="lkp-check-path"/>
        </svg>
      </div>

      <h3 class="lkp-title" id="lkpTitle">Verify your payment</h3>
      <p class="lkp-subtitle" id="lkpSubtitle">
        Enter the email or phone you used during payment.
      </p>

      <div class="lkp-input-wrap" id="lkpInputWrap">
        <input
          type="text"
          class="lkp-input"
          id="lkpInput"
          placeholder="email@example.com or +919..."
          autocomplete="email"
          autofocus
        />
        <div class="lkp-input-hint">We'll check our server for your purchase</div>
      </div>

      <div class="lkp-verifying" id="lkpVerifying" style="display:none;">
        <div class="lkp-spinner"></div>
        <div class="lkp-verifying-text" id="lkpVerifyingText">Checking our servers…</div>
      </div>

      <div class="lkp-actions" id="lkpActions">
        <button class="lkp-btn lkp-btn-ghost" data-action="not-yet">Not yet</button>
        <button class="lkp-btn lkp-btn-primary" data-action="verify" id="lkpVerifyBtn">
          Verify & Unlock
        </button>
      </div>

      <div class="lkp-fineprint">
        <span id="lkpFineprint">Paid just now? Wait 20 seconds before verifying.</span>
      </div>
    `);

    const inputWrap = modal.querySelector('#lkpInputWrap');
    const input = modal.querySelector('#lkpInput');
    const verifying = modal.querySelector('#lkpVerifying');
    const verifyingText = modal.querySelector('#lkpVerifyingText');
    const actions = modal.querySelector('#lkpActions');
    const icon = modal.querySelector('#lkpIcon');
    const title = modal.querySelector('#lkpTitle');
    const subtitle = modal.querySelector('#lkpSubtitle');
    const fineprint = modal.querySelector('#lkpFineprint');

    const close = () => modal.remove();

    // Not yet → close
    modal.querySelector('[data-action="not-yet"]').onclick = () => {
      close();
      onCancel?.();
    };

    // Verify
    modal.querySelector('[data-action="verify"]').onclick = doVerify;

    // Enter key submits
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doVerify();
      }
    });

    async function doVerify() {
      const value = (input.value || '').trim();
      if (value.length < 3) {
        inputWrap.classList.add('lkp-error');
        setTimeout(() => inputWrap.classList.remove('lkp-error'), 500);
        input.focus();
        return;
      }

      // Show verifying state
      inputWrap.style.display = 'none';
      actions.style.display = 'none';
      verifying.style.display = 'flex';
      fineprint.style.display = 'none';

      const isEmail = value.includes('@');
      const email = isEmail ? value : '';
      const phone = !isEmail ? value : '';

      verifyingText.textContent = 'Checking our servers…';

      const result = await verifyWithWorker(product, email, phone);

      if (result.paid) {
        // SUCCESS STATE
        icon.classList.add('lkp-success');
        title.textContent = 'Payment verified! 🎉';
        subtitle.textContent = 'Unlocking your file now…';
        verifying.style.display = 'none';
        icon.style.display = 'grid';

        // Save to localStorage
        markPaid(product, PRICES[product], 'worker-verified', value);
        try {
          localStorage.setItem(`lifekit_paid_${product}`, JSON.stringify({
            product, amount: PRICES[product], ts: Date.now(),
            verified: true, source: 'worker', identity: value,
          }));
        } catch (e) {}

        // Animate & close
        setTimeout(() => {
          close();
          onSuccess({ product, amount: PRICES[product], method: 'worker' });
        }, 1400);
      } else {
        // ERROR STATE
        verifying.style.display = 'none';
        inputWrap.style.display = 'block';
        actions.style.display = 'grid';
        fineprint.style.display = 'block';

        title.textContent = 'Payment not found';
        subtitle.textContent = 'We couldn\'t find a purchase for that email/phone.';
        icon.classList.add('lkp-error');
        setTimeout(() => icon.classList.remove('lkp-error'), 600);
        inputWrap.classList.add('lkp-shake');
        setTimeout(() => inputWrap.classList.remove('lkp-shake'), 600);

        fineprint.textContent = 'Paid already? Wait 30 sec, check spelling, try again.';
        fineprint.style.color = 'var(--danger)';
      }
    }
  }

  // ═══════════════════════════════════════════
  //   MODAL BUILDER
  // ═══════════════════════════════════════════

  function createModal(html) {
    const modal = document.createElement('div');
    modal.className = 'lkp-modal';
    modal.innerHTML = `
      <div class="lkp-backdrop"></div>
      <div class="lkp-dialog">${html}</div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.querySelector('.lkp-backdrop').onclick = () => {
      modal.classList.add('lkp-closing');
      setTimeout(() => modal.remove(), 200);
    };

    // Esc closes
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        modal.classList.add('lkp-closing');
        setTimeout(() => modal.remove(), 200);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    return modal;
  }

  // ═══════════════════════════════════════════
  //   STATE HELPERS
  // ═══════════════════════════════════════════

  function markPaid(product, amount, source, identity) {
    try {
      localStorage.setItem(`lifekit_paid_${product}`, JSON.stringify({
        product, amount, ts: Date.now(), source: source || 'manual',
        identity: identity || null, verified: true,
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

  // ═══════════════════════════════════════════
  //   WORKER VERIFICATION (with retry)
  // ═══════════════════════════════════════════

  async function verifyWithWorker(product, email, phone, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const url = `${WORKER_URL}/verify?product=${encodeURIComponent(product)}&email=${encodeURIComponent(email || '')}&phone=${encodeURIComponent(phone || '')}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

        if (!res.ok) {
          if (res.status === 400) return { paid: false, error: 'Invalid input' };
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log(`[Worker] Verify attempt ${attempt}:`, data);
        return data;
      } catch (err) {
        console.warn(`[Worker] Attempt ${attempt} failed:`, err.message);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 500 * attempt));
        } else {
          return { paid: false, error: err.message };
        }
      }
    }
    return { paid: false };
  }

  async function isPaidAsync(product) {
    if (isPaid(product)) return true;

    // Show animated verify modal
    return new Promise((resolve) => {
      showVerifyModal(
        product,
        () => resolve(true),
        () => resolve(false)
      );
    });
  }

  async function checkExistingPayment(product) {
    if (isPaid(product)) return true;
    return new Promise((resolve) => {
      showVerifyModal(
        product,
        () => resolve(true),
        () => resolve(false)
      );
    });
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
  //   STYLES — PREMIUM ANIMATED MODAL
  // ═══════════════════════════════════════════

  function injectStyles() {
    if (document.getElementById('lkp-styles')) return;
    const style = document.createElement('style');
    style.id = 'lkp-styles';
    style.textContent = `
      .lkp-modal {
        position: fixed; inset: 0;
        z-index: 2147483646;
        display: grid; place-items: center;
        padding: 20px;
        font-family: 'Inter', system-ui, sans-serif;
      }

      .lkp-backdrop {
        position: absolute; inset: 0;
        background: rgba(8, 6, 15, 0.75);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        animation: lkpFadeIn .3s ease;
      }

      .lkp-closing .lkp-backdrop {
        animation: lkpFadeOut .2s ease forwards;
      }

      @keyframes lkpFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes lkpFadeOut { from { opacity: 1; } to { opacity: 0; } }

      .lkp-dialog {
        position: relative;
        background: linear-gradient(180deg, #131022 0%, #1a1530 100%);
        border: 1px solid rgba(168, 85, 247, 0.2);
        border-radius: 24px;
        padding: 40px 32px 28px;
        max-width: 440px;
        width: 100%;
        text-align: center;
        color: #f8fafc;
        box-shadow:
          0 40px 100px rgba(0, 0, 0, 0.7),
          0 0 80px rgba(192, 38, 211, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.05);
        animation: lkpSlideUp .4s cubic-bezier(.2,.9,.3,1.2);
        overflow: hidden;
      }

      .lkp-dialog::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, #c026d3, #a855f7, #22d3ee, transparent);
      }

      .lkp-closing .lkp-dialog {
        animation: lkpSlideDown .2s ease forwards;
      }

      @keyframes lkpSlideUp {
        from { opacity: 0; transform: translateY(30px) scale(0.94); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes lkpSlideDown {
        from { opacity: 1; transform: translateY(0) scale(1); }
        to { opacity: 0; transform: translateY(20px) scale(0.96); }
      }

      /* ══ ICON BADGE ══ */
      .lkp-icon-badge {
        width: 72px; height: 72px;
        border-radius: 22px;
        display: grid;
        place-items: center;
        font-size: 2rem;
        margin: 0 auto 20px;
        position: relative;
        animation: lkpPulse 2s ease-in-out infinite;
      }

      .lkp-gradient-biodata {
        background: linear-gradient(135deg, rgba(192, 38, 211, 0.2), rgba(168, 85, 247, 0.15));
        border: 1px solid rgba(192, 38, 211, 0.35);
        box-shadow: 0 0 40px rgba(192, 38, 211, 0.4);
      }

      .lkp-gradient-resume {
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(56, 189, 248, 0.15));
        border: 1px solid rgba(34, 211, 238, 0.35);
        box-shadow: 0 0 40px rgba(34, 211, 238, 0.4);
      }

      .lkp-gradient-wishes {
        background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(192, 38, 211, 0.15));
        border: 1px solid rgba(236, 72, 153, 0.35);
        box-shadow: 0 0 40px rgba(236, 72, 153, 0.4);
      }

      @keyframes lkpPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.06); }
      }

      /* ══ SUCCESS ICON (verify modal) ══ */
      .lkp-success-icon {
        width: 80px; height: 80px;
        margin: 0 auto 20px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: #a855f7;
        background: rgba(168, 85, 247, 0.1);
        border: 2px solid rgba(168, 85, 247, 0.3);
        transition: all .5s cubic-bezier(.2,.9,.3,1.2);
        position: relative;
      }

      .lkp-success-icon svg {
        width: 44px; height: 44px;
      }

      .lkp-success-icon .lkp-check-path {
        stroke-dasharray: 20;
        stroke-dashoffset: 20;
        transition: stroke-dashoffset .5s ease;
      }

      .lkp-success-icon.lkp-success {
        color: #22c55e;
        background: rgba(34, 197, 94, 0.15);
        border-color: rgba(34, 197, 94, 0.5);
        box-shadow: 0 0 40px rgba(34, 197, 94, 0.5);
        animation: lkpSuccessPop .5s cubic-bezier(.2,.9,.3,1.5);
      }

      .lkp-success-icon.lkp-success .lkp-check-path {
        stroke-dashoffset: 0;
      }

      @keyframes lkpSuccessPop {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }

      .lkp-success-icon.lkp-error {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.5);
        animation: lkpErrorShake .5s ease;
      }

      @keyframes lkpErrorShake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-8px); }
        40%, 80% { transform: translateX(8px); }
      }

      /* ══ TEXT ══ */
      .lkp-title {
        font-size: 1.4rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        margin-bottom: 8px;
        color: #fff;
        transition: all .3s;
      }

      .lkp-subtitle {
        font-size: 0.92rem;
        color: #9a95b8;
        line-height: 1.5;
        margin-bottom: 22px;
        transition: all .3s;
      }

      .lkp-price {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 2px;
        margin: 10px 0 20px;
      }

      .lkp-price-currency {
        font-size: 1.5rem;
        font-weight: 700;
        color: #c026d3;
      }

      .lkp-price-value {
        font-size: 3rem;
        font-weight: 900;
        letter-spacing: -0.04em;
        background: linear-gradient(135deg, #c026d3, #a855f7 50%, #22d3ee);
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        line-height: 1;
        animation: lkpShine 3s linear infinite;
      }

      @keyframes lkpShine {
        to { background-position: 200% center; }
      }

      .lkp-note {
        font-size: 0.85rem;
        color: #9a95b8;
        line-height: 1.55;
        margin-bottom: 24px;
        max-width: 340px;
        margin-left: auto;
        margin-right: auto;
      }

      /* ══ INPUT ══ */
      .lkp-input-wrap {
        margin-bottom: 20px;
        transition: all .3s;
      }

      .lkp-input {
        width: 100%;
        background: rgba(8, 6, 15, 0.6);
        border: 1.5px solid #332a52;
        border-radius: 14px;
        padding: 14px 18px;
        color: #f8fafc;
        font-family: inherit;
        font-size: 1rem;
        outline: none;
        transition: all .25s;
        text-align: center;
      }

      .lkp-input::placeholder {
        color: #55556a;
      }

      .lkp-input:focus {
        border-color: #a855f7;
        box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.15);
        background: rgba(8, 6, 15, 0.9);
      }

      .lkp-input-hint {
        font-size: 0.75rem;
        color: #6b6880;
        margin-top: 8px;
        text-align: center;
      }

      .lkp-input-wrap.lkp-error .lkp-input {
        border-color: #ef4444;
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
      }

      .lkp-input-wrap.lkp-shake {
        animation: lkpErrorShake .5s ease;
      }

      /* ══ VERIFYING STATE ══ */
      .lkp-verifying {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 24px 0;
        margin-bottom: 20px;
      }

      .lkp-spinner {
        width: 44px;
        height: 44px;
        border: 3px solid rgba(168, 85, 247, 0.15);
        border-top-color: #a855f7;
        border-right-color: #c026d3;
        border-radius: 50%;
        animation: lkpSpin 0.8s linear infinite;
        box-shadow: 0 0 30px rgba(192, 38, 211, 0.3);
      }

      @keyframes lkpSpin {
        to { transform: rotate(360deg); }
      }

      .lkp-verifying-text {
        font-size: 0.9rem;
        color: #9a95b8;
        font-weight: 500;
        animation: lkpPulseText 1.5s ease-in-out infinite;
      }

      @keyframes lkpPulseText {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }

      /* ══ ACTIONS ══ */
      .lkp-actions {
        display: grid;
        grid-template-columns: 1fr 1.6fr;
        gap: 12px;
        margin-bottom: 16px;
      }

      .lkp-btn {
        padding: 14px 20px;
        border-radius: 14px;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        border: 1.5px solid transparent;
        transition: all .2s cubic-bezier(.2,.9,.3,1.2);
        letter-spacing: -0.01em;
      }

      .lkp-btn-ghost {
        background: transparent;
        color: #9a95b8;
        border-color: #332a52;
      }

      .lkp-btn-ghost:hover {
        color: #f8fafc;
        border-color: #a855f7;
        background: rgba(168, 85, 247, 0.05);
      }

      .lkp-btn-primary {
        background: linear-gradient(135deg, #a855f7, #c026d3);
        color: #fff;
        box-shadow: 0 6px 24px rgba(192, 38, 211, 0.4);
        position: relative;
        overflow: hidden;
      }

      .lkp-btn-primary::before {
        content: '';
        position: absolute;
        top: 0; left: -100%;
        width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left .6s;
      }

      .lkp-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 32px rgba(192, 38, 211, 0.55);
      }

      .lkp-btn-primary:hover::before {
        left: 100%;
      }

      .lkp-btn:active {
        transform: translateY(0) scale(0.98);
      }

      /* ══ FOOTER ══ */
      .lkp-fineprint {
        font-size: 0.72rem;
        color: #6b6880;
        line-height: 1.5;
        margin-top: 6px;
        transition: color .3s;
      }

      .lkp-secure {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 0.72rem;
        color: #6b6880;
        margin-top: 4px;
        padding-top: 16px;
        border-top: 1px solid rgba(51, 42, 82, 0.5);
      }

      /* ══ MOBILE ══ */
      @media (max-width: 480px) {
        .lkp-dialog {
          padding: 32px 22px 22px;
          border-radius: 20px;
        }
        .lkp-price-value { font-size: 2.4rem; }
        .lkp-title { font-size: 1.2rem; }
        .lkp-icon-badge { width: 64px; height: 64px; font-size: 1.7rem; }
        .lkp-actions { grid-template-columns: 1fr; }
      }
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
    checkExistingPayment,
    verifyWithWorker,
    resetPaid,
    markPaid,
    PRICES,
    PAYMENT_LINKS,
    WORKER_URL,
  };

})();