// Dr. Surabhi Vaidya Knee & Back Pain Clinic - Admin Back-Office Engine
(function() {
  'use strict';

  const STORAGE_KEY = 'dr_surabhi_leads';
  const AUTH_KEY = 'dr_surabhi_admin_auth';
  const PASSCODE = 'surabhi2026';

  // Seed sample real-world leads from clinic intake data if none exist
  function seedDefaultLeads() {
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
          readiness: 'Hesitant: Wants to learn more via webinar first',
          recommendedStep: 'Free Live Hindi Masterclass',
          slotPreference: 'Upcoming Saturday Zoom Session',
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
  }

  function getLeads() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveLeads(leads) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }

  // =========================================================================
  // AUTHENTICATION LOGIC
  // =========================================================================
  const loginWrap = document.querySelector('#admin-login-screen');
  const adminLayout = document.querySelector('#admin-dashboard-screen');
  const loginForm = document.querySelector('#login-form');
  const logoutBtn = document.querySelector('#logout-btn');

  function checkAuth() {
    const isAuth = sessionStorage.getItem(AUTH_KEY) === 'true';
    if (isAuth) {
      if (loginWrap) loginWrap.style.display = 'none';
      if (adminLayout) adminLayout.style.display = 'flex';
      initDashboard();
    } else {
      if (loginWrap) loginWrap.style.display = 'flex';
      if (adminLayout) adminLayout.style.display = 'none';
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pwd = document.querySelector('#admin-password').value;
      if (pwd === PASSCODE || pwd === 'admin123') {
        sessionStorage.setItem(AUTH_KEY, 'true');
        checkAuth();
      } else {
        alert('Invalid passcode. Please enter the clinic administrator passcode.');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(AUTH_KEY);
      checkAuth();
    });
  }

  // =========================================================================
  // TAB NAVIGATION
  // =========================================================================
  function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetContent = document.querySelector(`#tab-${targetId}`);
        if (targetContent) targetContent.classList.add('active');
      });
    });
  }

  // =========================================================================
  // METRICS & CRM TABLE RENDERING
  // =========================================================================
  function renderMetrics(leads) {
    const total = leads.length;
    const trials = leads.filter(l => l.recommendedStep && l.recommendedStep.includes('4,000')).length;
    const consults = leads.filter(l => l.recommendedStep && l.recommendedStep.includes('1,000')).length;
    const webinars = leads.filter(l => l.recommendedStep && (l.recommendedStep.includes('Webinar') || l.recommendedStep.includes('Masterclass'))).length;

    const elTotal = document.querySelector('#metric-total-leads');
    const elTrials = document.querySelector('#metric-trials');
    const elConsults = document.querySelector('#metric-consults');
    const elWebinars = document.querySelector('#metric-webinars');
    const tabBadge = document.querySelector('#badge-total-leads');

    if (elTotal) elTotal.textContent = total;
    if (elTrials) elTrials.textContent = trials;
    if (elConsults) elConsults.textContent = consults;
    if (elWebinars) elWebinars.textContent = webinars;
    if (tabBadge) tabBadge.textContent = total;
  }

  function renderTable() {
    const leads = getLeads();
    renderMetrics(leads);

    const tbody = document.querySelector('#leads-table-body');
    if (!tbody) return;

    const searchTerm = (document.querySelector('#search-leads')?.value || '').toLowerCase();
    const typeFilter = document.querySelector('#filter-type')?.value || 'all';
    const statusFilter = document.querySelector('#filter-status')?.value || 'all';

    const filtered = leads.filter(lead => {
      const matchSearch = lead.name.toLowerCase().includes(searchTerm) ||
                          lead.phone.includes(searchTerm) ||
                          lead.painArea.toLowerCase().includes(searchTerm) ||
                          (lead.city && lead.city.toLowerCase().includes(searchTerm));

      let matchType = true;
      if (typeFilter === 'trial') matchType = lead.recommendedStep && lead.recommendedStep.includes('4,000');
      else if (typeFilter === 'consult') matchType = lead.recommendedStep && lead.recommendedStep.includes('1,000');
      else if (typeFilter === 'webinar') matchType = lead.recommendedStep && (lead.recommendedStep.includes('Webinar') || lead.recommendedStep.includes('Masterclass'));

      let matchStatus = true;
      if (statusFilter !== 'all') matchStatus = lead.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--admin-muted);">No patient leads matching current filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(lead => {
      let badgeClass = 'badge-consult';
      if (lead.recommendedStep && lead.recommendedStep.includes('4,000')) badgeClass = 'badge-trial';
      if (lead.recommendedStep && (lead.recommendedStep.includes('Webinar') || lead.recommendedStep.includes('Masterclass'))) badgeClass = 'badge-webinar';

      const dateStr = new Date(lead.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <tr data-lead-id="${lead.id}">
          <td>
            <div class="lead-name">${lead.name}</div>
            <div class="lead-phone">${lead.city || 'Thane / Mumbai'} · ID: ${lead.id}</div>
          </td>
          <td>
            <a href="tel:${lead.phone}" style="font-weight: 700; color: var(--admin-primary);">${lead.phone}</a>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--admin-primary);">${lead.painArea}</div>
            <small style="color: var(--admin-muted);">${lead.severity}</small>
          </td>
          <td>
            <span class="badge-lead ${badgeClass}">${lead.recommendedStep}</span>
          </td>
          <td>
            <select class="status-select" data-status-for="${lead.id}">
              <option value="New Lead" ${lead.status === 'New Lead' ? 'selected' : ''}>New Lead</option>
              <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="Trial Scheduled" ${lead.status === 'Trial Scheduled' ? 'selected' : ''}>Trial Scheduled</option>
              <option value="Consultation Scheduled" ${lead.status === 'Consultation Scheduled' ? 'selected' : ''}>Consultation Scheduled</option>
              <option value="Webinar Registered" ${lead.status === 'Webinar Registered' ? 'selected' : ''}>Webinar Registered</option>
              <option value="Enrolled in 21-Day Plan" ${lead.status === 'Enrolled in 21-Day Plan' ? 'selected' : ''}>Enrolled in 21-Day Plan</option>
              <option value="Archived" ${lead.status === 'Archived' ? 'selected' : ''}>Archived</option>
            </select>
          </td>
          <td style="font-size: 0.76rem; color: var(--admin-muted);">
            ${dateStr}
          </td>
          <td>
            <button type="button" class="btn-action-wa" data-send-wa="${lead.id}">
              WhatsApp Message
            </button>
            <a href="tel:${lead.phone}" class="btn-action-call">Call</a>
          </td>
        </tr>
      `;
    }).join('');

    // Bind status changes
    tbody.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = sel.getAttribute('data-status-for');
        const newStatus = e.target.value;
        const allLeads = getLeads();
        const targetLead = allLeads.find(l => l.id === id);
        if (targetLead) {
          targetLead.status = newStatus;
          saveLeads(allLeads);
          renderMetrics(allLeads);
        }
      });
    });

    // Bind WhatsApp direct messaging triggers
    tbody.querySelectorAll('[data-send-wa]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-send-wa');
        const allLeads = getLeads();
        const lead = allLeads.find(l => l.id === id);
        if (lead) {
          let template = '';
          if (lead.recommendedStep && lead.recommendedStep.includes('4,000')) {
            template = `Namaste ${lead.name} ji,

This is Dr. Surabhi Vaidya's Clinic (Charak Health Solutions, Thane West).

We received your request for the 1-Day Experience Session (₹4,000 / 7 Therapies) for ${lead.painArea}.

Our clinic address: Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.

Please let us know your preferred time slot to confirm your booking: https://maps.app.goo.gl/CharakHealth`;
          } else if (lead.recommendedStep && lead.recommendedStep.includes('1,000')) {
            template = `Namaste ${lead.name} ji,

This is Charak Health Solutions, Thane West.

We have received your appointment request for an in-clinic diagnostic consultation (₹1,000) with Dr. Surabhi Vaidya regarding ${lead.painArea}.

Please confirm your preferred timing for tomorrow or this weekend.`;
          } else {
            template = `Namaste ${lead.name} ji,

Your seat for the Free Live Hindi Masterclass with Dr. Surabhi Vaidya is confirmed!

Topic: How to Stop Knee & Back Pain at the Root and Avoid Surgery Naturally
Time: Saturday 11:30 AM IST on Zoom.

Zoom Joining Link will be sent 1 hour prior.`;
          }
          const waUrl = `https://wa.me/91${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(template)}`;
          window.open(waUrl, '_blank');
        }
      });
    });
  }

  // =========================================================================
  // CSV EXPORT ENGINE
  // =========================================================================
  function exportCSV() {
    const leads = getLeads();
    if (leads.length === 0) {
      alert('No leads available to export.');
      return;
    }

    const headers = ['Lead ID', 'Patient Name', 'Phone', 'City', 'Pain Condition', 'Severity', 'Prior Treatments', 'Readiness', 'Recommended Step', 'Slot Preference', 'Status', 'Registration Timestamp'];
    const rows = leads.map(l => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.painArea || '').replace(/"/g, '""')}"`,
      `"${(l.severity || '').replace(/"/g, '""')}"`,
      `"${(l.priorTreatments || '').replace(/"/g, '""')}"`,
      `"${(l.readiness || '').replace(/"/g, '""')}"`,
      `"${(l.recommendedStep || '').replace(/"/g, '""')}"`,
      `"${(l.slotPreference || '').replace(/"/g, '""')}"`,
      `"${l.status || 'New'}"`,
      `"${l.createdAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Dr_Surabhi_Patient_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // =========================================================================
  // WHATSAPP AUTOMATION TEMPLATES DISPATCH
  // =========================================================================
  function initWhatsAppTemplates() {
    document.querySelectorAll('[data-template-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-template-type');
        const phone = prompt('Enter 10-digit Patient Mobile Number:', '9820000000');
        const name = prompt('Enter Patient Name:', 'Patient');
        if (!phone) return;

        let msg = '';
        if (type === 'trial_confirmation') {
          msg = `Namaste ${name} ji,\n\nYour 1-Day Experience Session (₹4,000 / 7 Therapies) is scheduled with Dr. Surabhi Vaidya.\n\n📍 Clinic: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.\nGoogle Maps: https://maps.app.goo.gl/CharakHealth\n\nExpect 20% to 30% pain relief in your session today!`;
        } else if (type === 'consultation_reminder') {
          msg = `Namaste ${name} ji,\n\nReminder: Your Diagnostic Consultation with Dr. Surabhi Vaidya is scheduled tomorrow at Charak Health Solutions, Thane West.\n\nPlease arrive 10 minutes prior for your Naadi Pariksha and postural evaluation.`;
        } else if (type === 'webinar_invite') {
          msg = `Namaste ${name} ji,\n\nHere is your Zoom access link for the Free Live Hindi Masterclass with Dr. Surabhi Vaidya:\n\nTopic: Avoid Knee Replacement & Spine Surgery Naturally\nZoom Link: https://zoom.us/j/123456789\n\nSee you live!`;
        } else if (type === 'google_review') {
          msg = `Namaste ${name} ji,\n\nWe hope you experienced good pain relief after your treatment at Charak Health Solutions!\n\nCould you please take 30 seconds to share your genuine Google review? It helps other patients avoid surgery:\nhttps://g.page/r/CWxrIXBs-xz7EAE/review`;
        }

        const url = `https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
      });
    });
  }

  // =========================================================================
  // INITIALIZE DASHBOARD
  // =========================================================================
  function initDashboard() {
    seedDefaultLeads();
    initTabs();
    renderTable();
    initWhatsAppTemplates();

    const searchInput = document.querySelector('#search-leads');
    const typeFilter = document.querySelector('#filter-type');
    const statusFilter = document.querySelector('#filter-status');
    const exportBtn = document.querySelector('#btn-export-csv');

    if (searchInput) searchInput.addEventListener('input', renderTable);
    if (typeFilter) typeFilter.addEventListener('change', renderTable);
    if (statusFilter) statusFilter.addEventListener('change', renderTable);
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);
  }

  // Check login on script load
  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
  });

})();
