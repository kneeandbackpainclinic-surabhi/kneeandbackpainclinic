// Vercel Serverless Function: Automated 30-Minute Consultation Reminder Runner
// Endpoint: GET /api/send-reminders & POST /api/send-reminders
// Purpose:
//   - Sweeps upcoming Cal.id / CRM consultations starting in ~30 minutes (20-45 min window).
//   - Dispatches official 30-minute reminder WhatsApp message via AgentBandhu.
//   - Supports instant manual trigger (?phone=91XXXXXXXXXX&test=true) for validation.
//   - Prevents duplicate dispatches with 4-hour lead deduplication.

import {
  AGENTBANDHU_MESSAGES_ENDPOINT,
  formatPhoneNumber,
  buildAgentBandhuPayload
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

  const calApiKey = (
    process.env.CALID_API ||
    process.env.CAL_API_KEY ||
    process.env.CALID_API_KEY ||
    ''
  ).trim();

  // ---------------------------------------------------------------------------
  // 1. Direct Test / Ad-hoc Dispatch Mode (?phone=91XXXXXXXXXX)
  // ---------------------------------------------------------------------------
  const testPhone = query.phone || body.phone;
  const isTest = query.test === 'true' || Boolean(testPhone);

  if (isTest && testPhone) {
    const cleanPhone = String(testPhone).replace(/[^0-9]/g, '').slice(-10);
    const testName = query.name || body.name || 'Patient';
    const testSlot = query.slot || body.slot || '10:00 AM IST';

    if (!agentBandhuKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing AgentBandhu API key in META_WHATSAPP_ACCESS_TOKEN'
      });
    }

    try {
      const formattedTo = formatPhoneNumber(cleanPhone);
      const reminderTemplate = 'surabhi_v4_no_image';
      const reminderVariables = [
        testName,
        `Reminder: Your in-clinic consultation with Dr. Dr. Surabhi Vaidya begins in 30 minutes at ${testSlot}.`,
        'Location: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.',
        'Please arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available.'
      ];

      const waPayload = buildAgentBandhuPayload({
        to: formattedTo,
        templateName: reminderTemplate,
        variables: reminderVariables,
        reference: `test_rem_${Date.now()}`
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
        action: 'test_reminder_dispatched',
        recipient: formattedTo,
        template: reminderTemplate,
        variables: reminderVariables,
        apiStatus: waResp.status,
        response: respJson
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to dispatch test reminder',
        details: err.message
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Automated Sweep Mode: Scan Upcoming Bookings ~30 min Ahead
  // ---------------------------------------------------------------------------
  try {
    const now = new Date();
    const nowMs = now.getTime();
    // 30-minute reminder window: 15 to 45 minutes from now
    const minLeadMs = 15 * 60 * 1000;
    const maxLeadMs = 45 * 60 * 1000;

    const results = {
      timestamp: now.toISOString(),
      currentTimeIST: now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }),
      targetWindowMinutes: '15 to 45 minutes ahead (~30 min reminder)',
      checkedCount: 0,
      remindersSent: 0,
      skippedAlreadyReminded: 0,
      skippedNotInWindow: 0,
      details: []
    };

    // A. Fetch active consultation leads from Supabase CRM
    let eligibleLeads = [];
    if (supabaseUrl && supabaseKey) {
      try {
        const resp = await fetch(
          `${supabaseUrl}/rest/v1/leads?status=eq.Consultation Scheduled&select=id,name,phone,slot_preference,delivered_message,delivered_message_time`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          }
        );
        if (resp.ok) {
          const rows = await resp.json();
          if (Array.isArray(rows)) eligibleLeads = rows;
        }
      } catch (e) {
        console.warn('Could not query Supabase leads for reminders:', e.message);
      }
    }

    results.checkedCount = eligibleLeads.length;

    for (const lead of eligibleLeads) {
      const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (!cleanPhone || cleanPhone.length !== 10) continue;

      // Deduplication: skip if reminder was already sent in last 4 hours
      if (lead.delivered_message === 'consultation_reminder_30m' && lead.delivered_message_time) {
        const prevSent = new Date(lead.delivered_message_time).getTime();
        if (nowMs - prevSent < 4 * 60 * 60 * 1000) {
          results.skippedAlreadyReminded++;
          results.details.push({
            id: lead.id,
            phone: `+91${cleanPhone}`,
            action: 'skipped_already_reminded',
            lastSent: lead.delivered_message_time
          });
          continue;
        }
      }

      // Check slot preference time
      const slotText = lead.slot_preference || '';
      let isDue = false;

      // Try parsing date/time from slot preference
      if (slotText) {
        // Match ISO or readable string
        const parsedMs = Date.parse(slotText);
        if (!isNaN(parsedMs)) {
          const diffMs = parsedMs - nowMs;
          if (diffMs >= minLeadMs && diffMs <= maxLeadMs) {
            isDue = true;
          }
        }
      }

      // If query passed ?force=true, mark due for testing
      if (query.force === 'true') {
        isDue = true;
      }

      if (!isDue) {
        results.skippedNotInWindow++;
        results.details.push({
          id: lead.id,
          phone: `+91${cleanPhone}`,
          slot: slotText,
          action: 'skipped_not_in_30m_window'
        });
        continue;
      }

      // Dispatch Reminder
      if (agentBandhuKey) {
        try {
          const formattedTo = formatPhoneNumber(cleanPhone);
          const reminderTemplate = 'surabhi_v4_no_image';
          const reminderVariables = [
            lead.name || 'Patient',
            `Reminder: Your in-clinic consultation with Dr. Surabhi Vaidya begins in 30 minutes.`,
            'Location: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.',
            'Please arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available.'
          ];

          const waPayload = buildAgentBandhuPayload({
            to: formattedTo,
            templateName: reminderTemplate,
            variables: reminderVariables,
            reference: `cron_rem_${lead.id}_${Date.now()}`
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
            results.remindersSent++;
            // Update Supabase
            if (supabaseUrl && supabaseKey) {
              await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${lead.id}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  delivered_message: 'consultation_reminder_30m',
                  delivered_message_time: now.toISOString()
                })
              }).catch(() => {});
            }

            results.details.push({
              id: lead.id,
              phone: formattedTo,
              action: 'reminder_sent',
              status: 'SUCCESS'
            });
          } else {
            const errText = await waResp.text();
            results.details.push({
              id: lead.id,
              phone: formattedTo,
              action: 'dispatch_failed',
              error: errText
            });
          }
        } catch (dispatchErr) {
          results.details.push({
            id: lead.id,
            action: 'dispatch_exception',
            error: dispatchErr.message
          });
        }
      }
    }

    return res.status(200).json(results);

  } catch (err) {
    console.error('Send Reminders Runner Error:', err);
    return res.status(500).json({ error: 'Failed to process reminders sweep', details: err.message });
  }
}
