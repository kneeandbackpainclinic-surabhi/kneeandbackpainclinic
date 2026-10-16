// Vercel Serverless Function: Cal.id / Cal.com Webhook Handler
// Endpoint: POST /api/cal-webhook
// Supported events: BOOKING_CREATED, BOOKING_RESCHEDULED, BOOKING_CANCELLED

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
      service: 'Dr. Surabhi Knee & Back Pain Clinic - Cal.id Webhook',
      endpoint: 'https://kneeandbackpainclinic.vercel.app/api/cal-webhook',
      supportedEvents: ['BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED'],
      clinicAddress: 'Charak Health Solutions, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Vartak Nagar, Thane West, Maharashtra 400606',
      clinicEmail: 'kneeandbackpainclinic@gmail.com'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const triggerEvent = body.triggerEvent || body.event || body.type || 'BOOKING_CREATED';
    const payload = body.payload || body.data || body;

    const attendees = Array.isArray(payload.attendees) ? payload.attendees : [];
    const firstAttendee = attendees[0] || {};
    const responses = payload.responses || {};

    // 1. Extract Attendee details
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

    // 2. Format Appointment Date & Time in IST (+05:30)
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
    const bookingUid = payload.uid || payload.id || `cal_${Date.now()}`;
    const nowIso = new Date().toISOString();

    // 3. Sync to Supabase CRM Leads
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

    let leadId = `CAL-${String(bookingUid).slice(0, 8)}`;
    let existingLead = null;

    if (supabaseUrl && supabaseKey) {
      try {
        if (cleanPhone && cleanPhone.length === 10) {
          const searchResp = await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${cleanPhone}*&select=id,name,phone,delivered_message,delivered_message_time`, {
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

        const isCancelled = /cancel/i.test(triggerEvent);
        const isRescheduled = /resched/i.test(triggerEvent);
        const leadStatus = isCancelled ? 'Consultation Cancelled' : (isRescheduled ? 'Consultation Rescheduled' : 'Consultation Scheduled');

        if (existingLead) {
          leadId = existingLead.id;
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
              slot_preference: slotString,
              recommended_step: '₹1,000 Diagnostic Consultation'
            })
          });
        } else {
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
              slot_preference: slotString,
              status: leadStatus,
              payment_status: 'Unpaid',
              created_at: nowIso
            })
          });
        }
      } catch (dbErr) {
        console.warn('Supabase Cal.id Webhook DB Sync Notice:', dbErr.message);
      }
    }

    // 4. Dispatch AgentBandhu WhatsApp Confirmation if valid phone
    let whatsappSent = false;
    let whatsappError = null;
    const agentBandhuKey = (process.env.AGENTBANDHU_API_KEY || process.env.META_WHATSAPP_ACCESS_TOKEN || '').trim();

    const templateName = 'consultation_booking_confirmation_v1';
    let alreadySentRecently = false;
    if (existingLead && existingLead.delivered_message === templateName && existingLead.delivered_message_time) {
      const prevSent = new Date(existingLead.delivered_message_time).getTime();
      if (Date.now() - prevSent < 10 * 60 * 1000) {
        alreadySentRecently = true;
      }
    }

    if (agentBandhuKey && cleanPhone && cleanPhone.length === 10 && triggerEvent !== 'BOOKING_CANCELLED' && !alreadySentRecently) {
      try {
        const { formatPhoneNumber, buildAgentBandhuPayload, AGENTBANDHU_MESSAGES_ENDPOINT } = await import('./whatsapp-templates.js');
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
          // Update delivered message status in Supabase
          if (supabaseUrl && supabaseKey) {
            await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${leadId}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                delivered_message: templateName,
                delivered_message_time: nowIso
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
      triggerEvent,
      bookingUid,
      patient: {
        name,
        email,
        phone: cleanPhone ? `+91${cleanPhone}` : ''
      },
      slot: slotString,
      whatsappSent,
      whatsappError: whatsappError || undefined
    });

  } catch (err) {
    console.error('Cal.id Webhook Handler Error:', err);
    return res.status(500).json({ error: 'Server error handling Cal.id webhook', details: err.message });
  }
}
