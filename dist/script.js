// Dr. Surabhi Vaidya Knee & Back Pain Clinic - Interactive Engine
(function() {
  'use strict';

  // =========================================================================
  // 1. DYNAMIC VSL SLUG & VIDEO INITIALIZER
  // =========================================================================
  function initVslSlug() {
    const urlParams = new URLSearchParams(window.location.search);
    const vslParam = urlParams.get('vsl');
    const defaultVsl = document.body.getAttribute('data-default-vsl') || 'consultation';
    const activeVsl = vslParam ? vslParam.toLowerCase() : defaultVsl;

    const vslHeader = document.querySelector('#vsl-header-text');
    const vslDuration = document.querySelector('#vsl-duration-text');
    const vslWrap = document.querySelector('#vsl-trigger-wrap');
    const vslPoster = document.querySelector('#vsl-poster-img');
    const vslTitle = document.querySelector('#vsl-caption-title');
    const vslDesc = document.querySelector('#vsl-caption-desc');

    if (!vslWrap) return;

    if (activeVsl === 'webinar') {
      const videoId = 's_OgsH07lCQ';
      if (vslHeader) vslHeader.textContent = 'MASTERCLASS VIDEO PRESENTATION';
      if (vslDuration) vslDuration.textContent = '3 MIN MASTERCLASS INVITATION';
      if (vslWrap) vslWrap.setAttribute('data-video-id', videoId);
      if (vslPoster) vslPoster.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      if (vslTitle) vslTitle.innerHTML = 'Sunday Masterclass Invitation (₹201) · Joint Restoration Blueprint';
      if (vslDesc) vslDesc.innerHTML = 'Watch Dr. Surabhi Vaidya preview what will be revealed in the 90-minute live interactive webinar.gg masterclass.';
    } else {
      const videoId = 'wrwncuc7zz8';
      if (vslHeader) vslHeader.textContent = 'DOCTOR VIDEO PRESENTATION';
      if (vslDuration) vslDuration.textContent = '5 MIN CLINICAL OVERVIEW';
      if (vslWrap) vslWrap.setAttribute('data-video-id', videoId);
      if (vslPoster) vslPoster.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      if (vslTitle) vslTitle.innerHTML = 'How We Decompress Pinched Nerves &amp; Prevent Joint Surgery';
      if (vslDesc) vslDesc.innerHTML = 'Watch Dr. Surabhi Vaidya explain our 4-pillar Marma &amp; Panchakarma protocol in simple patient language.';
    }
  }

  // =========================================================================
  // 2. VIDEO MODAL PLAYER
  // =========================================================================
  const videoModal = document.querySelector('#video-modal');
  const modalIframe = document.querySelector('#modal-iframe');
  const modalTitle = document.querySelector('#modal-video-title');
  const modalCloseBtn = document.querySelector('#modal-close-btn');

  function openVideoModal(videoId, title) {
    if (!videoModal || !modalIframe) return;
    if (modalTitle && title) modalTitle.textContent = title;
    modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    videoModal.style.display = 'flex';
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!videoModal || !modalIframe) return;
    modalIframe.src = '';
    videoModal.style.display = 'none';
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  // Bind VSL & Testimonial cards
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-video-id]');
    if (card) {
      e.preventDefault();
      const videoId = card.getAttribute('data-video-id');
      const title = card.querySelector('h3, h4, .vsl-caption-bar h3')?.textContent || 'Dr. Surabhi Vaidya · Video Story';
      openVideoModal(videoId, title);
    }
  });

  // =========================================================================
  // 3. QUESTIONNAIRE WITH STRICT SINGLE-OPTION RECOMMENDATION ENGINE & CRM
  // =========================================================================
  const quizModal = document.querySelector('#quiz-modal');
  const quizBody = document.querySelector('#quiz-body');
  const quizProgress = document.querySelector('#quiz-progress');
  const quizCloseBtn = document.querySelector('#quiz-close-btn');

  const quizQuestions = [
    {
      title: 'Which area is causing you the most pain or difficulty?',
      subtitle: 'Select your primary joint or spine condition.',
      options: [
        'Knee Joint (One or both knees / Osteoarthritis)',
        'Lower Back & Spine (Slip disc / L4-L5 / Sciatica)',
        'Neck & Cervical Spondylosis (Shoulder / upper back stiffness)',
        'Multiple Joints & Age-Related Mobility Restrictions'
      ]
    },
    {
      title: 'How severe is this pain in your everyday life?',
      subtitle: 'Select the statement that best describes your daily difficulty.',
      options: [
        'Severe distress: Walking or stairs are agonizing, night sleep is disturbed',
        'Advanced restriction: Getting up from chairs requires arm support and 2 minutes',
        'Moderate restriction: Pain starts after 15 to 20 minutes of walking or standing',
        'Early discomfort: Pain is intermittent, looking to prevent further joint damage'
      ]
    },
    {
      title: 'What prior treatments have you tried so far?',
      subtitle: 'Understanding what you have already tried helps determine your next step.',
      options: [
        'Total Knee Replacement or Spine Surgery has been advised by a doctor',
        'Daily painkillers or steroid injections with only temporary relief',
        'Physiotherapy, exercise, or generic pain oils',
        'Just beginning to explore specialized non-surgical care'
      ]
    },
    {
      title: 'Where do you currently stand regarding starting treatment?',
      subtitle: 'We tailor your next step based on your readiness and comfort level.',
      options: [
        'I am ready to begin treatment to get relief and avoid surgery',
        'I am fairly ready and want an in-clinic consultation first to understand my condition',
        'I am hesitant or skeptical: I want to learn more about how Ayurveda works before visiting',
        'I am just exploring information online for now'
      ]
    }
  ];

  let currentStep = 0;
  let userAnswers = [];

  function openQuiz() {
    currentStep = 0;
    userAnswers = [];
    const modalContainer = quizModal ? quizModal.querySelector('.quiz-modal-container') : null;
    if (modalContainer) modalContainer.classList.remove('is-consultation-step');
    renderQuiz();
    if (quizModal) {
      quizModal.style.display = 'flex';
      quizModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeQuiz() {
    if (quizModal) {
      const modalContainer = quizModal.querySelector('.quiz-modal-container');
      if (modalContainer) modalContainer.classList.remove('is-consultation-step');
      quizModal.style.display = 'none';
      quizModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (quizCloseBtn) {
    quizCloseBtn.addEventListener('click', closeQuiz);
  }

  if (quizModal) {
    quizModal.addEventListener('click', (e) => {
      if (e.target === quizModal) closeQuiz();
    });
  }

  // Bind all CTA buttons with data-start-assessment
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-start-assessment]')) {
      e.preventDefault();
      openQuiz();
    }
  });

  function renderQuiz() {
    if (!quizBody || !quizProgress) return;

    const total = quizQuestions.length;
    quizProgress.style.width = `${((currentStep) / total) * 100}%`;

    // RESULT STEP: ONLY TWO PATHWAYS (Webinar or Consultation)
    if (currentStep >= total) {
      quizProgress.style.width = '100%';
      const painArea = quizQuestions[0].options[userAnswers[0]] || 'Knee & Back Pain';
      const qSeverity = userAnswers[1];
      const qPrior = userAnswers[2];
      const qReadiness = userAnswers[3];

      // Calculate next available date in India Standard Time (+5:30)
      function getNextAvailableDateStr() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const istTime = new Date(utc + (330 * 60000));
        // After 5:00 PM IST (17:00), default to tomorrow's date
        if (istTime.getHours() >= 17) {
          istTime.setDate(istTime.getDate() + 1);
        }
        const yyyy = istTime.getFullYear();
        const mm = String(istTime.getMonth() + 1).padStart(2, '0');
        const dd = String(istTime.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }

      // ONLY TWO BRANCHES:
      // Hesitant, skeptical, just exploring -> Recommend Webinar Masterclass (₹201)
      // Otherwise (active pain, ready, seeking doctor diagnosis) -> In-Clinic Consultation (₹1,000, 30-Min)
      let branch = 'consultation';
      if (qReadiness === 2 || qReadiness === 3 || qPrior === 3) {
        branch = 'webinar';
      } else {
        branch = 'consultation';
      }

      let resultHtml = '';
      const nextAvailableDate = getNextAvailableDateStr();

      // Helper to render dedicated final Consultation Confirmed screen
      function renderConsultationSuccess(nameVal, phoneVal, slotVal, isPaid) {
        const cleanP = (phoneVal || '').replace(/[^0-9]/g, '').slice(-10);
        const displayName = nameVal || 'Patient';
        const displaySlot = slotVal || 'Earliest Available (Selected on Cal.id)';
        const feeStatus = isPaid ? 'Paid Online via Cashfree ✓' : 'Pay ₹1,000 at Clinic Desk';

        quizBody.innerHTML = `
          <div style="text-align: center; padding: 20px 12px;">
            <div style="font-size: 3.2rem; margin-bottom: 8px;">🎉</div>
            <h3 style="font-size: 1.4rem; color: var(--primary-deep); margin-bottom: 6px;">
              Consultation Confirmed for ${displayName}!
            </h3>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
              Your 30-minute in-clinic diagnostic assessment with <strong>Dr. Surabhi Vaidya</strong> is registered.
            </p>

            <div style="background: #eef7ed; border: 1.5px solid #86efac; border-radius: 8px; padding: 14px; text-align: left; margin-bottom: 14px;">
              <div style="font-weight: 700; color: #166534; font-size: 0.88rem; margin-bottom: 4px;">
                📲 WhatsApp Confirmation Dispatched
              </div>
              <div style="font-size: 0.82rem; color: #15803d; line-height: 1.5;">
                Appointment details and clinic directions have been sent to <strong>+91 ${cleanP || phoneVal}</strong>. If you booked your slot on Cal.id, your time is confirmed on the clinic schedule.
              </div>
            </div>

            <div style="background: var(--bg-sand); border-radius: 8px; padding: 14px; text-align: left; margin-bottom: 18px; font-size: 0.82rem; color: var(--primary-deep); line-height: 1.6;">
              <div>📅 <strong>Scheduled Time:</strong> ${displaySlot}</div>
              <div style="margin-top: 4px;">📍 <strong>Clinic Address:</strong> Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Vartak Nagar, Thane West, Maharashtra 400606</div>
              <div style="margin-top: 4px;">⏱️ <strong>Duration:</strong> 30 Minutes In-Clinic Assessment</div>
              <div style="margin-top: 4px;">💳 <strong>Consultation Fee:</strong> ₹1,000 (${feeStatus})</div>
            </div>

            <div style="display: flex; gap: 10px; flex-direction: column;">
              <button type="button" id="confirmed-done-close-btn" class="btn btn-primary btn-lg" style="width: 100%; font-weight: 700;">
                ✓ Done &amp; Close Window
              </button>
              ${!isPaid ? `
              <button type="button" id="confirmed-pay-cashfree-btn" class="btn btn-secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span>💳</span> Or Pay ₹1,000 Online via Cashfree Now
              </button>
              ` : ''}
            </div>
          </div>
        `;

        const doneCloseBtn = quizBody.querySelector('#confirmed-done-close-btn');
        if (doneCloseBtn) {
          doneCloseBtn.addEventListener('click', closeQuiz);
        }

        const payNowBtn = quizBody.querySelector('#confirmed-pay-cashfree-btn');
        if (payNowBtn) {
          payNowBtn.addEventListener('click', async function() {
            payNowBtn.disabled = true;
            payNowBtn.textContent = 'Opening Cashfree Gateway...';
            try {
              if (window.triggerCashfreeCheckout) {
                await window.triggerCashfreeCheckout({
                  amount: 1000,
                  name: displayName,
                  phone: cleanP,
                  planType: '₹1,000 Diagnostic Consultation (30-Min)',
                  leadId: `LEAD-${Date.now()}`
                });
              }
            } catch (e) {
              console.warn('PG Checkout Note:', e);
              payNowBtn.disabled = false;
              payNowBtn.textContent = 'Pay ₹1,000 Online via Cashfree';
            }
          });
        }
      }

      // BRANCH 1: IN-CLINIC DIAGNOSTIC CONSULTATION (WITH DIRECT EMBEDDED CAL.ID FORM)
      const modalContainer = quizModal ? quizModal.querySelector('.quiz-modal-container') : null;
      if (branch === 'consultation') {
        if (modalContainer) modalContainer.classList.add('is-consultation-step');
        resultHtml = `
          <div class="quiz-result-single" style="border-color: var(--accent-gold);">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
              SINGLE RECOMMENDED NEXT STEP
            </div>
            <h3 style="font-size: 1.35rem; color: var(--primary-deep); margin-bottom: 8px;">
              In-Clinic Diagnostic Consultation (₹1,000)
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; margin-bottom: 12px;">
              You are at a suitable stage to get an in-depth 30-minute clinical assessment with Dr. Surabhi Vaidya for your <strong>${painArea}</strong>. She will perform Ayurvedic Naadi Pariksha (pulse analysis), evaluate your MRI / X-Rays, and map your surgical prevention plan.
            </p>

            <div class="quiz-flow-indicator">
              <div class="flow-node">1. Assessment ✓</div>
              <div class="flow-node active-node">2. ★ 30-Min Consultation (₹1,000)</div>
              <div class="flow-node">3. Targeted Protocol</div>
            </div>

            <!-- Booking Form With Cal.id Embedded in Responsive 2-Column Grid -->
            <form id="quiz-booking-form">
              <div class="booking-grid-layout">
                
                <!-- Left Sidebar: Patient Details, Pricing & Action Buttons -->
                <div class="booking-sidebar">
                  <div class="form-field" style="margin-bottom: 6px;">
                    <label for="booking-name" style="font-size: 0.8rem; font-weight: 600; color: var(--primary-deep); margin-bottom: 3px; display: block;">Your Full Name *</label>
                    <input type="text" id="booking-name" required placeholder="Enter full name" minlength="2" style="width: 100%; padding: 8px 10px; font-size: 0.85rem; border: 1px solid var(--border-light); border-radius: 6px;">
                  </div>
                  <div class="form-field" style="margin-bottom: 8px;">
                    <label for="booking-phone" style="font-size: 0.8rem; font-weight: 600; color: var(--primary-deep); margin-bottom: 3px; display: block;">Mobile Phone (WhatsApp) *</label>
                    <input type="tel" id="booking-phone" required placeholder="10-digit mobile number" pattern="[6-9][0-9]{9}" maxlength="10" style="width: 100%; padding: 8px 10px; font-size: 0.85rem; border: 1px solid var(--border-light); border-radius: 6px;">
                  </div>

                  <!-- Consultation Fee & Action Box -->
                  <div style="background: var(--bg-sand); padding: 12px; border-radius: 8px; border: 1px solid var(--border-light);">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                      <span style="font-size: 0.82rem; color: var(--text-muted);">Consultation Fee:</span>
                      <strong style="font-size: 1.15rem; color: var(--primary-deep);">₹1,000</strong>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px; line-height: 1.35;">
                      Select your preferred date &amp; time on the calendar, then click below to confirm your booking:
                    </p>
                    <div style="display: flex; gap: 8px; flex-direction: column;">
                      <button type="submit" id="confirm-clinic-slot-btn" class="btn btn-primary btn-lg" style="width: 100%; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; font-size: 0.88rem;">
                        <span>✅</span> Confirm Booking &amp; Pay at Clinic
                      </button>
                      <button type="button" id="pay-cashfree-consult-btn" class="btn btn-secondary" style="width: 100%; padding: 8px 10px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.82rem;">
                        <span>💳</span> Or Pay ₹1,000 Online via Cashfree
                      </button>
                    </div>
                  </div>

                  <div style="background: #faf8f5; border: 1px solid var(--border-light); padding: 8px 10px; border-radius: 6px; font-size: 0.72rem; color: var(--text-muted); line-height: 1.4;">
                    📍 <strong>Clinic Address:</strong> Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Vartak Nagar, Thane West. Desk: kneeandbackpainclinic@gmail.com
                  </div>
                </div>

                <!-- Right Main: Live Cal.id Calendar Embed -->
                <div class="booking-calendar-main">
                  <div class="calendar-header-bar">
                    <span>📅 Select Appointment Slot (Cal.id Live Calendar)</span>
                    <span class="auto-slot-badge">● Live Availability</span>
                  </div>
                  <iframe id="quiz-cal-embed-frame" src="https://cal.id/charakhealth/consultation?embed=true&layout=week_view&date=${nextAvailableDate}" title="Cal.id Booking Calendar"></iframe>
                </div>

              </div>
            </form>
          </div>
        `;
      } else {
        if (modalContainer) modalContainer.classList.remove('is-consultation-step');
        // BRANCH 2: ONLY LIVE HINDI WEBINAR MASTERCLASS (₹201)
        resultHtml = `
          <div class="quiz-result-single" style="border-color: var(--primary-sage);">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary-sage); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
              SINGLE RECOMMENDED NEXT STEP
            </div>
            <h3 style="font-size: 1.35rem; color: var(--primary-deep); margin-bottom: 8px;">
              Attend Live Hindi Masterclass on Webinar.gg (₹201)
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; margin-bottom: 12px;">
              Since you are currently exploring or looking to understand how Ayurveda compares with surgery for <strong>${painArea}</strong>, we recommend starting with our 90-minute live online session with Dr. Surabhi Vaidya on our interactive <strong>Webinar.gg</strong> platform. Learn root-cause analysis and discover practical ways to protect your joints without visiting the clinic yet.
            </p>

            <div class="quiz-flow-indicator">
              <div class="flow-node">1. Assessment ✓</div>
              <div class="flow-node active-node">2. ★ Live Masterclass (₹201)</div>
              <div class="flow-node">3. In-Clinic Care</div>
            </div>

            <div style="background: var(--bg-sand); padding: 12px 14px; border-radius: 6px; font-size: 0.82rem; color: var(--primary-deep); margin-bottom: 16px;">
              <strong>Includes:</strong> 90-Min Live Interactive Webinar.gg Session + Live Doctor Q&amp;A + Anti-Inflammatory Ayurvedic Diet Guide.
            </div>

            <form id="quiz-booking-form">
              <div class="form-field">
                <label for="booking-name">Your Full Name *</label>
                <input type="text" id="booking-name" required placeholder="Enter full name" minlength="2">
              </div>
              <div class="form-field">
                <label for="booking-phone">Mobile Phone Number *</label>
                <input type="tel" id="booking-phone" required placeholder="10-digit mobile number" pattern="[6-9][0-9]{9}" maxlength="10">
              </div>
              <div class="form-field">
                <label for="booking-city">City / Area *</label>
                <input type="text" id="booking-city" required placeholder="e.g. Thane / Mumbai / Pune">
              </div>
              <button type="submit" class="btn btn-deep btn-lg" style="width: 100%; margin-top: 10px;">
                Register for Masterclass (₹201) ↗
              </button>
            </form>
          </div>
        `;
      }

      quizBody.innerHTML = `
        ${resultHtml}
        <div class="quiz-footer" style="border-top: none; justify-content: center;">
          <button class="quiz-back-btn" type="button" id="quiz-restart-btn">↺ Retake Assessment</button>
        </div>
      `;

      // Helper to save and dispatch lead to CRM and serverless API
      function saveConsultationLead(name, phone, slotInfo, paymentStatus) {
        const lead = {
          id: 'LEAD-' + Math.floor(100 + Math.random() * 900),
          name: name || 'Patient',
          phone: phone || '',
          city: 'Thane / Mumbai',
          painArea: painArea,
          severity: quizQuestions[1].options[userAnswers[1]] || '',
          priorTreatments: quizQuestions[2].options[userAnswers[2]] || '',
          readiness: quizQuestions[3].options[userAnswers[3]] || '',
          recommendedStep: branch === 'webinar' ? '₹201 Live Hindi Masterclass' : '₹1,000 Diagnostic Consultation',
          slotPreference: slotInfo || 'Earliest Available (Cal.id)',
          status: slotInfo ? 'Consultation Scheduled' : 'New Lead',
          paymentStatus: paymentStatus || 'Unpaid',
          createdAt: new Date().toISOString()
        };

        try {
          const existing = JSON.parse(localStorage.getItem('dr_surabhi_leads')) || [];
          const idx = existing.findIndex(l => (lead.phone && l.phone === lead.phone));
          if (idx >= 0) {
            existing[idx] = Object.assign(existing[idx], lead);
          } else {
            existing.unshift(lead);
          }
          localStorage.setItem('dr_surabhi_leads', JSON.stringify(existing));

          fetch('/api/lead-intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
          }).catch(err => console.warn('Lead intake sync error:', err));
        } catch (e) {
          console.warn('Lead sync error:', e);
        }

        return lead;
      }

      // If Consultation branch: dynamic Cal.id prefilling & postMessage listening
      if (branch === 'consultation') {
        const calFrame = quizBody.querySelector('#quiz-cal-embed-frame');
        const nameInput = quizBody.querySelector('#booking-name');
        const phoneInput = quizBody.querySelector('#booking-phone');
        const payConsultBtn = quizBody.querySelector('#pay-cashfree-consult-btn');

        // Dynamic prefill sync when user completes name & phone
        function updateCalFramePrefill() {
          if (!calFrame) return;
          const nameVal = nameInput ? nameInput.value.trim() : '';
          const phoneVal = phoneInput ? phoneInput.value.trim() : '';
          if (phoneVal.length === 10) {
            saveConsultationLead(nameVal, phoneVal, '', 'Unpaid');
            const newUrl = `https://cal.id/charakhealth/consultation?embed=true&layout=week_view&date=${nextAvailableDate}&name=${encodeURIComponent(nameVal)}&phone=${encodeURIComponent(phoneVal)}`;
            if (calFrame.src !== newUrl) {
              calFrame.src = newUrl;
            }
          }
        }

        if (phoneInput) phoneInput.addEventListener('blur', updateCalFramePrefill);
        if (nameInput) nameInput.addEventListener('blur', updateCalFramePrefill);

        // Listen for all Cal.com / Cal.id booking confirmation events across origins
        const onCalMessage = function(ev) {
          try {
            const raw = ev.data;
            if (!raw) return;
            const str = typeof raw === 'string' ? raw : JSON.stringify(raw);
            const isBooking = /bookingSuccessful/i.test(str) || /booking_successful/i.test(str);
            if (isBooking) {
              const nameVal = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Patient';
              const phoneVal = phoneInput ? phoneInput.value.trim() : '';
              let slotTime = 'Confirmed on Cal.id';
              try {
                const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                const d = parsed.data || parsed.payload || parsed;
                if (d && d.startTime) {
                  slotTime = new Date(d.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
                }
              } catch (e) {}

              saveConsultationLead(nameVal, phoneVal, slotTime, 'Slot Booked (Cal.id)');
              renderConsultationSuccess(nameVal, phoneVal, slotTime, false);
            }
          } catch (e) {
            // Ignore non-booking messages
          }
        };

        window.addEventListener('message', onCalMessage);

        // Cashfree online payment trigger
        if (payConsultBtn) {
          payConsultBtn.addEventListener('click', async function() {
            const nameVal = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Patient';
            const phoneVal = phoneInput ? phoneInput.value.trim() : '';
            if (!phoneVal || phoneVal.length !== 10) {
              if (phoneInput) phoneInput.focus();
              alert('Please enter your 10-digit mobile number before proceeding.');
              return;
            }

            const currentLead = saveConsultationLead(nameVal, phoneVal, 'Slot Chosen on Cal.id', 'Paid Online Pending');
            payConsultBtn.disabled = true;
            payConsultBtn.textContent = 'Opening Cashfree Gateway...';

            try {
              if (window.triggerCashfreeCheckout) {
                const result = await window.triggerCashfreeCheckout({
                  amount: 1000,
                  name: nameVal,
                  phone: phoneVal,
                  planType: '₹1,000 Diagnostic Consultation (30-Min)',
                  leadId: currentLead.id
                });
                renderConsultationSuccess(nameVal, phoneVal, 'Slot Chosen on Cal.id', true);
              } else {
                renderConsultationSuccess(nameVal, phoneVal, 'Slot Chosen on Cal.id', true);
              }
            } catch (err) {
              console.warn('Consultation PG checkout error:', err);
              payConsultBtn.disabled = false;
              payConsultBtn.textContent = 'Pay ₹1,000 Online via Cashfree';
            }
          });
        }
      }

      // Wire submit form
      const form = quizBody.querySelector('#quiz-booking-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const nameInput = form.querySelector('#booking-name');
          const phoneInput = form.querySelector('#booking-phone');
          const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Patient';
          const phone = phoneInput ? phoneInput.value.trim() : '';

          if (branch === 'consultation') {
            if (!phone || phone.length !== 10) {
              if (phoneInput) phoneInput.focus();
              alert('Please enter your 10-digit mobile number.');
              return;
            }
            saveConsultationLead(name, phone, 'Confirmed on Cal.id / Pay at Clinic', 'Pay at Clinic');
            renderConsultationSuccess(name, phone, 'Confirmed on Cal.id', false);
            return;
          }

          // Webinar registration handling
          if (branch === 'webinar') {
            const newLead = saveConsultationLead(name, phone, 'Webinar Registered', 'Unpaid');
            quizBody.innerHTML = `
              <div style="text-align: center; padding: 16px 8px;">
                <div style="font-size: 2.8rem; margin-bottom: 8px;">🎥</div>
                <h3 style="font-size: 1.35rem; color: var(--primary-deep); margin-bottom: 6px;">
                  Confirm Your Masterclass Seat (₹201)
                </h3>
                <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px;">
                  Thank you, <strong>${name}</strong>. Secure your seat via Cashfree Payment Gateway to get your direct <strong>Webinar.gg</strong> joining pass.
                </p>
                <div style="background: var(--bg-sand); padding: 14px; border-radius: 8px; margin-bottom: 16px; text-align: left;">
                  <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--primary-deep); margin-bottom: 4px;">
                    <span>90-Min Live Masterclass Access</span>
                    <span>₹201</span>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">Includes Live Q&amp;A + Anti-Inflammatory Ayurvedic Nutrition Protocol</div>
                </div>

                <button type="button" id="pay-cashfree-webinar-btn" class="btn btn-deep btn-lg" style="width: 100%; margin-bottom: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span>💳</span> Pay ₹201 via Cashfree (UPI / Cards) ↗
                </button>

                <div id="webinar-access-box" style="display: none; background: #eef7ed; border: 1px solid #c7e8c6; padding: 16px; border-radius: 8px; margin-bottom: 16px; text-align: left;">
                  <div style="font-weight: 700; color: #166534; margin-bottom: 6px;">🎉 Payment &amp; Registration Successful!</div>
                  <p style="font-size: 0.85rem; color: #15803d; margin-bottom: 10px;">Your secure Webinar.gg join token has been issued for <strong>${phone}</strong>.</p>
                  <a id="webinar-room-join-link" href="https://webinar.gg/charakhealth" target="_blank" rel="noopener" class="btn btn-primary" style="width: 100%; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700;">
                    <span>🎥</span> Enter Live Room on Webinar.gg ↗
                  </a>
                </div>

                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
                  Clinic Desk: kneeandbackpainclinic@gmail.com · Raymond TenX Habitat, Pokharan Road No. 2, Thane West.
                </p>
                <button type="button" class="btn btn-secondary" style="margin-top: 6px;" onclick="document.querySelector('#quiz-modal').style.display='none'; document.body.style.overflow='';">
                  Close &amp; Return
                </button>
              </div>
            `;

            const payBtn = quizBody.querySelector('#pay-cashfree-webinar-btn');
            if (payBtn) {
              payBtn.addEventListener('click', async function() {
                payBtn.disabled = true;
                payBtn.textContent = 'Opening Cashfree Secure Checkout...';
                try {
                  if (window.triggerCashfreeCheckout) {
                    await window.triggerCashfreeCheckout({
                      amount: 201,
                      name: name,
                      phone: phone,
                      planType: '₹201 Live Masterclass',
                      leadId: newLead.id
                    });
                  }
                } catch (e) {
                  console.warn('Checkout note:', e.message);
                }

                // Generate Webinar.gg token & display room access
                try {
                  const tokenResp = await fetch('/api/get-webinar-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name, phone: phone })
                  });
                  const tokenData = await tokenResp.json();
                  const accessBox = quizBody.querySelector('#webinar-access-box');
                  const joinLink = quizBody.querySelector('#webinar-room-join-link');
                  if (accessBox && joinLink) {
                    accessBox.style.display = 'block';
                    payBtn.style.display = 'none';

                    joinLink.addEventListener('click', function(ev) {
                      ev.preventDefault();
                      document.querySelector('#quiz-modal').style.display = 'none';
                      document.body.style.overflow = '';
                      if (window.openWebinarModal) {
                        window.openWebinarModal({
                          token: tokenData.token || '',
                          webinarId: tokenData.webinarId || 'charakhealth',
                          name: name,
                          phone: phone
                        });
                      } else {
                        window.location.href = '/room?token=' + encodeURIComponent(tokenData.token || '');
                      }
                    });
                  }
                } catch (tokErr) {
                  console.warn('Webinar token fetch:', tokErr);
                }
              });
            }
          }
        });
      }

      const restartBtn = quizBody.querySelector('#quiz-restart-btn');
      if (restartBtn) {
        restartBtn.addEventListener('click', openQuiz);
      }
      return;
    }

    // REGULAR QUESTION STEP
    const q = quizQuestions[currentStep];
    let optionsHtml = '';
    q.options.forEach((opt, idx) => {
      optionsHtml += `
        <button type="button" class="quiz-option-btn" data-option-idx="${idx}">
          <span class="quiz-option-radio"></span>
          <span class="quiz-option-text">${opt}</span>
        </button>
      `;
    });

    quizBody.innerHTML = `
      <div class="quiz-step-header">
        <span class="quiz-step-counter">STEP ${currentStep + 1} OF ${total}</span>
        <h3 class="quiz-step-title">${q.title}</h3>
        <p class="quiz-step-subtitle">${q.subtitle}</p>
      </div>
      <div class="quiz-options-list">
        ${optionsHtml}
      </div>
      <div class="quiz-footer">
        ${currentStep > 0 ? `<button class="quiz-back-btn" type="button" id="quiz-prev-btn">← Back</button>` : `<span></span>`}
        <span style="font-size: 0.75rem; color: var(--text-muted);">Select one to continue</span>
      </div>
    `;

    // Bind option selections
    const optButtons = quizBody.querySelectorAll('.quiz-option-btn');
    optButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-option-idx'), 10);
        userAnswers[currentStep] = idx;
        currentStep++;
        renderQuiz();
      });
    });

    const prevBtn = quizBody.querySelector('#quiz-prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentStep--;
        renderQuiz();
      });
    }
  }

  // =========================================================================
  // 4. FAQ ACCORDION
  // =========================================================================
  function initFaq() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const btn = item.querySelector('.faq-question');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(el => {
          el.classList.remove('active');
          const b = el.querySelector('.faq-question');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isActive) {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // =========================================================================
  // 5. MOBILE STICKY BAR VISIBILITY
  // =========================================================================
  function initStickyBar() {
    const bar = document.querySelector('#sticky-bar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        bar.style.opacity = '1';
        bar.style.pointerEvents = 'auto';
      } else {
        bar.style.opacity = '0';
        bar.style.pointerEvents = 'none';
      }
    });
  }

  // =========================================================================
  // 6. VIDEO TESTIMONIAL SAFEGUARD (Hide cards with unavailable video)
  // =========================================================================
  function initVideoStoryCards() {
    const cards = document.querySelectorAll('.video-story-card');
    cards.forEach((card) => {
      const img = card.querySelector('.video-thumb-holder img');
      if (!img) return;

      const checkUnavailable = () => {
        // YouTube returns a 120x90 placeholder for 404 / unavailable videos
        if (img.naturalWidth > 0 && img.naturalWidth <= 120) {
          card.remove();
        }
      };

      if (img.complete) {
        checkUnavailable();
      } else {
        img.addEventListener('load', checkUnavailable);
        img.addEventListener('error', () => card.remove());
      }
    });
  }

  // INITIALIZATION ON DOM READY
  document.addEventListener('DOMContentLoaded', () => {
    initVslSlug();
    initFaq();
    initStickyBar();
    initVideoStoryCards();
  });

})();
