// Vercel Serverless Function: Automated Consultation Reminder & Drop-Off Recovery Engine
// Endpoint: GET /api/send-reminders & POST /api/send-reminders
// Purpose:
//   1. 30-Minute Consultation Reminder: Dispatches utility reminder to patients whose slot starts in ~30 min.
//   2. Incomplete Booking Recovery (15m): Dispatches recovery prompt to leads captured with no slot chosen.
//   3. Abandoned Checkout Recovery (24h): Dispatches fee option prompt (₹800 online vs ₹1,000 at clinic).
//   4. Strict Opt-Out & Deduplication: Respects opted_out flag and updates recovery_step in Supabase public.leads.

import {
  AGENTBANDHU_MESSAGES_ENDPOINT,
  formatPhoneNumber,
  buildAgentBandhuPayload,
  CLINIC_UPI_VPA,
  CLINIC_UPI_QR_URL
} from './_lib/whatsapp-templates.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const body = req.body || {};

  const agentBandhuKey = (
    query.apiKey ||
    body.apiKey ||
    process.env.AGENTBANDHU_API_KEY ||
    process.env.META_WHATSAPP_ACCESS_TOKEN ||
    ''
  ).trim();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

  // ---------------------------------------------------------------------------
  // 1. Opt-Out / Unsubscribe Handler (?action=opt_out&phone=91XXXXXXXXXX)
  // ---------------------------------------------------------------------------
  if (query.action === 'opt_out' || body.action === 'opt_out' || query.opt_out === 'true' || body.opt_out === 'true') {
    const rawTargetPhone = query.phone || body.phone;
    if (!rawTargetPhone) {
      return res.status(400).json({ success: false, error: 'Missing phone number for opt-out' });
    }
    const cleanPhone = String(rawTargetPhone).replace(/[^0-9]/g, '').slice(-10);

    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${cleanPhone}*`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            opted_out: true,
            whatsapp_consent: false,
            notes: `Opted out from WhatsApp communications at ${new Date().toISOString()}`
          })
        });
      } catch (dbErr) {
        console.warn('Opt-out database sync warning:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Phone +91${cleanPhone} has been opted out from promotional WhatsApp messages.`
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Direct Diagnostic / Test Dispatch Mode (?phone=91XXXXXXXXXX&test=true)
  // ---------------------------------------------------------------------------
  const testPhone = query.phone || body.phone;
  const isTest = query.test === 'true' || Boolean(testPhone && (query.scenario || body.scenario));

  if (isTest && testPhone) {
    const cleanPhone = String(testPhone).replace(/[^0-9]/g, '').slice(-10);
    const testName = query.name || body.name || 'Patient';
    const scenario = query.scenario || body.scenario || '30min'; // '30min' | 'incomplete' | 'abandoned'

    if (!agentBandhuKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing AgentBandhu API key in META_WHATSAPP_ACCESS_TOKEN or AGENTBANDHU_API_KEY'
      });
    }

    try {
      const formattedTo = formatPhoneNumber(cleanPhone);
      let reminderTemplate = 'surabhi_v4_no_image';
      let reminderVariables = [];
      let headerMediaUrl = null;

      if (scenario === 'incomplete') {
        reminderTemplate = 'surabhi_v4_no_image';
        reminderVariables = [
          testName,
          'We noticed you started reserving a consultation with Dr. Surabhi Vaidya but haven\'t chosen your slot.',
          `Exclusive 20% Discount: Prepay ₹800 via UPI VPA: ${CLINIC_UPI_VPA} (Save ₹200 vs standard ₹1,000 at clinic).`,
          'To select your slot & pay ₹800 directly: https://kneeandbackpainrelief.com/pay-upi?am=800'
        ];
      } else if (scenario === 'abandoned') {
        // Send QR Code Header Image + VPA ID + Deep Link
        reminderTemplate = 'surabhi_v4_with_image';
        headerMediaUrl = CLINIC_UPI_QR_URL;
        reminderVariables = [
          testName,
          'Your in-clinic consultation slot with Dr. Surabhi Vaidya is held for you at Charak Health Solutions, Thane West.',
          `Special 20% Savings: Prepay ₹800 via UPI VPA: ${CLINIC_UPI_VPA} (or pay standard ₹1,000 at clinic reception).`,
          'Scan the QR code above or tap here to pay ₹800: https://kneeandbackpainrelief.com/pay-upi?am=800'
        ];
      } else {
        // Default 30-min reminder
        const testSlot = query.slot || body.slot || '11:00 AM IST';
        reminderTemplate = 'surabhi_v4_no_image';
        reminderVariables = [
          testName,
          `Reminder: Your in-clinic consultation with Dr. Surabhi Vaidya begins in 30 minutes at ${testSlot}.`,
          'Location: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.',
          'Please arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available.'
        ];
      }

      const waPayload = buildAgentBandhuPayload({
        to: formattedTo,
        templateName: reminderTemplate,
        variables: reminderVariables,
        headerMediaUrl,
        reference: `test_${scenario}_${Date.now()}`
      });

      const waResp = await fetch(AGENTBANDHU_MESSAGES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${agentBandhuKey}`,
          'x-api-key': agentBandhuKey,
          'api-key': agentBandhuKey
        },
        body: JSON.stringify(waPayload)
      });

      const respText = await waResp.text();
      let respJson;
      try { respJson = JSON.parse(respText); } catch { respJson = { raw: respText }; }

      return res.status(200).json({
        success: waResp.ok,
        action: `test_${scenario}_dispatched`,
        recipient: formattedTo,
        template: reminderTemplate,
        variables: reminderVariables,
        apiStatus: waResp.status,
        response: respJson
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to dispatch test WhatsApp message',
        details: err.message
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Automated Sweep Engine: 30-Min Reminders + Drop-Off Recovery Sweeps
  // ---------------------------------------------------------------------------
  try {
    const sweepType = query.type || body.type || 'all'; // '30min' | 'recovery' | 'all'
    const now = new Date();
    const nowMs = now.getTime();

    const sweepResults = {
      timestamp: now.toISOString(),
      currentTimeIST: now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }),
      sweepType,
      reminders30m: { checked: 0, sent: 0, skipped: 0, details: [] },
      recoveryIncomplete: { checked: 0, sent: 0, skipped: 0, details: [] },
      recoveryAbandoned: { checked: 0, sent: 0, skipped: 0, details: [] }
    };

    // -------------------------------------------------------------------------
    // SWEEP A: 30-Minute Consultation Reminders (15 to 45 min ahead)
    // -------------------------------------------------------------------------
    if (sweepType === 'all' || sweepType === '30min') {
      const minLeadMs = 15 * 60 * 1000;
      const maxLeadMs = 45 * 60 * 1000;

      let eligibleAppointments = [];
      if (supabaseUrl && supabaseKey) {
        try {
          const resp = await fetch(
            `${supabaseUrl}/rest/v1/leads?status=in.(Consultation Scheduled,Appointment Requested - Pay at Clinic,Appointment Confirmed - Paid Online (₹800))&select=id,name,phone,slot_preference,status,opted_out,prior_treatments`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
              }
            }
          );
          if (resp.ok) {
            const rows = await resp.json();
            if (Array.isArray(rows)) eligibleAppointments = rows;
          }
        } catch (e) {
          console.warn('Could not query leads for 30m reminders:', e.message);
        }
      }

      sweepResults.reminders30m.checked = eligibleAppointments.length;

      for (const lead of eligibleAppointments) {
        const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '').slice(-10);
        if (!cleanPhone || cleanPhone.length !== 10) continue;

        // Strict Opt-Out check
        if (lead.opted_out === true) {
          sweepResults.reminders30m.skipped++;
          continue;
        }

        // Deduplication check
        if (lead.status === 'Consultation Scheduled (Reminded)' || (lead.prior_treatments && lead.prior_treatments.includes('Reminder: 30min sent'))) {
          sweepResults.reminders30m.skipped++;
          continue;
        }

        // Parse slot start time
        const slotText = lead.slot_preference || '';
        let appointmentDate = null;

        const isoMatch = slotText.match(/\[ISO:([^\]]+)\]/);
        if (isoMatch && isoMatch[1]) {
          const d = new Date(isoMatch[1]);
          if (!isNaN(d.getTime())) appointmentDate = d;
        }

        if (!appointmentDate && slotText) {
          try {
            const cleanStr = slotText
              .replace(/\[ISO:[^\]]+\]/, '')
              .replace(/^[A-Za-z]+,\s*/, '')
              .replace(' at ', ' ')
              .replace(' IST', ' +05:30')
              .trim();
            const d = new Date(cleanStr);
            if (!isNaN(d.getTime())) appointmentDate = d;
          } catch (e) {}
        }

        let isDue = false;
        let timeLabel = '11:00 AM IST';

        if (appointmentDate) {
          const diffMs = appointmentDate.getTime() - nowMs;
          timeLabel = appointmentDate.toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).toUpperCase() + ' IST';

          if (diffMs >= minLeadMs && diffMs <= maxLeadMs) {
            isDue = true;
          }
        }

        if (query.force === 'true') isDue = true;

        if (!isDue) {
          sweepResults.reminders30m.skipped++;
          continue;
        }

        // Dispatch 30m reminder via AgentBandhu
        if (agentBandhuKey) {
          try {
            const formattedTo = formatPhoneNumber(cleanPhone);
            const waPayload = buildAgentBandhuPayload({
              to: formattedTo,
              templateName: 'surabhi_v4_no_image',
              variables: [
                lead.name || 'Patient',
                `Reminder: Your in-clinic consultation with Dr. Surabhi Vaidya begins in 30 minutes at ${timeLabel}.`,
                'Location: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.',
                'Please arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available.'
              ],
              reference: `rem30m_${lead.id}_${Date.now()}`
            });

            const waResp = await fetch(AGENTBANDHU_MESSAGES_ENDPOINT, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${agentBandhuKey}`,
                'x-api-key': agentBandhuKey,
                'api-key': agentBandhuKey
              },
              body: JSON.stringify(waPayload)
            });

            if (waResp.ok) {
              sweepResults.reminders30m.sent++;
              if (supabaseUrl && supabaseKey) {
                await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${lead.id}`, {
                  method: 'PATCH',
                  headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    status: 'Consultation Scheduled (Reminded)',
                    prior_treatments: `Reminder: 30min sent at ${now.toISOString()}`
                  })
                }).catch(() => {});
              }
              sweepResults.reminders30m.details.push({ id: lead.id, phone: formattedTo, status: 'SENT' });
            }
          } catch (waErr) {
            sweepResults.reminders30m.details.push({ id: lead.id, error: waErr.message });
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // SWEEP B: Incomplete Booking Recovery (15 minutes after Lead Captured)
    // -------------------------------------------------------------------------
    if (sweepType === 'all' || sweepType === 'recovery') {
      const minAgeMs = 15 * 60 * 1000;       // At least 15 min old
      const maxAgeMs = 24 * 60 * 60 * 1000;  // Within 24 hours

      let incompleteLeads = [];
      if (supabaseUrl && supabaseKey) {
        try {
          const resp = await fetch(
            `${supabaseUrl}/rest/v1/leads?status=eq.Lead Captured&select=id,name,phone,created_at,recovery_step,opted_out,whatsapp_consent`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
              }
            }
          );
          if (resp.ok) {
            const rows = await resp.json();
            if (Array.isArray(rows)) incompleteLeads = rows;
          }
        } catch (e) {
          console.warn('Could not query leads for incomplete recovery:', e.message);
        }
      }

      sweepResults.recoveryIncomplete.checked = incompleteLeads.length;

      for (const lead of incompleteLeads) {
        const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '').slice(-10);
        if (!cleanPhone || cleanPhone.length !== 10) continue;

        // Skip if opted out
        if (lead.opted_out === true) {
          sweepResults.recoveryIncomplete.skipped++;
          continue;
        }

        // Deduplication: skip if already sent incomplete recovery
        if (lead.recovery_step && lead.recovery_step.includes('incomplete_15m')) {
          sweepResults.recoveryIncomplete.skipped++;
          continue;
        }

        // Check age: between 15m and 24h
        const leadCreated = lead.created_at ? new Date(lead.created_at).getTime() : 0;
        const ageMs = nowMs - leadCreated;
        if ((ageMs < minAgeMs || ageMs > maxAgeMs) && query.force !== 'true') {
          sweepResults.recoveryIncomplete.skipped++;
          continue;
        }

        // Dispatch Incomplete Recovery prompt
        if (agentBandhuKey) {
          try {
            const formattedTo = formatPhoneNumber(cleanPhone);
            const waPayload = buildAgentBandhuPayload({
              to: formattedTo,
              templateName: 'surabhi_v4_no_image',
              variables: [
                lead.name || 'Patient',
                'We noticed you started reserving a consultation with Dr. Surabhi Vaidya but haven\'t chosen your slot.',
                `Exclusive 20% Discount: Prepay ₹800 via UPI VPA: ${CLINIC_UPI_VPA} (Save ₹200 vs standard ₹1,000 at clinic).`,
                `To select your slot & pay ₹800 directly: https://kneeandbackpainrelief.com/pay-upi?lead=${lead.id}&am=800`
              ],
              reference: `rec_inc_${lead.id}_${Date.now()}`
            });

            const waResp = await fetch(AGENTBANDHU_MESSAGES_ENDPOINT, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${agentBandhuKey}`,
                'x-api-key': agentBandhuKey,
                'api-key': agentBandhuKey
              },
              body: JSON.stringify(waPayload)
            });

            if (waResp.ok) {
              sweepResults.recoveryIncomplete.sent++;
              if (supabaseUrl && supabaseKey) {
                await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${lead.id}`, {
                  method: 'PATCH',
                  headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    recovery_step: 'incomplete_15m',
                    delivered_message: 'incomplete_booking_followup_15m',
                    delivered_message_time: now.toISOString()
                  })
                }).catch(() => {});
              }
              sweepResults.recoveryIncomplete.details.push({ id: lead.id, phone: formattedTo, status: 'SENT' });
            }
          } catch (waErr) {
            sweepResults.recoveryIncomplete.details.push({ id: lead.id, error: waErr.message });
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // SWEEP C: Abandoned Checkout Recovery (24 hours after Slot chosen, Unpaid)
    // -------------------------------------------------------------------------
    if (sweepType === 'all' || sweepType === 'recovery') {
      const minAgeMs = 24 * 60 * 60 * 1000;  // At least 24 hours old
      const maxAgeMs = 72 * 60 * 60 * 1000;  // Within 72 hours

      let pendingLeads = [];
      if (supabaseUrl && supabaseKey) {
        try {
          const resp = await fetch(
            `${supabaseUrl}/rest/v1/leads?payment_status=ilike.*pending*&select=id,name,phone,created_at,recovery_step,opted_out,whatsapp_consent`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
              }
            }
          );
          if (resp.ok) {
            const rows = await resp.json();
            if (Array.isArray(rows)) pendingLeads = rows;
          }
        } catch (e) {
          console.warn('Could not query leads for abandoned recovery:', e.message);
        }
      }

      sweepResults.recoveryAbandoned.checked = pendingLeads.length;

      for (const lead of pendingLeads) {
        const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '').slice(-10);
        if (!cleanPhone || cleanPhone.length !== 10) continue;

        // Skip if opted out
        if (lead.opted_out === true) {
          sweepResults.recoveryAbandoned.skipped++;
          continue;
        }

        // Deduplication: skip if already sent abandoned checkout recovery
        if (lead.recovery_step && lead.recovery_step.includes('abandoned_24h')) {
          sweepResults.recoveryAbandoned.skipped++;
          continue;
        }

        // Check age: between 24h and 72h
        const leadCreated = lead.created_at ? new Date(lead.created_at).getTime() : 0;
        const ageMs = nowMs - leadCreated;
        if ((ageMs < minAgeMs || ageMs > maxAgeMs) && query.force !== 'true') {
          sweepResults.recoveryAbandoned.skipped++;
          continue;
        }

        // Dispatch Abandoned Checkout Recovery prompt
        if (agentBandhuKey) {
          try {
            const formattedTo = formatPhoneNumber(cleanPhone);
            const waPayload = buildAgentBandhuPayload({
              to: formattedTo,
              templateName: 'surabhi_v4_with_image',
              variables: [
                lead.name || 'Patient',
                'Your in-clinic consultation slot with Dr. Surabhi Vaidya is held for you at Charak Health Solutions, Thane West.',
                `Special 20% Savings: Prepay ₹800 via UPI VPA: ${CLINIC_UPI_VPA} (or pay standard ₹1,000 at clinic reception).`,
                `Scan the QR code above or tap here to pay ₹800: https://kneeandbackpainrelief.com/pay-upi?lead=${lead.id}&am=800`
              ],
              headerMediaUrl: CLINIC_UPI_QR_URL,
              reference: `rec_abn_${lead.id}_${Date.now()}`
            });

            const waResp = await fetch(AGENTBANDHU_MESSAGES_ENDPOINT, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${agentBandhuKey}`,
                'x-api-key': agentBandhuKey,
                'api-key': agentBandhuKey
              },
              body: JSON.stringify(waPayload)
            });

            if (waResp.ok) {
              sweepResults.recoveryAbandoned.sent++;
              if (supabaseUrl && supabaseKey) {
                await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${lead.id}`, {
                  method: 'PATCH',
                  headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    recovery_step: 'abandoned_24h',
                    delivered_message: 'abandoned_checkout_followup_24h',
                    delivered_message_time: now.toISOString()
                  })
                }).catch(() => {});
              }
              sweepResults.recoveryAbandoned.details.push({ id: lead.id, phone: formattedTo, status: 'SENT' });
            }
          } catch (waErr) {
            sweepResults.recoveryAbandoned.details.push({ id: lead.id, error: waErr.message });
          }
        }
      }
    }

    return res.status(200).json(sweepResults);

  } catch (err) {
    console.error('Send Reminders Runner Error:', err);
    return res.status(500).json({ error: 'Failed to process reminders sweep', details: err.message });
  }
}
