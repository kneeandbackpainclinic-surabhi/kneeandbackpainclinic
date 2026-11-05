// Clinic Configuration & Booking Integrations (Cal.id, Cashfree & Webinar.gg)
window.BOOKING_LINKS = {
  // Cal.id booking link for in-clinic appointments & sessions
  calBase: 'https://cal.id/charakhealth/consultation',
  consultation: 'https://cal.id/charakhealth/consultation',
  experienceSession: 'https://cal.id/charakhealth/consultation',
  calLink: 'charakhealth/consultation',
  embedJsUrl: 'https://cal.id/embed-link/embed.js',
  calOrigin: 'https://cal.id',
  
  // Clinic appointment desk direct email
  clinicPhone: '',
  clinicEmail: 'kneeandbackpainclinic@gmail.com',
  
  // Webinar.gg Room
  webinarRoom: 'https://webinar.gg/charakhealth',
  webinarPlatform: 'webinar.gg',

  // Clinic location & reviews
  googleMapsUrl: 'https://www.google.com/maps/place/Charak+Health+Solutions%7C+Best+Ayurvedic+Doctor+in+Vartak+Nagar+Thane%7C+Best+Panchkarma+Center+in+Vartak+Nagar+Thane/@19.2132024,72.9622171,17z/data=!4m12!1m2!2m1!1sCharak+Health+Solutions+Raymond+TenX+Habitat+Thane!3m8!1s0x3be7b9611e939a9f:0xfb1cfb6c70216b6c!8m2!3d19.2132024!4d72.9667232!9m1!1b1!16s%2Fg%2F11vx7gllpl',
  googleReviewsUrl: 'https://g.page/r/CWxrIXBs-xz7EAE/review',
  clinicWebsite: 'https://www.kneeandbackpainclinic.com',
  vaidyaWebsite: 'https://www.vaidyaparampara.com',
  
  // Clinic Address
  clinicAddress: 'Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Vartak Nagar, Thane West, Maharashtra 400606',
  confirmationUrl: 'https://kneeandbackpainclinic.vercel.app/confirmation',
  
  // Webinar start ISO
  webinarStartIso: '2026-09-27T11:30:00Z'
};

// ============================================================================
// OFFICIAL CAL.ID EMBED RUNTIME INITIALIZATION
// ============================================================================
(function (C, A, L) {
  let p = function (a, ar) { a.q.push(ar); };
  let d = C.document;
  C.Cal = C.Cal || function () {
    let cal = C.Cal;
    let ar = arguments;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      const s = d.createElement("script");
      s.src = A;
      s.async = true;
      d.head.appendChild(s);
      cal.loaded = true;
    }
    if (ar[0] === L) {
      const api = function () { p(api, arguments); };
      const namespace = ar[1];
      api.q = api.q || [];
      if (typeof namespace === "string") {
        cal.ns[namespace] = cal.ns[namespace] || api;
        p(cal.ns[namespace], ar);
        p(cal, ["initNamespace", namespace]);
      } else p(cal, ar);
      return;
    }
    p(cal, ar);
  };
})(window, "https://cal.id/embed-link/embed.js", "init");

// ============================================================================
// OFFICIAL CAL.ID INLINE EMBED RUNTIME
// ============================================================================
Cal("init", "default", { origin: "https://cal.id" });
Cal("init", "quiz", { origin: "https://cal.id" });

let calModalMounted = false;

window.mountCalInline = function(elementOrSelector, namespace, configOverrides) {
  namespace = namespace || "default";
  const el = typeof elementOrSelector === "string" ? document.querySelector(elementOrSelector) : elementOrSelector;
  if (!el) return;

  const layout = (configOverrides && configOverrides.layout) ? configOverrides.layout : "week_view";

  try {
    Cal("init", namespace, { origin: "https://cal.id" });
    const ns = (Cal.ns && Cal.ns[namespace]) ? Cal.ns[namespace] : Cal;

    const baseConfig = { "layout": layout };
    const finalConfig = Object.assign(baseConfig, configOverrides || {});

    // Build prefilled query params if name/phone/email provided to avoid Cal.id re-asking
    let calLink = (configOverrides && configOverrides.calLink) ? configOverrides.calLink : "charakhealth/consultation";
    if (!configOverrides || !configOverrides.calLink) {
      const q = new URLSearchParams();
      if (finalConfig.name) q.set('name', finalConfig.name);
      if (finalConfig.phone) {
        q.set('phone', finalConfig.phone);
        q.set('smsReminderNumber', finalConfig.phone);
        q.set('responses[phone]', finalConfig.phone);
        q.set('responses[whatsapp]', finalConfig.phone);
      }
      if (finalConfig.email) {
        q.set('email', finalConfig.email);
        q.set('responses[email]', finalConfig.email);
      }
      if (finalConfig.name) {
        q.set('responses[name]', finalConfig.name);
      }
      const qs = q.toString();
      if (qs) {
        calLink += (calLink.includes('?') ? '&' : '?') + qs;
      }
    }

    ns("inline", {
      elementOrSelector: elementOrSelector,
      config: finalConfig,
      calLink: calLink
    });

    ns("ui", {
      cssVarsPerTheme: {
        light: { "cal-brand": "#007ee5" },
        dark: { "cal-brand": "#fafafa" }
      },
      hideEventTypeDetails: true,
      layout: layout
    });
  } catch (e) {
    console.warn("Cal mount error:", e);
  }
};

// ============================================================================
// 1. INLINE CAL.ID EMBEDDED MODAL (DELEGATES TO 3-STAGE CONSULTATION FLOW)
// ============================================================================
window.openCalModal = function(options) {
  options = options || {};

  // If unified 3-stage consultation flow is available, use it directly
  if (typeof window.openConsultationModal === 'function') {
    window.openConsultationModal(options);
    return;
  }

  const modal = document.querySelector('#cal-modal');
  const titleEl = document.querySelector('#cal-modal-title');

  if (titleEl && options.title) {
    titleEl.textContent = options.title;
  }

  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  const prefill = {};
  if (options.name) prefill.name = options.name;
  if (options.phone) prefill.phone = options.phone;
  if (options.email) prefill.email = options.email;
  if (options.notes) prefill.notes = options.notes;

  if (!calModalMounted) {
    calModalMounted = true;
    window.mountCalInline("#my-cal-inline", "default", prefill);
  }
};

window.closeCalModal = function() {
  const modal = document.querySelector('#cal-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

// ============================================================================
// 2. DIRECT CLINIC UPI & QR PAYMENT MODAL (RELIABLE ZERO-GATEWAY WORKAROUND)
// ============================================================================
function escapeHtmlModal(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.openUPIPaymentModal = function(params) {
  params = params || {};
  const amount = Number(params.amount) || 201;
  const name = (params.name || 'Patient').trim();
  const phone = (params.phone || '').replace(/[^0-9]/g, '').slice(-10);
  const email = (params.email || '').trim();
  const planType = params.planType || (amount === 201 ? 'Live Masterclass (₹201)' : 'Diagnostic Consultation (₹1,000)');
  const leadId = params.leadId || ('LEAD-' + Math.floor(100 + Math.random() * 900));
  const slot = params.slot || '';
  const onSuccess = params.onSuccess || null;
  const onDismiss = params.onDismiss || null;

  // Generate Unique Payment Reference Comment: CHK-{10DigitPhone}-{LeadIdShort}
  const leadNum = leadId.replace(/[^0-9]/g, '').slice(-4) || '101';
  const phoneSegment = phone || 'CARE';
  const paymentComment = 'CHK-' + phoneSegment + '-' + leadNum;

  const upiId = 'surabhivaidya7@okhdfcbank';
  const payeeName = 'Charak Health Solutions';

  // Standard UPI URI scheme with mandatory Transaction Note (tn)
  const upiDeepLink = 'upi://pay?pa=' + encodeURIComponent(upiId) +
                      '&pn=' + encodeURIComponent(payeeName) +
                      '&am=' + amount +
                      '&cu=INR' +
                      '&tn=' + encodeURIComponent(paymentComment);

  // Dedicated Payment Page URL for direct navigation
  const fullPaymentUrl = '/payment?plan=' + encodeURIComponent(planType) +
                         '&amount=' + amount +
                         '&name=' + encodeURIComponent(name) +
                         '&phone=' + encodeURIComponent(phone) +
                         '&lead=' + encodeURIComponent(leadId) +
                         '&slot=' + encodeURIComponent(slot);

  // Log checkout initiation immediately in CRM
  fetch('/api/lead-intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: leadId,
      name: name,
      phone: phone,
      email: email,
      recommendedStep: planType,
      slotPreference: slot || 'Confirmed Slot',
      status: 'Payment Initiated (UPI QR)',
      paymentStatus: 'Pending Direct UPI (Ref: ' + paymentComment + ')',
      paymentOrderId: paymentComment
    })
  }).catch(function() {});

  // Remove existing modal if any
  const existingModal = document.getElementById('upi-checkout-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'upi-checkout-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.8);backdrop-filter:blur(5px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:14px;overflow-y:auto;animation:fadeIn 0.2s ease;';

  const waPreMsg = encodeURIComponent('Namaste Dr. Surabhi Vaidya Clinic, I have completed the ₹' + amount + ' UPI payment for ' + name + ' (+91 ' + phone + ').\nService: ' + planType + '\nPayment Ref: ' + paymentComment + '\nPlease confirm my registration pass.');

  modal.innerHTML = `
    <div style="background:#ffffff;border-radius:16px;max-width:480px;width:100%;max-height:92vh;overflow-y:auto;padding:24px 20px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.3);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;position:relative;">
      <button type="button" id="close-upi-modal-x" style="position:absolute;top:14px;right:14px;background:#f1f5f9;border:none;width:32px;height:32px;border-radius:50%;font-size:18px;line-height:1;cursor:pointer;color:#64748b;display:flex;align-items:center;justify-content:center;font-weight:700;">×</button>

      <div style="display:inline-flex;align-items:center;gap:6px;background:#eef7ed;color:#166534;font-size:0.75rem;font-weight:700;padding:3px 9px;border-radius:9999px;margin-bottom:8px;border:1px solid #bbf7d0;">
        <span>🛡️</span> Verified Direct Clinic UPI
      </div>
      <h3 style="margin:0 0 4px 0;font-size:1.3rem;color:#143026;font-weight:800;">Pay ₹${amount} via UPI</h3>
      <p style="margin:0 0 14px 0;font-size:0.84rem;color:#64748b;line-height:1.4;">
        Scan the QR code or tap the mobile button below to pay directly to <strong>Charak Health Solutions</strong>.
      </p>

      <div style="background:#faf8f5;border:1px solid #e5e0d8;border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:0.84rem;color:#334155;line-height:1.5;">
        <div>👤 <strong>Patient:</strong> ${escapeHtmlModal(name)} &bull; 📱 <strong>+91 ${phone || '---------'}</strong></div>
        <div>🏷️ <strong>Booking:</strong> ${escapeHtmlModal(planType)}</div>
        <div style="margin-top:4px;padding-top:4px;border-top:1px dashed #e5e0d8;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:600;color:#143026;">Payable Total:</span>
          <strong style="font-size:1.2rem;color:#166534;">₹${amount}</strong>
        </div>
      </div>

      <!-- Payment Scope Notice -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:8px 10px;margin-bottom:12px;font-size:0.75rem;color:#92400e;line-height:1.4;">
        <strong>Payment Information:</strong> Payments on this website are collected for personal consultation bookings and live educational webinar registrations. Physical medicines, supplements and other products are not sold or shipped through these checkout flows.
      </div>

      <!-- ⭐ MANDATORY PAYMENT COMMENT / REFERENCE NOTE BOX -->
      <div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:10px;padding:14px;margin-bottom:16px;box-shadow:0 3px 10px rgba(245,158,11,0.1);">
        <div style="font-weight:800;color:#b45309;font-size:0.86rem;margin-bottom:4px;display:flex;align-items:center;gap:6px;text-transform:uppercase;letter-spacing:0.03em;">
          <span>⚠️</span> Mandatory Payment Comment / Note
        </div>
        <div style="font-size:0.8rem;color:#92400e;line-height:1.4;margin-bottom:8px;">
          Please enter or paste this reference into the <strong>"Add a note" / "Message"</strong> box in your UPI app to identify your registration:
        </div>
        <div style="background:#ffffff;border:1.5px dashed #f59e0b;border-radius:6px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <span id="modal-upi-comment-text" style="font-family:monospace;font-weight:800;font-size:1.05rem;color:#78350f;letter-spacing:0.04em;">${paymentComment}</span>
          <button type="button" id="modal-btn-copy-comment" style="background:#f59e0b;color:#ffffff;border:none;border-radius:4px;padding:6px 10px;font-size:0.78rem;font-weight:700;cursor:pointer;white-space:nowrap;">📋 Copy Note</button>
        </div>
      </div>

      <!-- Mobile Instant Pay Deep Link -->
      <a href="${upiDeepLink}" id="modal-mobile-upi-btn" style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);color:#ffffff;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:8px;font-weight:700;font-size:0.95rem;text-decoration:none;margin-bottom:14px;box-shadow:0 4px 14px rgba(22,163,74,0.25);">
        <span>📱</span> Tap to Pay ₹${amount} via UPI App (GPay/PhonePe)
      </a>

      <!-- Centered QR Code & UPI Handle -->
      <div style="text-align:center;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:16px;">
        <div style="font-size:0.8rem;font-weight:700;color:#143026;margin-bottom:8px;">
          Or Scan with Google Pay, PhonePe, Paytm, or BHIM:
        </div>
        <div style="max-width:210px;margin:0 auto 10px;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 14px rgba(0,0,0,0.06);">
          <img src="assets/charak-upi-qr.jpg" alt="Charak Health Solutions UPI QR" style="width:100%;height:auto;display:block;">
        </div>
        <div style="display:inline-flex;align-items:center;gap:6px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:6px 12px;font-size:0.82rem;font-weight:700;color:#143026;">
          <span>UPI:</span>
          <span>${upiId}</span>
          <button type="button" id="modal-btn-copy-upi" style="background:#fff;border:1px solid #94a3b8;border-radius:4px;padding:2px 6px;font-size:0.72rem;cursor:pointer;font-weight:600;">Copy</button>
        </div>
      </div>

      <!-- Step 2: Verification / UTR Input -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:12px;">
        <div style="font-size:0.84rem;font-weight:700;color:#143026;margin-bottom:4px;">
          ✅ Step 2: Confirm Payment (Enter 12-digit UTR)
        </div>
        <p style="font-size:0.76rem;color:#64748b;margin:0 0 8px 0;line-height:1.4;">
          After paying, enter the 12-digit UTR / Ref No. from your UPI app receipt:
        </p>
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <input type="text" id="modal-utr-input" placeholder="e.g. 431289567123" maxlength="20" style="flex:1;padding:8px 10px;font-size:0.88rem;border:1.5px solid #cbd5e1;border-radius:6px;outline:none;">
          <button type="button" id="modal-btn-submit-utr" style="background:#143026;color:#ffffff;border:none;padding:8px 14px;border-radius:6px;font-weight:700;font-size:0.84rem;cursor:pointer;white-space:nowrap;">Confirm</button>
        </div>
        <a id="modal-wa-confirm-btn" href="https://wa.me/918108500200?text=${waPreMsg}" target="_blank" rel="noopener" style="background:#25d366;color:#ffffff;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px;border-radius:6px;font-weight:700;font-size:0.82rem;text-decoration:none;">
          <span>💬</span> Send Receipt on Clinic WhatsApp (+91 8108500200)
        </a>
      </div>

      <div style="text-align:center;font-size:0.75rem;color:#94a3b8;margin-bottom:6px;">
        <a href="${fullPaymentUrl}" target="_blank" style="color:#1e3a2f;text-decoration:underline;">Open Full Dedicated Payment Page ↗</a>
      </div>
      <div style="text-align:center;font-size:0.72rem;color:#64748b;">
        Protected by <a href="/refund-policy" target="_blank" style="color:#166534;text-decoration:underline;">Cancellation &amp; Refund Policy</a> &bull; <a href="/terms-and-conditions" target="_blank" style="color:#166534;text-decoration:underline;">Terms &amp; Conditions</a>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Copy helper
  function setupModalCopy(btnId, text, successText) {
    const btn = modal.querySelector(btnId);
    if (!btn) return;
    btn.addEventListener('click', function() {
      navigator.clipboard.writeText(text).then(function() {
        const prev = btn.textContent;
        btn.textContent = successText || '✓ Copied!';
        setTimeout(function() { btn.textContent = prev; }, 2000);
      }).catch(function() { alert('Copied: ' + text); });
    });
  }

  setupModalCopy('#modal-btn-copy-comment', paymentComment, '✓ Copied Note!');
  setupModalCopy('#modal-btn-copy-upi', upiId, '✓ Copied!');

  // Live UTR input listener to update WhatsApp button
  const utrInp = modal.querySelector('#modal-utr-input');
  const waBtn = modal.querySelector('#modal-wa-confirm-btn');
  if (utrInp && waBtn) {
    utrInp.addEventListener('input', function() {
      const u = utrInp.value.trim();
      const newMsg = encodeURIComponent('Namaste Dr. Surabhi Vaidya Clinic, I have completed the ₹' + amount + ' UPI payment for ' + name + ' (+91 ' + phone + ').\nService: ' + planType + '\nPayment Ref: ' + paymentComment + (u ? '\nUTR / Txn ID: ' + u : '') + '\nPlease confirm my registration pass.');
      waBtn.href = 'https://wa.me/918108500200?text=' + newMsg;
    });
  }

  // Handle Payment Confirmation / Submission
  async function completeUpiPayment(utrValue) {
    const utr = utrValue || '';
    const updatedPayload = {
      id: leadId,
      name: name,
      phone: phone,
      email: email,
      recommendedStep: planType,
      slotPreference: slot || 'Confirmed Slot',
      status: (amount === 201) ? 'Webinar Registered' : 'Consultation Scheduled',
      paymentStatus: 'Paid via UPI (' + (utr ? 'UTR: ' + utr : 'Ref: ' + paymentComment) + ')',
      paymentOrderId: paymentComment,
      notes: 'UPI Payment Confirmed. Comment: ' + paymentComment + (utr ? ' | UTR: ' + utr : ''),
      utr: utr
    };

    // Save locally
    try {
      const STORAGE_KEY = 'dr_surabhi_leads';
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const idx = existing.findIndex(l => (phone && l.phone === phone) || l.id === leadId);
      if (idx >= 0) {
        existing[idx] = Object.assign(existing[idx], updatedPayload);
      } else {
        existing.unshift(updatedPayload);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {}

    // Dispatch to lead-intake API
    fetch('/api/lead-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPayload)
    }).catch(function() {});

    // Google Ads conversion event
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-18534158307/o8ztCN3M4acdEOOf44VF',
          'value': Number(amount),
          'currency': 'INR',
          'transaction_id': utr || paymentComment
        });
      }
    } catch (e) {}

    // Close modal
    modal.remove();
    document.body.style.overflow = '';

    // Invoke success callback
    if (typeof onSuccess === 'function') {
      onSuccess({
        status: 'SUCCESS',
        orderId: utr || paymentComment,
        amount: amount,
        phone: phone,
        plan: planType,
        name: name
      });
    } else {
      showPaymentSuccessPopup({
        orderId: utr || paymentComment,
        amount: amount,
        phone: phone,
        plan: planType,
        name: name
      });
    }
  }

  const submitUtrBtn = modal.querySelector('#modal-btn-submit-utr');
  if (submitUtrBtn) {
    submitUtrBtn.addEventListener('click', function() {
      const u = utrInp ? utrInp.value.trim() : '';
      submitUtrBtn.disabled = true;
      submitUtrBtn.textContent = 'Verifying...';
      completeUpiPayment(u);
    });
  }

  // Close handlers
  const closeBtn = modal.querySelector('#close-upi-modal-x');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      modal.remove();
      document.body.style.overflow = '';
      if (typeof onDismiss === 'function') {
        onDismiss({ droppedOff: true, status: 'CLOSED' });
      }
    });
  }

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = '';
      if (typeof onDismiss === 'function') {
        onDismiss({ droppedOff: true, status: 'CLOSED' });
      }
    }
  });

  return { success: true, modal: true, paymentComment: paymentComment };
};

// Aliases for seamless backward compatibility across consultation & webinar buttons
window.triggerPayUCheckout = window.openUPIPaymentModal;
window.triggerCashfreeCheckout = window.openUPIPaymentModal;
window.triggerPaymentGatewayCheckout = window.openUPIPaymentModal;

// Post-payment return handler (Shows confirmation popup upon redirect back from PayU)
function showPaymentSuccessPopup(info) {
  // Trigger Google Ads Purchase Conversion tracking upon confirmed payment
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-18534158307/o8ztCN3M4acdEOOf44VF',
        'value': Number(info.amount) || 1.0,
        'currency': 'INR',
        'transaction_id': info.orderId || ''
      });
    }
  } catch (e) {
    console.warn('Google Ads conversion trigger notice:', e);
  }
  const isWebinar = (info.plan || '').toLowerCase().includes('masterclass') || (info.plan || '').toLowerCase().includes('webinar') || Number(info.amount) === 201;
  const cleanPhone = (info.phone || '').replace(/[^0-9]/g, '').slice(-10);

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'payu-success-modal';
  modalOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.75);backdrop-filter:blur(4px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';

  modalOverlay.innerHTML = `
    <div style="background:#ffffff;border-radius:14px;max-width:440px;width:100%;padding:24px;box-shadow:0 20px 40px rgba(0,0,0,0.2);text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="font-size:3.2rem;margin-bottom:8px;">🎉</div>
      <h3 style="font-size:1.35rem;color:#1e3a2f;margin:0 0 6px 0;font-weight:700;">Payment &amp; Booking Confirmed!</h3>
      <p style="font-size:0.88rem;color:#64748b;margin:0 0 16px 0;line-height:1.5;">
        Thank you, <strong>${info.name || 'Patient'}</strong>. Your payment via <strong>UPI</strong> has been verified.
      </p>

      <div style="background:#eef7ed;border:1.5px solid #86efac;border-radius:8px;padding:12px 14px;text-align:left;margin-bottom:14px;">
        <div style="font-weight:700;color:#166534;font-size:0.85rem;margin-bottom:4px;">📲 WhatsApp Confirmation Dispatched</div>
        <div style="font-size:0.8rem;color:#15803d;line-height:1.4;">
          Your receipt and appointment pass have been sent to <strong>+91 ${cleanPhone || info.phone}</strong>.
        </div>
      </div>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:left;font-size:0.8rem;color:#334155;margin-bottom:16px;line-height:1.6;">
        <div>🏷️ <strong>Booking:</strong> ${info.plan || 'Diagnostic Consultation'}</div>
        <div>💳 <strong>Amount Paid:</strong> ₹${info.amount || 'Confirmed'}</div>
        <div>🧾 <strong>Txn Reference:</strong> ${info.orderId || 'Verified'}</div>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;">
        ${isWebinar ? `
        <a href="https://webinar.gg/charakhealth" target="_blank" rel="noopener" style="background:#1e3a2f;color:#ffffff;padding:12px;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.9rem;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>🎥</span> Enter Live Room on Webinar.gg ↗
        </a>
        ` : ''}
        <button type="button" id="close-payu-success-modal" style="background:#f1f5f9;color:#334155;border:none;padding:10px;border-radius:8px;font-weight:600;font-size:0.88rem;cursor:pointer;">
          ✓ Done &amp; Return to Page
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  document.body.style.overflow = 'hidden';

  const closeBtn = modalOverlay.querySelector('#close-payu-success-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      modalOverlay.remove();
      document.body.style.overflow = '';
      try {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (e) {}
    });
  }
}

// Post-payment drop-off recovery handler (shows helpful options if payment fails or drops off)
function showPaymentFailureRecovery(info) {
  const cleanPhone = (info.phone || '').replace(/[^0-9]/g, '').slice(-10);
  const patientName = info.name || 'Patient';
  const plan = info.plan || 'Diagnostic Consultation';

  // Mark as drop-off in backend
  fetch('/api/lead-intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: cleanPhone,
      name: patientName,
      status: 'Payment Dropped Off',
      paymentStatus: 'Payment Incomplete / Gateway Drop-off',
      slotPreference: `Drop-off at Checkout [Plan: ${plan}]`
    })
  }).catch(function() {});

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'payu-failure-recovery-modal';
  modalOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.78);backdrop-filter:blur(4px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';

  const waText = encodeURIComponent(`Namaste Dr. Surabhi Vaidya Clinic, my name is ${patientName} (+91 ${cleanPhone}). I was registering for ${plan} on the website, but faced a payment gateway issue. Please help confirm my booking.`);

  modalOverlay.innerHTML = `
    <div style="background:#ffffff;border-radius:14px;max-width:460px;width:100%;padding:24px;box-shadow:0 20px 40px rgba(0,0,0,0.25);text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="font-size:3rem;margin-bottom:8px;">⚠️</div>
      <h3 style="font-size:1.3rem;color:#9a3412;margin:0 0 6px 0;font-weight:700;">Payment Issue? Your Details Are Saved!</h3>
      <p style="font-size:0.88rem;color:#475569;margin:0 0 16px 0;line-height:1.5;">
        Don't worry, <strong>${patientName}</strong>. If you experienced any issue with the online payment gateway, your booking request has been safely captured.
      </p>

      <div style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:8px;padding:14px;text-align:left;margin-bottom:16px;">
        <div style="font-weight:700;color:#9a3412;font-size:0.88rem;margin-bottom:4px;">🏥 Option: Pay at Clinic Reception on Visit</div>
        <div style="font-size:0.82rem;color:#7c2d12;line-height:1.45;">
          No online payment needed! You can visit our clinic in Thane and pay ₹1,000 at the reception desk via Cash, UPI, or Card on your appointment day.
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;">
        <a href="https://wa.me/918108500200?text=${waText}" target="_blank" rel="noopener" style="background:#25d366;color:#ffffff;padding:12px;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.92rem;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 12px rgba(37,211,102,0.3);">
          <span>💬</span> WhatsApp Clinic Desk for Payment Help ↗
        </a>
        <a href="tel:+918108500200" style="background:#1e3a2f;color:#ffffff;padding:11px;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.9rem;display:flex;align-items:center;justify-content:center;gap:8px;">
          <span>📞</span> Call Clinic Reception (+91 8108500200)
        </a>
        <button type="button" id="close-payu-failure-modal" style="background:#f1f5f9;color:#475569;border:none;padding:10px;border-radius:8px;font-weight:600;font-size:0.86rem;cursor:pointer;margin-top:4px;">
          ← Return to Clinic Website
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  document.body.style.overflow = 'hidden';

  const closeBtn = modalOverlay.querySelector('#close-payu-failure-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      modalOverlay.remove();
      document.body.style.overflow = '';
      try {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (e) {}
    });
  }
}

function initPaymentReturnCheck() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const status = (urlParams.get('status') || '').toUpperCase();
    const gateway = (urlParams.get('gateway') || '').toLowerCase();
    const orderId = urlParams.get('order_id');
    const amount = urlParams.get('amount') || '';
    const phone = urlParams.get('phone') || '';
    const plan = urlParams.get('plan') || '';
    const name = urlParams.get('name') || '';

    if ((gateway === 'payu' || orderId) && (status === 'SUCCESS' || status === 'PAID')) {
      showPaymentSuccessPopup({ orderId, amount, phone, plan, name });
    } else if ((gateway === 'payu' || orderId) && (status === 'FAILED' || status === 'ERROR' || status === 'CANCELLED')) {
      showPaymentFailureRecovery({ orderId, phone, plan, name });
    }
  } catch (e) {
    console.warn('PayU payment return check notice:', e);
  }
}

// ============================================================================
// 3. WEBINAR.GG TOKEN & INLINE EMBEDDED MODAL (PLAN-ONE-PAGE PARITY)
// ============================================================================
window.getWebinarGgToken = async function(attendee) {
  try {
    const res = await fetch('/api/get-webinar-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: attendee.name || 'Patient Attendee',
        phone: attendee.phone || '',
        email: attendee.email || ''
      })
    });
    return await res.json();
  } catch (err) {
    console.error('Webinar token error:', err);
    return {
      token: '',
      joinUrl: 'https://webinar.gg/charakhealth',
      webinarId: 'charakhealth'
    };
  }
};

window.openWebinarModal = async function(options) {
  options = options || {};
  const token = options.token || '';
  const webinarId = options.webinarId || 'charakhealth';
  const name = options.name || '';
  const phone = options.phone || '';
  const email = options.email || '';

  const modal = document.querySelector('#webinar-modal');
  const iframe = document.querySelector('#webinar-inline-frame');
  const loader = document.querySelector('#webinar-modal-loader');
  const errorEl = document.querySelector('#webinar-modal-error');
  const titleEl = document.querySelector('#webinar-modal-title');

  if (titleEl && options.title) {
    titleEl.textContent = options.title;
  }

  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  if (loader) loader.style.display = 'flex';
  if (errorEl) errorEl.style.display = 'none';
  if (iframe) iframe.style.display = 'none';

  let finalToken = token;
  if (!finalToken && (phone || email || name)) {
    try {
      const data = await window.getWebinarGgToken({ name, phone, email });
      if (data && data.token) {
        finalToken = data.token;
      }
    } catch (e) {
      console.warn('Token error:', e);
    }
  }

  const embedUrl = finalToken 
    ? 'https://webinar.gg/embed/' + webinarId + '?token=' + encodeURIComponent(finalToken)
    : 'https://webinar.gg/embed/' + webinarId;

  if (iframe) {
    iframe.src = embedUrl;
    iframe.onload = function() {
      if (loader) loader.style.display = 'none';
      iframe.style.display = 'block';
    };
    // Fallback timer if onload doesn't fire due to cross-origin iframe
    setTimeout(function() {
      if (loader) loader.style.display = 'none';
      iframe.style.display = 'block';
    }, 1500);
  }
};

window.closeWebinarModal = function() {
  const modal = document.querySelector('#webinar-modal');
  const iframe = document.querySelector('#webinar-inline-frame');
  if (iframe) iframe.src = '';
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

// Global event listeners on load
document.addEventListener('DOMContentLoaded', function() {
  // Check for PayU payment return redirects (?status=SUCCESS&gateway=payu)
  initPaymentReturnCheck();

  // Close Cal modal button
  const closeBtn = document.querySelector('#close-cal-modal-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeCalModal);
  }

  // Close Cal modal when clicking on overlay background
  const calModal = document.querySelector('#cal-modal');
  if (calModal) {
    calModal.addEventListener('click', function(e) {
      if (e.target === calModal) {
        window.closeCalModal();
      }
    });
  }

  // Close Webinar modal button
  const closeWebinarBtn = document.querySelector('#close-webinar-modal-btn');
  if (closeWebinarBtn) {
    closeWebinarBtn.addEventListener('click', window.closeWebinarModal);
  }

  // Close Webinar modal on backdrop click
  const webinarModal = document.querySelector('#webinar-modal');
  if (webinarModal) {
    webinarModal.addEventListener('click', function(e) {
      if (e.target === webinarModal) {
        window.closeWebinarModal();
      }
    });
  }

  // Intercept all links targeting cal.id to open inline modal instead of navigating away
  document.addEventListener('click', function(e) {
    const calTarget = e.target.closest('a[href*="cal.id"]');
    if (calTarget) {
      e.preventDefault();
      window.openCalModal({ title: 'Schedule Your In-Clinic Appointment' });
      return;
    }

    // Intercept webinar.gg links or data-open-webinar triggers to open embedded player
    const webinarTarget = e.target.closest('a[href*="webinar.gg"], [data-open-webinar]');
    if (webinarTarget) {
      e.preventDefault();
      window.openWebinarModal({ title: "Dr. Surabhi's Live Knee & Spine Relief Masterclass" });
    }
  });
});
