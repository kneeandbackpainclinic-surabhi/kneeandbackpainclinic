// Dr. Surabhi Vaidya Knee & Back Pain Clinic - Interactive Engine
(function() {
  'use strict';

  const links = window.BOOKING_LINKS || {};

  // =========================================================================
  // 1. LIVE COUNTDOWN TIMER (TOP ANNOUNCEMENT BAR)
  // =========================================================================
  function initCountdown() {
    const timerEl = document.querySelector('#countdown-display');
    if (!timerEl) return;

    let target = links.webinarStartIso ? new Date(links.webinarStartIso) : null;
    if (!target || isNaN(target.getTime()) || target < new Date()) {
      target = new Date();
      target.setDate(target.getDate() + ((7 - target.getDay() + 7) % 7 || 7));
      target.setHours(11, 30, 0, 0);
    }

    function updateTimer() {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        timerEl.textContent = "Registration open for upcoming batch";
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        timerEl.textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
      } else {
        timerEl.textContent = `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
      }
    }

    updateTimer();
    setInterval(updateTimer, 1000);

    const closeBtn = document.querySelector('.announcement-close');
    const bar = document.querySelector('.top-announcement');
    if (closeBtn && bar) {
      closeBtn.addEventListener('click', () => {
        bar.style.display = 'none';
      });
    }
  }

  // =========================================================================
  // 2. QUESTIONNAIRE WITH STRICT SINGLE-OPTION RECOMMENDATION ENGINE & CRM SYNC
  // =========================================================================
  const quizDialog = document.querySelector('#quiz-modal');
  const quizBody = document.querySelector('#quiz-body');
  const quizProgress = document.querySelector('#quiz-progress-fill');

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
    if (quizDialog) {
      quizDialog.showModal();
      document.body.style.overflow = 'hidden';
    }
  }

  function closeQuiz() {
    if (quizDialog) {
      quizDialog.close();
      document.body.style.overflow = '';
    }
  }

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

      if (qReadiness === 0 || qSeverity === 0 || qPrior === 0) {
        branch = 'trial';
      } else if (qReadiness === 2 || qReadiness === 3) {
        branch = 'webinar';
      } else {
        branch = 'consultation';
      }

      let resultHtml = '';

      // BRANCH 1: ONLY RS 4,000 1-DAY TRIAL SESSION
      if (branch === 'trial') {
        resultHtml = `
          <div class="quiz-result-single">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-terracotta); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
              SINGLE RECOMMENDED NEXT STEP
            </div>
            <h3 style="font-size: 1.3rem; color: var(--primary-deep); margin-bottom: 8px;">
              1-Day Comprehensive Experience Session (₹4,000)
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; margin-bottom: 12px;">
              Because you are experiencing severe distress or ready to prevent surgery for <strong>${painArea}</strong>, a standard talk is not enough. You need immediate physical decompression. In this single-day session, you receive 7 targeted therapies and can expect <strong>20% to 30% pain relief on Day 1</strong>.
            </p>

            <div class="quiz-flow-indicator">
              <div class="flow-node">1. Assessment ✓</div>
              <div class="flow-node active-node">2. ★ 1-Day Experience Session (₹4,000)</div>
              <div class="flow-node">3. Recovery Protocol</div>
            </div>

            <div style="background: var(--bg-sand); padding: 12px 14px; border-radius: 6px; font-size: 0.82rem; color: var(--primary-deep); margin-bottom: 16px;">
              <strong>What is included:</strong> Full doctor consultation + Naadi Pariksha + Marma point alignment + Pottali Sekam + Medicated steam + Herbal Lepam + Diet plan.
            </div>

            <form id="quiz-booking-form">
              <div class="form-field">
                <label for="booking-name">Patient Full Name *</label>
                <input type="text" id="booking-name" required placeholder="Enter full name" minlength="2">
              </div>
              <div class="form-field">
                <label for="booking-phone">Mobile Phone Number *</label>
                <input type="tel" id="booking-phone" required placeholder="10-digit mobile number" pattern="[6-9][0-9]{9}" maxlength="10">
              </div>
              <div class="form-field">
                <label for="booking-time">Preferred Day / Slot *</label>
                <select id="booking-time" required>
                  <option value="">Select preferred day</option>
                  <option value="Tomorrow Morning (10:00 AM - 1:00 PM)">Tomorrow Morning (10:00 AM - 1:00 PM)</option>
                  <option value="Tomorrow Afternoon (3:00 PM - 7:00 PM)">Tomorrow Afternoon (3:00 PM - 7:00 PM)</option>
                  <option value="This Weekend (Saturday / Sunday)">This Weekend (Saturday / Sunday)</option>
                  <option value="Next Week">Next Week</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 10px;">
                Request ₹4,000 Experience Session Booking ↗
              </button>
            </form>
          </div>
        `;
      }
      // BRANCH 2: ONLY RS 1,000 DIAGNOSTIC CONSULTATION
      else if (branch === 'consultation') {
        resultHtml = `
          <div class="quiz-result-single">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
              SINGLE RECOMMENDED NEXT STEP
            </div>
            <h3 style="font-size: 1.3rem; color: var(--primary-deep); margin-bottom: 8px;">
              In-Clinic Diagnostic Consultation (₹1,000)
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; margin-bottom: 12px;">
              Based on your condition stage for <strong>${painArea}</strong>, your most effective starting point is an in-depth 45-minute clinical consultation with Dr. Surabhi Vaidya to analyze your posture, pulse (Naadi Pariksha), and exact root causes before selecting treatments.
            </p>

            <div class="quiz-flow-indicator">
              <div class="flow-node">1. Assessment ✓</div>
              <div class="flow-node active-node">2. ★ Diagnostic Consultation (₹1,000)</div>
              <div class="flow-node">3. Recommended Protocol</div>
            </div>

            <div style="background: var(--bg-sand); padding: 12px 14px; border-radius: 6px; font-size: 0.82rem; color: var(--primary-deep); margin-bottom: 16px;">
              <strong>What is included:</strong> Medical history review + Naadi Pariksha pulse diagnosis + Posture & joint space evaluation + Personalized recovery roadmap.
            </div>

            <form id="quiz-booking-form">
              <div class="form-field">
                <label for="booking-name">Patient Full Name *</label>
                <input type="text" id="booking-name" required placeholder="Enter full name" minlength="2">
              </div>
              <div class="form-field">
                <label for="booking-phone">Mobile Phone Number *</label>
                <input type="tel" id="booking-phone" required placeholder="10-digit mobile number" pattern="[6-9][0-9]{9}" maxlength="10">
              </div>
              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 10px;">
                Confirm In-Clinic Consultation (₹1,000) ↗
              </button>
            </form>
          </div>
        `;
      }
      // BRANCH 3: ONLY FREE LIVE HINDI WEBINAR
      else {
        resultHtml = `
          <div class="quiz-result-single" style="border-color: var(--primary-sage);">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary-sage); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
              SINGLE RECOMMENDED NEXT STEP
            </div>
            <h3 style="font-size: 1.3rem; color: var(--primary-deep); margin-bottom: 8px;">
              Attend Free Live Hindi Masterclass on Zoom
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; margin-bottom: 12px;">
              Since you are currently exploring or looking to understand how Ayurveda compares with surgery for <strong>${painArea}</strong>, we recommend starting with our live online session with Dr. Surabhi Vaidya. Learn root cause analysis and discover practical ways to protect your joints without visiting the clinic yet.
            </p>

            <div class="quiz-flow-indicator">
              <div class="flow-node">1. Assessment ✓</div>
              <div class="flow-node active-node">2. ★ Free Live Masterclass</div>
              <div class="flow-node">3. In-Clinic Diagnosis</div>
            </div>

            <div style="background: var(--bg-sand); padding: 12px 14px; border-radius: 6px; font-size: 0.82rem; color: var(--primary-deep); margin-bottom: 16px;">
              <strong>Topic:</strong> Root Causes of Knee & Back Pain, Common Misconceptions, and How to Prevent Surgery Naturally.
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
                <input type="text" id="booking-city" required placeholder="e.g. Thane / Mumbai">
              </div>
              <button type="submit" class="btn btn-deep btn-lg" style="width: 100%; margin-top: 10px;">
                Register for Free Webinar Place ↗
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
              recommendedStep: branch === 'trial' ? '₹4,000 1-Day Experience Session' : (branch === 'consultation' ? '₹1,000 Diagnostic Consultation' : 'Free Live Hindi Masterclass'),
              slotPreference: slot,
              status: 'New Lead',
              createdAt: new Date().toISOString()
            };
            existing.unshift(newLead);
            localStorage.setItem('dr_surabhi_leads', JSON.stringify(existing));
          } catch(err) {
            console.error('CRM sync error:', err);
          }

          quizBody.innerHTML = `
            <div class="quiz-result-single" style="text-align: center; border-color: var(--primary-sage);">
              <div style="font-size: 2.2rem; margin-bottom: 10px;">✓</div>
              <h3 style="font-size: 1.3rem; margin-bottom: 8px;">Request Received, ${name}</h3>
              <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 18px;">
                Thank you. Our clinic appointment desk at Charak Health Solutions, Thane West has logged your request for <strong>${painArea}</strong>. Our care coordinator will call you shortly on <strong>${phone}</strong> to confirm your slot.
              </p>
              <button class="btn btn-deep" type="button" onclick="document.querySelector('#quiz-modal').close();">
                Close
              </button>
            </div>
          `;
        });
      }

      const restartBtn = quizBody.querySelector('#quiz-restart-btn');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          currentStep = 0;
          userAnswers = [];
          renderQuiz();
        });
      }
      return;
    }

    // REGULAR QUESTION STEP
    const q = quizQuestions[currentStep];
    let optionsHtml = q.options.map((opt, idx) => {
      const isSelected = userAnswers[currentStep] === idx;
      return `
        <button type="button" class="quiz-option-btn${isSelected ? ' selected' : ''}" data-index="${idx}">
          <span>${opt}</span>
          <span style="font-weight: 700; color: var(--accent-terracotta); font-size: 1rem;">→</span>
        </button>
      `;
    }).join('');

    quizBody.innerHTML = `
      <div style="font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; color: var(--accent-terracotta); text-transform: uppercase; margin-bottom: 6px;">
        QUESTION ${String(currentStep + 1).padStart(2, '0')} OF ${String(total).padStart(2, '0')}
      </div>
      <h2 class="quiz-step-title" id="quiz-title">${q.title}</h2>
      <p class="quiz-step-subtitle">${q.subtitle}</p>
      <div class="quiz-options-grid">${optionsHtml}</div>
      <div class="quiz-footer">
        <button type="button" class="quiz-back-btn" id="quiz-prev-btn">
          ${currentStep > 0 ? '← Previous Question' : 'Cancel & Close'}
        </button>
        <span style="font-size: 0.74rem; color: var(--text-light); font-weight: 600;">60-Sec Screening</span>
      </div>
    `;

    quizBody.querySelectorAll('[data-index]').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'), 10);
        userAnswers[currentStep] = index;
        currentStep++;
        renderQuiz();
      });
    });

    const prevBtn = quizBody.querySelector('#quiz-prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep--;
          renderQuiz();
        } else {
          closeQuiz();
        }
      });
    }
  }

  // Bind trigger buttons for assessment
  document.querySelectorAll('[data-start-assessment]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openQuiz();
    });
  });

  const quizCloseBtn = document.querySelector('#quiz-modal-close');
  if (quizCloseBtn) {
    quizCloseBtn.addEventListener('click', closeQuiz);
  }

  if (quizDialog) {
    quizDialog.addEventListener('close', () => {
      document.body.style.overflow = '';
    });
  }

  // =========================================================================
  // 3. VIDEO TESTIMONIAL MODAL & FILTERING
  // =========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const videoCards = document.querySelectorAll('.video-card');
  const videoModal = document.querySelector('#video-modal');
  const videoFrame = document.querySelector('#video-modal-frame');
  const videoModalClose = document.querySelector('#video-modal-close');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      videoCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  document.querySelectorAll('[data-video-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const videoId = btn.getAttribute('data-video-id');
      if (videoFrame && videoModal && videoId) {
        videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        videoModal.showModal();
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeVideoModal() {
    if (videoModal && videoFrame) {
      videoFrame.src = '';
      videoModal.close();
      document.body.style.overflow = '';
    }
  }

  if (videoModalClose) {
    videoModalClose.addEventListener('click', closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener('close', closeVideoModal);
  }

  // =========================================================================
  // 4. FAQ ACCORDION
  // =========================================================================
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // =========================================================================
  // 5. STICKY BOTTOM BAR ON SCROLL
  // =========================================================================
  const stickyBar = document.querySelector('#sticky-bar');
  if (stickyBar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 450) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
    }, { passive: true });
  }

  // =========================================================================
  // 6. EXIT INTENT DETECTION
  // =========================================================================
  const exitModal = document.querySelector('#exit-modal');
  const exitClose = document.querySelector('#exit-modal-close');
  let exitShown = false;

  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0 && !exitShown && exitModal) {
      exitShown = true;
      exitModal.showModal();
    }
  });

  if (exitClose && exitModal) {
    exitClose.addEventListener('click', () => {
      exitModal.close();
    });
  }

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
  });

})();
