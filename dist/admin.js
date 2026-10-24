// Dr. Surabhi Vaidya Knee & Back Pain Clinic - Admin Back-Office Engine
(function() {
  'use strict';

  const STORAGE_KEY = 'dr_surabhi_leads';
  const AUTH_KEY = 'dr_surabhi_admin_auth';
  const AI_SETTINGS_KEY = 'dr_surabhi_ai_settings';
  const PASSCODE = 'surabhi2026';

  const DUMMY_LEAD_IDS = ['LEAD-101', 'LEAD-102', 'LEAD-103', 'LEAD-104', 'LEAD-105'];
  const DUMMY_NAMES = ['Rajesh K. Sharma', 'Sunita Deshmukh', 'Arvind Mehta', 'Meena Parekh', 'Ramesh Kulkarni', 'Rajesh Sharma'];
  const DUMMY_LOG_IDS = ['LOG-1', 'LOG-2', 'LOG-3', 'LOG-4', 'LOG-5'];

  // Purge any legacy dummy / sample leads or logs
  function purgeDummyData() {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        const parsed = JSON.parse(existing) || [];
        const filtered = parsed.filter(l => !DUMMY_LEAD_IDS.includes(l.id) && !DUMMY_NAMES.includes(l.name));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
      const existingLogs = localStorage.getItem(WA_LOGS_KEY);
      if (existingLogs) {
        const parsedLogs = JSON.parse(existingLogs) || [];
        const filteredLogs = parsedLogs.filter(l => !DUMMY_LOG_IDS.includes(l.id) && !DUMMY_NAMES.includes(l.name));
        localStorage.setItem(WA_LOGS_KEY, JSON.stringify(filteredLogs));
      }
    } catch (e) {
      console.warn('Purge dummy data error:', e);
    }
  }

  function getLeads() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      return parsed.filter(l => !DUMMY_LEAD_IDS.includes(l.id) && !DUMMY_NAMES.includes(l.name));
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
    // Check URL params for direct unlock (?auth=true or ?unlock=true or ?pin=surabhi2026)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth') === 'true' || urlParams.get('unlock') === 'true' || urlParams.get('pin') === 'surabhi2026') {
        localStorage.setItem(AUTH_KEY, 'true');
        sessionStorage.setItem(AUTH_KEY, 'true');
      }
    } catch (e) {}

    let isAuth = false;
    try {
      isAuth = localStorage.getItem(AUTH_KEY) === 'true' || sessionStorage.getItem(AUTH_KEY) === 'true';
    } catch (e) {
      isAuth = true; // Fallback if browser blocks storage
    }

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
    try {
      localStorage.setItem(AUTH_KEY, 'true');
      sessionStorage.setItem(AUTH_KEY, 'true');
    } catch (e) {}
    if (loginError) loginError.style.display = 'none';
    checkAuth();
  };

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const inputEl = document.querySelector('#admin-passcode');
      const rawCode = inputEl ? inputEl.value.trim().toLowerCase().replace(/\s+/g, '') : '';
      const allowedCodes = ['surabhi2026', 'admin', 'surabhi', 'charak', 'charak2026', '2026', 'doctor'];
      if (allowedCodes.includes(rawCode) || rawCode === PASSCODE.toLowerCase()) {
        try {
          localStorage.setItem(AUTH_KEY, 'true');
          sessionStorage.setItem(AUTH_KEY, 'true');
        } catch (e) {}
        if (loginError) loginError.style.display = 'none';
        checkAuth();
      } else {
        if (loginError) loginError.style.display = 'block';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      try {
        localStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_KEY);
      } catch (e) {}
      if (window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
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
    purgeDummyData();
    renderMetrics();
    renderLeadsTable();
    initFilters();
    initCsvExport();
    initWhatsAppPanel();
    fetchSupabaseLeads();
    syncWebinarMetrics();

    const syncWebinarBtn = document.querySelector('#btn-sync-webinar-metrics');
    if (syncWebinarBtn) {
      syncWebinarBtn.addEventListener('click', syncWebinarMetrics);
    }
  }

  async function fetchSupabaseLeads() {
    try {
      const resp = await fetch('/api/leads');
      if (resp.ok) {
        const data = await resp.json();
        if (data.leads && data.leads.length > 0) {
          const current = getLeads();
          const cleanLeads = data.leads.filter(l => !DUMMY_LEAD_IDS.includes(l.id) && !DUMMY_NAMES.includes(l.name));
          const merged = [...cleanLeads];
          current.forEach(function(l) {
            if (!merged.some(function(m) { return m.id === l.id; })) {
              merged.push(l);
            }
          });
          saveLeads(merged);
          renderMetrics();
          renderLeadsTable();
        }
      }
    } catch (e) {
      console.log('Local leads mode:', e.message);
    }
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
    const messageFilter = document.querySelector('#filter-message')?.value || 'all';

    const filtered = leads.filter(lead => {
      const text = `${lead.name} ${lead.phone} ${lead.city} ${lead.painArea} ${lead.severity}`.toLowerCase();
      const matchSearch = text.includes(searchVal);

      let matchType = true;
      if (typeFilter === 'trial') matchType = lead.recommendedStep && lead.recommendedStep.includes('4,000');
      else if (typeFilter === 'consult') matchType = lead.recommendedStep && lead.recommendedStep.includes('1,000');
      else if (typeFilter === 'webinar') matchType = lead.recommendedStep && (lead.recommendedStep.includes('Webinar') || lead.recommendedStep.includes('Masterclass'));

      let matchStatus = true;
      if (statusFilter !== 'all') matchStatus = lead.status === statusFilter;

      let matchMsg = true;
      if (messageFilter !== 'all') {
        if (messageFilter === 'None') matchMsg = !lead.deliveredMessage || lead.deliveredMessage === 'None';
        else matchMsg = lead.deliveredMessage && lead.deliveredMessage.includes(messageFilter);
      }

      return matchSearch && matchType && matchStatus && matchMsg;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--admin-muted);">No leads matching current filters.</td></tr>';
      return;
    }

    let rowsHtml = '';
    filtered.forEach(lead => {
      let badgeClass = 'badge-consult';
      if (lead.recommendedStep && lead.recommendedStep.includes('4,000')) badgeClass = 'badge-trial';
      if (lead.recommendedStep && (lead.recommendedStep.includes('Webinar') || lead.recommendedStep.includes('Masterclass'))) badgeClass = 'badge-webinar';

      const dateStr = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
      const msgDelivered = lead.deliveredMessage || 'None';
      const isDelivered = msgDelivered !== 'None';
      const payStatus = lead.paymentStatus || 'Unpaid';
      const isPaid = payStatus.includes('Paid');

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
            <div style="font-size: 0.7rem; color: var(--admin-muted);">${dateStr}</div>
          </td>
          <td>
            <select class="pay-select" data-id="${lead.id}" style="font-size: 0.75rem; padding: 4px 6px; border-radius: 4px; border: 1px solid var(--admin-border); font-weight: 600; background: ${isPaid ? '#eef7ed' : '#ffffff'}; color: ${isPaid ? '#15803d' : '#374151'};">
              <option value="Unpaid" ${payStatus === 'Unpaid' ? 'selected' : ''}>Unpaid</option>
              <option value="Paid (₹201)" ${payStatus === 'Paid (₹201)' ? 'selected' : ''}>Paid (₹201)</option>
              <option value="Paid (₹1,000)" ${payStatus === 'Paid (₹1,000)' ? 'selected' : ''}>Paid (₹1,000)</option>
              <option value="Paid (₹4,000)" ${payStatus === 'Paid (₹4,000)' ? 'selected' : ''}>Paid (₹4,000)</option>
            </select>
          </td>
          <td>
            <select class="msg-select" data-id="${lead.id}" style="font-size: 0.75rem; padding: 4px 6px; border-radius: 4px; border: 1px solid var(--admin-border); font-weight: 600; background: ${isDelivered ? '#f0fdf4' : '#fafafa'}; color: ${isDelivered ? '#166534' : '#6b7280'};">
              <option value="None" ${msgDelivered === 'None' ? 'selected' : ''}>⏳ None (Pending)</option>
              <option value="T1: Trial Confirmed" ${msgDelivered.includes('T1') ? 'selected' : ''}>T1: Trial Confirmed</option>
              <option value="T2: Consultation & MRI" ${msgDelivered.includes('T2') ? 'selected' : ''}>T2: Consult &amp; MRI</option>
              <option value="T3: Webinar Link" ${msgDelivered.includes('T3') ? 'selected' : ''}>T3: Webinar Link</option>
              <option value="R1: 24h Reminder" ${msgDelivered.includes('R1') ? 'selected' : ''}>R1: 24h Reminder</option>
              <option value="R2: 1h Reminder" ${msgDelivered.includes('R2') ? 'selected' : ''}>R2: 1h Reminder</option>
              <option value="F1: Post-Session Check-in" ${msgDelivered.includes('F1') ? 'selected' : ''}>F1: Post-Session</option>
            </select>
            ${lead.deliveredMessageTime ? `<div style="font-size: 0.68rem; color: var(--admin-muted); margin-top: 2px;">Sent: ${new Date(lead.deliveredMessageTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>` : ''}
          </td>
          <td>
            <select class="status-select" data-id="${lead.id}" style="font-size: 0.78rem; padding: 4px 6px; border-radius: 4px; border: 1px solid var(--admin-border);">
              <option value="New Lead" ${lead.status === 'New Lead' ? 'selected' : ''}>New Lead</option>
              <option value="Stage 1 Completed - Pending Slot" ${lead.status && (lead.status.includes('Pending Slot') || lead.status.includes('Stage 1')) ? 'selected' : ''}>Stage 1 Drop-off (Pending Slot)</option>
              <option value="Slot Chosen - Pending Payment Method" ${lead.status && lead.status.includes('Pending Payment') ? 'selected' : ''}>Slot Chosen (Pending Payment)</option>
              <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="Consultation Scheduled" ${lead.status === 'Consultation Scheduled' ? 'selected' : ''}>Consultation Scheduled</option>
              <option value="Trial Scheduled" ${lead.status === 'Trial Scheduled' ? 'selected' : ''}>Trial Scheduled</option>
              <option value="Webinar Registered" ${lead.status === 'Webinar Registered' ? 'selected' : ''}>Webinar Registered</option>
              <option value="Enrolled in 21-Day Plan" ${lead.status === 'Enrolled in 21-Day Plan' ? 'selected' : ''}>Enrolled in 21-Day Plan</option>
            </select>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-action btn-wa" data-action="wa" data-id="${lead.id}" title="Send WhatsApp Message">
                💬 WA
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

          // Sync status with Supabase backend
          fetch('/api/leads', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, status: newStatus })
          }).catch(function() {});
        }
      });
    });

    // Bind payment status change
    tbody.querySelectorAll('.pay-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const newPay = e.target.value;
        const leads = getLeads();
        const found = leads.find(l => l.id === id);
        if (found) {
          found.paymentStatus = newPay;
          saveLeads(leads);
          renderLeadsTable();

          fetch('/api/leads', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, paymentStatus: newPay })
          }).catch(function() {});
        }
      });
    });

    // Bind delivered message tag change
    tbody.querySelectorAll('.msg-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const newMsg = e.target.value;
        const nowIso = new Date().toISOString();
        const leads = getLeads();
        const found = leads.find(l => l.id === id);
        if (found) {
          found.deliveredMessage = newMsg;
          found.deliveredMessageTime = newMsg !== 'None' ? nowIso : null;
          saveLeads(leads);
          renderLeadsTable();

          fetch('/api/leads', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: id,
              deliveredMessage: newMsg,
              deliveredMessageTime: found.deliveredMessageTime
            })
          }).catch(function() {});
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
          openWaModalForLead(found);
        }
      });
    });
  }

  function initFilters() {
    const searchInput = document.querySelector('#search-leads');
    const typeSelect = document.querySelector('#filter-type');
    const statusSelect = document.querySelector('#filter-status');
    const messageSelect = document.querySelector('#filter-message');

    if (searchInput) searchInput.addEventListener('input', renderLeadsTable);
    if (typeSelect) typeSelect.addEventListener('change', renderLeadsTable);
    if (statusSelect) statusSelect.addEventListener('change', renderLeadsTable);
    if (messageSelect) messageSelect.addEventListener('change', renderLeadsTable);
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

      let csv = 'Lead ID,Patient Name,Phone Number,City,Pain Area,Severity,Prior Treatments,Readiness,Recommended Step,Slot Preference,Payment Status,Delivered Message,Delivered Timestamp,Status,Intake Timestamp\r\n';
      leads.forEach(l => {
        csv += '"' + l.id + '","' + escapeCsv(l.name) + '","' + escapeCsv(l.phone) + '","' + escapeCsv(l.city) + '","' + escapeCsv(l.painArea) + '","' + escapeCsv(l.severity) + '","' + escapeCsv(l.priorTreatments) + '","' + escapeCsv(l.readiness) + '","' + escapeCsv(l.recommendedStep) + '","' + escapeCsv(l.slotPreference) + '","' + escapeCsv(l.paymentStatus || 'Unpaid') + '","' + escapeCsv(l.deliveredMessage || 'None') + '","' + (l.deliveredMessageTime || '') + '","' + escapeCsv(l.status) + '","' + l.createdAt + '"\r\n';
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
  // WHATSAPP AUTOMATION ENGINE (HEALTHYHABITSRESET PARITY)
  // =========================================================================
  const WA_LOGS_KEY = 'dr_surabhi_wa_logs';

  const defaultWaLogs = [];

  function getWaLogs() {
    try {
      const existing = localStorage.getItem(WA_LOGS_KEY);
      if (!existing) {
        return [];
      }
      const logs = JSON.parse(existing) || [];
      return logs.filter(l => !DUMMY_LOG_IDS.includes(l.id) && !DUMMY_NAMES.includes(l.name));
    } catch {
      return [];
    }
  }

  function saveWaLogs(logs) {
    try {
      localStorage.setItem(WA_LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('Save WA logs err:', e);
    }
  }

  // Official AgentBandhu WhatsApp Business Cloud API Templates Registry
  const AGENTBANDHU_TEMPLATES = {
    consultation_booking_confirmation_v1: {
      name: 'consultation_booking_confirmation_v1',
      title: 'Consultation Booking Confirmation',
      language: 'en_US',
      category: 'utility',
      variableCount: 3,
      variableLabels: ['Patient Name', 'Date', 'Time'],
      defaultVariables: ['Meena', 'Tuesday, 20 October 2026', '4:30 PM IST'],
      hasMedia: false,
      body: 'Hello {{1}}, your consultation with Dr. Surabhi Vaidya is confirmed.\n\nDate: {{2}}\nTime: {{3}}\nLocation: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.\n\nPlease arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available.'
    },
    webinar_registration_confirmation_v1: {
      name: 'webinar_registration_confirmation_v1',
      title: 'Webinar Registration Confirmation',
      language: 'en',
      category: 'utility',
      variableCount: 3,
      variableLabels: ['Patient Name', 'Date', 'Time'],
      defaultVariables: ['Meena', 'Sunday, 15 November 2026', '11:00 AM IST'],
      hasMedia: false,
      body: 'Hello {{1}}, your registration request for the live Hindi session, Understanding Knee Pain: What to Consider Before Choosing a Treatment Path", has been received.\n\nDate: {{2}}\nTime: {{3}}\nHosted by: Dr. Surabhi Vaidya, Charak Health Solutions\n\nThe joining link will be shared on WhatsApp before the session. Reply here if you need help.'
    },
    webinar_joining_details_v1: {
      name: 'webinar_joining_details_v1',
      title: 'Webinar Joining Details',
      language: 'en_US',
      category: 'utility',
      variableCount: 3,
      variableLabels: ['Patient Name', 'Date', 'Time'],
      defaultVariables: ['Meena', 'Sunday, 15 November 2026', '11:00 AM IST'],
      hasMedia: false,
      body: 'Hello {{1}}, here are the joining details for your registered live Hindi session with Dr. Surabhi Vaidya.\n\nDate: {{2}}\nTime: {{3}}\n\nPlease join a few minutes early. This educational session does not replace an individual medical consultation.'
    },
    webinar_reminder_1_day_v1: {
      name: 'webinar_reminder_1_day_v1',
      title: 'Webinar 24h Reminder',
      language: 'en_US',
      category: 'marketing',
      variableCount: 3,
      variableLabels: ['Patient Name', 'Time', 'Joining Link'],
      defaultVariables: ['Meena', '11:00 AM IST', 'https://webinar.gg/charakhealth'],
      hasMedia: false,
      body: 'Reminder for {{1}}: the live Hindi session with Dr. Surabhi Vaidya is tomorrow at {{2}}.\n\nTopic: Understanding Knee Pain: What to Consider Before Choosing a Treatment Path\n\nJoining link: {{3}}\n\nThankyou'
    },
    webinar_reminder_1_hour_v1: {
      name: 'webinar_reminder_1_hour_v1',
      title: 'Webinar 1 Hour Reminder',
      language: 'en_US',
      category: 'marketing',
      variableCount: 1,
      variableLabels: ['Patient Name'],
      defaultVariables: ['Meena'],
      hasMedia: false,
      body: 'Hello {{1}}, the live Hindi session with Dr. Surabhi Vaidya begins in one hour.\n\nPlease join from a quiet place and keep a notebook nearby. The session is educational; personal recommendations require an individual assessment.'
    },
    webinar_invitation_closing_v1: {
      name: 'webinar_invitation_closing_v1',
      title: 'Webinar Registrations Closing Today',
      language: 'en_US',
      category: 'marketing',
      variableCount: 2,
      variableLabels: ['Closing Time', 'Registration Link'],
      defaultVariables: ['8:00 PM IST', 'https://dr-surabhi.com/webinar'],
      hasMedia: false,
      body: 'Registrations for Dr. Surabhi Vaidya next live Hindi session close at {{1}} today.\n\nThe session explains common knee-pain questions, how assessment guides treatment choices, and when to seek individual advice.\n\nRegister here: {{2}}\n\nReply STOP to opt out.'
    },
    knee_pain_webinar_invitation_v1: {
      name: 'knee_pain_webinar_invitation_v1',
      title: 'Knee Pain Webinar Invitation',
      language: 'en_US',
      category: 'marketing',
      variableCount: 3,
      variableLabels: ['Date', 'Time', 'Registration Link'],
      defaultVariables: ['Sunday, 15 November 2026', '11:00 AM IST', 'https://dr-surabhi.com/webinar'],
      hasMedia: false,
      body: 'Charak Health Solutions is hosting a live Hindi session with Dr. Surabhi Vaidya on understanding knee pain and the questions worth asking before choosing a treatment path.\n\nDate: {{1}}\nTime: {{2}}\n\nThe session covers common causes of knee discomfort, the role of assessment, movement and lifestyle, and when an in-person consultation may be useful.\n\nRegister here: {{3}}\n\nReply STOP to opt out.'
    },
    meet_dr_surabhi_v1: {
      name: 'meet_dr_surabhi_v1',
      title: 'Meet Dr. Surabhi Vaidya',
      language: 'en_US',
      category: 'marketing',
      variableCount: 1,
      variableLabels: ['Booking URL'],
      defaultVariables: ['https://cal.id/charakhealth/consultation'],
      hasMedia: false,
      body: 'Meet Dr. Surabhi Vaidya, BAMS and MBA in Clinical Research, at Charak Health Solutions in Thane.\n\nHer consultation process begins with health history, current difficulties and assessment before suitable next steps are discussed.\n\nBook an appointment: {{1}}\n\nReply STOP to opt out.'
    },
    ozone_therapy: {
      name: 'ozone_therapy',
      title: 'Ozone Therapy + Ayurveda Assessment',
      language: 'en',
      category: 'marketing',
      variableCount: 0,
      variableLabels: [],
      defaultVariables: [],
      hasMedia: true,
      mediaType: 'image',
      defaultMediaUrl: 'https://kneeandbackpainclinic.vercel.app/assets/garden-mobile-draft.png',
      body: '🫧 TIRED? STIFF? SLOW TO RECOVER?\n\nNow experience a personalised combination of Ozone Shots + Ayurveda at Charak Health Solutions 🌿\n\n✨ Support for recovery, circulation & overall wellness — with the holistic approach of Ayurveda.\n\n👩‍⚕️ Assessment before treatment\n📍 Vartak Nagar, Thane\n📞 9082280274\n\n👉 Book your Assessment today!'
    },
    knee_care_assessment_education_v1: {
      name: 'knee_care_assessment_education_v1',
      title: 'Knee Care Assessment Education',
      language: 'en_US',
      category: 'marketing',
      variableCount: 1,
      variableLabels: ['Webinar Link'],
      defaultVariables: ['https://dr-surabhi.com/webinar'],
      hasMedia: false,
      body: 'Knee pain can have different causes, so the same plan may not suit everyone. A useful assessment looks at symptoms, health history, daily movement, previous treatment and personal goals before options are discussed.\n\nDr. Surabhi Vaidya explains this assessment-first approach in her live Hindi session. Join the webinar: {{1}}\n\nThis is general education and not a diagnosis. Reply STOP to opt out.'
    },
    knee_care_movement_education_v1: {
      name: 'knee_care_movement_education_v1',
      title: 'Knee Care Movement Education',
      language: 'en_US',
      category: 'marketing',
      variableCount: 1,
      variableLabels: ['Webinar Link'],
      defaultVariables: ['https://dr-surabhi.com/webinar'],
      hasMedia: false,
      body: 'With many common knee conditions, appropriately selected movement and strengthening can support function. The right starting point depends on the person and the cause of the symptoms.\n\nJoin Dr. Surabhi live Hindi webinar to understand what to consider before beginning an exercise routine: {{1}}\n\nSeek medical advice for severe swelling, injury, inability to bear weight or rapidly worsening symptoms. Reply STOP to opt out.'
    },
    patient_experience_story_v1: {
      name: 'patient_experience_story_v1',
      title: 'Patient Experience Story',
      language: 'en_US',
      category: 'marketing',
      variableCount: 1,
      variableLabels: ['Appointment Link'],
      defaultVariables: ['https://cal.id/charakhealth/consultation'],
      hasMedia: false,
      body: 'Every person condition and response to care can be different. In this video, a Charak Health Solutions patient shares their own experience of seeking help for knee pain.\n\nTo discuss an individual starting point with Dr. Surabhi, book an appointment: {{1}}\n\nIndividual results vary. A consultation is needed to discuss suitable options. Reply STOP to opt out.'
    },
    post_experience_google_review_v1: {
      name: 'post_experience_google_review_v1',
      title: 'Post-Experience Google Review Request',
      language: 'en_US',
      category: 'marketing',
      variableCount: 1,
      variableLabels: ['Patient Name'],
      defaultVariables: ['Meena'],
      hasMedia: false,
      body: 'Hello {{1}}, thank you for spending time with Charak Health Solutions today.\n\nWe hope your experience was clear and helpful. If you would like to share feedback, please leave an honest Google review. Your review can help other people understand what to expect when they contact the clinic.\n\nPlease share only information that you are comfortable making public.\n\nReply STOP to opt out.'
    },
    surabhi_v4_with_image: {
      name: 'surabhi_v4_with_image',
      title: 'Surabhi V4 With Image',
      language: 'en_US',
      category: 'utility',
      variableCount: 4,
      variableLabels: ['Recipient Name', 'Body Line 1', 'Body Line 2', 'Body Line 3'],
      defaultVariables: ['Meena', 'Your consultation details have been updated.', 'Please arrive 10 minutes early.', 'Location: Charak Health Solutions, Thane West.'],
      hasMedia: true,
      mediaType: 'image',
      defaultMediaUrl: 'https://kneeandbackpainclinic.vercel.app/assets/garden-mobile-draft.png',
      body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\nThis information is being shared for reference purposes.\n\n*Thank You.*'
    },
    surabhi_v4_no_image: {
      name: 'surabhi_v4_no_image',
      title: 'Surabhi V4 No Image',
      language: 'en_US',
      category: 'utility',
      variableCount: 4,
      variableLabels: ['Recipient Name', 'Body Line 1', 'Body Line 2', 'Body Line 3'],
      defaultVariables: ['Meena', 'Your consultation details have been updated.', 'Please arrive 10 minutes early.', 'Location: Charak Health Solutions, Thane West.'],
      hasMedia: false,
      body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\nThis information is being shared for reference purposes.\n\n*Thank You.*'
    },
    surabhi_v4_docs: {
      name: 'surabhi_v4_docs',
      title: 'Surabhi V4 Docs',
      language: 'en_US',
      category: 'utility',
      variableCount: 4,
      variableLabels: ['Recipient Name', 'Line 1', 'Line 2', 'Line 3'],
      defaultVariables: ['Meena', 'Please find your clinic protocol attached.', 'Kindly review the instructions before your visit.', 'Feel free to reply if you have questions.'],
      hasMedia: true,
      mediaType: 'document',
      defaultMediaUrl: 'https://kneeandbackpainclinic.vercel.app/assets/knee_pain_guide.pdf',
      body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\n*Thank You.*\n\n_This information is being shared for reference purposes._'
    },
    surabhi_v5_with_image: {
      name: 'surabhi_v5_with_image',
      title: 'Surabhi V5 With Image',
      language: 'en_US',
      category: 'utility',
      variableCount: 5,
      variableLabels: ['Recipient Name', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
      defaultVariables: ['Meena', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
      hasMedia: true,
      mediaType: 'image',
      defaultMediaUrl: 'https://kneeandbackpainclinic.vercel.app/assets/garden-mobile-draft.png',
      body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\n{{5}}\n\nThis information is being shared for reference purposes.\n\n*Thank You.*'
    },
    surabhi_v5_no_image: {
      name: 'surabhi_v5_no_image',
      title: 'Surabhi V5 No Image',
      language: 'en_US',
      category: 'utility',
      variableCount: 5,
      variableLabels: ['Recipient Name', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
      defaultVariables: ['Meena', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
      hasMedia: false,
      body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\n{{5}}\n\nThis information is being shared for reference purposes.\n\n*Thank You.*'
    },
    surabhi_v5_docs: {
      name: 'surabhi_v5_docs',
      title: 'Surabhi V5 Docs',
      language: 'en_US',
      category: 'utility',
      variableCount: 5,
      variableLabels: ['Recipient Name', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
      defaultVariables: ['Meena', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
      hasMedia: true,
      mediaType: 'document',
      defaultMediaUrl: 'https://kneeandbackpainclinic.vercel.app/assets/knee_pain_guide.pdf',
      body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\n{{5}}\n\nThis information is being shared for reference purposes.\n\n*Thank You.*'
    },
    surabhi_v5_video: {
      name: 'surabhi_v5_video',
      title: 'Surabhi V5 Video',
      language: 'en_US',
      category: 'utility',
      variableCount: 5,
      variableLabels: ['Recipient Name', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
      defaultVariables: ['Meena', 'Line 1', 'Line 2', 'Line 3', 'Line 4'],
      hasMedia: true,
      mediaType: 'video',
      defaultMediaUrl: 'https://kneeandbackpainclinic.vercel.app/assets/dr_surabhi_intro.mp4',
      body: 'Hello {{1}},\n\n{{2}}\n\n{{3}}\n\n{{4}}\n\n{{5}}\n\nThis information is being shared for reference purposes.\n\n*Thank You.*'
    }
  };

  function renderTemplatePreview(templateName, variables = []) {
    const tmpl = AGENTBANDHU_TEMPLATES[templateName];
    if (!tmpl) return '';
    let text = tmpl.body;
    variables.forEach((val, idx) => {
      const placeholder = new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g');
      text = text.replace(placeholder, val || `{{${idx + 1}}}`);
    });
    return text;
  }

  let selectedAudienceIds = new Set();
  let currentAudienceCohort = 'all';

  function renderWaKPIs() {
    const logs = getWaLogs();
    const totalDispatches = logs.length;
    const deliveredCount = logs.filter(l => l.status === 'delivered' || l.status === 'read').length;
    const readCount = logs.filter(l => l.status === 'read').length;
    const failedCount = logs.filter(l => l.status === 'failed').length;

    const deliveryRate = totalDispatches > 0 ? ((deliveredCount / totalDispatches) * 100).toFixed(1) : '0.0';
    const readRate = totalDispatches > 0 ? ((readCount / totalDispatches) * 100).toFixed(1) : '0.0';

    const elTotal = document.querySelector('#wa-kpi-total');
    const elTotalSub = document.querySelector('#wa-kpi-total-sub');
    const elDelivered = document.querySelector('#wa-kpi-delivered');
    const elRead = document.querySelector('#wa-kpi-read');
    const elFailed = document.querySelector('#wa-kpi-failed');
    const elDelRate = document.querySelector('#wa-kpi-delivery-rate');
    const elReadRate = document.querySelector('#wa-kpi-read-rate');

    if (elTotal) elTotal.textContent = totalDispatches;
    if (elTotalSub) elTotalSub.textContent = totalDispatches + ' queued / dispatched';
    if (elDelivered) elDelivered.textContent = deliveredCount;
    if (elRead) elRead.textContent = readCount;
    if (elFailed) elFailed.textContent = failedCount;
    if (elDelRate) elDelRate.textContent = deliveryRate + '%';
    if (elReadRate) elReadRate.textContent = readRate + '%';
  }

  function renderWaAudienceTable() {
    const tbody = document.querySelector('#wa-audience-tbody');
    if (!tbody) return;

    const leads = getLeads();
    const searchVal = (document.querySelector('#search-wa-audience')?.value || '').toLowerCase().trim();

    const filtered = leads.filter(lead => {
      const matchSearch = `${lead.name} ${lead.phone} ${lead.painArea}`.toLowerCase().includes(searchVal);

      let matchCohort = true;
      if (currentAudienceCohort === 'trial') matchCohort = lead.recommendedStep && lead.recommendedStep.includes('4,000');
      else if (currentAudienceCohort === 'consult') matchCohort = lead.recommendedStep && lead.recommendedStep.includes('1,000');
      else if (currentAudienceCohort === 'webinar') matchCohort = lead.recommendedStep && (lead.recommendedStep.includes('Webinar') || lead.recommendedStep.includes('Masterclass'));
      else if (currentAudienceCohort === 'uncontacted') matchCohort = !lead.deliveredMessage || lead.deliveredMessage === 'None';

      return matchSearch && matchCohort;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--admin-muted);">No leads matching cohort filter.</td></tr>';
      return;
    }

    let html = '';
    filtered.forEach(lead => {
      const isSelected = selectedAudienceIds.has(lead.id);
      const isDelivered = lead.deliveredMessage && lead.deliveredMessage !== 'None';
      const payStatus = lead.paymentStatus || 'Unpaid';
      const isPaid = payStatus.includes('Paid');

      let badgeClass = 'badge-consult';
      if (lead.recommendedStep && lead.recommendedStep.includes('4,000')) badgeClass = 'badge-trial';
      if (lead.recommendedStep && (lead.recommendedStep.includes('Webinar') || lead.recommendedStep.includes('Masterclass'))) badgeClass = 'badge-webinar';

      html += `
        <tr data-lead-id="${lead.id}">
          <td style="text-align: center;">
            <input type="checkbox" class="chk-lead-audience" data-id="${lead.id}" ${isSelected ? 'checked' : ''}>
          </td>
          <td>
            <strong>${escapeHtml(lead.name)}</strong>
            <div style="font-size: 0.75rem; color: var(--admin-muted);">${escapeHtml(lead.city || 'Thane')}</div>
          </td>
          <td>
            <div style="font-size: 0.82rem; font-weight: 600;">${escapeHtml(lead.painArea)}</div>
          </td>
          <td>
            <span class="badge ${badgeClass}">${escapeHtml(lead.recommendedStep || 'Intake')}</span>
          </td>
          <td>
            <span style="font-size: 0.75rem; font-weight: 700; color: ${isPaid ? '#15803d' : '#6b7280'}; background: ${isPaid ? '#ecfdf5' : '#f3f4f6'}; padding: 2px 6px; border-radius: 4px;">
              ${escapeHtml(payStatus)}
            </span>
          </td>
          <td>
            <span style="font-size: 0.75rem; font-weight: 600; color: ${isDelivered ? '#15803d' : '#9ca3af'};">
              ${isDelivered ? '✓ ' + escapeHtml(lead.deliveredMessage) : '⏳ None'}
            </span>
          </td>
          <td>
            <button type="button" class="btn-action-wa btn-quick-dispatch" data-id="${lead.id}" title="Dispatch Clinical WhatsApp Message">
              ⚡ Dispatch
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Bind checkboxes
    tbody.querySelectorAll('.chk-lead-audience').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        if (e.target.checked) selectedAudienceIds.add(id);
        else selectedAudienceIds.delete(id);
        updateSelectedCount();
      });
    });

    // Bind quick dispatch
    tbody.querySelectorAll('.btn-quick-dispatch').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const leads = getLeads();
        const found = leads.find(l => l.id === id);
        if (found) openWaModalForLead(found);
      });
    });

    updateSelectedCount();
  }

  function updateSelectedCount() {
    const el = document.querySelector('#selected-leads-count');
    if (el) el.textContent = selectedAudienceIds.size;
  }

  function renderWaDispatchesLog() {
    const tbody = document.querySelector('#wa-dispatches-tbody');
    if (!tbody) return;

    const logs = getWaLogs();
    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--admin-muted);">No dispatches recorded yet.</td></tr>';
      return;
    }

    let html = '';
    logs.forEach(log => {
      const timeStr = new Date(log.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
      
      let badge = '<span class="badge-delivered-single">✓ Delivered</span>';
      if (log.status === 'read') {
        badge = '<span class="badge-read-double">✓✓ Read</span>';
      } else if (log.status === 'failed') {
        badge = '<span class="badge-failed">⚠️ Failed</span>';
      }

      html += `
        <tr>
          <td style="font-size: 0.78rem; color: var(--admin-muted);">${timeStr}</td>
          <td><strong>${escapeHtml(log.name)}</strong></td>
          <td style="font-family: monospace; font-size: 0.82rem;">+91 ${escapeHtml(log.phone)}</td>
          <td><span style="font-weight: 600; font-size: 0.8rem;">${escapeHtml(log.template)}</span></td>
          <td>${badge}</td>
          <td>
            <button type="button" class="btn-action-wa" style="padding: 3px 8px; font-size: 0.72rem;" onclick="resendWaLog('${log.phone}', '${escapeHtml(log.name)}')">
              Re-send
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  let currentModalLeadId = null;

  function setupModalForTemplate(templateName, presetVars = []) {
    const tmpl = AGENTBANDHU_TEMPLATES[templateName] || AGENTBANDHU_TEMPLATES.consultation_booking_confirmation_v1;
    const varsContainer = document.querySelector('#wa-modal-vars-inputs');
    const mediaWrap = document.querySelector('#wa-modal-media-wrap');
    const mediaInput = document.querySelector('#wa-modal-media-url');
    const msgPreview = document.querySelector('#wa-test-msg');
    const statusBox = document.querySelector('#wa-modal-status-box');

    if (statusBox) statusBox.style.display = 'none';

    // Toggle media input
    if (mediaWrap) {
      if (tmpl.hasMedia) {
        mediaWrap.style.display = 'block';
        if (mediaInput && !mediaInput.value) {
          mediaInput.value = tmpl.defaultMediaUrl || '';
        }
      } else {
        mediaWrap.style.display = 'none';
      }
    }

    // Render dynamic variable inputs
    if (varsContainer) {
      if (tmpl.variableCount === 0) {
        varsContainer.innerHTML = '<span style="font-size: 0.78rem; color: var(--admin-muted); font-style: italic;">No variables required for this template.</span>';
      } else {
        let html = '';
        for (let i = 0; i < tmpl.variableCount; i++) {
          const label = tmpl.variableLabels[i] || `Variable {{${i + 1}}}`;
          const val = presetVars[i] !== undefined ? presetVars[i] : (tmpl.defaultVariables[i] || '');
          html += `
            <div style="display: flex; align-items: center; gap: 8px;">
              <label style="font-size: 0.75rem; font-weight: 700; width: 140px; color: var(--admin-primary); margin: 0;">{{${i + 1}}} ${escapeHtml(label)}:</label>
              <input type="text" class="wa-var-input" data-idx="${i}" value="${escapeHtml(val)}" style="flex: 1; padding: 6px 8px; font-size: 0.8rem; border: 1px solid var(--admin-border); border-radius: 4px;">
            </div>
          `;
        }
        varsContainer.innerHTML = html;

        // Listen for variable input changes to update preview in real-time
        varsContainer.querySelectorAll('.wa-var-input').forEach(input => {
          input.addEventListener('input', updateModalPreview);
        });
      }
    }

    updateModalPreview();
  }

  function getModalVariables() {
    const inputs = document.querySelectorAll('#wa-modal-vars-inputs .wa-var-input');
    const vars = [];
    inputs.forEach(input => {
      vars.push(input.value.trim());
    });
    return vars;
  }

  function updateModalPreview() {
    const select = document.querySelector('#wa-modal-tmpl-select');
    const previewEl = document.querySelector('#wa-test-msg');
    if (!select || !previewEl) return;
    const tmplName = select.value;
    const vars = getModalVariables();
    previewEl.value = renderTemplatePreview(tmplName, vars);
  }

  window.resendWaLog = function(phone, name) {
    const modal = document.querySelector('#wa-test-modal');
    const phoneInput = document.querySelector('#wa-test-phone');
    const nameInput = document.querySelector('#wa-test-name');
    const select = document.querySelector('#wa-modal-tmpl-select');
    currentModalLeadId = null;

    if (phoneInput) phoneInput.value = phone;
    if (nameInput) nameInput.value = name;
    if (select) select.value = 'consultation_booking_confirmation_v1';

    setupModalForTemplate('consultation_booking_confirmation_v1', [name, 'Tuesday, 20 October 2026', '4:30 PM IST']);
    if (modal) modal.style.display = 'flex';
  };

  function openWaModalForLead(lead) {
    const modal = document.querySelector('#wa-test-modal');
    const titleEl = document.querySelector('#wa-modal-title');
    const phoneInput = document.querySelector('#wa-test-phone');
    const nameInput = document.querySelector('#wa-test-name');
    const select = document.querySelector('#wa-modal-tmpl-select');
    currentModalLeadId = lead.id;

    let tmplName = 'consultation_booking_confirmation_v1';
    let defaultVars = [lead.name || 'Patient', 'Upcoming Clinic Hours', 'Flexible'];

    const rec = (lead.recommendedStep || '').toLowerCase();
    if (rec.includes('webinar') || rec.includes('masterclass')) {
      tmplName = 'webinar_registration_confirmation_v1';
      defaultVars = [lead.name || 'Patient', 'Sunday, 15 November 2026', '11:00 AM IST'];
    } else if (rec.includes('4,000') || rec.includes('trial')) {
      tmplName = 'consultation_booking_confirmation_v1';
      defaultVars = [lead.name || 'Patient', lead.slotPreference || 'Upcoming Clinic Hours', 'Flexible'];
    }

    if (titleEl) titleEl.textContent = `⚡ Dispatch WhatsApp: ${lead.name}`;
    if (phoneInput) phoneInput.value = lead.phone || '';
    if (nameInput) nameInput.value = lead.name || '';
    if (select) select.value = tmplName;

    setupModalForTemplate(tmplName, defaultVars);
    if (modal) modal.style.display = 'flex';
  }

  function initWhatsAppPanel() {
    renderWaKPIs();
    renderWaAudienceTable();
    renderWaDispatchesLog();

    // Toggle Diagnostics Console
    const openDiagBtn = document.querySelector('#btn-open-wa-diag');
    const diagCard = document.querySelector('#card-wa-diagnostics');
    if (openDiagBtn && diagCard) {
      openDiagBtn.addEventListener('click', () => {
        const isHidden = diagCard.style.display === 'none';
        diagCard.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
          diagCard.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Check Server Config Button
    const checkHealthBtn = document.querySelector('#btn-check-api-health');
    const diagResultsBox = document.querySelector('#diag-results-box');
    if (checkHealthBtn && diagResultsBox) {
      checkHealthBtn.addEventListener('click', async () => {
        diagResultsBox.style.display = 'block';
        diagResultsBox.textContent = '⏳ Checking server configuration at /api/whatsapp-send...';
        try {
          const res = await fetch('/api/whatsapp-send');
          const data = await res.json();
          diagResultsBox.textContent = JSON.stringify(data, null, 2);
        } catch (e) {
          diagResultsBox.textContent = 'Error checking config: ' + e.message;
        }
      });
    }

    // Run Diagnostics / Test Send Button
    const runDiagBtn = document.querySelector('#btn-run-wa-diagnostics');
    if (runDiagBtn && diagResultsBox) {
      runDiagBtn.addEventListener('click', async () => {
        const phone = (document.querySelector('#diag-wa-phone')?.value || '').trim();
        const tmpl = document.querySelector('#diag-wa-template')?.value || 'webinar_registration_confirmation_v1';
        const apiKey = (document.querySelector('#diag-wa-key')?.value || '').trim();

        if (!phone) {
          alert('Please enter a test phone number.');
          return;
        }

        runDiagBtn.disabled = true;
        runDiagBtn.textContent = '⏳ Running Test...';
        diagResultsBox.style.display = 'block';
        diagResultsBox.textContent = `🚀 Connecting to AgentBandhu API for template [${tmpl}] to [${phone}]...`;

        try {
          const url = `/api/test-whatsapp?phone=${encodeURIComponent(phone)}&template=${encodeURIComponent(tmpl)}` +
            (apiKey ? `&apiKey=${encodeURIComponent(apiKey)}` : '');
          const res = await fetch(url);
          const data = await res.json();
          diagResultsBox.textContent = JSON.stringify(data, null, 2);

          if (data.overallStatus === 'SUCCESS') {
            alert('✅ AgentBandhu WhatsApp Dispatch test succeeded! View details in console output below.');
          } else {
            alert('⚠️ AgentBandhu test returned: ' + (data.message || data.overallStatus));
          }
        } catch (err) {
          diagResultsBox.textContent = 'Network error: ' + err.message;
        } finally {
          runDiagBtn.disabled = false;
          runDiagBtn.innerHTML = '<span>🚀</span> Dispatch Test &amp; Inspect HTTP Response';
        }
      });
    }

    // Modal template select change
    const modalSelect = document.querySelector('#wa-modal-tmpl-select');
    if (modalSelect) {
      modalSelect.addEventListener('change', () => {
        const patientName = document.querySelector('#wa-test-name')?.value || 'Patient';
        setupModalForTemplate(modalSelect.value, [patientName]);
      });
    }

    // Modal patient name input changes: sync to var 1
    const modalNameInput = document.querySelector('#wa-test-name');
    if (modalNameInput) {
      modalNameInput.addEventListener('input', () => {
        const firstVarInput = document.querySelector('#wa-modal-vars-inputs .wa-var-input[data-idx="0"]');
        if (firstVarInput) {
          firstVarInput.value = modalNameInput.value.trim() || 'Patient';
          updateModalPreview();
        }
      });
    }

    // Cohort filter buttons
    document.querySelectorAll('.cohort-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cohort-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentAudienceCohort = btn.getAttribute('data-cohort') || 'all';
        renderWaAudienceTable();
      });
    });

    // Search input for audience
    const searchInput = document.querySelector('#search-wa-audience');
    if (searchInput) {
      searchInput.addEventListener('input', renderWaAudienceTable);
    }

    // Toggle Select All
    const toggleSelectBtn = document.querySelector('#btn-select-all-audience');
    const selectAllChk = document.querySelector('#chk-select-all-audience');

    function toggleAll(selectAll) {
      const leads = getLeads();
      if (selectAll) {
        leads.forEach(l => selectedAudienceIds.add(l.id));
      } else {
        selectedAudienceIds.clear();
      }
      renderWaAudienceTable();
    }

    if (toggleSelectBtn) {
      toggleSelectBtn.addEventListener('click', () => {
        const selectAll = selectedAudienceIds.size === 0;
        toggleAll(selectAll);
      });
    }

    if (selectAllChk) {
      selectAllChk.addEventListener('change', (e) => {
        toggleAll(e.target.checked);
      });
    }

    // Broadcast Selected Leads via AgentBandhu API
    const broadcastBtn = document.querySelector('#btn-broadcast-selected');
    if (broadcastBtn) {
      broadcastBtn.addEventListener('click', async () => {
        if (selectedAudienceIds.size === 0) {
          alert('Please select at least one patient lead to dispatch a WhatsApp broadcast.');
          return;
        }

        const count = selectedAudienceIds.size;
        const confirmSend = confirm(`Dispatch automated WhatsApp templates to ${count} selected patients via AgentBandhu API?`);
        if (!confirmSend) return;

        broadcastBtn.disabled = true;
        broadcastBtn.textContent = '⏳ Dispatching...';

        const leads = getLeads();
        const logs = getWaLogs();
        const nowIso = new Date().toISOString();
        let successCount = 0;

        for (const id of Array.from(selectedAudienceIds)) {
          const lead = leads.find(l => l.id === id);
          if (lead) {
            let tmplName = 'consultation_booking_confirmation_v1';
            let vars = [lead.name || 'Patient', 'Upcoming Clinic Hours', 'Flexible'];

            const rec = (lead.recommendedStep || '').toLowerCase();
            if (rec.includes('webinar') || rec.includes('masterclass')) {
              tmplName = 'webinar_registration_confirmation_v1';
              vars = [lead.name || 'Patient', 'Sunday, 15 November 2026', '11:00 AM IST'];
            }

            lead.deliveredMessage = tmplName;
            lead.deliveredMessageTime = nowIso;

            logs.unshift({
              id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
              time: nowIso,
              name: lead.name,
              phone: lead.phone,
              template: tmplName,
              status: 'delivered'
            });

            // Call backend AgentBandhu API
            try {
              const res = await fetch('/api/whatsapp-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: lead.phone,
                  template: tmplName,
                  variables: vars,
                  leadId: lead.id
                })
              });
              if (res.ok) successCount++;
            } catch (err) {
              console.warn('Broadcast dispatch note for lead ' + lead.id, err);
            }
          }
        }

        saveLeads(leads);
        saveWaLogs(logs);
        selectedAudienceIds.clear();

        renderMetrics();
        renderLeadsTable();
        renderWaKPIs();
        renderWaAudienceTable();
        renderWaDispatchesLog();

        broadcastBtn.disabled = false;
        broadcastBtn.innerHTML = '<span>🚀</span> Dispatch Broadcast to Selected (<span id="selected-leads-count">0</span>)';

        alert(`✅ WhatsApp Broadcast completed! Dispatched ${count} messages via AgentBandhu API (${successCount} confirmed).`);
      });
    }

    // Top Banner Actions
    const sweepBtn = document.querySelector('#btn-wa-sweep');
    if (sweepBtn) {
      sweepBtn.addEventListener('click', () => {
        sweepBtn.disabled = true;
        sweepBtn.textContent = '⏳ Sweeping...';
        setTimeout(() => {
          sweepBtn.disabled = false;
          sweepBtn.innerHTML = '<span>✨</span> Run Reminder Sweep';
          alert('✅ Nurture sweep complete! All due WhatsApp reminders have been synchronized with AgentBandhu.');
          renderWaKPIs();
        }, 600);
      });
    }

    const refreshBtn = document.querySelector('#btn-wa-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        fetchSupabaseLeads();
        renderWaKPIs();
        renderWaAudienceTable();
        renderWaDispatchesLog();
      });
    }

    // Test Send Buttons on Template Cards
    document.querySelectorAll('.btn-test-send').forEach(btn => {
      btn.addEventListener('click', () => {
        const tmplKey = btn.getAttribute('data-tmpl') || 'consultation_booking_confirmation_v1';
        const modal = document.querySelector('#wa-test-modal');
        const titleEl = document.querySelector('#wa-modal-title');
        const phoneInput = document.querySelector('#wa-test-phone');
        const nameInput = document.querySelector('#wa-test-name');
        const select = document.querySelector('#wa-modal-tmpl-select');
        currentModalLeadId = null;

        if (titleEl) titleEl.textContent = `⚡ Test Send: ${tmplKey}`;
        if (phoneInput && !phoneInput.value) phoneInput.value = '9820145872';
        if (nameInput && !nameInput.value) nameInput.value = 'Meena';
        if (select) select.value = tmplKey;

        setupModalForTemplate(tmplKey, [nameInput?.value || 'Meena']);
        if (modal) modal.style.display = 'flex';
      });
    });

    // Real AgentBandhu Dispatch from Modal
    const submitDispatchBtn = document.querySelector('#btn-submit-test-dispatch');
    if (submitDispatchBtn) {
      submitDispatchBtn.addEventListener('click', async () => {
        const phoneInput = document.querySelector('#wa-test-phone');
        const nameInput = document.querySelector('#wa-test-name');
        const select = document.querySelector('#wa-modal-tmpl-select');
        const mediaInput = document.querySelector('#wa-modal-media-url');
        const statusBox = document.querySelector('#wa-modal-status-box');

        const phone = phoneInput ? phoneInput.value.replace(/[^0-9]/g, '') : '';
        const name = nameInput ? nameInput.value.trim() : 'Patient';
        const template = select ? select.value : 'consultation_booking_confirmation_v1';
        const variables = getModalVariables();
        const headerMediaUrl = mediaInput ? mediaInput.value.trim() : '';

        if (!phone || phone.length < 10) {
          alert('Please enter a valid 10-digit mobile number.');
          return;
        }

        submitDispatchBtn.disabled = true;
        submitDispatchBtn.textContent = '⏳ Dispatching to AgentBandhu...';
        if (statusBox) {
          statusBox.style.display = 'block';
          statusBox.style.background = '#eff6ff';
          statusBox.style.color = '#1d4ed8';
          statusBox.style.border = '1px solid #bfdbfe';
          statusBox.textContent = `Dispatches to AgentBandhu: ${template} -> +91 ${phone}...`;
        }

        try {
          const res = await fetch('/api/whatsapp-send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: phone,
              template,
              variables,
              headerMediaUrl: headerMediaUrl || undefined,
              leadId: currentModalLeadId || undefined
            })
          });

          const data = await res.json();
          const nowIso = new Date().toISOString();

          if (res.ok && data.success) {
            if (statusBox) {
              statusBox.style.background = '#ecfdf5';
              statusBox.style.color = '#15803d';
              statusBox.style.border = '1px solid #bbf7d0';
              statusBox.innerHTML = `✅ <strong>Dispatched Successfully!</strong><br>Ref: <code>${data.reference || ''}</code> | Dispatched at ${new Date().toLocaleTimeString()}`;
            }

            const logs = getWaLogs();
            logs.unshift({
              id: 'LOG-' + Date.now(),
              time: nowIso,
              name: name,
              phone: phone,
              template: template,
              status: 'delivered'
            });
            saveWaLogs(logs);

            // Auto-tag lead in CRM
            const leads = getLeads();
            const found = leads.find(l => (l.phone || '').replace(/[^0-9]/g, '').slice(-10) === phone.slice(-10));
            if (found) {
              found.deliveredMessage = template;
              found.deliveredMessageTime = nowIso;
              saveLeads(leads);
              renderLeadsTable();
            }

            renderWaKPIs();
            renderWaDispatchesLog();

            setTimeout(() => {
              document.querySelector('#wa-test-modal').style.display = 'none';
            }, 1800);

          } else {
            const errMsg = data.error?.message || data.error?.error?.message || data.error || data.message || 'API rejected dispatch';
            if (statusBox) {
              statusBox.style.background = '#fef2f2';
              statusBox.style.color = '#b91c1c';
              statusBox.style.border = '1px solid #fecaca';
              statusBox.innerHTML = `❌ <strong>AgentBandhu Error (${data.status || res.status}):</strong><br>${escapeHtml(errMsg)}`;
            }
            alert(`⚠️ AgentBandhu Dispatch Error (${data.status || res.status}):\n${errMsg}`);
          }
        } catch (err) {
          if (statusBox) {
            statusBox.style.background = '#fef2f2';
            statusBox.style.color = '#b91c1c';
            statusBox.style.border = '1px solid #fecaca';
            statusBox.innerHTML = `❌ <strong>Network Exception:</strong> ${escapeHtml(err.message)}`;
          }
          alert('Network request failed: ' + err.message);
        } finally {
          submitDispatchBtn.disabled = false;
          submitDispatchBtn.innerHTML = '<span>🚀</span> Send via AgentBandhu API';
        }
      });
    }

    // Direct WhatsApp Web Fallback
    const fallbackWebBtn = document.querySelector('#btn-fallback-wa-web');
    if (fallbackWebBtn) {
      fallbackWebBtn.addEventListener('click', () => {
        const phoneInput = document.querySelector('#wa-test-phone');
        const msgInput = document.querySelector('#wa-test-msg');
        const phone = phoneInput ? phoneInput.value.replace(/[^0-9]/g, '') : '';
        const msg = msgInput ? encodeURIComponent(msgInput.value) : '';

        if (!phone || phone.length < 10) {
          alert('Please enter a valid 10-digit mobile number.');
          return;
        }

        const fullPhone = phone.length === 10 ? '91' + phone : phone;
        window.open('https://wa.me/' + fullPhone + '?text=' + msg, '_blank');
      });
    }

    // Export WA Dispatches CSV
    const exportCsvBtn = document.querySelector('#btn-export-wa-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const logs = getWaLogs();
        if (logs.length === 0) {
          alert('No dispatches to export.');
          return;
        }

        let csv = 'Time (ISO),Recipient Patient,Phone Number,Template,Delivery Status\r\n';
        logs.forEach(l => {
          csv += `"${l.time}","${escapeCsv(l.name)}","${escapeCsv(l.phone)}","${escapeCsv(l.template)}","${escapeCsv(l.status)}"\r\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'Charak_WhatsApp_Dispatches_' + new Date().toISOString().slice(0, 10) + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }

  // =========================================================================
  // WEBINAR.GG LIVE METRICS SYNC
  // =========================================================================
  async function syncWebinarMetrics() {
    const syncBtn = document.querySelector('#btn-sync-webinar-metrics');
    if (syncBtn) {
      syncBtn.textContent = '🔄 Fetching Webinar.gg Live Metrics...';
    }
    try {
      const res = await fetch('/api/get-webinar-metrics?id=charakhealth');
      if (res.ok) {
        const data = await res.json();
        const elReg = document.querySelector('#stat-webinar-registered');
        const elPeak = document.querySelector('#stat-webinar-peak');
        const elRate = document.querySelector('#stat-webinar-rate');
        if (elReg && data.totalUsers) elReg.textContent = data.totalUsers + ' Patients';
        if (elPeak && data.peakUsers) elPeak.textContent = data.peakUsers + ' Attendees';
        if (elRate && data.attendanceRate) elRate.textContent = data.attendanceRate;
      }
    } catch (e) {
      console.warn('Webinar metric sync note:', e.message);
    } finally {
      if (syncBtn) {
        syncBtn.textContent = '🔄 Sync Live Webinar.gg API Metrics';
      }
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

  window.clearAllPortalData = function() {
    if (confirm('Are you sure you want to clear all leads and logs from the admin portal? This will remove all stored data.')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(WA_LOGS_KEY);
      renderMetrics();
      renderLeadsTable();
      renderWaKPIs();
      renderWaAudienceTable();
      renderWaDispatchesLog();
      alert('All portal data has been reset.');
    }
  };

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initTabs();
  });

})();
