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
// 2. CASHFREE PAYMENT GATEWAY CHECKOUT INTEGRATION
// ============================================================================
window.triggerCashfreeCheckout = async function(params) {
  const amount = params.amount || 201;
  const name = params.name || 'Patient';
  const phone = params.phone || '';
  const email = params.email || '';
  const planType = params.planType || 'Knee & Back Pain Masterclass';
  const leadId = params.leadId || '';

  try {
    const res = await fetch('/api/create-cashfree-order', {
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
    if (!res.ok || !data.payment_session_id) {
      throw new Error(data.error || 'Failed to initialize Cashfree session');
    }

    // Check if Cashfree JS SDK v3 is loaded
    if (typeof window.Cashfree === 'function') {
      const mode = data.environment === 'production' ? 'production' : 'sandbox';
      const cashfree = window.Cashfree({ mode: mode });

      return cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: '_modal'
      });
    } else {
      console.warn('Cashfree SDK not loaded, using fallback modal');
      return { success: true, simulated: true, orderId: data.order_id };
    }
  } catch (err) {
    console.error('Cashfree checkout error:', err);
    throw err;
  }
};

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
  // Close Cal modal button

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
