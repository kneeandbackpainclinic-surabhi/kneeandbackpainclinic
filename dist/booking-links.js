// Clinic Configuration & Booking Integrations (Cal.id, Cashfree & Webinar.gg)
window.BOOKING_LINKS = {
  // Cal.id booking link for in-clinic appointments & sessions
  calBase: 'https://cal.id/charakhealth',
  consultation: 'https://cal.id/charakhealth',
  experienceSession: 'https://cal.id/charakhealth',
  
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
// 1. INLINE CAL.ID EMBEDDED MODAL (NO EXTERNAL REDIRECTION)
// ============================================================================
window.openCalModal = function(options) {
  options = options || {};
  const name = options.name || '';
  const phone = options.phone || '';
  const email = options.email || '';
  const notes = options.notes || '';

  const modal = document.querySelector('#cal-modal');
  const iframe = document.querySelector('#cal-inline-frame');
  const titleEl = document.querySelector('#cal-modal-title');

  if (titleEl && options.title) {
    titleEl.textContent = options.title;
  }

  // Build Cal.id embedded URL with prefilled parameters
  const params = new URLSearchParams({ embed: 'true' });
  if (name) params.set('name', name);
  if (phone) params.set('phone', phone);
  if (email) params.set('email', email);
  if (notes) params.set('notes', notes);

  const calUrl = 'https://cal.id/charakhealth?' + params.toString();

  if (iframe) {
    iframe.src = calUrl;
  }

  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
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
// 3. WEBINAR.GG TOKEN & ACCESS GENERATOR
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
      joinUrl: 'https://webinar.gg/charakhealth'
    };
  }
};

// Global event listeners on load
document.addEventListener('DOMContentLoaded', function() {
  // Close Cal modal button
  const closeBtn = document.querySelector('#close-cal-modal-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeCalModal);
  }

  // Close modal when clicking on overlay background
  const calModal = document.querySelector('#cal-modal');
  if (calModal) {
    calModal.addEventListener('click', function(e) {
      if (e.target === calModal) {
        window.closeCalModal();
      }
    });
  }

  // Intercept all links targeting cal.id to open inline modal instead of navigating away
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a[href*="cal.id"]');
    if (target) {
      e.preventDefault();
      window.openCalModal({ title: 'Schedule Your In-Clinic Appointment' });
    }
  });
});
