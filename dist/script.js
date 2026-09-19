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
      if (vslDesc) vslDesc.innerHTML = 'Watch Dr. Surabhi Vaidya preview what will be revealed in the 90-minute live interactive Zoom masterclass.';
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
    renderQuiz();
    if (quizModal) {
      quizModal.style.display = 'flex';
      quizModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeQuiz() {
    if (quizModal) {
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

    // RESULT STEP: STRICTLY ONLY ONE OPTION WITH FLOW DIAGRAM
    if (currentStep >= total) {
      quizProgress.style.width = '100%';
      const painArea = quizQuestions[0].options[userAnswers[0]] || 'Knee & Back Pain';
      const qSeverity = userAnswers[1];
      const qPrior = userAnswers[2];
      const qReadiness = userAnswers[3];

      let branch = 'consultation';

      // RULE 1: Severe distress, surgery advised, or ready to begin -> Recommend ONLY ₹4,000 Trial
      if (qReadiness === 0 || qSeverity === 0 || qPrior === 0) {
        branch = 'trial';
      }
      // RULE 2: Hesitant, skeptical, just exploring -> Recommend ONLY ₹201 Webinar Masterclass
      else if (qReadiness === 2 || qReadiness === 3 || qPrior === 3) {
        branch = 'webinar';
      }
      // RULE 3: Fairly ready, moderate/advanced stage -> Recommend ONLY ₹1,000 Consultation
      else {
        branch = 'consultation';
      }

      let resultHtml = '';

      // BRANCH 1: ONLY ₹4,000 1-DAY EXPERIENCE SESSION
      if (branch === 'trial') {
        resultHtml = `
          <div class="quiz-result-single" style="border-color: var(--accent-terracotta);">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-terracotta); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
              SINGLE RECOMMENDED NEXT STEP
            </div>
            <h3 style="font-size: 1.35rem; color: var(--primary-deep); margin-bottom: 8px;">
              Direct 1-Day Experience Session (₹4,000)
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; margin-bottom: 12px;">
              Based on your reported pain severity for <strong>${painArea}</strong>, an initial consultation alone may delay needed relief. We strongly recommend experiencing our <strong>1-Day Intensive Session (7 comprehensive treatments)</strong> to achieve 20% to 30% measurable pain relief on Day 1.
            </p>

            <div class="quiz-flow-indicator">
              <div class="flow-node">1. Assessment ✓</div>
              <div class="flow-node active-node">2. ★ 1-Day Trial (₹4k)</div>
              <div class="flow-node">3. Long-Term Recovery</div>
            </div>

            <div style="background: var(--bg-sand); padding: 12px 14px; border-radius: 6px; font-size: 0.82rem; color: var(--primary-deep); margin-bottom: 16px;">
              <strong>What is included:</strong> Full doctor diagnosis + Janu/Kati Basti + Marma stimulation + Pottali Sekam + Medicated Herbal Steam.
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
                <label for="booking-time">Preferred Session Slot *</label>
                <select id="booking-time" required>
                  <option value="Tomorrow Morning (9:30 AM)">Tomorrow Morning (9:30 AM)</option>
                  <option value="Tomorrow Afternoon (2:30 PM)">Tomorrow Afternoon (2:30 PM)</option>
                  <option value="This Weekend (Saturday)">This Weekend (Saturday)</option>
                  <option value="This Weekend (Sunday)">This Weekend (Sunday)</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 10px;">
                Confirm Trial Request (₹4,000) ↗
              </button>
            </form>
          </div>
        `;
      }
      // BRANCH 2: ONLY ₹1,000 DIAGNOSTIC CONSULTATION
      else if (branch === 'consultation') {
        resultHtml = `
          <div class="quiz-result-single" style="border-color: var(--accent-gold);">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
              SINGLE RECOMMENDED NEXT STEP
            </div>
            <h3 style="font-size: 1.35rem; color: var(--primary-deep); margin-bottom: 8px;">
              In-Clinic Diagnostic Consultation (₹1,000)
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; margin-bottom: 12px;">
              You are at a suitable stage to get an in-depth 45-minute clinical assessment with Dr. Surabhi Vaidya for your <strong>${painArea}</strong>. She will perform Ayurvedic Naadi Pariksha (pulse analysis), evaluate your MRI / X-Rays, and map your surgical prevention plan.
            </p>

            <div class="quiz-flow-indicator">
              <div class="flow-node">1. Assessment ✓</div>
              <div class="flow-node active-node">2. ★ Diagnosis (₹1,000)</div>
              <div class="flow-node">3. Targeted Protocol</div>
            </div>

            <div style="background: var(--bg-sand); padding: 12px 14px; border-radius: 6px; font-size: 0.82rem; color: var(--primary-deep); margin-bottom: 16px;">
              <strong>Clinic Location:</strong> Shop No 5, Panchsheel Shopping Centre, Gladys Alwares Road, Thane West.
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
                <label for="booking-time">Preferred Appointment Day *</label>
                <select id="booking-time" required>
                  <option value="Earliest Available Slot">Earliest Available Slot</option>
                  <option value="Tomorrow (Weekday)">Tomorrow (Weekday)</option>
                  <option value="This Saturday">This Saturday</option>
                  <option value="This Sunday">This Sunday</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 10px;">
                Schedule Consultation (₹1,000) ↗
              </button>
            </form>
          </div>
        `;
      }
      // BRANCH 3: ONLY LIVE HINDI WEBINAR MASTERCLASS (₹201)
      else {
        resultHtml = `
          <div class="quiz-result-single" style="border-color: var(--primary-sage);">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary-sage); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
              SINGLE RECOMMENDED NEXT STEP
            </div>
            <h3 style="font-size: 1.35rem; color: var(--primary-deep); margin-bottom: 8px;">
              Attend Live Hindi Masterclass on Zoom (₹201)
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; margin-bottom: 12px;">
              Since you are currently exploring or looking to understand how Ayurveda compares with surgery for <strong>${painArea}</strong>, we recommend starting with our 90-minute live online session with Dr. Surabhi Vaidya. Learn root-cause analysis and discover practical ways to protect your joints without visiting the clinic yet.
            </p>

            <div class="quiz-flow-indicator">
              <div class="flow-node">1. Assessment ✓</div>
              <div class="flow-node active-node">2. ★ Live Masterclass (₹201)</div>
              <div class="flow-node">3. In-Clinic Care</div>
            </div>

            <div style="background: var(--bg-sand); padding: 12px 14px; border-radius: 6px; font-size: 0.82rem; color: var(--primary-deep); margin-bottom: 16px;">
              <strong>Includes:</strong> 90-Min Live Interactive Zoom Session + Live Doctor Q&A + Anti-Inflammatory Ayurvedic Diet Guide.
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

      // Wire submit form & save lead to CRM
      const form = quizBody.querySelector('#quiz-booking-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const nameInput = form.querySelector('#booking-name');
          const phoneInput = form.querySelector('#booking-phone');
          const slotInput = form.querySelector('#booking-time');
          const cityInput = form.querySelector('#booking-city');
          const name = nameInput ? nameInput.value.trim() : 'Patient';
          const phone = phoneInput ? phoneInput.value.trim() : '';
          const slot = slotInput ? slotInput.value : (cityInput ? cityInput.value : 'Immediate Intake');

          // Save into CRM Leads
          try {
            const existing = JSON.parse(localStorage.getItem('dr_surabhi_leads')) || [];
            const newLead = {
              id: 'LEAD-' + Math.floor(100 + Math.random() * 900),
              name: name,
              phone: phone,
              city: cityInput ? cityInput.value : 'Thane / Mumbai',
              painArea: painArea,
              severity: quizQuestions[1].options[userAnswers[1]] || '',
              priorTreatments: quizQuestions[2].options[userAnswers[2]] || '',
              readiness: quizQuestions[3].options[userAnswers[3]] || '',
              recommendedStep: branch === 'trial' ? '₹4,000 1-Day Experience Session' : (branch === 'consultation' ? '₹1,000 Diagnostic Consultation' : '₹201 Live Hindi Masterclass'),
              slotPreference: slot,
              status: 'New Lead',
              createdAt: new Date().toISOString()
            };
            existing.unshift(newLead);
            localStorage.setItem('dr_surabhi_leads', JSON.stringify(existing));
          } catch (err) {
            console.error('Lead sync err:', err);
          }

          quizBody.innerHTML = `
            <div style="text-align: center; padding: 24px 10px;">
              <div style="font-size: 3rem; margin-bottom: 12px;">✅</div>
              <h3 style="font-size: 1.4rem; color: var(--primary-deep); margin-bottom: 8px;">
                Request Confirmed!
              </h3>
              <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px;">
                Thank you, <strong>${name}</strong>. Our clinical coordinator will call you at <strong>${phone}</strong> within 15 minutes to confirm your scheduled slot and provide intake instructions.
              </p>
              <div style="background: var(--bg-sand); padding: 14px; border-radius: 8px; font-size: 0.85rem; color: var(--primary-deep);">
                <strong>Clinic Desk:</strong> Shop No 5, Panchsheel Shopping Centre, Gladys Alwares Road, Thane West · Tel: +91 81085 00200
              </div>
              <button type="button" class="btn btn-secondary" style="margin-top: 20px;" onclick="document.querySelector('#quiz-modal').style.display='none'; document.body.style.overflow='';">
                Done &amp; Return
              </button>
            </div>
          `;
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

  // INITIALIZATION ON DOM READY
  document.addEventListener('DOMContentLoaded', () => {
    initVslSlug();
    initFaq();
    initStickyBar();
  });

})();
