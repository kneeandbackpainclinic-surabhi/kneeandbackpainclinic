// Vercel Serverless Function: Cal.id / Cal.com Universal Webhook Handler
// Endpoint: POST /api/cal-webhook
// Handled Lifecycle:
//   - BOOKING_CREATED: Dispatches consultation_booking_confirmation_v1 & saves lead in Supabase
//   - BOOKING_RESCHEDULED: Dispatches updated consultation_booking_confirmation_v1 & updates lead
//   - BEFORE_EVENT / REMINDER: Dispatches 30-minute pre-consultation reminder (surabhi_v4_no_image)
//   - MEETING_STARTED: Acknowledged only (IGNORED - no WhatsApp dispatched)
//   - MEETING_ENDED: Acknowledged only (IGNORED - no WhatsApp dispatched)
//   - BOOKING_CANCELLED: Updates CRM status to Cancelled (no WhatsApp dispatched)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-cal-signature-256'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health / verification endpoint for Cal.id webhook ping
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'Dr. Surabhi Knee & Back Pain Clinic - Cal.id Webhook Handler',
      endpoint: 'https://kneeandbackpainclinic.vercel.app/api/cal-webhook',
      supportedEvents: [
        'BOOKING_CREATED (dispatches booking confirmation)',
        'BOOKING_RESCHEDULED (dispatches updated confirmation)',
        'BEFORE_EVENT / REMINDER (dispatches 30-min pre-consultation reminder)',
        'MEETING_STARTED (acknowledged without dispatching messages)',
        'MEETING_ENDED (acknowledged without dispatching messages)',
        'BOOKING_CANCELLED (updates CRM status)'
      ],
      clinicAddress: 'Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Vartak Nagar, Thane West, Maharashtra 400606',
      clinicEmail: 'kneeandbackpainclinic@gmail.com'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const rawTriggerEvent = body.triggerEvent || body.event || body.type || 'BOOKING_CREATED';
    const normalizedEvent = String(rawTriggerEvent).toUpperCase().trim();
    const payload = body.payload || body.data || body;

    // -------------------------------------------------------------------------
    // 1. Classify Webhook Event
    // -------------------------------------------------------------------------
    const isMeetingLifecycle = /MEETING_STARTED|MEETING_ENDED|STARTED|ENDED/i.test(normalizedEvent);
    const isBookingCancelled = /CANCEL/i.test(normalizedEvent);
    const isReminderEvent = /BEFORE_EVENT|REMINDER|WORKFLOW|30MIN/i.test(normalizedEvent);
    const isBookingRescheduled = /RESCHED/i.test(normalizedEvent);
    const isBookingCreated = !isMeetingLifecycle && !isBookingCancelled && !isReminderEvent && !isBookingRescheduled;

    const attendees = Array.isArray(payload.attendees) ? payload.attendees : [];
    const firstAttendee = attendees[0] || {};
    const responses = payload.responses || {};

    // Extract Attendee details
    const name = firstAttendee.name || (responses.name && responses.name.value) || payload.name || 'Patient';
    const email = firstAttendee.email || (responses.email && responses.email.value) || payload.email || '';

    let rawPhone = firstAttendee.phoneNumber || firstAttendee.attendeePhoneNumber || payload.attendeePhoneNumber || payload.phoneNumber || payload.phone || '';
    if (!rawPhone && responses) {
      if (responses.attendeePhoneNumber) {
        const val = responses.attendeePhoneNumber;
        rawPhone = (typeof val === 'object' && val !== null) ? (val.value || '') : String(val);
      }
      if (!rawPhone) {
        for (const key of Object.keys(responses)) {
          if (/phone|mobile|contact|whatsapp|attendee/i.test(key)) {
            const val = responses[key];
            rawPhone = (typeof val === 'object' && val !== null) ? (val.value || '') : String(val);
            if (rawPhone) break;
          }
        }
      }
    }

    const cleanPhone = (rawPhone || '').replace(/[^0-9]/g, '').slice(-10);

    // Format Appointment Date & Time in IST (+05:30)
    const startTimeIso = payload.startTime || payload.start || (payload.booking && (payload.booking.startTime || payload.booking.start));
    let formattedDate = 'Upcoming Date';
    let formattedTime = 'Upcoming Time';
    if (startTimeIso) {
      const dateObj = new Date(startTimeIso);
      formattedDate = dateObj.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const t = dateObj.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toUpperCase();
      formattedTime = `${t} IST`;
    }

    const slotString = `${formattedDate} at ${formattedTime}`;
    const slotStringWithIso = startTimeIso ? `${slotString} [ISO:${startTimeIso}]` : slotString;
    const bookingUid = payload.uid || payload.id || `cal_${Date.now()}`;
    const nowIso = new Date().toISOString();

    // Supabase CRM credentials
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

    let leadId = `CAL-${String(bookingUid).slice(0, 8)}`;
    let existingLead = null;

    if (supabaseUrl && supabaseKey) {
      try {
        if (cleanPhone && cleanPhone.length === 10) {
          const searchResp = await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${cleanPhone}*&select=id,name,phone,status,slot_preference,prior_treatments`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          if (searchResp.ok) {
            const matches = await searchResp.json();
            if (matches && matches.length > 0) existingLead = matches[0];
          }
        }

        const leadStatus = isBookingCancelled
          ? 'Consultation Cancelled'
          : (isBookingRescheduled ? 'Consultation Rescheduled' : 'Consultation Scheduled');

        if (existingLead) {
          leadId = existingLead.id;
          if (!isMeetingLifecycle) {
            await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${leadId}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: existingLead.name && existingLead.name !== 'Patient' ? existingLead.name : name,
                status: leadStatus,
                slot_preference: slotStringWithIso,
                recommended_step: '₹1,000 Diagnostic Consultation'
              })
            });
          } else if (/MEETING_ENDED|ENDED/i.test(normalizedEvent)) {
            await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${leadId}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'Consultation Completed' })
            }).catch(() => {});
          }
        } else if (!isMeetingLifecycle) {
          await fetch(`${supabaseUrl}/rest/v1/leads`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              id: leadId,
              name: name,
              phone: cleanPhone || '9999999999',
              city: 'Thane',
              pain_area: 'Joint & Back Pain',
              recommended_step: '₹1,000 Diagnostic Consultation',
              slot_preference: slotStringWithIso,
              status: leadStatus
            })
          });
        }
      } catch (dbErr) {
        console.warn('Supabase Cal.id Webhook DB Sync Notice:', dbErr.message);
      }
    }

    const agentBandhuKey = (process.env.AGENTBANDHU_API_KEY || process.env.META_WHATSAPP_ACCESS_TOKEN || '').trim();

    // -------------------------------------------------------------------------
    // 2. LIFECYCLE EVENTS: MEETING_STARTED and MEETING_ENDED
    // -------------------------------------------------------------------------
    // Strictly IGNORE MEETING_STARTED (10:00 AM) and MEETING_ENDED (10:30 AM).
    // These must NEVER dispatch duplicate confirmation or reminder messages.
    if (isMeetingLifecycle) {
      return res.status(200).json({
        success: true,
        triggerEvent: rawTriggerEvent,
        action: 'ignored_meeting_lifecycle',
        message: `Meeting lifecycle event (${rawTriggerEvent}) acknowledged. No WhatsApp messages dispatched.`
      });
    }

    // -------------------------------------------------------------------------
    // 3. CANCELLATION EVENTS: BOOKING_CANCELLED
    // -------------------------------------------------------------------------
    if (isBookingCancelled) {
      return res.status(200).json({
        success: true,
        triggerEvent: rawTriggerEvent,
        action: 'cancellation_recorded',
        message: 'Consultation cancellation recorded in CRM. No confirmation or reminder sent.'
      });
    }

    // -------------------------------------------------------------------------
    // 4. 30-MINUTE PRE-CONSULTATION REMINDER DISPATCH
    // -------------------------------------------------------------------------
    if (isReminderEvent) {
      let reminderSent = false;
      let reminderError = null;

      // Deduplication: Avoid re-sending reminder if already reminded
      let alreadyReminded = false;
      if (existingLead && (existingLead.status === 'Consultation Scheduled (Reminded)' || (existingLead.prior_treatments && existingLead.prior_treatments.includes('Reminder: 30min sent')))) {
        alreadyReminded = true;
      }

      if (agentBandhuKey && cleanPhone && cleanPhone.length === 10 && !alreadyReminded) {
        try {
          const { formatPhoneNumber, buildAgentBandhuPayload, AGENTBANDHU_MESSAGES_ENDPOINT } = await import('./_lib/whatsapp-templates.js');
          const formattedTo = formatPhoneNumber(cleanPhone);
          const reminderTemplate = 'surabhi_v4_no_image';

          // 4 Variables for surabhi_v4_no_image
          const reminderVariables = [
            name || 'Patient',
            `Reminder: Your in-clinic consultation with Dr. Surabhi Vaidya begins in 30 minutes at ${formattedTime}.`,
            'Location: Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.',
            'Please arrive 10 minutes early. Bring relevant reports and a current list of medicines, if available.'
          ];

          const waPayload = buildAgentBandhuPayload({
            to: formattedTo,
            templateName: reminderTemplate,
            variables: reminderVariables,
            reference: `cal_rem_${bookingUid}`
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
            reminderSent = true;
            if (supabaseUrl && supabaseKey) {
              await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${leadId}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  status: 'Consultation Scheduled (Reminded)',
                  prior_treatments: `Reminder: 30min sent at ${nowIso}`
                })
              }).catch(() => {});
            }
          } else {
            reminderError = await waResp.text();
            console.warn('AgentBandhu Reminder Dispatch Notice:', waResp.status, reminderError);
          }
        } catch (err) {
          reminderError = err.message;
          console.warn('AgentBandhu Reminder Exception:', err.message);
        }
      }

      return res.status(200).json({
        success: true,
        triggerEvent: rawTriggerEvent,
        action: 'reminder_dispatched',
        patient: { name, phone: cleanPhone ? `+91${cleanPhone}` : '' },
        slot: slotString,
        reminderSent,
        alreadyReminded,
        reminderError: reminderError || undefined
      });
    }

    // -------------------------------------------------------------------------
    // 5. BOOKING CREATION & RESCHEDULE DISPATCH
    // -------------------------------------------------------------------------
    // Strictly fire ONLY on BOOKING_CREATED or BOOKING_RESCHEDULED.
    let whatsappSent = false;
    let whatsappError = null;
    const templateName = 'consultation_booking_confirmation_v1';

    let alreadySentRecently = false;
    if (existingLead && existingLead.prior_treatments && existingLead.prior_treatments.includes('Confirmation:')) {
      const match = existingLead.prior_treatments.match(/at ([0-9T:.Z-]+)/);
      if (match) {
        const prevSent = new Date(match[1]).getTime();
        if (Date.now() - prevSent < 15 * 60 * 1000) {
          alreadySentRecently = true;
        }
      }
    }

    if (agentBandhuKey && cleanPhone && cleanPhone.length === 10 && (isBookingCreated || isBookingRescheduled) && !alreadySentRecently) {
      try {
        const { formatPhoneNumber, buildAgentBandhuPayload, AGENTBANDHU_MESSAGES_ENDPOINT } = await import('./_lib/whatsapp-templates.js');
        const formattedTo = formatPhoneNumber(cleanPhone);
        const variables = [name || 'Patient', formattedDate, formattedTime];

        const waPayload = buildAgentBandhuPayload({
          to: formattedTo,
          templateName: templateName,
          variables: variables,
          reference: `cal_${bookingUid}`
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
          whatsappSent = true;
          if (supabaseUrl && supabaseKey) {
            await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${leadId}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                prior_treatments: `Confirmation: ${templateName} at ${nowIso}`
              })
            }).catch(() => {});
          }
        } else {
          const waErrText = await waResp.text();
          whatsappError = waErrText;
          console.warn('AgentBandhu Webhook dispatch status not OK:', waResp.status, waErrText);
        }
      } catch (waErr) {
        whatsappError = waErr.message;
        console.warn('AgentBandhu Webhook Dispatch Warning:', waErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      triggerEvent: rawTriggerEvent,
      bookingUid,
      patient: {
        name,
        email,
        phone: cleanPhone ? `+91${cleanPhone}` : ''
      },
      slot: slotString,
      whatsappSent,
      alreadySentRecently,
      whatsappError: whatsappError || undefined
    });

  } catch (err) {
    console.error('Cal.id Webhook Handler Error:', err);
    return res.status(500).json({ error: 'Server error handling Cal.id webhook', details: err.message });
  }
}
