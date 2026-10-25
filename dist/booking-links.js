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
// 2. PAYU PAYMENT GATEWAY CHECKOUT INTEGRATION (PRIMARY INDIAN GATEWAY)
// ============================================================================
function createCenteredPayUPopup(url, title, w, h) {
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
  const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
  const systemZoom = width / (window.screen.availWidth || width);
  const left = (width - w) / 2 / systemZoom + dualScreenLeft;
  const top = (height - h) / 2 / systemZoom + dualScreenTop;
  const newWindow = window.open(
    url,
    title,
    `scrollbars=yes,width=${Math.round(w / systemZoom)},height=${Math.round(h / systemZoom)},top=${Math.round(top)},left=${Math.round(left)},status=no,toolbar=no,menubar=no,resizable=yes`
  );
  if (window.focus && newWindow) newWindow.focus();
  return newWindow;
}

window.triggerPayUCheckout = async function(params) {
  params = params || {};
  const amount = params.amount || 201;
  const name = params.name || 'Patient';
  const phone = params.phone || '';
  const email = params.email || '';
  const planType = params.planType || 'Knee & Back Pain Masterclass';
  const leadId = params.leadId || '';
  const onSuccess = params.onSuccess || null;
  const onDismiss = params.onDismiss || null;

  // Open centered popup window synchronously on user click to prevent popup blockers
  const popupWindow = createCenteredPayUPopup('about:blank', 'PayUSecureWindow', 540, 740);
  if (popupWindow) {
    try {
      popupWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Connecting to PayU Secure Gateway...</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #faf8f5; color: #1e3a2f; text-align: center; }
            .card { padding: 32px 24px; max-width: 380px; width: 90%; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
            .spinner { border: 3px solid #f1f5f9; border-top: 3px solid #c25e3b; border-radius: 50%; width: 36px; height: 36px; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            h3 { font-size: 1.15rem; margin: 0 0 6px 0; color: #1e3a2f; }
            p { font-size: 0.85rem; color: #64748b; margin: 0; line-height: 1.4; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h3>Connecting to PayU Secure Gateway...</h3>
            <p>Please wait while we prepare your secure checkout screen. Do not refresh.</p>
          </div>
        </body>
        </html>
      `);
    } catch (e) {}
  }

  try {
    const res = await fetch('/api/create-payu-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderAmount: amount,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        planType: planType,
        leadId: leadId
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.action || !data.params) {
      if (popupWindow) popupWindow.close();
      throw new Error(data.error || data.details || 'Failed to initialize PayU payment');
    }

    // Set up message listener for payment completion postMessage from popup
    let paymentHandled = false;
    const messageListener = function(event) {
      if (event.data && event.data.type === 'PAYU_PAYMENT_RESULT') {
        paymentHandled = true;
        window.removeEventListener('message', messageListener);

        if (event.data.status === 'SUCCESS') {
          showPaymentSuccessPopup({
            orderId: event.data.orderId || data.params.txnid,
            amount: event.data.amount || data.params.amount,
            phone: event.data.phone || phone,
            plan: event.data.plan || planType,
            name: event.data.name || name
          });
          if (typeof onSuccess === 'function') {
            onSuccess(event.data);
          }
        } else {
          alert('Payment was not completed. You may try again or select Pay at Clinic Reception.');
          if (typeof onDismiss === 'function') {
            onDismiss();
          }
        }
      }
    };
    window.addEventListener('message', messageListener);

    // Watch for popup close if user dismisses the window
    if (popupWindow) {
      const checkClosedTimer = setInterval(() => {
        if (popupWindow.closed) {
          clearInterval(checkClosedTimer);
          setTimeout(() => {
            if (!paymentHandled) {
              window.removeEventListener('message', messageListener);
              if (typeof onDismiss === 'function') {
                onDismiss();
              }
            }
          }, 800);
        }
      }, 700);
    }

    // Submit PayU hosted payment form targeting the popup window
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = data.action;
    form.target = popupWindow ? 'PayUSecureWindow' : '_self';
    form.style.display = 'none';

    for (const [key, value] of Object.entries(data.params)) {
      if (value !== undefined && value !== null) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
    }

    document.body.appendChild(form);
    form.submit();
    setTimeout(() => form.remove(), 1000);

    return { success: true, popup: true, orderId: data.params.txnid };
  } catch (err) {
    if (popupWindow) popupWindow.close();
    console.error('PayU checkout error:', err);
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
    throw err;
  }
};

// Aliases for seamless backward compatibility across consultation & webinar buttons
window.triggerCashfreeCheckout = window.triggerPayUCheckout;
window.triggerPaymentGatewayCheckout = window.triggerPayUCheckout;

// Post-payment return handler (Shows confirmation popup upon redirect back from PayU)
function showPaymentSuccessPopup(info) {
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
        Thank you, <strong>${info.name || 'Patient'}</strong>. Your payment via <strong>PayU</strong> has been verified.
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
