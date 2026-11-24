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

          <!-- Booking Status (Editable & Triggers WhatsApp) -->
          <td>
            <select class="status-select" data-id="${lead.id}" style="font-size: 0.78rem; padding: 4px 6px; border-radius: 4px; border: 1.5px solid var(--admin-border); font-weight: 600;">
              <option value="Lead Captured" ${lead.status === 'Lead Captured' ? 'selected' : ''}>Lead Captured</option>
              <option value="Slot Selected" ${lead.status === 'Slot Selected' ? 'selected' : ''}>Slot Selected</option>
              <option value="Appointment Requested - Pay at Clinic" ${lead.status === 'Appointment Requested - Pay at Clinic' ? 'selected' : ''}>Pay at Clinic (Pending)</option>
              <option value="Appointment Confirmed - Paid Online (₹800)" ${lead.status === 'Appointment Confirmed - Paid Online (₹800)' ? 'selected' : ''}>Confirmed - Paid Online (₹800) 💬</option>
              <option value="Appointment Confirmed - Paid at Clinic" ${lead.status === 'Appointment Confirmed - Paid at Clinic' || lead.status === 'Payment Received - Slot Confirmed' ? 'selected' : ''}>Confirmed - Payment Received 💬</option>
              <option value="Consultation Completed" ${lead.status === 'Consultation Completed' ? 'selected' : ''}>Visit Completed 💬 (Review)</option>
              <option value="Cancelled" ${lead.status === 'Cancelled' ? 'selected' : ''}>Cancelled 💬 (Reschedule)</option>
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
          <td style="white-space: nowrap;">
            <button type="button" class="btn-notes" data-id="${lead.id}" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px; border: 1px solid var(--admin-border); background: #ffffff; cursor: pointer;">
              📝 Notes ${lead.staffNotes ? '•' : ''}
            </button>
            <button type="button" class="btn-send-review" data-id="${lead.id}" title="Send Google Review link via WhatsApp" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px; border: 1px solid #16a34a; background: #f0fdf4; color: #166534; font-weight: 700; cursor: pointer; margin-left: 4px;">
              ⭐ Review
            </button>
            <button type="button" class="btn-send-followup" data-id="${lead.id}" title="Send Follow-Up Consultation Reminder" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px; border: 1px solid #0284c7; background: #f0f9ff; color: #0369a1; font-weight: 700; cursor: pointer; margin-left: 4px;">
              📅 Follow-up
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
    bindTableEvents();
  }

  function bindTableEvents() {
    // 1. Status Dropdown Change (Triggers automated WhatsApp messages)
    document.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const id = sel.getAttribute('data-id');
        const newStatus = sel.value;
        const found = cachedLeads.find(l => l.id === id);
        sel.disabled = true;

        try {
          const resp = await patchLead(id, { status: newStatus });
          if (resp.ok) {
            const data = await resp.json().catch(() => ({}));
            if (found) {
              found.status = newStatus;
              if (data.updated && data.updated.delivered_message) {
                found.deliveredMessage = data.updated.delivered_message;
              }
              if (data.updated && data.updated.payment_status) {
                found.paymentStatus = data.updated.payment_status;
              }
            }
            renderKPIs();
            renderLeadsTable();

            // Notify staff about WhatsApp dispatch outcome
            if (data.whatsapp && data.whatsapp.sent) {
              if (newStatus.toLowerCase().includes('completed')) {
                showStatusToast(`✓ Status: Visit Completed. Google Review WhatsApp dispatched to ${found?.name || 'patient'}!`);
              } else if (newStatus.toLowerCase().includes('confirmed') || newStatus.toLowerCase().includes('payment')) {
                showStatusToast(`✓ Status: Payment Confirmed. Slot confirmation WhatsApp sent to ${found?.name || 'patient'}!`);
              } else if (newStatus.toLowerCase().includes('cancel')) {
                showStatusToast(`✓ Status: Cancelled. Reschedule link WhatsApp sent to ${found?.name || 'patient'}!`);
              } else {
                showStatusToast(`✓ Status updated to "${newStatus}" and WhatsApp dispatched.`);
              }
            } else if (data.whatsapp && data.whatsapp.error) {
              showStatusToast(`⚠️ Status saved, but WhatsApp notice: ${data.whatsapp.error}`, true);
            } else {
              showStatusToast(`✓ Status updated to "${newStatus}".`);
            }
          } else {
            alert('Failed to update status on server.');
          }
        } catch (err) {
          alert('Network error while updating status: ' + err.message);
        } finally {
          sel.disabled = false;
        }
      });
    });

    // 2. Direct "⭐ Review" button click (Dispatches Google Review link instantly)
    document.querySelectorAll('.btn-send-review').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const found = cachedLeads.find(l => l.id === id);
        if (!found) return;

        const clean10 = (found.phone || '').replace(/[^0-9]/g, '').slice(-10);
        if (!confirm(`Dispatch Google Review WhatsApp message to ${found.name || 'Patient'} (+91 ${clean10})?`)) {
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
          const resp = await patchLead(id, { triggerAction: 'send_review' });
          if (resp.ok) {
            const data = await resp.json().catch(() => ({}));
            if (data.updated && data.updated.delivered_message) {
              found.deliveredMessage = data.updated.delivered_message;
            }
            renderLeadsTable();

            if (data.whatsapp && data.whatsapp.sent) {
              showStatusToast(`✓ Google Review link dispatched to ${found.name} (+91 ${clean10})!`);
            } else if (data.whatsapp && data.whatsapp.error) {
              showStatusToast(`⚠️ Notice: ${data.whatsapp.error}`, true);
            } else {
              showStatusToast(`✓ Google Review message dispatched to ${found.name}!`);
            }
          } else {
            alert('Failed to dispatch Google Review message.');
          }
        } catch (err) {
          alert('Network error: ' + err.message);
        } finally {
          btn.disabled = false;
          btn.textContent = '⭐ Review';
        }
      });
    });

    // 3. Follow-up Checkbox
    document.querySelectorAll('.cb-followup').forEach(cb => {
      cb.addEventListener('change', async () => {
        const id = cb.getAttribute('data-id');
        const isChecked = cb.checked;
        await patchLead(id, { followUpRequired: isChecked });
        const found = cachedLeads.find(l => l.id === id);
        if (found) found.followUpRequired = isChecked;
      });
    });

    // 4. Follow-up Modal Opener (📅 Follow-up button)
    document.querySelectorAll('.btn-send-followup').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openFollowupModal(id);
      });
    });

    // 5. Notes Modal Opener
    document.querySelectorAll('.btn-notes').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openNotesModal(id);
      });
    });
  }

  function showStatusToast(message, isWarning = false) {
    let toast = document.getElementById('admin-status-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-status-toast';
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.right = '24px';
      toast.style.padding = '12px 18px';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)';
      toast.style.zIndex = '9999';
      toast.style.fontSize = '0.86rem';
      toast.style.fontWeight = '600';
      toast.style.transition = 'all 0.3s ease';
      toast.style.maxWidth = '420px';
      document.body.appendChild(toast);
    }

    if (isWarning) {
      toast.style.background = '#fef2f2';
      toast.style.color = '#991b1b';
      toast.style.border = '1.5px solid #f87171';
    } else {
      toast.style.background = '#f0fdf4';
      toast.style.color = '#166534';
      toast.style.border = '1.5px solid #4ade80';
    }

    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.opacity = '1';

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 4500);
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
  // 8. FOLLOW-UP REMINDER MODAL (MANUAL TRIGGER FOR 2, 3, 4 MONTHS)
  // --------------------------------------------------------------------------
  let activeFollowupLeadId = null;
  const followupModal = document.getElementById('followup-modal');
  const followupPatientLabel = document.getElementById('followup-patient-label');
  const followupIntervalSelect = document.getElementById('followup-interval-select');
  const followupCustomWrap = document.getElementById('followup-custom-wrap');
  const followupCustomInput = document.getElementById('followup-custom-input');
  const followupPreviewBox = document.getElementById('followup-preview-box');
  const btnSendFollowup = document.getElementById('btn-send-followup');
  const btnCancelFollowup = document.getElementById('btn-cancel-followup');

  function openFollowupModal(leadId) {
    activeFollowupLeadId = leadId;
    const lead = cachedLeads.find(l => l.id === leadId);
    if (!lead || !followupModal) return;

    if (followupPatientLabel) {
      followupPatientLabel.textContent = `Patient: ${lead.name || 'Patient'} (+91 ${lead.phone || ''}) · ID: ${lead.id}`;
    }

    if (followupIntervalSelect) followupIntervalSelect.value = '2 months';
    if (followupCustomWrap) followupCustomWrap.style.display = 'none';
    if (followupCustomInput) followupCustomInput.value = '';

    updateFollowupPreview();
    followupModal.style.display = 'flex';
  }

  function closeFollowupModal() {
    activeFollowupLeadId = null;
    if (followupModal) followupModal.style.display = 'none';
  }

  function getEffectiveFollowupInterval() {
    const val = followupIntervalSelect?.value || '2 months';
    if (val === 'custom') {
      return (followupCustomInput?.value || '2 months').trim() || '2 months';
    }
    return val;
  }

  function updateFollowupPreview() {
    if (!followupPreviewBox) return;
    const lead = cachedLeads.find(l => l.id === activeFollowupLeadId);
    const patientName = lead?.name || 'Patient';
    const interval = getEffectiveFollowupInterval();
    const intervalText = interval.toLowerCase().startsWith('after ') ? interval : `after ${interval}`;

    followupPreviewBox.textContent = `Hello ${patientName},

It is time to book your recommended follow-up consultation with Dr. Surabhi Vaidya at Charak Health Solutions.

As advised during your consultation, a follow-up assessment ${intervalText} ensures your knee/back recovery and joint mobility remain on track.

To choose your preferred follow-up slot, tap here: https://kneeandbackpainrelief.com or call our clinic at +91 90822 80274.

This information is being shared for reference purposes.
*Thank You.*`;
  }

  followupIntervalSelect?.addEventListener('change', () => {
    if (followupIntervalSelect.value === 'custom') {
      if (followupCustomWrap) followupCustomWrap.style.display = 'block';
      followupCustomInput?.focus();
    } else {
      if (followupCustomWrap) followupCustomWrap.style.display = 'none';
    }
    updateFollowupPreview();
  });

  followupCustomInput?.addEventListener('input', updateFollowupPreview);
  btnCancelFollowup?.addEventListener('click', closeFollowupModal);

  btnSendFollowup?.addEventListener('click', async () => {
    if (!activeFollowupLeadId) return;
    const lead = cachedLeads.find(l => l.id === activeFollowupLeadId);
    if (!lead) return;

    const interval = getEffectiveFollowupInterval();
    btnSendFollowup.disabled = true;
    btnSendFollowup.textContent = 'Dispatching WhatsApp...';

    try {
      const resp = await patchLead(activeFollowupLeadId, {
        triggerAction: 'send_followup',
        followupInterval: interval
      });

      if (resp.ok) {
        const data = await resp.json().catch(() => ({}));
        if (data.updated && data.updated.delivered_message) {
          lead.deliveredMessage = data.updated.delivered_message;
        }
        if (data.updated && data.updated.notes) {
          lead.notes = data.updated.notes;
        }
        closeFollowupModal();
        renderLeadsTable();

        if (data.whatsapp && data.whatsapp.sent) {
          showStatusToast(`✓ Follow-up reminder (${interval}) dispatched to ${lead.name} (+91 ${lead.phone})!`);
        } else if (data.whatsapp && data.whatsapp.error) {
          showStatusToast(`⚠️ Notice: ${data.whatsapp.error}`, true);
        } else {
          showStatusToast(`✓ Follow-up reminder (${interval}) dispatched to ${lead.name}!`);
        }
      } else {
        alert('Failed to send follow-up reminder.');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      btnSendFollowup.disabled = false;
      btnSendFollowup.textContent = 'Send Follow-Up WhatsApp →';
    }
  });

  // --------------------------------------------------------------------------
  // 9. CSV EXPORT
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
