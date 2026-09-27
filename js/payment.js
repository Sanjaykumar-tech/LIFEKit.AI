/* ═══════════════════════════════════════════
   LIFEKit AI — Payment Module
   Razorpay Payment Links
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ═══════════════════════════════════════════
  //   ⚙️ CONFIG — EDIT THIS BLOCK
  // ═══════════════════════════════════════════

  const PAYMENT_LINKS = {
    biodata: 'https://rzp.io/rzp/two4ho0',   // ← your ₹99 link
    resume:  'https://rzp.io/rzp/GoDZGs2',   // ← your ₹49 link
    wishes:  'https://rzp.io/rzp/rAMaqsm3',  // ← your ₹19 link
  };

  const PRICES = {
    biodata: 99,
    resume:  49,
    wishes:  19,
  };

  // ═══════════════════════════════════════════
  //   PAYMENT FLOW
  // ═══════════════════════════════════════════

  /**
   * Opens Razorpay payment link in a new tab.
   * After returning, user clicks "I've paid" to unlock.
   *
   * @param {string} product   - 'biodata' | 'resume' | 'wishes'
   * @param {string} name      - customer name (for display only)
   * @param {object} callbacks - { onSuccess, onCancel }
   */
  function openCheckout(product, name, callbacks = {}) {
    const {
      onSuccess = () => {},
      onCancel  = () => {},
    } = callbacks;

    const link = PAYMENT_LINKS[product];
    if (!link) {
      alert('Payment link not configured for this product.');
      onCancel({ reason: 'unknown_product' });
      return;
    }

    const price = PRICES[product] || 0;
    const titles = {
      biodata: 'Marriage Biodata PDF',
      resume:  'Resume PDF',
      wishes:  'Wish Card PNG',
    };

    // ── Show confirmation modal before redirect ──
    showPayModal({
      title: titles[product],
      price,
      link,
      onConfirm: () => {
        // Open Razorpay in a new tab
        const win = window.open(link, '_blank', 'noopener,noreferrer');

        if (!win || win.closed || typeof win.closed === 'undefined') {
          // Popup blocked — fall back to same-tab navigation
          location.href = link;
          return;
        }

        // After user returns, ask them to confirm
        waitForReturn(product, price, onSuccess, onCancel);
      },
      onCancel,
    });
  }

  // ── Modal shown before redirect ───────
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
        <p class="lk-pay-note">You'll be taken to a secure Razorpay page to complete payment.</p>
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

    // Focus the continue button
    setTimeout(() => modal.querySelector('.lk-pay-go')?.focus(), 50);

    // Esc closes
    const escHandler = (e) => {
      if (e.key === 'Escape') { close(); onCancel?.(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);
  }

  // ── After user returns from Razorpay ──
  function waitForReturn(product, price, onSuccess, onCancel) {
    // Give the user ~1.5 seconds to switch back to our tab
    setTimeout(() => {
      showConfirmModal(product, price, onSuccess, onCancel);
    }, 1500);
  }

  // ── "I've paid" confirmation modal ────
  function showConfirmModal(product, price, onSuccess, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'lk-pay-modal';
    modal.innerHTML = `
      <div class="lk-pay-backdrop"></div>
      <div class="lk-pay-dialog">
        <div class="lk-pay-icon">✅</div>
        <h3>Did you complete the payment?</h3>
        <p class="lk-pay-product">₹${price} · ${product}</p>
        <p class="lk-pay-note">If you paid successfully, click "Yes, unlock" to download your file.</p>
        <div class="lk-pay-actions lk-pay-actions-3">
          <button class="lk-pay-not-yet">Not yet</button>
          <button class="lk-pay-trouble">I had trouble</button>
          <button class="lk-pay-success">Yes, unlock ✓</button>
        </div>
        <p class="lk-pay-fineprint">Payments are processed by Razorpay. Funds are non-refundable after download.</p>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();

    modal.querySelector('.lk-pay-backdrop').onclick = () => { close(); onCancel?.(); };
    modal.querySelector('.lk-pay-not-yet').onclick = () => { close(); onCancel?.(); };
    modal.querySelector('.lk-pay-trouble').onclick = () => {
      close();
      alert('Sorry to hear that. Please try again, or contact support@lifekit.ai if the issue persists.');
      onCancel?.({ reason: 'payment_trouble' });
    };
    modal.querySelector('.lk-pay-success').onclick = () => {
      close();
      // Mark as paid (no verification in v1)
      try {
        localStorage.setItem(`lifekit_paid_${product}`, JSON.stringify({
          product,
          amount: price,
          ts: Date.now(),
          verified: false,
        }));
      } catch (e) {}
      onSuccess({ product, amount: price, method: 'payment_link_manual' });
    };
  }

  // ── Modal CSS (injected once) ─────────
  function injectModalStyles() {
    if (document.getElementById('lk-pay-styles')) return;
    const style = document.createElement('style');
    style.id = 'lk-pay-styles';
    style.textContent = `
      .lk-pay-modal {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: grid;
        place-items: center;
        padding: 20px;
        font-family: 'Inter', system-ui, sans-serif;
      }
      .lk-pay-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(8, 6, 15, 0.75);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        animation: lkFade .25s ease;
      }
      @keyframes lkFade { from { opacity: 0; } to { opacity: 1; } }

      .lk-pay-dialog {
        position: relative;
        background: linear-gradient(180deg, #131022, #1a1530);
        border: 1px solid #332a52;
        border-radius: 20px;
        padding: 36px 32px 28px;
        max-width: 460px;
        width: 100%;
        text-align: center;
        color: #f8fafc;
        box-shadow:
          0 40px 100px rgba(0, 0, 0, 0.6),
          0 0 80px rgba(192, 38, 211, 0.15);
        animation: lkSlide .35s cubic-bezier(.2,.8,.2,1);
      }
      @keyframes lkSlide {
        from { opacity: 0; transform: translateY(20px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      .lk-pay-icon {
        font-size: 2.5rem;
        margin-bottom: 12px;
        filter: drop-shadow(0 0 20px rgba(192, 38, 211, 0.5));
      }
      .lk-pay-dialog h3 {
        font-size: 1.3rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        margin-bottom: 8px;
        color: #fff;
      }
      .lk-pay-product {
        font-size: 0.9rem;
        color: #9a95b8;
        margin-bottom: 6px;
      }
      .lk-pay-amount {
        font-size: 2.4rem;
        font-weight: 900;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, #c026d3, #a855f7, #22d3ee);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        line-height: 1;
        margin: 10px 0 18px;
      }
      .lk-pay-note {
        font-size: 0.88rem;
        color: #9a95b8;
        line-height: 1.55;
        margin-bottom: 22px;
        max-width: 360px;
        margin-left: auto;
        margin-right: auto;
      }
      .lk-pay-actions {
        display: grid;
        grid-template-columns: 1fr 1.4fr;
        gap: 10px;
        margin-bottom: 14px;
      }
      .lk-pay-actions-3 {
        grid-template-columns: 1fr 1fr;
      }
      .lk-pay-actions-3 .lk-pay-success {
        grid-column: span 2;
      }
      .lk-pay-actions button {
        padding: 13px 18px;
        border-radius: 12px;
        font-family: inherit;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform .15s, box-shadow .2s, background .2s;
        border: 1px solid transparent;
      }
      .lk-pay-cancel,
      .lk-pay-not-yet,
      .lk-pay-trouble {
        background: #1a1530;
        color: #9a95b8;
        border-color: #332a52;
      }
      .lk-pay-cancel:hover,
      .lk-pay-not-yet:hover,
      .lk-pay-trouble:hover {
        color: #f8fafc;
        border-color: #a855f7;
      }
      .lk-pay-go,
      .lk-pay-success {
        background: linear-gradient(135deg, #a855f7, #c026d3);
        color: #fff;
        box-shadow: 0 6px 24px rgba(192, 38, 211, 0.4);
      }
      .lk-pay-go:hover,
      .lk-pay-success:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 32px rgba(192, 38, 211, 0.6);
      }
      .lk-pay-fineprint {
        font-size: 0.72rem;
        color: #6b6880;
        margin-top: 6px;
        line-height: 1.5;
      }
    `;
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════
  //   STATE HELPERS
  // ═══════════════════════════════════════════

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
    try {
      localStorage.removeItem(`lifekit_paid_${product}`);
    } catch (e) {}
  }

  // ═══════════════════════════════════════════
  //   AUTO-DETECT RETURN FROM PAYMENT
  // ═══════════════════════════════════════════

  // If URL has ?paid=biodata (or resume/wishes) → auto-mark as paid
  function checkReturnUrl() {
    const params = new URLSearchParams(location.search);
    const paidProduct = params.get('paid');
    if (paidProduct && ['biodata', 'resume', 'wishes'].includes(paidProduct)) {
      try {
        localStorage.setItem(`lifekit_paid_${paidProduct}`, JSON.stringify({
          product: paidProduct,
          amount: PRICES[paidProduct],
          ts: Date.now(),
          verified: false,
          source: 'url_return',
        }));
      } catch (e) {}

      // Clean the URL
      const clean = location.pathname + location.hash;
      history.replaceState({}, '', clean);

      // Dispatch event so tool scripts can react
      window.dispatchEvent(new CustomEvent('lifekit:paid', {
        detail: { product: paidProduct },
      }));
    }
  }
  checkReturnUrl();

  // ── Expose globally ────────────────────
  window.LIFEKitPayment = {
    openCheckout,
    isPaid,
    resetPaid,
    PRICES,
  };

})();