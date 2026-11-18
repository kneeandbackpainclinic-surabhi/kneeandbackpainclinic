// ==============================================================================
// CHARAK HEALTH SOLUTIONS - DR. SURABHI VAIDYA CLINIC
// Modern Calendar-First Consultation Funnel, Booking & Analytics Engine
// ==============================================================================

(function() {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. CONFIGURATION & PRICING
  // --------------------------------------------------------------------------
  const CLINIC_CONFIG = {
    durationMinutes: 30,
    modes: {
      in_clinic: {
        id: 'in_clinic',
        name: 'In-clinic (Thane)',
        tag: '🏥',
        location: 'Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West',
        standardFee: 1000,
        prepayFee: 800,
        discountPercent: 20,
        allowPayAtClinic: true
      },
      online_video: {
        id: 'online_video',
        name: 'Online video',
        tag: '💻',
        location: 'Secure Video Call (Google Meet / WhatsApp Video)',
        standardFee: 1000,
        prepayFee: 800,
        discountPercent: 20,
        allowPayAtClinic: false
      }
    }
  };

  // --------------------------------------------------------------------------
  // 2. STATE & ATTRIBUTION INITIALIZATION
  // --------------------------------------------------------------------------
  const state = {
    leadId: null,
    name: '',
    phone: '',
    email: '',
    consultationMode: 'in_clinic', // 'in_clinic' or 'online_video'
    whatsappConsent: true,
    selectedSlotDate: '',
    selectedSlotTime: '',
    selectedSlotDisplay: '',
    paymentMethod: 'pending',
    amount: 1000,
    discountApplied: 0,
    currentStep: 1,
    utm: {
      source: '',
      medium: '',
      campaign: '',
      content: '',
      term: '',
      gclid: ''
    }
  };

  // First-party random session ID generator to link funnel events to CRM lead
  function getSessionId() {
    try {
      let sid = sessionStorage.getItem('clinic_session_id');
      if (!sid) {
        sid = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('clinic_session_id', sid);
      }
      return sid;
    } catch (e) {
      return 'sess_' + Date.now().toString(36);
    }
  }

  // Capture UTM parameters and GCLID from URL
  function initAttribution() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'];
      utmKeys.forEach(key => {
        const val = urlParams.get(key);
        if (val) {
          const shortKey = key.replace('utm_', '');
          state.utm[shortKey] = val;
          sessionStorage.setItem(`lead_${key}`, val);
          const hiddenInput = document.getElementById(key);
          if (hiddenInput) hiddenInput.value = val;
        } else {
          const saved = sessionStorage.getItem(`lead_${key}`);
          if (saved) {
            const shortKey = key.replace('utm_', '');
            state.utm[shortKey] = saved;
            const hiddenInput = document.getElementById(key);
            if (hiddenInput) hiddenInput.value = saved;
          }
        }
      });
    } catch (e) {
      console.warn('Attribution capture notice:', e);
    }
  }

  // --------------------------------------------------------------------------
  // 3. ANALYTICS & GOOGLE ADS / GA4 TRACKING HELPER
  // --------------------------------------------------------------------------
  // Strict Privacy: Never pass patient names, phone numbers, or health concerns to analytics!
  function trackEvent(eventName, params = {}) {
    try {
      const sid = getSessionId();
      const safeParams = {
        session_id: sid,
        ...params,
        timestamp: new Date().toISOString()
      };

      // Strip any potential PII fields as a safeguard
      delete safeParams.name;
      delete safeParams.phone;
      delete safeParams.email;
      delete safeParams.concern;
      delete safeParams.pain_area;

      const dedupeKey = `event_fired_${eventName}_${params.lead_id || params.slot_date || sid}`;
      if (sessionStorage.getItem(dedupeKey)) {
        return;
      }

      // Safe DataLayer Push for GA4 Funnel Tracking
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...safeParams
      });

      // Google Tag dispatch (if configured)
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, safeParams);
      }

      sessionStorage.setItem(dedupeKey, 'true');
      console.log(`[Tracking] Dispatched event: ${eventName}`, safeParams);
    } catch (err) {
      console.warn('[Tracking] Dispatch notice:', err);
    }
  }

  // --------------------------------------------------------------------------
  // 4. UI MODAL CONTROLLERS & 3-STEP STEPPER
  // --------------------------------------------------------------------------
  const bookingModal = document.getElementById('booking-modal');
  const btnCloseBookingModal = document.getElementById('btn-close-booking-modal');

  const modalStep1 = document.getElementById('modal-step-1');
  const modalStep2 = document.getElementById('modal-step-2');
  const modalStep3 = document.getElementById('modal-step-3');

  const stepPill1 = document.getElementById('step-pill-1');
  const stepPill2 = document.getElementById('step-pill-2');
  const stepPill3 = document.getElementById('step-pill-3');

  function openBookingModal(targetStep = 1, triggerSource = 'homepage') {
    if (!bookingModal) return;
    bookingModal.classList.add('active');
    bookingModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Track View Available Slots Click with specific button source
    trackEvent('view_slots_click', {
      source_button: triggerSource,
      consultation_mode: state.consultationMode
    });

    updateModePillStyles();
    setBookingStep(targetStep);
  }

  // Expose globally for cross-module compatibility
  window.openBookingModal = openBookingModal;
  window.openConsultationModal = openBookingModal;

  function closeBookingModal() {
    if (!bookingModal) return;
    bookingModal.classList.remove('active');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function setBookingStep(stepNum) {
    state.currentStep = stepNum;

    if (modalStep1) modalStep1.style.display = (stepNum === 1) ? 'block' : 'none';
    if (modalStep2) modalStep2.style.display = (stepNum === 2) ? 'block' : 'none';
    if (modalStep3) modalStep3.style.display = (stepNum === 3) ? 'block' : 'none';

    // 3-Step Stepper Header Indicator
    if (stepPill1) {
      stepPill1.classList.remove('active', 'completed');
      if (stepNum === 1) stepPill1.classList.add('active');
      if (stepNum > 1) stepPill1.classList.add('completed');
    }
    if (stepPill2) {
      stepPill2.classList.remove('active', 'completed');
      if (stepNum === 2) stepPill2.classList.add('active');
      if (stepNum > 2) stepPill2.classList.add('completed');
    }
    if (stepPill3) {
      stepPill3.classList.remove('active', 'completed');
      if (stepNum === 3) stepPill3.classList.add('active');
    }

    if (stepNum === 1) {
      loadAppointmentSlots();
      updateModalBanner();
    } else if (stepNum === 2) {
      updateStep2DetailsSummary();
      // Populate fields if previously entered
      const nameInput = document.getElementById('modal-patient-name');
      const phoneInput = document.getElementById('modal-patient-phone');
      const emailInput = document.getElementById('modal-patient-email');
      if (nameInput && state.name) nameInput.value = state.name;
      if (phoneInput && state.phone) phoneInput.value = state.phone;
      if (emailInput && state.email) emailInput.value = state.email;
    } else if (stepNum === 3) {
      renderStep3PaymentChoices();
    }
  }

  // --------------------------------------------------------------------------
  // 5. CONSULTATION MODE SWITCHERS & BANNERS
  // --------------------------------------------------------------------------
  function setConsultationMode(newMode) {
    state.consultationMode = (newMode === 'online_video') ? 'online_video' : 'in_clinic';
    updateModePillStyles();
    updateModalBanner();
    if (state.currentStep === 1) {
      loadAppointmentSlots(false);
    } else if (state.currentStep === 2) {
      updateStep2DetailsSummary();
    } else if (state.currentStep === 3) {
      renderStep3PaymentChoices();
    }
  }

  function updateModePillStyles() {
    const isOnline = (state.consultationMode === 'online_video');

    // Hero Compact Card Mode Labels
    const cardClinicLabel = document.getElementById('card-mode-clinic-label');
    const cardOnlineLabel = document.getElementById('card-mode-online-label');
    if (cardClinicLabel && cardOnlineLabel) {
      cardClinicLabel.classList.toggle('active', !isOnline);
      cardOnlineLabel.classList.toggle('active', isOnline);
    }
    document.querySelectorAll('input[name="hero_consult_mode"]').forEach(r => {
      r.checked = (r.value === state.consultationMode);
    });

    // Modal Mode Selector Labels
    const modalClinicLabel = document.getElementById('modal-mode-clinic-label');
    const modalOnlineLabel = document.getElementById('modal-mode-online-label');
    if (modalClinicLabel && modalOnlineLabel) {
      modalClinicLabel.classList.toggle('active', !isOnline);
      modalOnlineLabel.classList.toggle('active', isOnline);
    }
    document.querySelectorAll('input[name="modal_consult_mode"]').forEach(r => {
      r.checked = (r.value === state.consultationMode);
    });
  }

  function updateModalBanner() {
    const isOnline = (state.consultationMode === 'online_video');
    const modeNameEl = document.getElementById('modal-banner-mode-name');
    const locNameEl = document.getElementById('modal-banner-loc-name');
    const subEl = document.getElementById('slot-modal-sub');

    if (modeNameEl) {
      modeNameEl.innerHTML = isOnline
        ? '<strong>💻 Online Video Consultation:</strong> 30-Minute Video Evaluation'
        : '<strong>🏥 In-Clinic Visit:</strong> 30-Minute Dedicated Evaluation';
    }
    if (locNameEl) {
      locNameEl.innerHTML = isOnline
        ? 'Secure Video Call (WhatsApp Video / Google Meet) &bull; Fee: ₹1,000 standard or ₹800 online (Save 20%)'
        : 'Raymond TenX Habitat Clinic, Thane West &bull; Fee: ₹1,000 at clinic or ₹800 online (Save 20%)';
    }
    if (subEl) {
      subEl.textContent = isOnline
        ? 'Choose an available 30-minute online video slot with Dr. Surabhi Vaidya. No contact details needed to browse.'
        : 'Choose an available 30-minute consultation slot at our Thane clinic with Dr. Surabhi Vaidya. No contact details needed to browse.';
    }
  }

  // --------------------------------------------------------------------------
  // 6. STEP 1: REAL-TIME CALENDAR AVAILABILITY & SLOTS SCHEDULER
  // --------------------------------------------------------------------------
  let cachedSlotsResponse = null;

  async function loadAppointmentSlots(forceRefresh = false) {
    const spinner = document.getElementById('slot-loading-spinner');
    const container = document.getElementById('slot-days-container');
    const errorState = document.getElementById('slot-error-state');
    const hint = document.getElementById('slot-instruction-hint');

    if (errorState) errorState.style.display = 'none';

    if (cachedSlotsResponse && !forceRefresh) {
      if (spinner) spinner.style.display = 'none';
      renderSlots(cachedSlotsResponse);
      return;
    }

    if (spinner) spinner.style.display = 'block';
    if (container) container.style.display = 'none';
    if (hint) hint.style.display = 'none';

    try {
      const resp = await fetch(`/api/cal-direct?action=slots&days=6&mode=${state.consultationMode}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      cachedSlotsResponse = data;

      // Dynamic Hero Copy & Live Appointment Badge Sync
      syncHeroWithLiveCalendar(data);

      if (spinner) spinner.style.display = 'none';
      renderSlots(data);
    } catch (err) {
      console.warn('Slot loading error:', err);
      if (spinner) spinner.style.display = 'none';
      if (container) container.style.display = 'none';
      if (errorState) errorState.style.display = 'block';
    }
  }

  // Updates the homepage persuasion body copy and live availability indicator
  function syncHeroWithLiveCalendar(data) {
    try {
      const heroNextSlotText = document.getElementById('hero-next-slot-text');
      const cardNextSlotTime = document.getElementById('card-next-slot-time');
      const timeframeSpan = document.getElementById('hero-timeframe-span');

      const firstSlot = data.firstAvailableSlot;
      const hasThisWeek = Boolean(data.hasSlotsThisWeek);

      // Persuasion body copy: change "this week" to "at your convenience" if no slots this week
      if (timeframeSpan) {
        timeframeSpan.textContent = hasThisWeek ? 'this week' : 'at your convenience';
      }

      const slotDisplay = firstSlot ? firstSlot.display : 'Call clinic desk for earliest opening';

      if (heroNextSlotText) {
        heroNextSlotText.textContent = slotDisplay;
      }
      if (cardNextSlotTime) {
        cardNextSlotTime.textContent = slotDisplay;
      }
    } catch (e) {
      console.warn('Hero sync notice:', e);
    }
  }

  function renderSlots(data) {
    const container = document.getElementById('slot-days-container');
    const hint = document.getElementById('slot-instruction-hint');
    if (!container) return;

    container.innerHTML = '';
    const days = data.days || [];

    if (days.length === 0) {
      container.style.display = 'block';
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); background: #f8fafc; border-radius: 10px;">
          <p style="margin: 0 0 10px; font-weight: 600;">No open appointment slots found for the selected period.</p>
          <a href="tel:+919867510223" class="btn btn-primary btn-sm">Call Clinic Reception (+91 9867510223)</a>
        </div>
      `;
      return;
    }

    container.style.display = 'block';
    if (hint) hint.style.display = 'block';

    // Days Tabs Wrapper (Horizontal scrollable)
    const tabsWrapper = document.createElement('div');
    tabsWrapper.className = 'scheduler-days-scroll';
    tabsWrapper.style.cssText = 'display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; -webkit-overflow-scrolling: touch;';

    const slotGridWrapper = document.createElement('div');
    slotGridWrapper.className = 'scheduler-grid-wrap';

    days.forEach((day, idx) => {
      const dayBtn = document.createElement('button');
      dayBtn.type = 'button';
      dayBtn.className = `scheduler-day-tab ${idx === 0 ? 'active' : ''}`;
      dayBtn.innerHTML = `
        <span style="font-size: 0.76rem; text-transform: uppercase; font-weight: 700;">${day.dayOfWeek}</span>
        <strong style="font-size: 0.96rem;">${day.displayDate.split('(')[0].trim()}</strong>
      `;

      dayBtn.addEventListener('click', () => {
        tabsWrapper.querySelectorAll('.scheduler-day-tab').forEach(b => b.classList.remove('active'));
        dayBtn.classList.add('active');
        renderDaySlotButtons(day, slotGridWrapper);
      });

      tabsWrapper.appendChild(dayBtn);
    });

    container.appendChild(tabsWrapper);
    container.appendChild(slotGridWrapper);

    // Track slots_loaded event
    trackEvent('slots_loaded', {
      consultation_mode: state.consultationMode,
      available_days_count: days.length,
      first_available_date: days[0]?.dateKey || ''
    });

    // Automatically display first day's slots
    if (days[0]) {
      renderDaySlotButtons(days[0], slotGridWrapper);
    }
  }

  function renderDaySlotButtons(day, container) {
    container.innerHTML = '';

    const morningSlots = (day.slots || []).filter(s => s.period === 'morning');
    const eveningSlots = (day.slots || []).filter(s => s.period === 'evening');

    const availableCount = (day.slots || []).filter(s => s.available).length;
    if (availableCount === 0) {
      container.innerHTML = `
        <div style="padding: 18px; text-align: center; background: #fafafa; border: 1px dashed #cbd5e1; border-radius: 8px; color: var(--text-muted); font-size: 0.86rem;">
          All appointment slots on <strong>${day.displayDate}</strong> are fully reserved. Please pick another date above.
        </div>
      `;
      return;
    }

    if (morningSlots.length > 0) {
      const mHeader = document.createElement('div');
      mHeader.style.cssText = 'font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--primary-sage); margin: 6px 0 6px; display: flex; align-items: center; gap: 4px;';
      mHeader.innerHTML = '<span>🌅</span> Morning Timings (10:00 AM – 1:00 PM)';
      container.appendChild(mHeader);

      const mGrid = document.createElement('div');
      mGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: 8px; margin-bottom: 14px;';
      morningSlots.forEach(s => appendSlotButton(s, day, mGrid));
      container.appendChild(mGrid);
    }

    if (eveningSlots.length > 0) {
      const eHeader = document.createElement('div');
      eHeader.style.cssText = 'font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--primary-sage); margin: 6px 0 6px; display: flex; align-items: center; gap: 4px;';
      eHeader.innerHTML = '<span>🌆</span> Evening Timings (4:30 PM – 7:30 PM)';
      container.appendChild(eHeader);

      const eGrid = document.createElement('div');
      eGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: 8px; margin-bottom: 12px;';
      eveningSlots.forEach(s => appendSlotButton(s, day, eGrid));
      container.appendChild(eGrid);
    }
  }

  function appendSlotButton(slot, day, grid) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scheduler-slot-btn';
    btn.textContent = slot.time;

    if (!slot.available) {
      btn.disabled = true;
      btn.classList.add('disabled');
      btn.title = 'Slot reserved';
    } else {
      btn.addEventListener('click', () => {
        // Record slot selection
        state.selectedSlotDate = day.dateKey;
        state.selectedSlotTime = slot.time;
        state.selectedSlotDisplay = `${day.displayDate} at ${slot.time}`;

        // Track slot_selected event
        trackEvent('slot_selected', {
          consultation_mode: state.consultationMode,
          slot_date: state.selectedSlotDate,
          slot_time: state.selectedSlotTime
        });

        // Advance to Step 2: Patient Details
        setBookingStep(2);
      });
    }

    grid.appendChild(btn);
  }

  // --------------------------------------------------------------------------
  // 7. STEP 2: PATIENT DETAILS & RECHECK AVAILABILITY
  // --------------------------------------------------------------------------
  function updateStep2DetailsSummary() {
    const isOnline = (state.consultationMode === 'online_video');
    const summaryMode = document.getElementById('summary-slot-mode');
    const summaryTime = document.getElementById('summary-slot-time');
    const summaryFee = document.getElementById('summary-slot-fee');

    if (summaryMode) {
      summaryMode.textContent = isOnline ? '💻 Online Video Consultation' : '🏥 In-Clinic Visit (Thane West)';
    }
    if (summaryTime) {
      summaryTime.textContent = state.selectedSlotDisplay || 'Selected Appointment Slot';
    }
    if (summaryFee) {
      summaryFee.innerHTML = isOnline
        ? 'Fee: <strong class="discount-fee">₹800</strong> (Prepay online &amp; save 20%) or <strong>₹1,000</strong> standard'
        : 'Fee: <strong>₹1,000</strong> (Pay at clinic) or <strong class="discount-fee">₹800</strong> (Prepay online &amp; save 20%)';
    }
  }

  // Handle Step 2 Form Submission
  const modalDetailsForm = document.getElementById('modal-details-form');
  if (modalDetailsForm) {
    modalDetailsForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const nameInput = document.getElementById('modal-patient-name');
      const phoneInput = document.getElementById('modal-patient-phone');
      const emailInput = document.getElementById('modal-patient-email');
      const consentInput = document.getElementById('modal-patient-consent');
      const submitBtn = document.getElementById('btn-submit-details');
      const collisionWarning = document.getElementById('details-collision-warning');

      if (collisionWarning) collisionWarning.style.display = 'none';

      const nameVal = (nameInput?.value || '').trim();
      const phoneVal = (phoneInput?.value || '').replace(/[^0-9]/g, '').slice(-10);
      const emailVal = (emailInput?.value || '').trim();

      let hasError = false;

      // Validate Name
      if (!nameVal || nameVal.length < 2) {
        nameInput?.closest('.form-group')?.classList.add('has-error');
        hasError = true;
      } else {
        nameInput?.closest('.form-group')?.classList.remove('has-error');
      }

      // Validate 10-digit Indian Mobile Number
      if (!phoneVal || phoneVal.length !== 10 || !/^[6-9]\d{9}$/.test(phoneVal)) {
        phoneInput?.closest('.form-group')?.classList.add('has-error');
        hasError = true;
      } else {
        phoneInput?.closest('.form-group')?.classList.remove('has-error');
      }

      // Email is optional, but if entered, must be valid
      if (emailVal && (!emailVal.includes('@') || !emailVal.includes('.'))) {
        emailInput?.closest('.form-group')?.classList.add('has-error');
        hasError = true;
      } else {
        emailInput?.closest('.form-group')?.classList.remove('has-error');
      }

      if (hasError) return;

      state.name = nameVal;
      state.phone = phoneVal;
      state.email = emailVal; // Optional, never invented
      state.whatsappConsent = Boolean(consentInput?.checked);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying slot availability...';
      }

      // Recheck availability before confirming to prevent double bookings
      try {
        if (state.selectedSlotDate && state.selectedSlotTime) {
          const checkResp = await fetch(`/api/cal-direct?action=check&date=${state.selectedSlotDate}&time=${encodeURIComponent(state.selectedSlotTime)}`);
          if (checkResp.ok) {
            const checkData = await checkResp.json();
            if (checkData.available === false) {
              if (collisionWarning) {
                collisionWarning.style.display = 'block';
              }
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Continue to Payment Options →';
              }
              return;
            }
          }
        }
      } catch (checkErr) {
        console.warn('Real-time check note:', checkErr);
      }

      // Save Lead Data in CRM (Supabase) via /api/lead-intake
      try {
        if (submitBtn) submitBtn.textContent = 'Reserving your slot...';

        const intakePayload = {
          id: state.leadId,
          name: state.name,
          phone: state.phone,
          email: state.email || null, // null if omitted, never invented
          consultation_mode: state.consultationMode,
          slotPreference: state.selectedSlotDisplay,
          slotDate: state.selectedSlotDate,
          slotTime: state.selectedSlotTime,
          session_id: getSessionId(),
          whatsapp_consent: state.whatsappConsent,
          status: 'Lead Captured',
          paymentStatus: 'Unpaid',
          utm_source: state.utm.source,
          utm_medium: state.utm.medium,
          utm_campaign: state.utm.campaign,
          utm_content: state.utm.content,
          utm_term: state.utm.term,
          gclid: state.utm.gclid
        };

        const resp = await fetch('/api/lead-intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(intakePayload)
        });

        const resData = await resp.json();
        if (resp.ok && resData.success) {
          state.leadId = resData.leadId || resData.lead?.id;
          sessionStorage.setItem('clinic_lead_id', state.leadId);

          // Track lead_saved ONLY after successful CRM response
          trackEvent('lead_saved', {
            lead_id: state.leadId,
            consultation_mode: state.consultationMode,
            slot_date: state.selectedSlotDate,
            slot_time: state.selectedSlotTime
          });
        } else {
          throw new Error(resData.error || 'Failed to register lead');
        }
      } catch (leadErr) {
        console.warn('Lead CRM save note:', leadErr);
        if (!state.leadId) {
          state.leadId = `LEAD-${Date.now().toString().slice(-4)}`;
        }
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Continue to Payment Options →';
      }

      // Advance to Step 3: Payment Choice
      setBookingStep(3);
    });
  }

  // Change slot buttons (returns to Step 1 without wiping entered name/phone)
  document.getElementById('btn-change-slot-top')?.addEventListener('click', () => setBookingStep(1));
  document.getElementById('btn-back-to-step1')?.addEventListener('click', () => setBookingStep(1));
  document.getElementById('btn-back-to-step2')?.addEventListener('click', () => setBookingStep(2));
  document.getElementById('btn-retry-slots')?.addEventListener('click', () => loadAppointmentSlots(true));

  // --------------------------------------------------------------------------
  // 8. STEP 3: CLEAR PAYMENT CHOICES & BOOKING CONFIRMATION
  // --------------------------------------------------------------------------
  function renderStep3PaymentChoices() {
    const container = document.getElementById('payment-options-container');
    const summaryName = document.getElementById('payment-summary-name');
    const summaryPhone = document.getElementById('payment-summary-phone');
    const summaryModeLine = document.getElementById('payment-summary-mode-line');
    const summarySlot = document.getElementById('payment-summary-slot');

    if (summaryName) summaryName.textContent = state.name || 'Patient';
    if (summaryPhone) summaryPhone.textContent = state.phone ? `+91 ${state.phone}` : '+91 98XXXXXXXX';
    if (summarySlot) summarySlot.textContent = state.selectedSlotDisplay || 'Scheduled Appointment';

    const isOnline = (state.consultationMode === 'online_video');

    if (summaryModeLine) {
      summaryModeLine.innerHTML = isOnline
        ? '📍 <strong>Mode:</strong> <span>Online Video Call (WhatsApp Video / Meet)</span>'
        : '📍 <strong>Mode:</strong> <span>In-Clinic Visit (Thane West Clinic)</span>';
    }

    if (!container) return;
    container.innerHTML = '';

    if (!isOnline) {
      // -----------------------------------------------------------------------
      // IN-CLINIC PAYMENT CHOICES: "Pay at clinic" (₹1,000) & "Prepay via UPI" (₹800)
      // -----------------------------------------------------------------------
      container.innerHTML = `
        <!-- Option 1: Pay at Clinic Reception -->
        <div class="payment-card">
          <div class="payment-card-header">
            <span class="payment-card-title">🏥 Option 1: Pay at Clinic Reception</span>
            <span class="payment-card-price">₹1,000</span>
          </div>
          <p class="payment-card-desc">
            Pay upon arrival at reception on your appointment day via Cash, UPI, or Card. No online payment needed now.
          </p>
          <button type="button" class="btn-payment-action btn-pay-clinic" id="btn-choice-pay-clinic">
            Confirm Booking (Pay ₹1,000 at Clinic) →
          </button>
        </div>

        <!-- Option 2: Prepay via UPI QR Code / UPI ID & Save 20% -->
        <div class="payment-card highlight">
          <span class="payment-card-badge">Save ₹200 (20% OFF)</span>
          <div class="payment-card-header">
            <span class="payment-card-title">⚡ Option 2: Prepay via UPI QR Code / UPI ID</span>
            <span class="payment-card-price discounted">
              <span class="strike-fee">₹1,000</span> ₹800
            </span>
          </div>
          <p class="payment-card-desc">
            Scan clinic QR code or pay via UPI ID (surabhivaidya7@okhdfcbank) using Google Pay, PhonePe, Paytm, or BHIM.
          </p>
          <button type="button" class="btn-payment-action btn-pay-online" id="btn-choice-prepay-online">
            Pay ₹800 via UPI QR / UPI ID (Save 20%) →
          </button>
        </div>
      `;
    } else {
      // -----------------------------------------------------------------------
      // ONLINE VIDEO PAYMENT CHOICES: "Prepay via UPI" (₹800) & "Pay Later UPI" (₹1,000)
      // -----------------------------------------------------------------------
      container.innerHTML = `
        <!-- Option 1: Prepay via UPI QR Code / UPI ID & Save 20% -->
        <div class="payment-card highlight">
          <span class="payment-card-badge">Save ₹200 (20% OFF)</span>
          <div class="payment-card-header">
            <span class="payment-card-title">⚡ Option 1: Prepay via UPI QR Code / UPI ID</span>
            <span class="payment-card-price discounted">
              <span class="strike-fee">₹1,000</span> ₹800
            </span>
          </div>
          <p class="payment-card-desc">
            Lock in your 30-minute online video consultation now via clinic UPI QR code or UPI ID (surabhivaidya7@okhdfcbank).
          </p>
          <button type="button" class="btn-payment-action btn-pay-online" id="btn-choice-prepay-online">
            Pay ₹800 via UPI QR / UPI ID (Save 20%) →
          </button>
        </div>

        <!-- Option 2: Pay Later via UPI -->
        <div class="payment-card">
          <div class="payment-card-header">
            <span class="payment-card-title">💻 Option 2: Confirm Video Call (Pay Later)</span>
            <span class="payment-card-price">₹1,000</span>
          </div>
          <p class="payment-card-desc">
            Confirm your slot now. You can complete the ₹1,000 consultation payment via UPI link sent to your WhatsApp prior to the call.
          </p>
          <button type="button" class="btn-payment-action btn-pay-clinic" id="btn-choice-pay-later-video">
            Confirm Video Slot (Pay ₹1,000 Later) →
          </button>
        </div>
      `;
    }

    // Attach listeners for Payment Choice buttons
    document.getElementById('btn-choice-pay-clinic')?.addEventListener('click', handlePayAtClinic);
    document.getElementById('btn-choice-pay-later-video')?.addEventListener('click', handlePayLaterVideo);
    document.getElementById('btn-choice-prepay-online')?.addEventListener('click', renderUpiCheckoutView);
  }

  // Handlers for Confirming Booking
  async function handlePayAtClinic() {
    const btn = document.getElementById('btn-choice-pay-clinic');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Confirming Appointment...';
    }

    state.paymentMethod = 'pay_at_clinic';
    state.amount = 1000;
    state.discountApplied = 0;

    await finalizeBooking({
      isPaid: false,
      amount: 1000,
      paymentMethod: 'pay_at_clinic',
      status: 'Appointment Requested - Pay at Clinic',
      paymentStatus: 'Pay at Clinic - Pending (₹1,000)'
    });
  }

  async function handlePayLaterVideo() {
    const btn = document.getElementById('btn-choice-pay-later-video');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Confirming Video Slot...';
    }

    state.paymentMethod = 'pay_later_video';
    state.amount = 1000;
    state.discountApplied = 0;

    await finalizeBooking({
      isPaid: false,
      amount: 1000,
      paymentMethod: 'pay_later_video',
      status: 'Appointment Requested - Online Video Consultation',
      paymentStatus: 'Video Consultation - Pending (₹1,000)'
    });
  }

  // Render Direct UPI Payment Checkout (Zero PayU Integration)
  function renderUpiCheckoutView() {
    const container = document.getElementById('payment-options-container');
    if (!container) return;

    state.paymentMethod = 'upi_direct';
    state.amount = 800;
    state.discountApplied = 200;

    trackEvent('checkout_started', {
      lead_id: state.leadId,
      amount: 800,
      consultation_mode: state.consultationMode,
      payment_type: 'upi_direct'
    });

    const isOnline = (state.consultationMode === 'online_video');
    const cleanPhone = (state.phone || '').replace(/[^0-9]/g, '').slice(-10) || 'CARE';
    const cleanLead = (state.leadId || '').replace(/[^0-9]/g, '').slice(-4) || Date.now().toString().slice(-4);
    const paymentComment = `CHK-${cleanPhone}-${cleanLead}`;
    const vpa = 'surabhivaidya7@okhdfcbank';
    const payee = 'Charak Health Solutions';
    const upiDeepLink = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payee)}&am=800&cu=INR&tn=${encodeURIComponent(paymentComment)}`;
    const waPreMsg = encodeURIComponent(`Namaste Dr. Surabhi Vaidya Clinic, I have completed the ₹800 UPI payment for ${state.name} (+91 ${state.phone}).\nMode: ${isOnline ? 'Online Video' : 'In-Clinic (Thane)'}\nPayment Ref: ${paymentComment}\nPlease confirm my registration pass.`);

    container.innerHTML = `
      <div class="upi-checkout-view" id="upi-checkout-view">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <button type="button" class="btn-link btn-sm" id="btn-back-to-payment-choices" style="padding: 0; font-size: 0.85rem; font-weight: 600; color: #1e3a2f; background: none; border: none; cursor: pointer;">
            ← Choose a different payment method
          </button>
          <span class="upi-shield-badge">🛡️ Verified Clinic UPI</span>
        </div>

        <div class="upi-discount-callout">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="upi-save-tag">20% Prepayment Discount Applied</span>
              <div style="font-size: 0.84rem; color: #166534; font-weight: 600; margin-top: 4px;">Standard Fee: <strike style="color: #94a3b8; font-weight: normal;">₹1,000</strike></div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.8rem; color: #166534; font-weight: 600;">Payable via UPI:</span>
              <div style="font-size: 1.4rem; font-weight: 800; color: #166534;">₹800</div>
            </div>
          </div>
        </div>

        <!-- 1. Mobile Instant UPI App Launcher -->
        <a href="${upiDeepLink}" id="btn-mobile-upi-app" class="btn-mobile-upi-launch">
          <span>📱</span> Tap to Pay ₹800 in UPI App (GPay / PhonePe / Paytm)
        </a>

        <!-- 2. Centered QR Code Image & VPA Copy Box -->
        <div class="upi-qr-card">
          <div class="upi-qr-heading">Or Scan with Any UPI App (Google Pay / PhonePe / Paytm / BHIM):</div>
          <div class="upi-qr-image-wrap">
            <img src="assets/charak-upi-qr.jpg" alt="Dr. Surabhi Vaidya Charak Health Solutions UPI QR Code">
          </div>

          <!-- VPA (UPI ID) Pill Box -->
          <div class="upi-data-row">
            <div style="min-width: 0;">
              <span class="upi-data-label">UPI ID (VPA):</span>
              <div class="upi-data-code" id="upi-vpa-display">${vpa}</div>
            </div>
            <button type="button" class="btn-copy-chip" id="btn-copy-upi-vpa">📋 Copy UPI ID</button>
          </div>

          <!-- Payment Note Pill Box -->
          <div class="upi-data-row" style="margin-top: 8px;">
            <div style="min-width: 0;">
              <span class="upi-data-label">Payment Note / Message:</span>
              <div class="upi-data-code" id="upi-note-display" style="color: #b45309;">${paymentComment}</div>
            </div>
            <button type="button" class="btn-copy-chip" id="btn-copy-upi-note">📋 Copy Note</button>
          </div>
          <p class="upi-note-reminder">Please paste or enter reference note <strong>${paymentComment}</strong> in your UPI app message box so our accounts desk immediately identifies your booking.</p>
        </div>

        <!-- 3. Step 2: Confirm Payment / Submit UTR -->
        <div class="upi-verify-section">
          <div class="upi-verify-title">✅ Step 2: Confirm Your Booking</div>
          <p class="upi-verify-sub">Once completed in your UPI app, enter the 12-digit UTR / Ref No. from your receipt to get your confirmed pass:</p>
          <div class="upi-utr-form-row">
            <input type="text" id="modal-upi-utr-input" class="form-input upi-utr-input" placeholder="e.g. 431289567123 (12-digit UTR)" maxlength="22">
            <button type="button" class="btn btn-primary" id="btn-confirm-upi-utr">
              Confirm Booking →
            </button>
          </div>
          <div style="margin-top: 10px; text-align: center;">
            <a href="https://wa.me/919867510223?text=${waPreMsg}" id="modal-wa-confirm-link" target="_blank" rel="noopener noreferrer" class="btn-wa-receipt-link">
              <span>💬</span> Or Send Receipt on WhatsApp (+91 9867510223)
            </a>
          </div>
        </div>

        ${!isOnline ? `
        <div style="text-align: center; margin-top: 12px;">
          <button type="button" class="btn-link btn-sm" id="btn-switch-to-pay-clinic" style="color: #64748b; font-size: 0.8rem; text-decoration: underline; background: none; border: none; cursor: pointer;">
            Prefer to pay ₹1,000 at clinic reception instead? Click here
          </button>
        </div>` : ''}
      </div>
    `;

    // Copy handlers
    const setupCopy = (btnId, text, successMsg) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(text).then(() => {
          const prev = btn.textContent;
          btn.textContent = successMsg;
          setTimeout(() => { btn.textContent = prev; }, 2000);
        }).catch(() => {
          prompt('Copy text:', text);
        });
      });
    };

    setupCopy('btn-copy-upi-vpa', vpa, '✓ Copied!');
    setupCopy('btn-copy-upi-note', paymentComment, '✓ Copied Note!');

    // UTR input live update for WhatsApp link
    const utrInput = document.getElementById('modal-upi-utr-input');
    const waLink = document.getElementById('modal-wa-confirm-link');
    if (utrInput && waLink) {
      utrInput.addEventListener('input', () => {
        const u = utrInput.value.trim();
        const msg = encodeURIComponent(`Namaste Dr. Surabhi Vaidya Clinic, I have completed the ₹800 UPI payment for ${state.name} (+91 ${state.phone}).\nMode: ${isOnline ? 'Online Video' : 'In-Clinic (Thane)'}\nPayment Ref: ${paymentComment}${u ? `\nUTR: ${u}` : ''}\nPlease confirm my registration pass.`);
        waLink.href = `https://wa.me/919867510223?text=${msg}`;
      });
    }

    // Back to payment choices
    document.getElementById('btn-back-to-payment-choices')?.addEventListener('click', () => {
      renderStep3PaymentChoices();
    });

    document.getElementById('btn-switch-to-pay-clinic')?.addEventListener('click', () => {
      handlePayAtClinic();
    });

    // Confirm UPI Payment button handler
    const confirmBtn = document.getElementById('btn-confirm-upi-utr');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        const utrVal = utrInput ? utrInput.value.trim() : '';
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Confirming Booking...';

        state.paymentMethod = 'upi_direct';
        state.amount = 800;
        state.discountApplied = 200;

        await finalizeBooking({
          isPaid: true,
          amount: 800,
          paymentMethod: 'upi_direct',
          orderId: utrVal || paymentComment,
          status: isOnline ? 'Online Video Consultation Confirmed - Paid via UPI (₹800)' : 'Appointment Confirmed - Paid via UPI (₹800)',
          paymentStatus: `Paid Online via UPI (₹800)${utrVal ? ` [UTR: ${utrVal}]` : ''}`
        });
      });
    }
  }

  async function finalizeBooking({ isPaid, amount, paymentMethod, orderId, status, paymentStatus }) {
    const isOnline = (state.consultationMode === 'online_video');
    const finalOrderId = orderId || (isPaid ? `TXN-${Date.now().toString().slice(-6)}` : `DESK-${Date.now().toString().slice(-4)}`);

    try {
      // 1. Sync completed booking to Supabase & trigger AgentBandhu WhatsApp pass
      await fetch('/api/lead-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: state.leadId,
          name: state.name,
          phone: state.phone,
          email: state.email || null,
          consultation_mode: state.consultationMode,
          booking_type: isOnline ? 'online_video_consultation' : 'in_clinic_consultation',
          slotPreference: state.selectedSlotDisplay,
          slotDate: state.selectedSlotDate,
          slotTime: state.selectedSlotTime,
          status: status,
          paymentStatus: paymentStatus,
          paymentMethod: paymentMethod,
          amount: amount,
          discount_applied: isPaid ? 200 : 0,
          paymentOrderId: finalOrderId,
          session_id: getSessionId(),
          triggerWhatsApp: true
        })
      });

      // 2. Fire Verified appointment_confirmed Analytics Event
      trackEvent('appointment_confirmed', {
        lead_id: state.leadId,
        consultation_mode: state.consultationMode,
        payment_method: paymentMethod,
        amount: amount,
        is_prepaid: isPaid
      });

      // 3. Redirect to Confirmation Pass
      const confParams = new URLSearchParams({
        lead_id: state.leadId || '',
        name: state.name || 'Patient',
        phone: state.phone || '',
        email: state.email || '',
        slot: state.selectedSlotDisplay || 'Confirmed Schedule',
        mode: state.consultationMode || 'in_clinic',
        paid: isPaid ? '1' : '0',
        amount: String(amount),
        order_id: finalOrderId
      });

      window.location.href = `/confirmation?${confParams.toString()}`;

    } catch (err) {
      console.error('Finalize booking error:', err);
      window.location.href = `/confirmation?lead_id=${encodeURIComponent(state.leadId)}&name=${encodeURIComponent(state.name)}&phone=${encodeURIComponent(state.phone)}&slot=${encodeURIComponent(state.selectedSlotDisplay)}&mode=${encodeURIComponent(state.consultationMode)}&paid=${isPaid ? '1' : '0'}`;
    }
  }

  // --------------------------------------------------------------------------
  // 9. EVENT LISTENERS FOR CTAS & NAVIGATION
  // --------------------------------------------------------------------------
  function setupBookingCTAs() {
    // Route all booking CTAs to the calendar-first flow
    document.querySelectorAll('.btn-view-slots, .btn-open-booking').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const trigger = btn.getAttribute('data-trigger') || 'homepage';
        openBookingModal(1, trigger);
      });
    });

    // In-Clinic Hero Card Click: sets mode to in_clinic and opens calendar directly
    const clinicCard = document.getElementById('card-mode-clinic-label');
    if (clinicCard) {
      const triggerClinic = (e) => {
        e.preventDefault();
        setConsultationMode('in_clinic');
        openBookingModal(1, 'homepage_in_clinic_tab');
      };
      clinicCard.addEventListener('click', triggerClinic);
      clinicCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') triggerClinic(e);
      });
    }

    // Online Video Hero Card Click: sets mode to online_video and opens calendar directly
    const onlineCard = document.getElementById('card-mode-online-label');
    if (onlineCard) {
      const triggerOnline = (e) => {
        e.preventDefault();
        setConsultationMode('online_video');
        openBookingModal(1, 'homepage_online_video_tab');
      };
      onlineCard.addEventListener('click', triggerOnline);
      onlineCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') triggerOnline(e);
      });
    }

    // Next Available Slot Status Card Click: opens calendar directly
    const slotStatusBox = document.getElementById('card-slot-status');
    if (slotStatusBox) {
      const triggerStatus = (e) => {
        e.preventDefault();
        openBookingModal(1, 'homepage_slot_status_preview');
      };
      slotStatusBox.addEventListener('click', triggerStatus);
      slotStatusBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') triggerStatus(e);
      });
    }

    // Modal Mode Selection Radio changes
    document.querySelectorAll('input[name="modal_consult_mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        setConsultationMode(e.target.value);
      });
    });

    btnCloseBookingModal?.addEventListener('click', closeBookingModal);

    bookingModal?.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeBookingModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bookingModal?.classList.contains('active')) {
        closeBookingModal();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 10. FAQ ACCORDION INTERACTIVITY
  // --------------------------------------------------------------------------
  function setupFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const item = btn.closest('.faq-item');
        if (!item) return;
        const isOpen = item.classList.contains('active') || item.classList.contains('open');

        document.querySelectorAll('.faq-item').forEach(other => {
          other.classList.remove('active', 'open');
          other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('active', 'open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 11. VIDEO PLAYER MODAL INTERACTIVITY
  // --------------------------------------------------------------------------
  window.openVideoPlayer = function(videoId, title) {
    const modal = document.getElementById('video-player-modal');
    const iframe = document.getElementById('video-player-iframe');
    const titleEl = document.getElementById('video-player-title');
    if (modal && iframe) {
      if (title && titleEl) titleEl.textContent = title;
      iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeVideoPlayer = function() {
    const modal = document.getElementById('video-player-modal');
    const iframe = document.getElementById('video-player-iframe');
    if (modal && iframe) {
      iframe.src = '';
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  // --------------------------------------------------------------------------
  // 12. ON DOM READY INITIALIZATION
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initAttribution();
    setupBookingCTAs();
    setupFaqAccordion();

    // Prefetch live calendar slots on homepage load to populate live availability and persuasion copy
    loadAppointmentSlots(false);

    // Track Landing Page View (Funnel Start)
    trackEvent('page_view', { page_type: 'consultation_landing' });

    // Handle incoming booking intent from direct links or blog (?book=1)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('book') === '1' || urlParams.get('booking') === '1') {
        const modeParam = urlParams.get('mode');
        if (modeParam === 'online_video' || modeParam === 'in_clinic') {
          setConsultationMode(modeParam);
        }
        setTimeout(() => {
          openBookingModal(1, 'direct_link');
        }, 300);
      }
    } catch (e) {
      console.warn('Booking parameter handling notice:', e);
    }
  });

})();
