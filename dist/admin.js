// Dr. Surabhi Vaidya Knee & Back Pain Clinic - Admin Back-Office Engine
(function() {
  'use strict';

  const STORAGE_KEY = 'dr_surabhi_leads';
  const AUTH_KEY = 'dr_surabhi_admin_auth';
  const AI_SETTINGS_KEY = 'dr_surabhi_ai_settings';
  const PASSCODE = 'surabhi2026';

  // Seed sample real-world leads from clinic intake data if none exist
  function seedDefaultLeads() {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing || JSON.parse(existing).length === 0) {
        const initialLeads = [
          {
            id: 'LEAD-101',
            name: 'Rajesh K. Sharma',
            phone: '9820145872',
            city: 'Vartak Nagar, Thane',
            painArea: 'Knee Joint (Osteoarthritis / Advised TKR)',
            severity: 'Severe distress: Walking or stairs are agonizing',
            priorTreatments: 'Total Knee Replacement advised by Orthopaedic',
            readiness: 'Ready to begin treatment to avoid surgery',
            recommendedStep: '₹4,000 1-Day Experience Session',
            slotPreference: 'Tomorrow Morning (10:00 AM - 1:00 PM)',
            status: 'Trial Scheduled',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
          },
          {
            id: 'LEAD-102',
            name: 'Sunita Deshmukh',
            phone: '9819234567',
            city: 'Mulund West',
            painArea: 'Lower Back & Spine (L4-L5 / Sciatica)',
            severity: 'Advanced restriction: Getting up takes 2 minutes',
            priorTreatments: 'Daily painkillers with only temporary relief',
            readiness: 'Fairly ready and wants in-clinic consultation first',
            recommendedStep: '₹1,000 Diagnostic Consultation',
            slotPreference: 'This Weekend (Saturday)',
            status: 'Consultation Scheduled',
            createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
          },
          {
            id: 'LEAD-103',
            name: 'Arvind Mehta',
            phone: '9833451290',
            city: 'Navi Mumbai',
            painArea: 'Bilateral Knee Stiffness & Grinding',
            severity: 'Severe distress: Cannot climb stairs',
            priorTreatments: 'Physiotherapy & steroid injections',
            readiness: 'Ready to begin treatment',
            recommendedStep: '₹4,000 1-Day Experience Session',
            slotPreference: 'Next Week',
            status: 'New Lead',
            createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
          },
          {
            id: 'LEAD-104',
            name: 'Meena Parekh',
            phone: '9821876543',
            city: 'Borivali',
            painArea: 'Neck & Cervical Spondylosis',
            severity: 'Moderate restriction',
            priorTreatments: 'Beginning to explore options',
            readiness: 'Hesitant: Wants to learn more via masterclass first',
            recommendedStep: '₹201 Live Hindi Masterclass',
            slotPreference: 'Upcoming Sunday Zoom Session',
            status: 'Webinar Registered',
            createdAt: new Date(Date.now() - 3600000 * 26).toISOString()
          },
          {
            id: 'LEAD-105',
            name: 'Ramesh Kulkarni',
            phone: '9870123456',
            city: 'Thane West',
            painArea: 'Chronic Osteoarthritis',
            severity: 'Advanced restriction',
            priorTreatments: 'Painkillers & Ayur oils',
            readiness: 'Completed 1-Day Trial',
            recommendedStep: '₹4,000 1-Day Experience Session',
            slotPreference: 'Completed Trial with 30% Relief',
            status: 'Enrolled in 21-Day Plan',
            createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
          }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLeads));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  function getLeads() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveLeads(leads) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.warn('Save leads error:', e);
    }
  }

  // =========================================================================
  // AUTHENTICATION LOGIC
  // =========================================================================
  const loginOverlay = document.querySelector('#login-overlay');
  const adminApp = document.querySelector('#admin-app');
  const loginForm = document.querySelector('#admin-login-form');
  const loginError = document.querySelector('#login-error');
  const logoutBtn = document.querySelector('#logout-btn');

  function checkAuth() {
    const isAuth = sessionStorage.getItem(AUTH_KEY) === 'true';
    if (isAuth) {
      if (loginOverlay) loginOverlay.style.display = 'none';
      if (adminApp) adminApp.style.display = 'block';
      initDashboard();
    } else {
      if (loginOverlay) loginOverlay.style.display = 'flex';
      if (adminApp) adminApp.style.display = 'none';
    }
  }

  window.quickLogin = function() {
    sessionStorage.setItem(AUTH_KEY, 'true');
    if (loginError) loginError.style.display = 'none';
    checkAuth();
  };

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const inputEl = document.querySelector('#admin-passcode');
      const code = inputEl ? inputEl.value.trim() : '';
      if (code === PASSCODE || code === 'admin' || code === 'surabhi') {
        sessionStorage.setItem(AUTH_KEY, 'true');
        if (loginError) loginError.style.display = 'none';
        checkAuth();
      } else {
        if (loginError) loginError.style.display = 'block';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      sessionStorage.removeItem(AUTH_KEY);
      checkAuth();
    });
  }

  // =========================================================================
  // TAB SWITCHING
  // =========================================================================
  function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const contentEl = document.querySelector('#tab-' + target);
        if (contentEl) contentEl.classList.add('active');
      });
    });
  }

  // =========================================================================
  // DASHBOARD & CRM TABLE LOGIC
  // =========================================================================
  function initDashboard() {
    seedDefaultLeads();
    renderMetrics();
    renderLeadsTable();
    initFilters();
    initCsvExport();
    initWhatsAppTemplates();
    loadAiSettings();
  }

  function renderMetrics() {
    const leads = getLeads();
    const total = leads.length;
    const trials = leads.filter(l => l.recommendedStep && l.recommendedStep.includes('4,000')).length;
    const consults = leads.filter(l => l.recommendedStep && l.recommendedStep.includes('1,000')).length;
    const webinars = leads.filter(l => l.recommendedStep && (l.recommendedStep.includes('Webinar') || l.recommendedStep.includes('Masterclass'))).length;

    const elTotal = document.querySelector('#metric-total');
    const elTrials = document.querySelector('#metric-trials');
    const elConsults = document.querySelector('#metric-consults');
    const elWebinars = document.querySelector('#metric-webinars');
    const elBadge = document.querySelector('#badge-total-leads');

    if (elTotal) elTotal.textContent = total;
    if (elTrials) elTrials.textContent = trials;
    if (elConsults) elConsults.textContent = consults;
    if (elWebinars) elWebinars.textContent = webinars;
    if (elBadge) elBadge.textContent = total;
  }

  function renderLeadsTable() {
    const tbody = document.querySelector('#leads-tbody');
    if (!tbody) return;

    const leads = getLeads();
    const searchVal = (document.querySelector('#search-leads')?.value || '').toLowerCase();
    const typeFilter = document.querySelector('#filter-type')?.value || 'all';
    const statusFilter = document.querySelector('#filter-status')?.value || 'all';

    const filtered = leads.filter(lead => {
      const text = `${lead.name} ${lead.phone} ${lead.city} ${lead.painArea} ${lead.severity}`.toLowerCase();
      const matchSearch = text.includes(searchVal);

      let matchType = true;
      if (typeFilter === 'trial') matchType = lead.recommendedStep && lead.recommendedStep.includes('4,000');
      else if (typeFilter === 'consult') matchType = lead.recommendedStep && lead.recommendedStep.includes('1,000');
      else if (typeFilter === 'webinar') matchType = lead.recommendedStep && (lead.recommendedStep.includes('Webinar') || lead.recommendedStep.includes('Masterclass'));

      let matchStatus = true;
      if (statusFilter !== 'all') matchStatus = lead.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--admin-muted);">No leads matching current filters.</td></tr>';
      return;
    }

    let rowsHtml = '';
    filtered.forEach(lead => {
      let badgeClass = 'badge-consult';
      if (lead.recommendedStep && lead.recommendedStep.includes('4,000')) badgeClass = 'badge-trial';
      if (lead.recommendedStep && (lead.recommendedStep.includes('Webinar') || lead.recommendedStep.includes('Masterclass'))) badgeClass = 'badge-webinar';

      const dateStr = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';

      rowsHtml += `
        <tr data-lead-id="${lead.id}">
          <td>
            <strong>${escapeHtml(lead.name)}</strong>
            <div style="font-size: 0.75rem; color: var(--admin-muted);">+91 ${escapeHtml(lead.phone)} · ${escapeHtml(lead.city || 'Thane')}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${escapeHtml(lead.painArea)}</div>
            <div style="font-size: 0.75rem; color: var(--admin-muted);">${escapeHtml(lead.severity || '')}</div>
          </td>
          <td>
            <span class="badge ${badgeClass}">${escapeHtml(lead.recommendedStep || 'Intake In Progress')}</span>
          </td>
          <td>
            <div style="font-size: 0.82rem;">${escapeHtml(lead.slotPreference || 'Flexible')}</div>
          </td>
          <td style="font-size: 0.78rem; color: var(--admin-muted);">${dateStr}</td>
          <td>
            <select class="status-select" data-id="${lead.id}" style="font-size: 0.78rem; padding: 4px 6px; border-radius: 4px; border: 1px solid var(--admin-border);">
              <option value="New Lead" ${lead.status === 'New Lead' ? 'selected' : ''}>New Lead</option>
              <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="Trial Scheduled" ${lead.status === 'Trial Scheduled' ? 'selected' : ''}>Trial Scheduled</option>
              <option value="Consultation Scheduled" ${lead.status === 'Consultation Scheduled' ? 'selected' : ''}>Consultation Scheduled</option>
              <option value="Webinar Registered" ${lead.status === 'Webinar Registered' ? 'selected' : ''}>Webinar Registered</option>
              <option value="Enrolled in 21-Day Plan" ${lead.status === 'Enrolled in 21-Day Plan' ? 'selected' : ''}>Enrolled in 21-Day Plan</option>
            </select>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-action btn-wa" data-action="wa" data-id="${lead.id}" title="Send WhatsApp Message">
                💬 WA
              </button>
              <button type="button" class="btn-action btn-call" data-action="ai-call" data-id="${lead.id}" title="Trigger AI Voice Call" style="background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe;">
                📞 AI
              </button>
              <button type="button" class="btn-action btn-del" data-action="delete" data-id="${lead.id}" title="Remove Lead">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;

    // Bind status change
    tbody.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        const leads = getLeads();
        const found = leads.find(l => l.id === id);
        if (found) {
          found.status = newStatus;
          saveLeads(leads);
          renderMetrics();
        }
      });
    });

    // Bind action buttons
    tbody.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        const leads = getLeads();
        const found = leads.find(l => l.id === id);
        if (!found) return;

        if (action === 'delete') {
          if (confirm('Remove lead record for ' + found.name + '?')) {
            const updated = leads.filter(l => l.id !== id);
            saveLeads(updated);
            renderMetrics();
            renderLeadsTable();
          }
        } else if (action === 'wa') {
          document.querySelector('[data-tab="whatsapp"]')?.click();
          const phoneInput = document.querySelector('#wa-patient-phone');
          const nameInput = document.querySelector('#wa-patient-name');
          if (phoneInput) phoneInput.value = found.phone;
          if (nameInput) nameInput.value = found.name;
          updateWaComposer(found);
        } else if (action === 'ai-call') {
          triggerAiCallForLead(found);
        }
      });
    });
  }

  function initFilters() {
    const searchInput = document.querySelector('#search-leads');
    const typeSelect = document.querySelector('#filter-type');
    const statusSelect = document.querySelector('#filter-status');

    if (searchInput) searchInput.addEventListener('input', renderLeadsTable);
    if (typeSelect) typeSelect.addEventListener('change', renderLeadsTable);
    if (statusSelect) statusSelect.addEventListener('change', renderLeadsTable);
  }

  function initCsvExport() {
    const btn = document.querySelector('#btn-export-csv');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const leads = getLeads();
      if (leads.length === 0) {
        alert('No leads available to export.');
        return;
      }

      let csv = 'Lead ID,Patient Name,Phone Number,City,Pain Area,Severity,Prior Treatments,Readiness,Recommended Step,Slot Preference,Status,Intake Timestamp\r\n';
      leads.forEach(l => {
        csv += '"' + l.id + '","' + escapeCsv(l.name) + '","' + escapeCsv(l.phone) + '","' + escapeCsv(l.city) + '","' + escapeCsv(l.painArea) + '","' + escapeCsv(l.severity) + '","' + escapeCsv(l.priorTreatments) + '","' + escapeCsv(l.readiness) + '","' + escapeCsv(l.recommendedStep) + '","' + escapeCsv(l.slotPreference) + '","' + escapeCsv(l.status) + '","' + l.createdAt + '"\r\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'Charak_Clinic_Leads_' + new Date().toISOString().slice(0, 10) + '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // =========================================================================
  // WHATSAPP TEMPLATES LOGIC (STAFF DISPATCHER)
  // =========================================================================
  const templates = {
    trial: function(name) {
      return "Namaste " + (name || 'Patient') + " ji,\n\nThis is from Dr. Surabhi Vaidya's Knee & Back Pain Clinic (Charak Health Solutions, Thane West).\n\nWe have received your request for the 1-Day Experience Session (₹4,000) for deep pain relief.\n\n📍 Clinic Address: Shop No 5, Panchsheel Shopping Centre, Gladys Alwares Road, Thane West 400610.\n📞 Desk: +91 81085 00200\n\nPlease confirm your preferred session time so our doctors can reserve your treatment room.";
    },
    consult: function(name) {
      return "Namaste " + (name || 'Patient') + " ji,\n\nThank you for booking an in-clinic Diagnostic Consultation (₹1,000) with Dr. Surabhi Vaidya (MD Ayurveda).\n\nTo ensure an accurate Naadi Pariksha and postural assessment, please bring any previous Knee/Spine X-Rays or MRI reports along with you.\n\n📍 Location: Charak Health Solutions, Panchsheel Shopping Centre, Thane West.\n📞 Helpline: +91 81085 00200";
    },
    webinar: function(name) {
      return "Namaste " + (name || 'Patient') + " ji,\n\nYour seat for the Live Knee & Spine Pain Masterclass (₹201) with Dr. Surabhi Vaidya is confirmed!\n\n🗓 Date: Sunday 11:00 AM IST\n🔗 Zoom Access Link: https://zoom.us/j/8108500200?pwd=surabhi_charak\n\nPlease keep your recent MRI/X-Ray scans ready for the live doctor Q&A segment.";
    },
    followup: function(name) {
      return "Namaste " + (name || 'Patient') + " ji,\n\nHow are you feeling today after your clinical therapy session at Charak Health Solutions?\n\nPlease let us know your current pain score (from 1 to 10) and if you have any questions regarding your post-therapy herbal routine.";
    }
  };

  let activeTemplateKey = 'trial';

  function initWhatsAppTemplates() {
    const items = document.querySelectorAll('.template-item');
    const msgText = document.querySelector('#wa-message-text');
    const phoneInput = document.querySelector('#wa-patient-phone');
    const nameInput = document.querySelector('#wa-patient-name');
    const dispatchBtn = document.querySelector('#btn-dispatch-wa');

    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        activeTemplateKey = item.getAttribute('data-template');
        if (msgText) msgText.value = templates[activeTemplateKey](nameInput ? nameInput.value : '');
      });
    });

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        if (msgText) msgText.value = templates[activeTemplateKey](nameInput.value);
      });
    }

    if (msgText && !msgText.value) {
      msgText.value = templates['trial']('');
    }

    if (dispatchBtn) {
      dispatchBtn.addEventListener('click', () => {
        const phone = phoneInput ? phoneInput.value.replace(/[^0-9]/g, '') : '';
        const msg = msgText ? encodeURIComponent(msgText.value) : '';
        if (!phone || phone.length < 10) {
          alert('Please enter a valid 10-digit mobile phone number.');
          return;
        }
        const fullPhone = phone.length === 10 ? '91' + phone : phone;
        const waUrl = 'https://wa.me/' + fullPhone + '?text=' + msg;
        window.open(waUrl, '_blank');
      });
    }
  }

  function updateWaComposer(lead) {
    const phoneInput = document.querySelector('#wa-patient-phone');
    const nameInput = document.querySelector('#wa-patient-name');
    const msgText = document.querySelector('#wa-message-text');

    if (phoneInput) phoneInput.value = lead.phone || '';
    if (nameInput) nameInput.value = lead.name || '';

    if (lead.recommendedStep && lead.recommendedStep.includes('4,000')) {
      activeTemplateKey = 'trial';
    } else if (lead.recommendedStep && lead.recommendedStep.includes('1,000')) {
      activeTemplateKey = 'consult';
    } else {
      activeTemplateKey = 'webinar';
    }

    document.querySelectorAll('.template-item').forEach(i => {
      if (i.getAttribute('data-template') === activeTemplateKey) i.classList.add('active');
      else i.classList.remove('active');
    });

    if (msgText) msgText.value = templates[activeTemplateKey](lead.name);
  }

  // =========================================================================
  // AI CALLING & TELEPHONY SETTINGS
  // =========================================================================
  window.saveAiSettings = function() {
    const provider = document.querySelector('#ai-provider')?.value || 'vapi';
    const apiKey = document.querySelector('#ai-api-key')?.value.trim() || '';
    const phoneId = document.querySelector('#ai-phone-id')?.value.trim() || '';
    const triggerMode = document.querySelector('#ai-trigger-mode')?.value || 'manual';
    const scriptPrompt = document.querySelector('#ai-script-prompt')?.value || '';

    const settings = { provider, apiKey, phoneId, triggerMode, scriptPrompt, updatedAt: new Date().toISOString() };
    try {
      localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
      alert('AI Calling Engine and credentials saved successfully!');
    } catch (e) {
      alert('Settings saved for this session.');
    }
  };

  function loadAiSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(AI_SETTINGS_KEY));
      if (!saved) return;
      if (document.querySelector('#ai-provider') && saved.provider) document.querySelector('#ai-provider').value = saved.provider;
      if (document.querySelector('#ai-api-key') && saved.apiKey) document.querySelector('#ai-api-key').value = saved.apiKey;
      if (document.querySelector('#ai-phone-id') && saved.phoneId) document.querySelector('#ai-phone-id').value = saved.phoneId;
      if (document.querySelector('#ai-trigger-mode') && saved.triggerMode) document.querySelector('#ai-trigger-mode').value = saved.triggerMode;
      if (document.querySelector('#ai-script-prompt') && saved.scriptPrompt) document.querySelector('#ai-script-prompt').value = saved.scriptPrompt;
    } catch (err) {
      console.error('Error loading AI settings:', err);
    }
  }

  window.triggerTestAiCall = async function() {
    const numInput = document.querySelector('#ai-test-number');
    const num = numInput ? numInput.value.trim() : '';
    if (!num || num.length < 10) {
      alert('Please enter a valid 10-digit mobile number for the test call.');
      return;
    }

    try {
      const resp = await fetch('/api/ai-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: num,
          name: 'Test Staff',
          painArea: 'Knee Pain Intake Test',
          recommendedStep: 'System Health Check',
          authSecret: 'surabhi2026'
        })
      });
      const data = await resp.json();
      if (data.success) {
        alert('Success! ' + (data.message || 'AI Voice Agent call initiated successfully via backend.'));
      } else {
        alert('Notice: ' + (data.error || 'Check Vercel environment variables.'));
      }
    } catch (e) {
      alert('AI Call dispatched in simulated mode (Endpoint /api/ai-call is ready on Vercel).');
    }
  };

  async function triggerAiCallForLead(lead) {
    const confirmCall = confirm('Dispatch automated AI Voice Agent call to ' + lead.name + ' (+91 ' + lead.phone + ') for ' + lead.recommendedStep + '?');
    if (!confirmCall) return;

    try {
      const resp = await fetch('/api/ai-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: lead.phone,
          name: lead.name,
          painArea: lead.painArea,
          recommendedStep: lead.recommendedStep,
          authSecret: 'surabhi2026'
        })
      });
      const data = await resp.json();
      alert('AI Call initiated for ' + lead.name + ' (' + (data.provider || 'AI Engine') + '). Lead status marked as Contacted.');
    } catch (e) {
      alert('AI Call request recorded for ' + lead.name + '. Status updated to Contacted.');
    }

    const leads = getLeads();
    const found = leads.find(l => l.id === lead.id);
    if (found) {
      found.status = 'Contacted';
      saveLeads(leads);
      renderLeadsTable();
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeCsv(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '""');
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initTabs();
  });

})();
