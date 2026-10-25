// Dr. Surabhi Vaidya Knee & Back Pain Clinic - Interactive Engine
(function() {
  'use strict';

  // =========================================================================
  // 1. DYNAMIC VSL SLUG & INLINE VIDEO INITIALIZER (PLAYS DIRECTLY ON PAGE)
  // =========================================================================
  function initVslSlug() {
    const urlParams = new URLSearchParams(window.location.search);
    const vslParam = urlParams.get('vsl');
    const defaultVsl = document.body.getAttribute('data-default-vsl') || 'consultation';
    const activeVsl = vslParam ? vslParam.toLowerCase() : defaultVsl;

    const vslHeader = document.querySelector('#vsl-header-text');
    const vslIframe = document.querySelector('#vsl-inline-iframe');
    const vslTitle = document.querySelector('#vsl-caption-title');
    const vslDesc = document.querySelector('#vsl-caption-desc');

    if (activeVsl === 'webinar') {
      const videoId = 's_OgsH07lCQ';
      if (vslHeader) vslHeader.textContent = 'DR. SURABHI VAIDYA · WEBINAR PRESENTATION';
      if (vslIframe) vslIframe.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
      if (vslTitle) vslTitle.innerHTML = 'Sunday Masterclass Invitation (₹201) · Joint Restoration Blueprint';
      if (vslDesc) vslDesc.innerHTML = 'Watch Dr. Surabhi Vaidya preview what will be revealed in the live interactive Webinar.gg masterclass on <strong>Sunday, 15th November 2026</strong>.';
    } else {
      const videoId = 'r9ckkmCa7Pw';
      if (vslHeader) vslHeader.textContent = 'DR. SURABHI VAIDYA · CLINICAL GUIDE';
      if (vslIframe) vslIframe.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
      if (vslTitle) vslTitle.innerHTML = 'Find Your Exact Treatment Pathway in 60 Seconds';
      if (vslDesc) vslDesc.innerHTML = 'In this clinical introduction, Dr. Surabhi Vaidya explains how our 60-second diagnostic assessment evaluates your pain severity and helps you choose between an <strong>Online Masterclass (Pathway 1)</strong> or an <strong>In-Clinic Diagnostic Consultation (Pathway 2)</strong>.';
    }
  }

  // =========================================================================
  // 2. VIDEO MODAL PLAYER (FOR TESTIMONIAL STORIES ONLY - VSL PLAYS INLINE)
  // =========================================================================
  function openVideoModal(videoId, title) {
    if (typeof window.openVideoPlayer === 'function') {
      window.openVideoPlayer(videoId, title);
      return;
    }
    const modal = document.querySelector('#video-modal') || document.querySelector('#video-player-modal');
    const iframe = document.querySelector('#modal-iframe') || document.querySelector('#video-player-iframe');
    const titleEl = document.querySelector('#modal-video-title') || document.querySelector('#video-player-title');
    if (!modal || !iframe) return;
    if (titleEl && title) titleEl.textContent = title;
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (typeof window.closeVideoPlayer === 'function') {
      window.closeVideoPlayer();
      return;
    }
    const modal = document.querySelector('#video-modal') || document.querySelector('#video-player-modal');
    const iframe = document.querySelector('#modal-iframe') || document.querySelector('#video-player-iframe');
    if (!modal || !iframe) return;
    iframe.src = '';
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  const modalCloseBtn = document.querySelector('#modal-close-btn');
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeVideoModal);
  }

  const legacyVideoModal = document.querySelector('#video-modal');
  if (legacyVideoModal) {
    legacyVideoModal.addEventListener('click', (e) => {
      if (e.target === legacyVideoModal) closeVideoModal();
    });
  }

  // Bind Testimonial cards (VSL card excluded so it plays directly inline)
  document.addEventListener('click', (e) => {
    // If clicking on an element meant for assessment or VSL card, don't trigger modal popup
    if (e.target.closest('[data-start-assessment]')) return;
    if (e.target.closest('#vsl-showcase-card') || e.target.closest('#vsl-trigger-wrap')) return;

    const card = e.target.closest('[data-video-id]');
    if (card) {
      e.preventDefault();
      const videoId = card.getAttribute('data-video-id');
      const title = card.querySelector('h3, h4, .vsl-caption-bar h3')?.textContent || 'Dr. Surabhi Vaidya · Patient Recovery Story';
      openVideoModal(videoId, title);
    }
  });

  // Keyboard accessibility for video triggers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.matches && activeEl.matches('[data-video-id]')) {
        e.preventDefault();
        const videoId = activeEl.getAttribute('data-video-id');
        const title = activeEl.querySelector('h3, h4, .vsl-caption-bar h3')?.textContent || 'Dr. Surabhi Vaidya · Clinical Guide';
        openVideoModal(videoId, title);
      }
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
    window.forcedBranch = null;
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

  window.openConsultationModal = function(options) {
    // Consultation bookings must proceed through the 60-Second Pain Assessment
    openQuiz();
  };

  window.openWebinarDirect = function() {
    currentStep = quizQuestions.length; // Jump directly to webinar recommendation (Pathway 1)
    userAnswers = [0, 0, 0, 3]; // Webinar branch
    renderQuiz();
    if (quizModal) {
      quizModal.style.display = 'flex';
      quizModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

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
      let branch = window.forcedBranch || (qReadiness === 2 || qReadiness === 3 || qPrior === 3 ? 'webinar' : 'consultation');
      if (!window.forcedBranch && (qReadiness === 2 || qReadiness === 3 || qPrior === 3)) {
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
        const feeStatus = isPaid ? 'Paid Online via PayU ✓' : 'Pay ₹1,000 at Clinic Desk';

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
                ✓ View Confirmation Pass &amp; Clinic Directions →
              </button>
              ${!isPaid ? `
              <button type="button" id="confirmed-pay-cashfree-btn" class="btn btn-secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span>💳</span> Or Pay ₹1,000 Online via PayU Now
              </button>
              ` : ''}
            </div>
          </div>
        `;

        const confUrl = `/confirmation?name=${encodeURIComponent(displayName)}&phone=${encodeURIComponent(cleanP || phoneVal)}&slot=${encodeURIComponent(displaySlot)}&paid=${isPaid ? '1' : '0'}`;

        const doneCloseBtn = quizBody.querySelector('#confirmed-done-close-btn');
        if (doneCloseBtn) {
          doneCloseBtn.addEventListener('click', function() {
            window.location.href = confUrl;
          });
        }

        // Auto-redirect to dedicated confirmation URL for Google Ads & Analytics conversion tracking
        setTimeout(function() {
          if (quizModal && quizModal.style.display !== 'none') {
            window.location.href = confUrl;
          }
        }, 1500);

        const payNowBtn = quizBody.querySelector('#confirmed-pay-cashfree-btn');
        if (payNowBtn) {
          payNowBtn.addEventListener('click', async function() {
            payNowBtn.disabled = true;
            payNowBtn.textContent = 'Opening PayU Gateway...';
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
              payNowBtn.textContent = 'Pay ₹1,000 Online via PayU';
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
            <h3 style="font-size: 1.35rem; color: var(--primary-deep); margin-bottom: 6px;">
              In-Clinic Diagnostic Consultation (₹1,000)
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px;">
              You are at a suitable stage to get an in-depth 30-minute clinical assessment with Dr. Surabhi Vaidya for your <strong>${painArea}</strong>. She will perform Ayurvedic Naadi Pariksha (pulse analysis), evaluate your MRI / X-Rays, and map your surgical prevention plan.
            </p>

            <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <span style="font-size: 0.82rem; color: var(--text-muted);">Prefer attending the live online masterclass first?</span>
              <button type="button" id="switch-to-webinar-btn" style="background: none; border: none; color: var(--primary-sage); font-weight: 700; font-size: 0.84rem; cursor: pointer; text-decoration: underline;">
                Switch to Pathway 1: Live Masterclass (₹201) →
              </button>
            </div>

            <!-- 3-Stage Progress Stepper -->
            <div class="consultation-stepper">
              <div class="stepper-step active" id="stepper-step-1">
                <div class="stepper-num">1</div>
                <span class="stepper-label">Details</span>
              </div>
              <div class="stepper-divider"></div>
              <div class="stepper-step" id="stepper-step-2">
                <div class="stepper-num">2</div>
                <span class="stepper-label">Select Slot</span>
              </div>
              <div class="stepper-divider"></div>
              <div class="stepper-step" id="stepper-step-3">
                <div class="stepper-num">3</div>
                <span class="stepper-label">Payment</span>
              </div>
            </div>

            <!-- STAGE 1: ENTER NAME & MOBILE (WITH DROP-OFF CAPTURE & CONSENT) -->
            <div id="consult-stage-1" class="consult-stage-card">
              <div style="background: var(--bg-sand); border: 1px solid var(--border-light); border-radius: 8px; padding: 12px 14px; margin-bottom: 14px;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
                  Step 1 of 3: Patient Information
                </div>
                <div style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.45;">
                  Enter the patient's contact details below to check live doctor availability and pick your slot.
                </div>
              </div>

              <form id="consult-form-stage1">
                <div class="form-field" style="margin-bottom: 10px;">
                  <label for="booking-name" style="font-size: 0.82rem; font-weight: 600; color: var(--primary-deep); margin-bottom: 4px; display: block;">
                    Full Name of Patient *
                  </label>
                  <input type="text" id="booking-name" required placeholder="e.g. Milan Dodhia" minlength="2" style="width: 100%; padding: 10px 12px; font-size: 0.9rem; border: 1.5px solid var(--border-light); border-radius: 6px;">
                </div>

                <div class="form-field" style="margin-bottom: 12px;">
                  <label for="booking-phone" style="font-size: 0.82rem; font-weight: 600; color: var(--primary-deep); margin-bottom: 4px; display: block;">
                    Mobile Phone Number (WhatsApp) *
                  </label>
                  <div style="display: flex; align-items: stretch; border: 1.5px solid var(--border-light); border-radius: 6px; overflow: hidden; background: #fff;">
                    <span style="padding: 10px 14px; background: #faf8f5; border-right: 1.5px solid var(--border-light); font-weight: 700; color: var(--primary-deep); font-size: 0.92rem; white-space: nowrap; flex-shrink: 0; display: inline-flex; align-items: center; letter-spacing: 0.5px;">+91</span>
                    <input type="tel" id="booking-phone" required placeholder="10-digit mobile number" pattern="[6-9][0-9]{9}" maxlength="10" style="width: 100%; padding: 10px 12px; font-size: 0.92rem; border: none; outline: none; background: transparent; font-family: inherit;">
                  </div>
                  <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">Appointment confirmation &amp; clinic directions will be sent here.</div>
                </div>

                <div class="form-field" style="margin-bottom: 16px;">
                  <label for="booking-email" style="font-size: 0.82rem; font-weight: 600; color: var(--primary-deep); margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>Email Address <span style="font-weight: normal; color: var(--text-muted); font-size: 0.76rem;">(Optional - for calendar invite)</span></span>
                  </label>
                  <input type="email" id="booking-email" placeholder="patient@example.com (optional)" style="width: 100%; padding: 10px 12px; font-size: 0.9rem; border: 1.5px solid var(--border-light); border-radius: 6px;">
                </div>

                <button type="submit" id="btn-to-stage-2" class="btn btn-primary btn-lg" style="width: 100%; padding: 12px; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span>📅</span> Next: Choose Appointment Slot →
                </button>

                <!-- Subtle Consent Disclaimer Below Next Button -->
                <p style="font-size: 0.74rem; color: #64748b; line-height: 1.45; text-align: center; margin-top: 10px; margin-bottom: 4px;">
                  🔒 By continuing, you agree to receive appointment updates, reminders &amp; care guidance via Call/WhatsApp from Charak Health Solutions. You can opt out anytime.
                </p>
              </form>
            </div>

            <!-- STAGE 2: DIRECT CAL.ID SCHEDULE PICKER (NO POPUP IFRAME) -->
            <div id="consult-stage-2" class="consult-stage-card" style="display: none;">
              <div style="display: flex; justify-content: space-between; align-items: center; background: #faf8f5; border: 1px solid var(--border-light); border-radius: 6px; padding: 10px 14px; margin-bottom: 12px;">
                <div style="font-size: 0.84rem; color: var(--primary-deep);">
                  <strong>Patient:</strong> <span id="summary-patient-name"></span> &bull; <strong>WhatsApp:</strong> <span id="summary-patient-phone"></span>
                </div>
                <button type="button" id="btn-back-to-stage-1" style="background: none; border: none; color: var(--primary-sage); font-size: 0.8rem; text-decoration: underline; cursor: pointer; font-weight: 600;">
                  ✏️ Edit Details
                </button>
              </div>

              <div style="background: #eef7ed; border: 1px solid #c7e8c6; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.82rem; color: #166534; font-weight: 600;">
                  📅 Step 2 of 3: Select your preferred day &amp; time slot below:
                </div>
                <span class="auto-slot-badge">● Live Cal.id Schedule</span>
              </div>

              <!-- Direct Native Scheduler Container -->
              <div id="direct-scheduler-mount">
                <div style="text-align: center; padding: 36px 12px; color: var(--text-muted); background: #ffffff; border: 1.5px solid var(--border-light); border-radius: 10px;">
                  <div style="display: inline-block; width: 26px; height: 26px; border: 3px solid #cbd5e1; border-top-color: var(--primary-deep); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                  <div style="margin-top: 10px; font-size: 0.88rem; font-weight: 600;">Fetching live appointment slots...</div>
                </div>
              </div>

              <div id="stage-2-bottom-actions" style="margin-top: 12px; background: var(--bg-sand); border: 1px solid var(--border-light); border-radius: 8px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div id="stage-2-selected-status" style="font-size: 0.84rem; color: var(--text-muted);">
                  👉 Select any open time slot above to continue
                </div>
                <button type="button" id="btn-to-stage-3" class="btn btn-primary" style="padding: 10px 18px; font-weight: 700; font-size: 0.9rem; display: none; align-items: center; gap: 6px;">
                  Next: Choose Payment Method (₹1,000) →
                </button>
              </div>
            </div>

            <!-- STAGE 3: CHOOSE PAYMENT METHOD -->
            <div id="consult-stage-3" class="consult-stage-card" style="display: none;">
              <div style="background: #faf8f5; border: 1.5px solid var(--border-light); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <div style="font-size: 0.74rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">
                  Step 3 of 3: Appointment Summary
                </div>
                <div style="display: grid; grid-template-columns: 1fr; gap: 6px; font-size: 0.86rem; color: var(--text-main);">
                  <div>👤 <strong>Patient:</strong> <span id="summary-stage3-name"></span></div>
                  <div>📱 <strong>Mobile (WhatsApp):</strong> <span id="summary-stage3-phone"></span></div>
                  <div>📅 <strong>Selected Time Slot:</strong> <span id="summary-stage3-slot" style="color: #166534; font-weight: 700;">Confirmed on Cal.id Calendar</span></div>
                  <div>🩺 <strong>Doctor:</strong> Dr. Surabhi Vaidya (Ayurvedic Naadi Pariksha &amp; Surgery Prevention)</div>
                  <div>📍 <strong>Clinic Address:</strong> Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Vartak Nagar, Thane West</div>
                  <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed var(--border-light); display: flex; justify-content: space-between; align-items: baseline;">
                    <span style="font-size: 0.9rem; color: var(--primary-deep); font-weight: 600;">Total Consultation Fee:</span>
                    <strong style="font-size: 1.3rem; color: var(--primary-deep);">₹1,000</strong>
                  </div>
                </div>
              </div>

              <h4 style="font-size: 0.98rem; color: var(--primary-deep); margin-bottom: 12px; font-weight: 700;">
                Select Payment Method to Finalize Your Booking:
              </h4>

              <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                <!-- Option A: Pay Online via PayU -->
                <div style="border: 2px solid var(--primary-sage); border-radius: 8px; padding: 14px 16px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-weight: 700; color: var(--primary-deep); font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                      <span>💳</span> Pay ₹1,000 Online via PayU
                    </span>
                    <span style="background: #dcfce7; color: #166534; font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">
                      Instant Digital Pass
                    </span>
                  </div>
                  <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0 0 10px 0; line-height: 1.4;">
                    Instant confirmation via UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, or Netbanking.
                  </p>
                  <button type="button" id="stage3-pay-cashfree-btn" class="btn btn-primary" style="width: 100%; padding: 10px; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span>💳</span> Pay ₹1,000 Online via PayU →
                  </button>
                </div>

                <!-- Option B: Pay at Clinic Desk -->
                <div style="border: 1.5px solid var(--border-light); border-radius: 8px; padding: 14px 16px; background: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-weight: 700; color: var(--primary-deep); font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                      <span>🏥</span> Pay ₹1,000 at Clinic Desk
                    </span>
                    <span style="background: #f1f5f9; color: #475569; font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; font-weight: 600;">
                      Pay on Appointment Day
                    </span>
                  </div>
                  <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0 0 10px 0; line-height: 1.4;">
                    Lock in your reserved time slot now. Pay ₹1,000 at clinic reception on arrival via Cash, UPI, or Card.
                  </p>
                  <button type="button" id="stage3-pay-clinic-btn" class="btn btn-secondary" style="width: 100%; padding: 10px; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span>✅</span> Confirm Slot &amp; Pay at Clinic Desk →
                  </button>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <button type="button" id="btn-back-to-stage-2" class="quiz-back-btn" style="padding: 6px 14px; font-size: 0.82rem;">
                  ← Back to Calendar
                </button>
                <span style="font-size: 0.74rem; color: var(--text-muted);">Clinic Desk: kneeandbackpainclinic@gmail.com</span>
              </div>
            </div>

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

            <div style="background: var(--bg-sand); padding: 12px 14px; border-radius: 6px; font-size: 0.82rem; color: var(--primary-deep); margin-bottom: 12px;">
              <div>📅 <strong>Next Live Masterclass:</strong> Sunday, 15th November 2026 (11:00 AM IST)</div>
              <div style="margin-top: 4px;"><strong>Includes:</strong> 90-Min Live Interactive Webinar.gg Session + Live Doctor Q&amp;A + Anti-Inflammatory Ayurvedic Diet Guide.</div>
            </div>

            <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <span style="font-size: 0.82rem; color: var(--text-muted);">Want an in-person clinical checkup in Thane instead?</span>
              <button type="button" id="switch-to-consult-btn" style="background: none; border: none; color: #92400e; font-weight: 700; font-size: 0.84rem; cursor: pointer; text-decoration: underline;">
                Switch to Pathway 2: Diagnostic Consultation (₹1,000) →
              </button>
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
        const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
        const lead = {
          id: 'LEAD-' + Math.floor(100 + Math.random() * 900),
          name: name || 'Patient',
          phone: cleanPhone || phone || '',
          city: 'Thane / Mumbai',
          painArea: painArea,
          severity: quizQuestions[1].options[userAnswers[1]] || '',
          priorTreatments: quizQuestions[2].options[userAnswers[2]] || '',
          readiness: quizQuestions[3].options[userAnswers[3]] || '',
          recommendedStep: branch === 'webinar' ? '₹201 Live Hindi Masterclass' : '₹1,000 Diagnostic Consultation',
          slotPreference: slotInfo || 'Earliest Available (Cal.id)',
          status: slotInfo ? (slotInfo.includes('Pending') ? 'Stage 1 Completed - Pending Slot' : 'Consultation Scheduled') : 'New Lead',
          paymentStatus: paymentStatus || 'Unpaid',
          consent: 'Consent provided for Call & WhatsApp messaging',
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

      // If Consultation branch: Sequential 3-Stage Booking Flow
      if (branch === 'consultation') {
        const consultState = {
          stage: 1,
          name: '',
          phone: '',
          email: '',
          slotStart: '',
          slotEnd: '',
          slotTime: '',
          eventTypeId: null,
          leadId: ''
        };

        function setStage(stageNum) {
          consultState.stage = stageNum;

          // 1. Update Stepper Pills
          for (let i = 1; i <= 3; i++) {
            const pill = quizBody.querySelector('#stepper-step-' + i);
            if (!pill) continue;
            pill.classList.remove('active', 'completed');
            const numEl = pill.querySelector('.stepper-num');
            if (i < stageNum) {
              pill.classList.add('completed');
              if (numEl) numEl.textContent = '✓';
            } else if (i === stageNum) {
              pill.classList.add('active');
              if (numEl) numEl.textContent = i;
            } else {
              if (numEl) numEl.textContent = i;
            }
          }

          // 2. Toggle Stage Cards
          const card1 = quizBody.querySelector('#consult-stage-1');
          const card2 = quizBody.querySelector('#consult-stage-2');
          const card3 = quizBody.querySelector('#consult-stage-3');
          if (card1) card1.style.display = (stageNum === 1) ? 'block' : 'none';
          if (card2) card2.style.display = (stageNum === 2) ? 'block' : 'none';
          if (card3) card3.style.display = (stageNum === 3) ? 'block' : 'none';

          // 3. Stage-Specific Setups
          if (stageNum === 2) {
            const nameEl = quizBody.querySelector('#summary-patient-name');
            const phoneEl = quizBody.querySelector('#summary-patient-phone');
            if (nameEl) nameEl.textContent = consultState.name;
            if (phoneEl) phoneEl.textContent = '+91 ' + consultState.phone;

            initDirectScheduler();
          }

          if (stageNum === 3) {
            const s3Name = quizBody.querySelector('#summary-stage3-name');
            const s3Phone = quizBody.querySelector('#summary-stage3-phone');
            const s3Slot = quizBody.querySelector('#summary-stage3-slot');
            if (s3Name) s3Name.textContent = consultState.name;
            if (s3Phone) s3Phone.textContent = '+91 ' + consultState.phone;
            if (s3Slot) s3Slot.textContent = consultState.slotTime || 'Earliest Available Schedule';
          }
        }

        // DIRECT CAL.ID SCHEDULER: Fetches available slots & allows 1-click selection without popup
        function initDirectScheduler() {
          const mount = quizBody.querySelector('#direct-scheduler-mount');
          if (!mount) return;

          mount.innerHTML = `
            <div style="text-align: center; padding: 36px 12px; color: var(--text-muted); background: #ffffff; border: 1.5px solid var(--border-light); border-radius: 10px;">
              <div style="display: inline-block; width: 26px; height: 26px; border: 3px solid #cbd5e1; border-top-color: var(--primary-deep); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
              <div style="margin-top: 10px; font-size: 0.88rem; font-weight: 600;">Fetching live appointment slots...</div>
            </div>
          `;

          fetch('/api/cal-direct?action=slots&days=7')
            .then(res => res.json())
            .then(data => {
              const days = (data && data.days) ? data.days : [];
              if (!days.length) {
                mount.innerHTML = '<div style="padding: 20px; text-align: center; color: #b91c1c;">Unable to load schedule. Please try again.</div>';
                return;
              }

              if (data.eventTypeId) {
                consultState.eventTypeId = data.eventTypeId;
              }

              let activeDayIdx = days.findIndex(d => d.slots && d.slots.length > 0);
              if (activeDayIdx < 0) activeDayIdx = 0;

              function renderScheduleUI() {
                const activeDay = days[activeDayIdx] || days[0];

                let daysHtml = days.map((d, idx) => {
                  const isActive = (idx === activeDayIdx);
                  const isOff = (!d.slots || d.slots.length === 0);
                  return `
                    <button type="button" class="scheduler-day-tab ${isActive ? 'active' : ''} ${isOff ? 'disabled' : ''}" data-day-idx="${idx}">
                      <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase;">${d.weekdayName}</span>
                      <span style="font-size: 1.25rem; font-weight: 800; line-height: 1;">${d.dayNum}</span>
                      <span style="font-size: 0.7rem;">${d.monthName}</span>
                    </button>
                  `;
                }).join('');

                const morningSlots = (activeDay.slots || []).filter(s => s.period === 'morning');
                const eveningSlots = (activeDay.slots || []).filter(s => s.period === 'evening');

                const renderSlotBtns = (slots) => {
                  if (!slots.length) {
                    return '<div style="font-size: 0.8rem; color: #94a3b8; font-style: italic; padding: 4px 0;">No slots open in this session</div>';
                  }
                  return slots.map(s => {
                    const isChosen = (consultState.slotStart === s.startIso);
                    return `
                      <button type="button" class="scheduler-slot-btn ${isChosen ? 'selected' : ''}"
                        data-start="${s.startIso}"
                        data-end="${s.endIso}"
                        data-time="${s.time}">
                        ${isChosen ? '✓ ' : ''}${s.time}
                      </button>
                    `;
                  }).join('');
                };

                mount.innerHTML = `
                  <div class="direct-scheduler-wrap">
                    <div style="font-size: 0.76rem; font-weight: 700; color: var(--primary-deep); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                      1. Select Date:
                    </div>
                    <div id="scheduler-days-strip" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 14px; -webkit-overflow-scrolling: touch;">
                      ${daysHtml}
                    </div>

                    <div style="font-size: 0.76rem; font-weight: 700; color: var(--primary-deep); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                      <span>2. Select Time (${activeDay.displayDate}):</span>
                      <span style="font-size: 0.74rem; color: #166534; font-weight: 600;">30-Min Consultation</span>
                    </div>

                    <div style="margin-bottom: 12px;">
                      <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                        <span>🌅</span> Morning Sessions (10:00 AM – 01:00 PM)
                      </div>
                      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: 8px;">
                        ${renderSlotBtns(morningSlots)}
                      </div>
                    </div>

                    <div>
                      <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                        <span>🌇</span> Evening Sessions (04:00 PM – 07:30 PM)
                      </div>
                      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: 8px;">
                        ${renderSlotBtns(eveningSlots)}
                      </div>
                    </div>
                  </div>
                `;

                // Day tab switches
                const dayTabs = mount.querySelectorAll('.scheduler-day-tab');
                dayTabs.forEach(tab => {
                  tab.addEventListener('click', function() {
                    const idx = parseInt(tab.getAttribute('data-day-idx'), 10);
                    if (!isNaN(idx) && days[idx] && days[idx].slots && days[idx].slots.length > 0) {
                      activeDayIdx = idx;
                      renderScheduleUI();
                    }
                  });
                });

                // Slot click: 1-click selection with zero popups
                const slotBtns = mount.querySelectorAll('.scheduler-slot-btn');
                slotBtns.forEach(btn => {
                  btn.addEventListener('click', function() {
                    slotBtns.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');

                    const sStart = btn.getAttribute('data-start');
                    const sEnd = btn.getAttribute('data-end');
                    const sTime = btn.getAttribute('data-time');

                    consultState.slotStart = sStart;
                    consultState.slotEnd = sEnd;
                    consultState.slotTime = `${activeDay.displayDate} at ${sTime}`;

                    const statusEl = quizBody.querySelector('#stage-2-selected-status');
                    const toStage3Btn = quizBody.querySelector('#btn-to-stage-3');
                    if (statusEl) {
                      statusEl.innerHTML = `<strong>Selected Slot:</strong> <span style="color: #166534; font-weight: 700;">${consultState.slotTime}</span>`;
                    }
                    if (toStage3Btn) {
                      toStage3Btn.style.display = 'inline-flex';
                    }

                    saveConsultationLead(
                      consultState.name,
                      consultState.phone,
                      consultState.slotTime,
                      'Slot Chosen - Pending Payment Method'
                    );

                    // Seamless transition to Stage 3 (no friction, no popup!)
                    setTimeout(() => {
                      setStage(3);
                    }, 350);
                  });
                });
              }

              renderScheduleUI();
            })
            .catch(err => {
              console.warn('Direct schedule fetch error:', err);
              mount.innerHTML = '<div style="padding: 16px; text-align: center; color: #b91c1c;">Unable to load slots. Please check internet connection or call clinic desk directly.</div>';
            });
        }

        // Switch to Webinar Pathway Button
        const switchWebinarBtn = quizBody.querySelector('#switch-to-webinar-btn');
        if (switchWebinarBtn) {
          switchWebinarBtn.addEventListener('click', function() {
            window.forcedBranch = 'webinar';
            userAnswers[3] = 3; // Switch to webinar branch
            renderQuiz();
          });
        }

        // STAGE 1: Form Submit & Immediate Drop-off Lead Capture with Consent
        const formStage1 = quizBody.querySelector('#consult-form-stage1');
        if (formStage1) {
          formStage1.addEventListener('submit', function(e) {
            e.preventDefault();
            const nameInput = formStage1.querySelector('#booking-name');
            const phoneInput = formStage1.querySelector('#booking-phone');
            const emailInput = formStage1.querySelector('#booking-email');

            const nameVal = nameInput ? nameInput.value.trim() : '';
            const phoneVal = phoneInput ? phoneInput.value.trim().replace(/[^0-9]/g, '').slice(-10) : '';
            const emailVal = emailInput ? emailInput.value.trim() : '';

            if (!nameVal || nameVal.length < 2) {
              if (nameInput) nameInput.focus();
              alert('Please enter patient full name.');
              return;
            }
            if (!phoneVal || phoneVal.length !== 10) {
              if (phoneInput) phoneInput.focus();
              alert('Please enter a valid 10-digit mobile number.');
              return;
            }

            consultState.name = nameVal;
            consultState.phone = phoneVal;
            consultState.email = emailVal || `${phoneVal}@patient.charakhealth.com`;

            // IMMEDIATE DROP-OFF CAPTURE (Patient consent recorded below next button)
            const saved = saveConsultationLead(
              consultState.name,
              consultState.phone,
              'Stage 1 Completed - Pending Slot Selection',
              'Unpaid (Drop-off Lead)'
            );
            if (saved && saved.id) {
              consultState.leadId = saved.id;
            }

            setStage(2);
          });
        }

        // Also capture on phone blur if user types 10 digits in Stage 1
        const phoneField = quizBody.querySelector('#booking-phone');
        const nameField = quizBody.querySelector('#booking-name');
        function autoCaptureDraft() {
          const n = nameField ? nameField.value.trim() : '';
          const p = phoneField ? phoneField.value.trim().replace(/[^0-9]/g, '').slice(-10) : '';
          if (p.length === 10) {
            saveConsultationLead(n, p, 'Stage 1 Typing - Pending Slot', 'Unpaid (Draft Lead)');
          }
        }


        // STAGE 2: Return to Stage 1 (Edit Details)
        const btnBackTo1 = quizBody.querySelector('#btn-back-to-stage-1');
        if (btnBackTo1) {
          btnBackTo1.addEventListener('click', function() {
            setStage(1);
          });
        }

        // STAGE 2: Advance to Stage 3 Button
        const btnToStage3 = quizBody.querySelector('#btn-to-stage-3');
        if (btnToStage3) {
          btnToStage3.addEventListener('click', function() {
            if (!consultState.slotTime) {
              consultState.slotTime = 'Earliest Available Schedule';
            }
            saveConsultationLead(
              consultState.name,
              consultState.phone,
              consultState.slotTime,
              'Slot Chosen - Pending Payment Method'
            );
            setStage(3);
          });
        }

        // STAGE 3: Return to Stage 2 (Change Slot)
        const btnBackTo2 = quizBody.querySelector('#btn-back-to-stage-2');
        if (btnBackTo2) {
          btnBackTo2.addEventListener('click', function() {
            setStage(2);
          });
        }

        // STAGE 3: Option A - Pay Online via PayU (Opens in popup window, confirms ONLY after verified payment)
        const payCashfreeBtn = quizBody.querySelector('#stage3-pay-cashfree-btn');
        if (payCashfreeBtn) {
          payCashfreeBtn.addEventListener('click', async function() {
            payCashfreeBtn.disabled = true;
            payCashfreeBtn.innerHTML = '<span>⏳</span> Opening Secure PayU Checkout...';

            // Sync pending slot reservation to Cal direct (paymentMethod payu_online suppresses premature WhatsApp)
            fetch('/api/cal-direct', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: consultState.name,
                phone: consultState.phone,
                email: consultState.email,
                slotStart: consultState.slotStart,
                slotEnd: consultState.slotEnd,
                slotDisplay: consultState.slotTime,
                eventTypeId: consultState.eventTypeId,
                paymentStatus: 'Pending Online Payment (PayU)',
                paymentMethod: 'payu_online',
                painArea: painArea
              })
            }).catch(e => console.warn('Cal Direct PG booking sync:', e));

            try {
              if (window.triggerPayUCheckout) {
                await window.triggerPayUCheckout({
                  amount: 1000,
                  name: consultState.name || 'Patient',
                  phone: consultState.phone,
                  email: consultState.email,
                  planType: '₹1,000 Diagnostic Consultation (30-Min)',
                  leadId: consultState.leadId || `LEAD-${Date.now()}`,
                  onSuccess: function(result) {
                    saveConsultationLead(consultState.name, consultState.phone, consultState.slotTime, 'Paid Online via PayU');
                    renderConsultationSuccess(consultState.name, consultState.phone, consultState.slotTime, true);
                  },
                  onDismiss: function() {
                    payCashfreeBtn.disabled = false;
                    payCashfreeBtn.innerHTML = '<span>💳</span> Pay ₹1,000 Online via PayU →';
                  }
                });
              }
            } catch (err) {
              console.warn('Consultation PG checkout error:', err);
              payCashfreeBtn.disabled = false;
              payCashfreeBtn.innerHTML = '<span>💳</span> Pay ₹1,000 Online via PayU →';
            }
          });
        }

        // STAGE 3: Option B - Pay at Clinic Desk
        const payClinicBtn = quizBody.querySelector('#stage3-pay-clinic-btn');
        if (payClinicBtn) {
          payClinicBtn.addEventListener('click', async function() {
            payClinicBtn.disabled = true;
            payClinicBtn.textContent = 'Confirming Appointment...';

            try {
              const directResp = await fetch('/api/cal-direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: consultState.name,
                  phone: consultState.phone,
                  email: consultState.email,
                  slotStart: consultState.slotStart,
                  slotEnd: consultState.slotEnd,
                  slotDisplay: consultState.slotTime,
                  eventTypeId: consultState.eventTypeId,
                  paymentStatus: 'Pay at Clinic Reception',
                  paymentMethod: 'pay_at_clinic',
                  painArea: painArea
                })
              });
              const directData = await directResp.json();
              if (directData && directData.whatsappSent) {
                try {
                  const waLogs = JSON.parse(localStorage.getItem('dr_surabhi_wa_logs')) || [];
                  waLogs.unshift({
                    id: 'LOG-' + Date.now(),
                    time: new Date().toISOString(),
                    name: consultState.name,
                    phone: consultState.phone,
                    template: 'consultation_booking_confirmation_v1',
                    status: 'delivered'
                  });
                  localStorage.setItem('dr_surabhi_wa_logs', JSON.stringify(waLogs.slice(0, 100)));
                } catch (e) {}
              }
            } catch (e) {
              console.warn('Cal Direct Booking API call:', e);
            }

            saveConsultationLead(consultState.name, consultState.phone, consultState.slotTime, 'Pay at Clinic Desk');
            renderConsultationSuccess(consultState.name, consultState.phone, consultState.slotTime, false);
          });
        }
      }

      // Switch to Consultation Pathway Button
      const switchConsultBtn = quizBody.querySelector('#switch-to-consult-btn');
      if (switchConsultBtn) {
        switchConsultBtn.addEventListener('click', function() {
          window.forcedBranch = 'consultation';
          userAnswers = [0, 0, 0, 0]; // Switch to consultation branch
          renderQuiz();
        });
      }

      // Wire submit form for Webinar branch
      const form = quizBody.querySelector('#quiz-booking-form');
      if (form && branch === 'webinar') {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const nameInput = form.querySelector('#booking-name');
          const phoneInput = form.querySelector('#booking-phone');
          const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Patient';
          const phone = phoneInput ? phoneInput.value.trim() : '';

          // Webinar registration handling
          const newLead = saveConsultationLead(name, phone, 'Webinar Registered', 'Unpaid');
            quizBody.innerHTML = `
              <div style="text-align: center; padding: 16px 8px;">
                <div style="font-size: 2.8rem; margin-bottom: 8px;">🎥</div>
                <h3 style="font-size: 1.35rem; color: var(--primary-deep); margin-bottom: 6px;">
                  Confirm Your Masterclass Seat (₹201)
                </h3>
                <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px;">
                  Thank you, <strong>${name}</strong>. Secure your seat via PayU Payment Gateway to get your direct <strong>Webinar.gg</strong> joining pass.
                </p>
                <div style="background: var(--bg-sand); padding: 14px; border-radius: 8px; margin-bottom: 16px; text-align: left;">
                  <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--primary-deep); margin-bottom: 4px;">
                    <span>90-Min Live Masterclass (Sunday, 15th Nov, 11:00 AM)</span>
                    <span>₹201</span>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">Includes Live Q&amp;A + Anti-Inflammatory Ayurvedic Nutrition Protocol</div>
                </div>

                <button type="button" id="pay-cashfree-webinar-btn" class="btn btn-deep btn-lg" style="width: 100%; margin-bottom: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span>💳</span> Pay ₹201 via PayU (UPI / Cards) ↗
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
                payBtn.innerHTML = '<span>⏳</span> Opening Secure PayU Checkout...';
                try {
                  if (window.triggerPayUCheckout) {
                    await window.triggerPayUCheckout({
                      amount: 201,
                      name: name,
                      phone: phone,
                      planType: '₹201 Live Masterclass',
                      leadId: newLead.id,
                      onSuccess: async function(result) {
                        // Generate Webinar.gg token & display room access ONLY after verified payment
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
                      },
                      onDismiss: function() {
                        payBtn.disabled = false;
                        payBtn.innerHTML = '<span>💳</span> Pay ₹201 Online via PayU →';
                      }
                    });
                  }
                } catch (e) {
                  console.warn('Checkout note:', e.message);
                  payBtn.disabled = false;
                  payBtn.innerHTML = '<span>💳</span> Pay ₹201 Online via PayU →';
                }
              });
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
