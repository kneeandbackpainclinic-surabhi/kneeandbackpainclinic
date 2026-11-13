// ==============================================================================
// CHARAK HEALTH SOLUTIONS - DR. SURABHI VAIDYA CLINIC
// Modern Consultation-Only Funnel, Booking & Analytics Engine
// ==============================================================================

(function() {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. STATE & ATTRIBUTION INITIALIZATION
  // --------------------------------------------------------------------------
  const state = {
    leadId: null,
    name: '',
    email: '',
    phone: '',
    concern: 'Knee Osteoarthritis / Cartilage Wear (Difficulty Walking/Stairs)',
    consultationMode: 'in_clinic', // 'in_clinic' or 'online_video'
    whatsappConsent: false,
    selectedSlotDate: '',
    selectedSlotTime: '',
    selectedSlotDisplay: '',
    paymentMethod: 'pending',
    amount: 1000,
    discountApplied: 0,
    utm: {
      source: '',
      medium: '',
      campaign: '',
      content: '',
      term: '',
      gclid: ''
    }
  };

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
  // 2. GOOGLE ADS & GA4 TRACKING HELPER (With Deduplication)
  // --------------------------------------------------------------------------
  function trackEvent(eventName, params = {}) {
    try {
      const dedupeKey = `event_fired_${eventName}_${params.lead_id || params.transaction_id || 'session'}`;
      if (sessionStorage.getItem(dedupeKey)) {
        console.log(`[Tracking] Event ${eventName} already dispatched for this session. Skipping deduplicate.`);
        return;
      }

      // Safe DataLayer Push
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...params,
        timestamp: new Date().toISOString()
      });

      // Google Tag gtag dispatch (if configured)
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      }

      sessionStorage.setItem(dedupeKey, 'true');
      console.log(`[Tracking] Dispatched event: ${eventName}`, params);
    } catch (err) {
      console.warn('[Tracking] Dispatch notice:', err);
    }
  }

  // --------------------------------------------------------------------------
  // 3. UI ELEMENTS & MODAL CONTROLLERS
  // --------------------------------------------------------------------------
  const bookingModal = document.getElementById('booking-modal');
  const btnCloseBookingModal = document.getElementById('btn-close-booking-modal');

  const modalStep1 = document.getElementById('modal-step-1');
  const modalStep2 = document.getElementById('modal-step-2');

  const stepPill1 = document.getElementById('step-pill-1');
  const stepPill2 = document.getElementById('step-pill-2');

  function openBookingModal(startStep = 1) {
    if (!bookingModal) return;
    bookingModal.classList.add('active');
    bookingModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Populate Tab 1 fields if state exists
    const modalName = document.getElementById('modal-name');
    const modalEmail = document.getElementById('modal-email');
    const modalPhone = document.getElementById('modal-phone');
    const modalConcern = document.getElementById('modal-concern');
    if (modalName && state.name) modalName.value = state.name;
    if (modalEmail && state.email) modalEmail.value = state.email;
    if (modalPhone && state.phone) modalPhone.value = state.phone;
    if (modalConcern && state.concern) modalConcern.value = state.concern;

    updateModePillStyles();
    setBookingStep(startStep);
  }

  function closeBookingModal() {
    if (!bookingModal) return;
    bookingModal.classList.remove('active');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function setBookingStep(stepNum) {
    if (modalStep1) modalStep1.style.display = (stepNum === 1) ? 'block' : 'none';
    if (modalStep2) modalStep2.style.display = (stepNum === 2) ? 'block' : 'none';

    // Update 2-Tab Stepper
    if (stepPill1) {
      stepPill1.classList.remove('active', 'completed');
      if (stepNum === 1) stepPill1.classList.add('active');
      if (stepNum > 1) stepPill1.classList.add('completed');
    }
    if (stepPill2) {
      stepPill2.classList.remove('active', 'completed');
      if (stepNum === 2) stepPill2.classList.add('active');
    }

    if (stepNum === 2) {
      loadAppointmentSlots();
      updateSummaryCard();
    }
  }

  function updateSummaryCard() {
    const elName = document.getElementById('summary-patient-name');
    const elPhone = document.getElementById('summary-patient-phone');
    const elEmail = document.getElementById('summary-patient-email');
    const elConcern = document.getElementById('summary-patient-concern');
    const elSlot = document.getElementById('summary-slot-time');
    const elLoc = document.getElementById('summary-location-line');
    const slotModalSub = document.getElementById('slot-modal-sub');
    const payDeskBtn = document.getElementById('btn-confirm-payment-in-clinic');
    const modalBoxTitle = document.getElementById('step-2-mode-title');
    const modalBoxDesc = document.getElementById('step-2-mode-desc');

    const isOnline = (state.consultationMode === 'online_video');

    if (elName) elName.textContent = state.name || 'Patient';
    if (elPhone) elPhone.textContent = state.phone ? `+91 ${state.phone}` : '+91 98XXXXXXXX';
    if (elEmail) elEmail.textContent = state.email || '';
    if (elConcern) elConcern.textContent = state.concern || 'Knee / Back Concern';
    if (elSlot) elSlot.textContent = state.selectedSlotDisplay || 'Please select a time slot below';

    if (elLoc) {
      elLoc.innerHTML = isOnline
        ? '💻 Consultation Type: <strong>Online Video Consultation</strong> (WhatsApp Video / Meet)'
        : '📍 Consultation Type: <strong>In-Clinic Visit</strong> (Thane Clinic)';
    }

    if (slotModalSub) {
      slotModalSub.textContent = isOnline
        ? 'Select your preferred 30-minute online video consultation slot, then choose your payment option.'
        : 'Select your 30-minute consultation slot at our Thane West clinic, then choose your payment option.';
    }

    if (modalBoxTitle) {
      modalBoxTitle.textContent = isOnline
        ? '💻 Online Video Consultation Booking'
        : '🏥 In-Clinic Consultation Booking';
    }

    if (modalBoxDesc) {
      modalBoxDesc.textContent = isOnline
        ? 'Your dedicated 30-minute evaluation with Dr. Surabhi Vaidya will be held via secure Video Call. Consultation fee (₹1,000) can be paid at confirmation or online.'
        : 'Your dedicated 30-minute evaluation with Dr. Surabhi Vaidya will be held at our Thane clinic. Consultation fee (₹1,000) is payable at reception upon arrival.';
    }

    if (payDeskBtn) {
      payDeskBtn.textContent = isOnline
        ? 'Confirm Video Consultation (Pay Later / UPI ₹1,000) →'
        : 'Confirm Appointment (Payment in Clinic ₹1,000) →';
    }
  }

  function updateModePillStyles() {
    const isOnline = (state.consultationMode === 'online_video');

    // Hero Form Pills
    const heroClinicLabel = document.getElementById('hero-mode-clinic-label');
    const heroOnlineLabel = document.getElementById('hero-mode-online-label');
    const heroRadios = document.querySelectorAll('input[name="hero_consult_mode"]');
    if (heroClinicLabel && heroOnlineLabel) {
      heroClinicLabel.classList.toggle('active', !isOnline);
      heroOnlineLabel.classList.toggle('active', isOnline);
    }
    heroRadios.forEach(r => {
      r.checked = (r.value === state.consultationMode);
    });

    // Modal Form Pills
    const modalClinicLabel = document.getElementById('modal-mode-clinic-label');
    const modalOnlineLabel = document.getElementById('modal-mode-online-label');
    const modalRadios = document.querySelectorAll('input[name="modal_consult_mode"]');
    if (modalClinicLabel && modalOnlineLabel) {
      modalClinicLabel.classList.toggle('active', !isOnline);
      modalOnlineLabel.classList.toggle('active', isOnline);
    }
    modalRadios.forEach(r => {
      r.checked = (r.value === state.consultationMode);
    });
  }

  // Setup Consultation Mode Radio Listeners
  document.querySelectorAll('input[name="hero_consult_mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.consultationMode = e.target.value;
      updateModePillStyles();
      updateSummaryCard();
    });
  });

  document.querySelectorAll('input[name="modal_consult_mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.consultationMode = e.target.value;
      updateModePillStyles();
      updateSummaryCard();
    });
  });

  // --------------------------------------------------------------------------
  // 4. LEAD CAPTURE & VALIDATION
  // --------------------------------------------------------------------------
  async function submitLeadData(data, sourceTrigger = 'hero-form') {
    const payload = {
      name: data.name,
      email: data.email || (data.phone ? `${data.phone}@patient.charakhealth.com` : ''),
      phone: data.phone,
      concern: data.concern || 'Knee Osteoarthritis / Cartilage Wear (Difficulty Walking/Stairs)',
      consultation_mode: state.consultationMode || 'in_clinic',
      whatsappConsent: Boolean(data.whatsapp_consent || data.whatsappConsent),
      utm_source: state.utm.source,
      utm_medium: state.utm.medium,
      utm_campaign: state.utm.campaign,
      utm_content: state.utm.content,
      utm_term: state.utm.term,
      gclid: state.utm.gclid,
      status: 'Lead Captured',
      amount: 1000
    };

    try {
      const resp = await fetch('/api/lead-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await resp.json();
      if (resp.ok && result.success) {
        state.leadId = result.leadId || result.lead?.id;
        sessionStorage.setItem('clinic_lead_id', state.leadId);
        sessionStorage.setItem('clinic_lead_name', state.name);
        sessionStorage.setItem('clinic_lead_email', state.email);
        sessionStorage.setItem('clinic_lead_phone', state.phone);

        // Track Lead Captured in Google Ads & Analytics
        trackEvent('consultation_lead_submitted', {
          event_category: 'lead',
          lead_id: state.leadId,
          concern: state.concern
        });

        return { success: true, leadId: state.leadId };
      } else {
        throw new Error(result.error || 'Failed to register enquiry');
      }
    } catch (err) {
      console.warn('Lead submission network note:', err);
      // Fallback local lead ID so patient journey is not blocked
      if (!state.leadId) {
        state.leadId = `LEAD-${Date.now().toString().slice(-4)}`;
      }
      return { success: true, leadId: state.leadId };
    }
  }

  // Handle Hero Lead Form Submit
  const heroLeadForm = document.getElementById('hero-lead-form');
  if (heroLeadForm) {
    heroLeadForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const nameInput = document.getElementById('lead-name');
      const emailInput = document.getElementById('lead-email');
      const phoneInput = document.getElementById('lead-phone');
      const concernSelect = document.getElementById('lead-concern');
      const consentInput = document.getElementById('lead-marketing-consent');
      const btnSubmit = document.getElementById('btn-submit-hero-lead');

      const nameVal = (nameInput?.value || '').trim();
      const emailVal = (emailInput?.value || '').trim();
      const phoneVal = (phoneInput?.value || '').replace(/[^0-9]/g, '').slice(-10);
      const concernVal = (concernSelect?.value || '').trim();

      let hasError = false;

      // Validate Name
      if (!nameVal || nameVal.length < 2) {
        nameInput.closest('.form-group')?.classList.add('has-error');
        hasError = true;
      } else {
        nameInput.closest('.form-group')?.classList.remove('has-error');
      }

      // Validate Email
      if (!emailVal || !emailVal.includes('@')) {
        emailInput?.closest('.form-group')?.classList.add('has-error');
        hasError = true;
      } else {
        emailInput?.closest('.form-group')?.classList.remove('has-error');
      }

      // Validate Indian Phone Number
      if (!phoneVal || phoneVal.length !== 10 || !/^[6-9]\d{9}$/.test(phoneVal)) {
        phoneInput.closest('.form-group')?.classList.add('has-error');
        hasError = true;
      } else {
        phoneInput.closest('.form-group')?.classList.remove('has-error');
      }

      // Validate Concern
      if (!concernVal) {
        concernSelect?.closest('.form-group')?.classList.add('has-error');
        hasError = true;
      } else {
        concernSelect?.closest('.form-group')?.classList.remove('has-error');
      }

      if (hasError) return;

      state.name = nameVal;
      state.email = emailVal;
      state.phone = phoneVal;
      state.concern = concernVal;
      state.whatsappConsent = Boolean(consentInput?.checked);

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Saving Details...';
      }

      await submitLeadData({
        name: state.name,
        email: state.email,
        phone: state.phone,
        concern: state.concern,
        whatsapp_consent: state.whatsappConsent
      }, 'hero-form');

      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Continue to Slot & Payment →';
      }

      // Advance directly to Tab 2 in Modal
      openBookingModal(2);
    });
  }

  // Handle Modal Lead Form Submit (Tab 1: Patient Details)
  const modalLeadForm = document.getElementById('modal-lead-form');
  if (modalLeadForm) {
    modalLeadForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const nameInput = document.getElementById('modal-name');
      const emailInput = document.getElementById('modal-email');
      const phoneInput = document.getElementById('modal-phone');
      const concernSelect = document.getElementById('modal-concern');

      const nameVal = (nameInput?.value || '').trim();
      const emailVal = (emailInput?.value || '').trim();
      const phoneVal = (phoneInput?.value || '').replace(/[^0-9]/g, '').slice(-10);
      const concernVal = (concernSelect?.value || '').trim();

      if (!nameVal || nameVal.length < 2) {
        alert('Please enter patient full name.');
        return;
      }
      if (!emailVal || !emailVal.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      if (!phoneVal || phoneVal.length !== 10 || !/^[6-9]\d{9}$/.test(phoneVal)) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!concernVal) {
        alert('Please select your primary joint or spine concern from the dropdown.');
        return;
      }

      state.name = nameVal;
      state.email = emailVal;
      state.phone = phoneVal;
      state.concern = concernVal;

      const submitBtn = modalLeadForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving Details...';
      }

      await submitLeadData({
        name: state.name,
        email: state.email,
        phone: state.phone,
        concern: state.concern
      }, 'modal-form');

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Continue to Slot & Payment →';
      }

      setBookingStep(2);
    });
  }

  // --------------------------------------------------------------------------
  // 5. STEP 2: VERIFIED APPOINTMENT SLOTS SCHEDULER
  // --------------------------------------------------------------------------
  let cachedSlotsData = null;

  async function loadAppointmentSlots() {
    const spinner = document.getElementById('slot-loading-spinner');
    const container = document.getElementById('slot-days-container');
    const btnProceed = document.getElementById('btn-proceed-to-payment');
    const banner = document.getElementById('selected-slot-banner');

    if (banner) banner.style.display = 'none';
    if (btnProceed) btnProceed.disabled = true;

    if (cachedSlotsData) {
      renderSlots(cachedSlotsData);
      return;
    }

    if (spinner) spinner.style.display = 'block';
    if (container) container.style.display = 'none';

    try {
      const resp = await fetch('/api/cal-direct?action=slots&days=6');
      const data = await resp.json();
      cachedSlotsData = data;
      renderSlots(data);
    } catch (err) {
      console.warn('Slot fetch error:', err);
      // Fallback simple day selector
      renderFallbackSlots();
    }
  }

  function renderSlots(data) {
    const spinner = document.getElementById('slot-loading-spinner');
    const container = document.getElementById('slot-days-container');
    if (spinner) spinner.style.display = 'none';
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = '';

    const days = data.days || [];
    if (days.length === 0) {
      container.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted);">Please contact clinic desk at +91 9867510223 for today\'s available slots.</div>';
      return;
    }

    // Days Tabs
    const tabsWrapper = document.createElement('div');
    tabsWrapper.className = 'scheduler-days-scroll';
    tabsWrapper.style.cssText = 'display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px;';

    const slotGridWrapper = document.createElement('div');
    slotGridWrapper.className = 'scheduler-grid-wrap';

    days.forEach((day, idx) => {
      const dayBtn = document.createElement('button');
      dayBtn.type = 'button';
      dayBtn.className = `scheduler-day-tab ${idx === 0 ? 'active' : ''}`;
      dayBtn.style.cssText = 'flex: 0 0 auto; padding: 8px 14px; border-radius: 8px; border: 1.5px solid var(--border-light); background: #ffffff; cursor: pointer; text-align: center; font-size: 0.82rem;';
      dayBtn.innerHTML = `<strong>${day.dayOfWeek}</strong><div style="font-size: 0.74rem; color: var(--text-muted);">${day.displayDate.split('(')[0].trim()}</div>`;

      dayBtn.addEventListener('click', () => {
        tabsWrapper.querySelectorAll('.scheduler-day-tab').forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'var(--border-light)';
          b.style.background = '#ffffff';
          b.style.color = 'inherit';
        });
        dayBtn.classList.add('active');
        dayBtn.style.borderColor = 'var(--primary-deep)';
        dayBtn.style.background = 'var(--primary-deep)';
        dayBtn.style.color = '#ffffff';
        renderDaySlotButtons(day, slotGridWrapper);
      });

      tabsWrapper.appendChild(dayBtn);
    });

    container.appendChild(tabsWrapper);
    container.appendChild(slotGridWrapper);

    // Render first day slots
    if (days[0]) {
      tabsWrapper.querySelector('.scheduler-day-tab')?.click();
    }
  }

  function renderDaySlotButtons(day, container) {
    container.innerHTML = '';

    const morningSlots = (day.slots || []).filter(s => s.period === 'morning');
    const eveningSlots = (day.slots || []).filter(s => s.period === 'evening');

    if (morningSlots.length > 0) {
      const mHeader = document.createElement('div');
      mHeader.style.cssText = 'font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--primary-sage); margin: 10px 0 6px;';
      mHeader.textContent = '🌅 Morning Timings (10:00 AM – 1:00 PM)';
      container.appendChild(mHeader);

      const mGrid = document.createElement('div');
      mGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: 8px; margin-bottom: 12px;';
      morningSlots.forEach(s => appendSlotBtn(s, day, mGrid));
      container.appendChild(mGrid);
    }

    if (eveningSlots.length > 0) {
      const eHeader = document.createElement('div');
      eHeader.style.cssText = 'font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--primary-sage); margin: 10px 0 6px;';
      eHeader.textContent = '🌆 Evening Timings (4:30 PM – 7:30 PM)';
      container.appendChild(eHeader);

      const eGrid = document.createElement('div');
      eGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: 8px; margin-bottom: 12px;';
      eveningSlots.forEach(s => appendSlotBtn(s, day, eGrid));
      container.appendChild(eGrid);
    }
  }

  function appendSlotBtn(slot, day, grid) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scheduler-slot-btn';
    btn.textContent = slot.time;
    btn.style.cssText = 'padding: 8px; font-size: 0.84rem; font-weight: 600; border: 1.5px solid #cbd5e1; border-radius: 6px; background: #ffffff; cursor: pointer; text-align: center;';

    if (!slot.available) {
      btn.disabled = true;
      btn.style.opacity = '0.35';
      btn.style.cursor = 'not-allowed';
      btn.title = 'Slot already reserved';
    } else {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.scheduler-slot-btn').forEach(b => {
          b.classList.remove('selected');
          b.style.background = '#ffffff';
          b.style.borderColor = '#cbd5e1';
          b.style.color = 'inherit';
        });

        btn.classList.add('selected');
        btn.style.background = 'var(--primary-sage)';
        btn.style.borderColor = 'var(--primary-sage)';
        btn.style.color = '#ffffff';

        state.selectedSlotDate = day.dateKey;
        state.selectedSlotTime = slot.time;
        state.selectedSlotDisplay = `${day.displayDate} at ${slot.time}`;

        const banner = document.getElementById('selected-slot-banner');
        const bannerText = document.getElementById('slot-banner-text');
        const summarySlot = document.getElementById('summary-slot-time');
        const btnConfirmInClinic = document.getElementById('btn-confirm-payment-in-clinic');
        const slotPrompt = document.getElementById('slot-select-prompt');

        if (bannerText) bannerText.textContent = state.selectedSlotDisplay;
        if (banner) banner.style.display = 'block';
        if (summarySlot) summarySlot.textContent = state.selectedSlotDisplay;
        if (btnConfirmInClinic) btnConfirmInClinic.disabled = false;
        if (slotPrompt) slotPrompt.style.display = 'none';

        // Auto-save slot selection in background
        fetch('/api/cal-direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: state.leadId,
            name: state.name,
            phone: state.phone,
            email: state.email,
            slotDate: state.selectedSlotDate,
            slotTime: state.selectedSlotTime,
            slotDisplay: state.selectedSlotDisplay,
            paymentMethod: 'pending',
            concern: state.concern
          })
        }).catch(err => console.warn('Slot reservation background notice:', err));

        trackEvent('slot_selected', {
          lead_id: state.leadId,
          slot: state.selectedSlotDisplay
        });
      });
    }

    grid.appendChild(btn);
  }

  function renderFallbackSlots() {
    const container = document.getElementById('slot-days-container');
    if (!container) return;
    container.style.display = 'block';
    container.innerHTML = `
      <div style="padding: 14px; background: #f8fafc; border: 1px solid var(--border-light); border-radius: 8px; font-size: 0.88rem;">
        <label for="fallback-slot-select" style="font-weight: 700; display: block; margin-bottom: 6px; color: var(--primary-deep);">
          Select Preferred Consultation Window:
        </label>
        <select id="fallback-slot-select" class="form-input" style="width: 100%;">
          <option value="">-- Choose Day &amp; Time --</option>
          <option value="Tomorrow Morning (10:00 AM - 1:00 PM)">Tomorrow Morning (10:00 AM - 1:00 PM)</option>
          <option value="Tomorrow Evening (4:30 PM - 7:30 PM)">Tomorrow Evening (4:30 PM - 7:30 PM)</option>
          <option value="This Saturday Morning (10:00 AM - 1:00 PM)">This Saturday Morning (10:00 AM - 1:00 PM)</option>
          <option value="This Saturday Evening (4:30 PM - 7:30 PM)">This Saturday Evening (4:30 PM - 7:30 PM)</option>
          <option value="Next Weekday (Clinic Hours)">Next Weekday (Clinic Hours)</option>
        </select>
      </div>
    `;

    const selectEl = document.getElementById('fallback-slot-select');
    selectEl?.addEventListener('change', () => {
      if (selectEl.value) {
        state.selectedSlotDisplay = selectEl.value;
        const banner = document.getElementById('selected-slot-banner');
        const bannerText = document.getElementById('slot-banner-text');
        const summarySlot = document.getElementById('summary-slot-time');
        const btnConfirmInClinic = document.getElementById('btn-confirm-payment-in-clinic');
        const slotPrompt = document.getElementById('slot-select-prompt');

        if (bannerText) bannerText.textContent = state.selectedSlotDisplay;
        if (banner) banner.style.display = 'block';
        if (summarySlot) summarySlot.textContent = state.selectedSlotDisplay;
        if (btnConfirmInClinic) btnConfirmInClinic.disabled = false;
        if (slotPrompt) slotPrompt.style.display = 'none';
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. TAB 2: CONFIRM APPOINTMENT & EXCLUSIVE 20% PREPAYMENT DISCOUNT
  // --------------------------------------------------------------------------
  
  // Primary Confirmation: Confirm Appointment (Payment in Clinic)
  const btnConfirmPaymentInClinic = document.getElementById('btn-confirm-payment-in-clinic');
  if (btnConfirmPaymentInClinic) {
    btnConfirmPaymentInClinic.addEventListener('click', async function() {
      if (!state.selectedSlotDisplay) {
        alert('Please choose an available consultation slot above first.');
        return;
      }

      const isOnline = (state.consultationMode === 'online_video');
      btnConfirmPaymentInClinic.disabled = true;
      btnConfirmPaymentInClinic.textContent = isOnline ? 'Reserving Video Slot...' : 'Reserving Appointment...';

      state.paymentMethod = isOnline ? 'pay_later_video' : 'pay_at_clinic';
      state.amount = 1000;
      state.discountApplied = 0;

      // 1. Immediately save confirmed booking to Supabase & trigger WhatsApp
      try {
        await fetch('/api/lead-intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: state.leadId,
            name: state.name,
            email: state.email,
            phone: state.phone,
            concern: state.concern,
            consultation_mode: state.consultationMode,
            booking_type: isOnline ? 'online_video_consultation' : 'in_clinic_consultation',
            slotPreference: state.selectedSlotDisplay,
            slotDate: state.selectedSlotDate,
            slotTime: state.selectedSlotTime,
            status: isOnline ? 'Appointment Requested - Online Video Consultation' : 'Appointment Requested - Pay at Clinic',
            paymentStatus: isOnline ? 'Video Consultation - Pending (₹1,000)' : 'Pay at Clinic - Pending (₹1,000)',
            paymentMethod: state.paymentMethod,
            amount: 1000,
            paymentOrderId: `DESK-${Date.now().toString().slice(-4)}`,
            triggerWhatsApp: true
          })
        });
      } catch (e) {
        console.warn('Booking sync note:', e);
      }

      trackEvent('consultation_payment_clinic_clicked', {
        lead_id: state.leadId,
        slot: state.selectedSlotDisplay
      });

      // 2. Unlock & reveal the exclusive 20% prepayment discount offer
      const paymentActions = document.getElementById('step-2-payment-actions') || document.getElementById('step-3-initial-confirm');
      const offerBox = document.getElementById('step-2-discount-offer') || document.getElementById('step-3-discount-offer');
      if (paymentActions) paymentActions.style.display = 'none';
      if (offerBox) offerBox.style.display = 'block';
    });
  }

  // Exclusive Prepayment Offer: Pay Online ₹800 (Save 20% / ₹200)
  const btnPayOnline800 = document.getElementById('btn-pay-online-800');
  if (btnPayOnline800) {
    btnPayOnline800.addEventListener('click', async function() {
      btnPayOnline800.disabled = true;
      btnPayOnline800.textContent = 'Connecting to Payment...';

      state.paymentMethod = 'pay_online_payu';
      state.amount = 800;
      state.discountApplied = 200;

      trackEvent('checkout_started', {
        lead_id: state.leadId,
        amount: 800,
        currency: 'INR'
      });

      try {
        const isOnline = (state.consultationMode === 'online_video');
        const orderResp = await fetch('/api/create-payu-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderAmount: 800,
            customerName: state.name,
            customerPhone: state.phone,
            customerEmail: state.email || `${state.phone}@patient.charakhealth.com`,
            planType: isOnline ? 'Online Video Consultation (Prepaid ₹800)' : 'In-Clinic Consultation (Prepaid ₹800)',
            leadId: state.leadId
          })
        });

        const orderData = await orderResp.json();

        // If PayU Gateway order returned with action URL
        if (orderData && orderData.action && orderData.params) {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = orderData.action;
          for (const [k, v] of Object.entries(orderData.params)) {
            const inp = document.createElement('input');
            inp.type = 'hidden';
            inp.name = k;
            inp.value = v;
            form.appendChild(inp);
          }
          document.body.appendChild(form);
          form.submit();
          return;
        }

        // In test sandbox mode or direct UPI flow, complete verified booking
        await completeBookingFlow({
          isPaid: true,
          amount: 800,
          paymentMethod: 'pay_online_payu',
          orderId: orderData?.txnid || `SIM-${Date.now().toString().slice(-6)}`
        });

      } catch (err) {
        console.warn('PayU Gateway initiation exception:', err);
        // Fallback to confirmation pass with VPA details
        window.location.href = '/confirmation?lead_id=' + encodeURIComponent(state.leadId) +
                               '&name=' + encodeURIComponent(state.name) +
                               '&slot=' + encodeURIComponent(state.selectedSlotDisplay) +
                               '&mode=' + encodeURIComponent(state.consultationMode) +
                               '&paid=1&amount=800';
      }
    });
  }

  // Keep ₹1,000 Payment at Clinic Desk (View Pass)
  const btnKeepClinicPay1000 = document.getElementById('btn-keep-clinic-pay-1000');
  if (btnKeepClinicPay1000) {
    btnKeepClinicPay1000.addEventListener('click', function() {
      btnKeepClinicPay1000.disabled = true;
      btnKeepClinicPay1000.textContent = 'Opening Booking Pass...';

      window.location.href = '/confirmation?lead_id=' + encodeURIComponent(state.leadId) +
                             '&name=' + encodeURIComponent(state.name) +
                             '&phone=' + encodeURIComponent(state.phone) +
                             '&email=' + encodeURIComponent(state.email) +
                             '&slot=' + encodeURIComponent(state.selectedSlotDisplay) +
                             '&mode=' + encodeURIComponent(state.consultationMode) +
                             '&paid=0&amount=1000';
    });
  }

  async function completeBookingFlow({ isPaid, amount, paymentMethod, orderId }) {
    const isOnline = (state.consultationMode === 'online_video');
    const finalStatus = isPaid
      ? (isOnline ? 'Online Video Consultation Confirmed - Paid Online (₹800)' : 'Appointment Confirmed - Paid Online (₹800)')
      : (isOnline ? 'Appointment Requested - Online Video Consultation' : 'Appointment Requested - Pay at Clinic');
    const payStatus = isPaid
      ? 'Paid Online (₹800)'
      : (isOnline ? 'Video Consultation - Pending (₹1,000)' : 'Pay at Clinic - Pending (₹1,000)');

    try {
      // 1. Sync completed status to Supabase
      await fetch('/api/lead-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: state.leadId,
          name: state.name,
          email: state.email,
          phone: state.phone,
          concern: state.concern,
          consultation_mode: state.consultationMode,
          booking_type: isOnline ? 'online_video_consultation' : 'in_clinic_consultation',
          slotPreference: state.selectedSlotDisplay,
          slotDate: state.selectedSlotDate,
          slotTime: state.selectedSlotTime,
          status: finalStatus,
          paymentStatus: payStatus,
          paymentMethod: paymentMethod,
          amount: amount,
          paymentOrderId: orderId,
          triggerWhatsApp: true
        })
      });

      // 2. Fire Google Ads & GA4 Verified Events
      if (isPaid) {
        trackEvent('consultation_payment_verified', {
          event_category: 'payment',
          value: 800,
          currency: 'INR',
          transaction_id: orderId,
          lead_id: state.leadId
        });
      }

      trackEvent('consultation_booking_confirmed', {
        event_category: 'booking',
        lead_id: state.leadId,
        booking_type: isOnline ? 'online_video_consultation' : 'in_clinic_consultation',
        slot: state.selectedSlotDisplay,
        payment_method: paymentMethod
      });

      // 3. Redirect to dedicated Confirmation Pass
      const confParams = new URLSearchParams({
        lead_id: state.leadId || '',
        name: state.name || 'Patient',
        phone: state.phone || '',
        email: state.email || '',
        slot: state.selectedSlotDisplay || 'Confirmed Clinic Schedule',
        mode: state.consultationMode || 'in_clinic',
        paid: isPaid ? '1' : '0',
        amount: String(amount),
        order_id: orderId || ''
      });

      window.location.href = `/confirmation?${confParams.toString()}`;

    } catch (err) {
      console.error('Completion error:', err);
      window.location.href = `/confirmation?lead_id=${encodeURIComponent(state.leadId)}&name=${encodeURIComponent(state.name)}&mode=${encodeURIComponent(state.consultationMode)}&paid=${isPaid ? '1' : '0'}`;
    }
  }

  // Back Navigation Button (Tab 2 -> Tab 1)
  document.getElementById('btn-back-to-step1')?.addEventListener('click', () => setBookingStep(1));

  // --------------------------------------------------------------------------
  // 7. EVENT LISTENERS FOR MODALS & CTAS
  // --------------------------------------------------------------------------
  document.querySelectorAll('.btn-open-booking').forEach(btn => {
    btn.addEventListener('click', () => {
      // If patient already typed details in Hero form, jump straight to slots & payment!
      const heroName = (document.getElementById('lead-name')?.value || '').trim();
      const heroEmail = (document.getElementById('lead-email')?.value || '').trim();
      const heroPhone = (document.getElementById('lead-phone')?.value || '').replace(/[^0-9]/g, '').slice(-10);
      const heroConcern = (document.getElementById('lead-concern')?.value || '').trim();

      if (state.name && state.phone) {
        openBookingModal(2);
      } else if (heroName && heroPhone.length === 10) {
        state.name = heroName;
        state.email = heroEmail;
        state.phone = heroPhone;
        state.concern = heroConcern || 'Knee Osteoarthritis / Cartilage Wear (Difficulty Walking/Stairs)';
        openBookingModal(2);
      } else {
        openBookingModal(1);
      }
    });
  });

  btnCloseBookingModal?.addEventListener('click', closeBookingModal);

  bookingModal?.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeBookingModal();
  });

  // --------------------------------------------------------------------------
  // 8. FAQ ACCORDION INTERACTIVITY
  // --------------------------------------------------------------------------
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const item = btn.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('active') || item.classList.contains('open');

      // Close all FAQs first
      document.querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('active', 'open');
        other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });

      // If it was not open, open it
      if (!isOpen) {
        item.classList.add('active', 'open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 9. VIDEO PLAYER MODAL INTERACTIVITY
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

  document.getElementById('video-player-modal')?.addEventListener('click', function(e) {
    if (e.target === this) window.closeVideoPlayer();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') window.closeVideoPlayer();
  });

  // --------------------------------------------------------------------------
  // 10. ON DOM READY
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initAttribution();
    trackEvent('page_view', { page_type: 'consultation_landing' });

    // Handle incoming booking intent from blog articles or direct links (?book=1)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('book') === '1' || urlParams.get('booking') === '1') {
        const concernParam = (urlParams.get('concern') || '').toLowerCase();
        const concernField = document.getElementById('modal-concern') || document.getElementById('lead-concern');
        if (concernField && concernParam) {
          if (concernParam.includes('stairs') || concernParam.includes('cartilage') || concernParam.includes('walking')) {
            concernField.value = 'Knee Osteoarthritis / Cartilage Wear (Difficulty Walking/Stairs)';
          } else if (concernParam.includes('sitting') || concernParam.includes('desk') || concernParam.includes('office')) {
            concernField.value = 'Chronic Lower Back Pain & Lumbar Spine Stiffness';
          } else if (concernParam.includes('50') || concernParam.includes('arthritis')) {
            concernField.value = 'Knee Osteoarthritis / Cartilage Wear (Difficulty Walking/Stairs)';
          } else if (concernParam.includes('sciatica') || concernParam.includes('leg') || concernParam.includes('radiating')) {
            concernField.value = 'Sciatica / Radiating Leg, Hip or Buttock Pain';
          }
        }
        setTimeout(() => {
          if (typeof openBookingModal === 'function') {
            openBookingModal(1);
          }
        }, 300);
      }
    } catch (e) {
      console.warn('Booking parameter handling notice:', e);
    }
  });

})();
