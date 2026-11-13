// ==============================================================================
// CHARAK HEALTH SOLUTIONS - CLINIC CRM & STAFF ADMINISTRATION
// Server-Authenticated Back-Office Controller & Real-Time Sync
// ==============================================================================

(function() {
  'use strict';

  const AUTH_STORAGE_KEY = 'clinic_admin_token';
  let cachedLeads = [];
  let activeEditingLeadId = null;

  // --------------------------------------------------------------------------
  // 1. AUTHENTICATION (SERVER-VERIFIED)
  // --------------------------------------------------------------------------
  const loginOverlay = document.getElementById('login-overlay');
  const adminApp = document.getElementById('admin-app');
  const loginForm = document.getElementById('admin-login-form');
  const passcodeInput = document.getElementById('admin-passcode');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  function getAuthToken() {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY) || '';
  }

  function setAuthToken(token) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, token);
  }

  function clearAuthToken() {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  async function checkAuthAndInit() {
    const token = getAuthToken();
    if (!token) {
      showLogin();
      return;
    }

    // Verify token against /api/leads
    try {
      const resp = await fetch('/api/leads', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Admin-Key': token
        }
      });

      if (resp.status === 401) {
        clearAuthToken();
        showLogin('Session expired or invalid credentials. Please log in again.');
      } else {
        showApp();
        initDashboard();
        handleLeadsResponse(resp);
      }
    } catch (netErr) {
      showApp();
      showErrorBanner('Network notice: Unable to contact server. Checking local mode...');
    }
  }

  function showLogin(msg) {
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (adminApp) adminApp.style.display = 'none';
    if (loginError) {
      if (msg) {
        loginError.textContent = msg;
        loginError.style.display = 'block';
      } else {
        loginError.style.display = 'none';
      }
    }
    if (passcodeInput) passcodeInput.focus();
  }

  function showApp() {
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (adminApp) adminApp.style.display = 'block';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const enteredCode = (passcodeInput?.value || '').trim();
      if (!enteredCode) return;

      const submitBtn = document.getElementById('login-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Authenticating...';
      }

      try {
        const resp = await fetch('/api/leads', {
          headers: {
            'Authorization': `Bearer ${enteredCode}`,
            'X-Admin-Key': enteredCode
          }
        });

        if (resp.status === 401) {
          if (loginError) {
            loginError.textContent = 'Authentication failed. Invalid administrator access key.';
            loginError.style.display = 'block';
          }
        } else {
          setAuthToken(enteredCode);
          showApp();
          initDashboard();
          handleLeadsResponse(resp);
        }
      } catch (err) {
        if (loginError) {
          loginError.textContent = 'Server connection error: ' + err.message;
          loginError.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Authenticate & Open Portal →';
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearAuthToken();
      showLogin('You have been logged out.');
    });
  }

  // --------------------------------------------------------------------------
  // 2. ERROR BANNER & NOTIFICATIONS
  // --------------------------------------------------------------------------
  const errorBanner = document.getElementById('admin-error-banner');
  const alertTitle = document.getElementById('alert-title');
  const alertMessage = document.getElementById('alert-message');
  const btnAlertRetry = document.getElementById('btn-alert-retry');

  function showErrorBanner(message, title = 'Database / API Warning:') {
    if (!errorBanner) return;
    if (alertTitle) alertTitle.textContent = title;
    if (alertMessage) alertMessage.textContent = message;
    errorBanner.style.display = 'flex';
  }

  function hideErrorBanner() {
    if (errorBanner) errorBanner.style.display = 'none';
  }

  if (btnAlertRetry) {
    btnAlertRetry.addEventListener('click', () => {
      hideErrorBanner();
      fetchLeads();
    });
  }

  // --------------------------------------------------------------------------
  // 3. TAB NAVIGATION
  // --------------------------------------------------------------------------
  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const contentEl = document.getElementById('tab-' + targetTab);
        if (contentEl) contentEl.classList.add('active');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. DATA FETCHING & SYNCHRONIZATION
  // --------------------------------------------------------------------------
  async function fetchLeads() {
    const token = getAuthToken();
    if (!token) return;

    const tbody = document.getElementById('leads-tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 36px; color: var(--admin-muted);">Refreshing data from Supabase...</td></tr>';
    }

    try {
      const resp = await fetch('/api/leads', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Admin-Key': token
        }
      });
      await handleLeadsResponse(resp);
    } catch (err) {
      showErrorBanner(`Failed to connect to /api/leads: ${err.message}`);
    }
  }

  async function handleLeadsResponse(resp) {
    if (resp.status === 401) {
      clearAuthToken();
      showLogin('Session invalid. Please re-authenticate.');
      return;
    }

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      showErrorBanner(errData.error || `Server responded with status ${resp.status}`);
      return;
    }

    hideErrorBanner();
    const data = await resp.json();
    cachedLeads = data.leads || [];

    // Filter out dummy sample leads if any
    const dummyIds = ['LEAD-101', 'LEAD-102', 'LEAD-103'];
    cachedLeads = cachedLeads.filter(l => !dummyIds.includes(l.id));

    renderKPIs();
    renderLeadsTable();
  }

  // --------------------------------------------------------------------------
  // 5. RENDER OVERVIEW KPIS
  // --------------------------------------------------------------------------
  function renderKPIs() {
    const total = cachedLeads.length;
    const newLeads = cachedLeads.filter(l => (l.status || '').toLowerCase() === 'lead captured').length;
    const pendingAppts = cachedLeads.filter(l => {
      const s = (l.status || '').toLowerCase();
      return s.includes('requested') || s.includes('pending') || s.includes('slot selected');
    }).length;
    const pendingPay = cachedLeads.filter(l => {
      const p = (l.paymentStatus || '').toLowerCase();
      return p.includes('pending') || p.includes('unpaid');
    }).length;
    const confirmed = cachedLeads.filter(l => {
      const s = (l.status || '').toLowerCase();
      const p = (l.paymentStatus || '').toLowerCase();
      return s.includes('confirmed') || p.includes('paid online');
    }).length;
    const completed = cachedLeads.filter(l => (l.status || '').toLowerCase().includes('completed')).length;
    const dropoffs = cachedLeads.filter(l => {
      const s = (l.status || '').toLowerCase();
      const p = (l.paymentStatus || '').toLowerCase();
      return s.includes('drop') || s.includes('incomplete') || (s === 'lead captured' && !l.slotPreference);
    }).length;

    const elTotal = document.getElementById('kpi-total-leads');
    const elBadge = document.getElementById('badge-total-leads');
    const elNew = document.getElementById('kpi-new-leads');
    const elPendingAppts = document.getElementById('kpi-pending-appts');
    const elPendingPay = document.getElementById('kpi-pending-payment');
    const elConfirmed = document.getElementById('kpi-confirmed-bookings');
    const elCompleted = document.getElementById('kpi-completed-visits');
    const elDropoffs = document.getElementById('kpi-dropoffs');

    if (elTotal) elTotal.textContent = total;
    if (elBadge) elBadge.textContent = total;
    if (elNew) elNew.textContent = newLeads;
    if (elPendingAppts) elPendingAppts.textContent = pendingAppts;
    if (elPendingPay) elPendingPay.textContent = pendingPay;
    if (elConfirmed) elConfirmed.textContent = confirmed;
    if (elCompleted) elCompleted.textContent = completed;
    if (elDropoffs) elDropoffs.textContent = dropoffs;
  }

  // --------------------------------------------------------------------------
  // 6. RENDER UNIFIED LEADS & APPOINTMENTS TABLE
  // --------------------------------------------------------------------------
  function renderLeadsTable() {
    const tbody = document.getElementById('leads-tbody');
    if (!tbody) return;

    const searchVal = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const statusVal = document.getElementById('filter-status')?.value || 'all';
    const dateVal = document.getElementById('filter-date')?.value || 'all';

    const now = new Date();

    const filtered = cachedLeads.filter(lead => {
      // 1. Search text filter
      const text = `${lead.id} ${lead.name} ${lead.phone} ${lead.concern} ${lead.painArea} ${lead.city} ${lead.utmSource}`.toLowerCase();
      if (searchVal && !text.includes(searchVal)) return false;

      // 2. Status filter
      if (statusVal !== 'all' && lead.status !== statusVal) return false;

      // 3. Date range filter
      if (dateVal !== 'all' && lead.createdAt) {
        const leadDate = new Date(lead.createdAt);
        const diffDays = (now.getTime() - leadDate.getTime()) / (1000 * 3600 * 24);
        if (dateVal === 'today' && diffDays > 1) return false;
        if (dateVal === '7days' && diffDays > 7) return false;
        if (dateVal === '30days' && diffDays > 30) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 36px; color: var(--admin-muted);">No enquiries match your current filters.</td></tr>';
      return;
    }

    let rowsHtml = '';
    filtered.forEach(lead => {
      const clean10 = (lead.phone || '').replace(/[^0-9]/g, '').slice(-10);
      const isPaid = (lead.paymentStatus || '').toLowerCase().includes('paid');
      const isPayAtClinic = (lead.paymentMethod || '').includes('clinic') || (lead.paymentStatus || '').includes('Clinic');
      const formattedDate = lead.createdAt
        ? new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Recent';

      // WhatsApp quick message URL
      const waMsg = encodeURIComponent(`Namaste ${lead.name || 'Patient'} ji, Dr. Surabhi Vaidya Clinic here regarding your consultation appointment request. How can we assist you?`);
      const waUrl = `https://wa.me/91${clean10}?text=${waMsg}`;

      rowsHtml += `
        <tr data-lead-id="${lead.id}">
          <!-- Patient Details -->
          <td>
            <strong>${escapeHtml(lead.name || 'Patient')}</strong>
            <div style="font-size: 0.78rem; color: var(--admin-muted); margin-top: 2px;">
              📞 <a href="tel:+91${clean10}" style="color: inherit; text-decoration: underline;">+91 ${clean10}</a>
              · <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="color: #16a34a; font-weight: 700;">💬 WA</a>
            </div>
            <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">
              ID: ${escapeHtml(lead.id)} · ${formattedDate}
            </div>
          </td>

          <!-- Concern -->
          <td>
            <span class="badge badge-consult">${escapeHtml(lead.concern || lead.painArea || 'Knee Pain')}</span>
            <div style="font-size: 0.74rem; color: var(--admin-muted); margin-top: 4px;">${escapeHtml(lead.city || 'Thane')}</div>
          </td>

          <!-- Source & Campaign -->
          <td>
            <div style="font-size: 0.82rem; font-weight: 600;">${escapeHtml(lead.utmSource || 'Direct / Organic')}</div>
            <div style="font-size: 0.72rem; color: var(--admin-muted);">${escapeHtml(lead.utmCampaign || lead.gclid ? 'Google Ads' : 'Website')}</div>
          </td>

          <!-- Appointment Slot -->
          <td>
            <div style="font-size: 0.84rem; font-weight: 600; color: var(--primary-deep);">${escapeHtml(lead.slotPreference || 'Pending Slot Selection')}</div>
          </td>

          <!-- Booking Status (Editable) -->
          <td>
            <select class="status-select" data-id="${lead.id}" style="font-size: 0.78rem; padding: 4px 6px; border-radius: 4px; border: 1.5px solid var(--admin-border); font-weight: 600;">
              <option value="Lead Captured" ${lead.status === 'Lead Captured' ? 'selected' : ''}>Lead Captured</option>
              <option value="Slot Selected" ${lead.status === 'Slot Selected' ? 'selected' : ''}>Slot Selected</option>
              <option value="Appointment Requested - Pay at Clinic" ${lead.status === 'Appointment Requested - Pay at Clinic' ? 'selected' : ''}>Pay at Clinic (Pending)</option>
              <option value="Appointment Confirmed - Paid Online (₹800)" ${lead.status && lead.status.includes('Confirmed') ? 'selected' : ''}>Confirmed - Paid (₹800)</option>
              <option value="Consultation Completed" ${lead.status === 'Consultation Completed' ? 'selected' : ''}>Visit Completed</option>
              <option value="Cancelled" ${lead.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>

          <!-- Fee & Payment -->
          <td>
            ${isPaid 
              ? '<span class="badge" style="background: #dcfce7; color: #166534; font-weight: 800;">Paid Online (₹800) ✓</span>' 
              : (isPayAtClinic 
                ? '<span class="badge" style="background: #fef8ee; color: #9a3412;">₹1,000 Due at Desk</span>' 
                : '<span class="badge" style="background: #f1f5f9; color: #64748b;">Unpaid</span>')}
          </td>

          <!-- WhatsApp Status -->
          <td>
            <span class="badge ${lead.deliveredMessage && lead.deliveredMessage !== 'None' ? 'badge-consult' : ''}" style="font-size: 0.72rem;">
              ${escapeHtml(lead.deliveredMessage || 'None Sent')}
            </span>
          </td>

          <!-- Follow-up Checkbox -->
          <td style="text-align: center;">
            <input type="checkbox" class="cb-followup" data-id="${lead.id}" ${lead.followUpRequired ? 'checked' : ''} title="Mark for clinic follow-up" style="transform: scale(1.2); accent-color: var(--primary-deep);">
          </td>

          <!-- Actions -->
          <td>
            <button type="button" class="btn-notes" data-id="${lead.id}" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px; border: 1px solid var(--admin-border); background: #ffffff; cursor: pointer;">
              📝 Notes ${lead.staffNotes ? '•' : ''}
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
    bindTableEvents();
  }

  function bindTableEvents() {
    // 1. Status Dropdown Change
    document.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const id = sel.getAttribute('data-id');
        const newStatus = sel.value;
        sel.disabled = true;

        try {
          const resp = await patchLead(id, { status: newStatus });
          if (resp.ok) {
            const found = cachedLeads.find(l => l.id === id);
            if (found) found.status = newStatus;
            renderKPIs();
          } else {
            alert('Failed to update status on server.');
          }
        } finally {
          sel.disabled = false;
        }
      });
    });

    // 2. Follow-up Checkbox
    document.querySelectorAll('.cb-followup').forEach(cb => {
      cb.addEventListener('change', async () => {
        const id = cb.getAttribute('data-id');
        const isChecked = cb.checked;
        await patchLead(id, { followUpRequired: isChecked });
        const found = cachedLeads.find(l => l.id === id);
        if (found) found.followUpRequired = isChecked;
      });
    });

    // 3. Notes Modal Opener
    document.querySelectorAll('.btn-notes').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openNotesModal(id);
      });
    });
  }

  async function patchLead(id, payload) {
    const token = getAuthToken();
    return fetch('/api/leads', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Admin-Key': token
      },
      body: JSON.stringify({ id, ...payload })
    });
  }

  // --------------------------------------------------------------------------
  // 7. STAFF NOTES MODAL
  // --------------------------------------------------------------------------
  const notesModal = document.getElementById('notes-modal');
  const notesPatientLabel = document.getElementById('notes-patient-label');
  const staffNotesTextarea = document.getElementById('staff-notes-textarea');
  const btnSaveNotes = document.getElementById('btn-save-notes');
  const btnCancelNotes = document.getElementById('btn-cancel-notes');

  function openNotesModal(leadId) {
    activeEditingLeadId = leadId;
    const lead = cachedLeads.find(l => l.id === leadId);
    if (!lead || !notesModal) return;

    if (notesPatientLabel) {
      notesPatientLabel.textContent = `Patient: ${lead.name} (+91 ${lead.phone}) · ID: ${lead.id}`;
    }
    if (staffNotesTextarea) {
      staffNotesTextarea.value = lead.staffNotes || lead.notes || '';
    }

    notesModal.style.display = 'flex';
  }

  function closeNotesModal() {
    activeEditingLeadId = null;
    if (notesModal) notesModal.style.display = 'none';
  }

  btnCancelNotes?.addEventListener('click', closeNotesModal);
  btnSaveNotes?.addEventListener('click', async () => {
    if (!activeEditingLeadId) return;
    const noteText = (staffNotesTextarea?.value || '').trim();

    btnSaveNotes.disabled = true;
    btnSaveNotes.textContent = 'Saving...';

    try {
      await patchLead(activeEditingLeadId, { staffNotes: noteText });
      const found = cachedLeads.find(l => l.id === activeEditingLeadId);
      if (found) found.staffNotes = noteText;
      closeNotesModal();
      renderLeadsTable();
    } catch (e) {
      alert('Error saving notes: ' + e.message);
    } finally {
      btnSaveNotes.disabled = false;
      btnSaveNotes.textContent = 'Save Notes';
    }
  });

  // --------------------------------------------------------------------------
  // 8. CSV EXPORT
  // --------------------------------------------------------------------------
  const btnExportCsv = document.getElementById('btn-export-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      if (cachedLeads.length === 0) {
        alert('No leads available to export.');
        return;
      }

      const headers = ['Lead ID', 'Created At', 'Patient Name', 'Phone', 'City', 'Concern', 'Slot Preference', 'Booking Status', 'Payment Status', 'Fee Amount', 'Payment Method', 'Delivered Message', 'Follow-up Required', 'Staff Notes'];
      const rows = cachedLeads.map(l => [
        escapeCsv(l.id),
        escapeCsv(l.createdAt),
        escapeCsv(l.name),
        escapeCsv(l.phone),
        escapeCsv(l.city),
        escapeCsv(l.concern || l.painArea),
        escapeCsv(l.slotPreference),
        escapeCsv(l.status),
        escapeCsv(l.paymentStatus),
        escapeCsv(l.amount),
        escapeCsv(l.paymentMethod),
        escapeCsv(l.deliveredMessage),
        escapeCsv(l.followUpRequired ? 'Yes' : 'No'),
        escapeCsv(l.staffNotes || l.notes)
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Dr_Surabhi_Clinic_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  function escapeCsv(val) {
    if (val === null || val === undefined) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --------------------------------------------------------------------------
  // 9. EVENT LISTENERS FOR CONTROLS
  // --------------------------------------------------------------------------
  document.getElementById('search-input')?.addEventListener('input', renderLeadsTable);
  document.getElementById('filter-status')?.addEventListener('change', renderLeadsTable);
  document.getElementById('filter-date')?.addEventListener('change', renderLeadsTable);
  document.getElementById('btn-refresh-data')?.addEventListener('click', fetchLeads);

  function initDashboard() {
    initTabs();
  }

  // Initial Boot
  document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndInit();
  });

})();
