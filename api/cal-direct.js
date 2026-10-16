// Vercel Serverless Function: Direct Cal.id API Integration
// Enables native in-page slot selection and booking without Cal.id iframe/popups
// Endpoints:
//   GET  /api/cal-direct?action=status
//   GET  /api/cal-direct?action=slots&days=7
//   POST /api/cal-direct  (Creates booking directly via Cal.id API + Syncs CRM + WhatsApp)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const CAL_API_KEY = (
    process.env.CALID_API ||
    process.env.CAL_API_KEY ||
    process.env.CALID_API_KEY ||
    process.env.CAL_API ||
    ''
  ).trim();

  const CAL_API_BASE = 'https://api.cal.id';

  // --------------------------------------------------------------------------
  // GET: Health status, event types, or available slots
  // --------------------------------------------------------------------------
  if (req.method === 'GET') {
    const action = req.query.action || 'slots';

    if (action === 'status') {
      return res.status(200).json({
        status: 'active',
        service: 'Cal.id Direct API Bridge',
        hasApiKey: !!CAL_API_KEY,
        keyPrefix: CAL_API_KEY ? `${CAL_API_KEY.slice(0, 6)}...` : null
      });
    }

    if (action === 'event-types') {
      if (!CAL_API_KEY) {
        return res.status(200).json({
          hasApiKey: false,
          eventTypes: [
            { id: 1, slug: 'consultation', title: 'In-Clinic Diagnostic Consultation', length: 30 }
          ]
        });
      }

      try {
        const etResp = await fetch(`${CAL_API_BASE}/event-types`, {
          headers: { 'Authorization': `Bearer ${CAL_API_KEY}` }
        });
        const etData = await etResp.json();
        return res.status(etResp.ok ? 200 : 500).json(etData);
      } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch event types', details: err.message });
      }
    }

    // Default action: slots
    try {
      const days = Math.min(parseInt(req.query.days || '7', 10), 14);
      let eventTypeId = req.query.eventTypeId;

      // If eventTypeId not provided and API key is present, look it up
      if (!eventTypeId && CAL_API_KEY) {
        try {
          const etResp = await fetch(`${CAL_API_BASE}/event-types`, {
            headers: { 'Authorization': `Bearer ${CAL_API_KEY}` }
          });
          if (etResp.ok) {
            const etData = await etResp.json();
            const types = etData.event_types || etData.eventTypes || etData.data || (Array.isArray(etData) ? etData : []);
            const match = types.find(t => /consultation/i.test(t.slug || t.title)) || types[0];
            if (match && match.id) {
              eventTypeId = match.id;
            }
          }
        } catch (e) {
          console.warn('Could not auto-fetch eventTypeId:', e.message);
        }
      }

      // Calculate date window in IST
      const now = new Date();
      const startDate = new Date(now.getTime());
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
      endDate.setHours(23, 59, 59, 999);

      let apiSlots = null;

      if (CAL_API_KEY && eventTypeId) {
        try {
          const slotsUrl = new URL(`${CAL_API_BASE}/slots/`);
          slotsUrl.searchParams.set('eventTypeId', String(eventTypeId));
          slotsUrl.searchParams.set('start', startDate.toISOString());
          slotsUrl.searchParams.set('end', endDate.toISOString());
          slotsUrl.searchParams.set('timeZone', 'Asia/Kolkata');

          const sResp = await fetch(slotsUrl.toString(), {
            headers: { 'Authorization': `Bearer ${CAL_API_KEY}` }
          });

          if (sResp.ok) {
            const sData = await sResp.json();
            apiSlots = sData.slots || sData.data?.slots || sData.data;
          } else {
            console.warn('Cal.id /slots response status not OK:', sResp.status);
          }
        } catch (fetchErr) {
          console.warn('Cal.id /slots fetch error:', fetchErr.message);
        }
      }

      // Format days and slots
      const formattedDays = [];
      const standardTimes = [
        '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
      ];

      for (let i = 0; i < days; i++) {
        const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        // Exclude Sunday (day 0) unless specified
        const dayOfWeek = d.getDay();
        const isSunday = (dayOfWeek === 0);

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateKey = `${yyyy}-${mm}-${dd}`;

        const weekdayName = d.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' });
        const monthName = d.toLocaleDateString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' });
        const displayDate = i === 0 ? `Today (${weekdayName}, ${dd} ${monthName})` :
                            i === 1 ? `Tomorrow (${weekdayName}, ${dd} ${monthName})` :
                            `${weekdayName}, ${dd} ${monthName}`;

        const daySlots = [];

        if (apiSlots && apiSlots[dateKey] && Array.isArray(apiSlots[dateKey])) {
          // Use live slots from Cal.id API
          for (const s of apiSlots[dateKey]) {
            const sTimeStr = s.time || s.start || s.startTime;
            if (!sTimeStr) continue;
            const slotD = new Date(sTimeStr);
            const timeLabel = slotD.toLocaleTimeString('en-IN', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: 'Asia/Kolkata'
            }).toUpperCase();
            const istHour = parseInt(slotD.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: 'numeric' }), 10);
            daySlots.push({
              time: timeLabel,
              startIso: slotD.toISOString(),
              endIso: endD.toISOString(),
              period: istHour < 14 ? 'morning' : 'evening'
            });
          }
        } else if (!isSunday) {
          // Resilient standard clinic working schedule (Dr. Surabhi Clinic)
          for (const t of standardTimes) {
            const [hr, min] = t.split(':').map(Number);
            const slotD = new Date(d.getTime());
            // Set time in IST (+5:30)
            slotD.setHours(hr, min, 0, 0);

            // Skip past times if today
            if (i === 0 && slotD.getTime() <= now.getTime() + 30 * 60 * 1000) {
              continue;
            }

            const timeLabel = slotD.toLocaleTimeString('en-IN', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }).toUpperCase();
            const endD = new Date(slotD.getTime() + 30 * 60 * 1000);

            daySlots.push({
              time: timeLabel,
              startIso: slotD.toISOString(),
              endIso: endD.toISOString(),
              period: hr < 14 ? 'morning' : 'evening'
            });
          }
        }

        formattedDays.push({
          dateKey,
          displayDate,
          weekdayName,
          dayNum: dd,
          monthName,
          isSunday,
          available: daySlots.length > 0,
          slots: daySlots
        });
      }

      return res.status(200).json({
        success: true,
        eventTypeId: eventTypeId || null,
        hasApiKey: !!CAL_API_KEY,
        days: formattedDays
      });

    } catch (err) {
      console.error('Error generating slots:', err);
      return res.status(500).json({ error: 'Failed to retrieve slots', details: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // POST: Direct Booking Creation (No Cal.id popup)
  // --------------------------------------------------------------------------
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const {
        name = 'Patient',
        phone = '',
        email = '',
        slotStart,
        slotEnd,
        slotDisplay = 'Selected Slot',
        eventTypeId,
        paymentStatus = 'Unpaid',
        paymentMethod = 'pay_at_clinic',
        painArea = 'Joint & Back Pain'
      } = body;

      const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (!cleanPhone || cleanPhone.length !== 10) {
        return res.status(400).json({ error: 'Valid 10-digit mobile number required' });
      }

      const patientEmail = email || `${cleanPhone}@patient.charakhealth.com`;
      let calBookingUid = `direct_${Date.now()}`;
      let calApiSuccess = false;
      let calApiError = null;

      // 1. If API key present, create booking via Cal.id API
      if (CAL_API_KEY && slotStart) {
        try {
          const targetEventTypeId = Number(eventTypeId || 117395);
          const bookingPayload = {
            eventTypeId: targetEventTypeId,
            start: slotStart,
            end: slotEnd || new Date(new Date(slotStart).getTime() + 30 * 60 * 1000).toISOString(),
            responses: {
              name: name,
              attendeePhoneNumber: `+91${cleanPhone}`,
              phone: `+91${cleanPhone}`,
              whatsapp: `+91${cleanPhone}`,
              email: patientEmail,
              timeZone: 'Asia/Kolkata',
              location: {
                value: 'inPerson',
                optionValue: 'Charak Health Solutions Clinic, Cura 304, Raymond TenX Habitat, Pokharan Road No. 2, Thane West.'
              }
            }
          };

          const bookResp = await fetch(`${CAL_API_BASE}/booking/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${CAL_API_KEY}`
            },
            body: JSON.stringify(bookingPayload)
          });

          const bookResult = await bookResp.json();
          if (bookResp.ok && (bookResult.id || bookResult.uid || bookResult.success)) {
            calApiSuccess = true;
            calBookingUid = bookResult.uid || bookResult.id || calBookingUid;
          } else {
            calApiError = bookResult.message || bookResult.error || 'Failed to book on Cal.id API';
            console.warn('Cal.id Direct Booking Notice:', bookResult);
          }
        } catch (apiErr) {
          calApiError = apiErr.message;
          console.warn('Cal.id Direct Booking Exception:', apiErr.message);
        }
      }

      const nowIso = new Date().toISOString();
      const leadId = `CAL-${String(calBookingUid).slice(0, 8)}`;

      // 2. Sync to Supabase CRM
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
      const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

      if (supabaseUrl && supabaseKey) {
        try {
          const leadData = {
            id: leadId,
            name: name,
            phone: cleanPhone,
            city: 'Thane',
            pain_area: painArea,
            recommended_step: '₹1,000 Diagnostic Consultation',
            slot_preference: slotDisplay,
            status: 'Consultation Scheduled',
            payment_status: paymentStatus || 'Unpaid',
            consent: 'Consent provided for Call & WhatsApp messaging',
            notes: `Booked directly via Cal.id bridge (${paymentMethod})`
          };

          // Search if lead exists
          const searchResp = await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${cleanPhone}*&select=id`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });

          if (searchResp.ok) {
            const matches = await searchResp.json();
            if (matches && matches.length > 0) {
              await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${matches[0].id}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  status: 'Consultation Scheduled',
                  slot_preference: slotDisplay,
                  payment_status: paymentStatus
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
                body: JSON.stringify(leadData)
              });
            }
          }
        } catch (dbErr) {
          console.warn('Supabase Lead Update Notice:', dbErr.message);
        }
      }

      // 3. Dispatch WhatsApp Confirmation via AgentBandhu
      let whatsappSent = false;
      const agentBandhuKey = (process.env.AGENTBANDHU_API_KEY || process.env.META_WHATSAPP_ACCESS_TOKEN || '').trim();

      if (agentBandhuKey && cleanPhone) {
        try {
          const { formatPhoneNumber, buildAgentBandhuPayload, AGENTBANDHU_MESSAGES_ENDPOINT } = await import('./whatsapp-templates.js');
          const formattedTo = formatPhoneNumber(cleanPhone);
          const templateName = 'consultation_booking_confirmation_v1';

          // Format Date and Time
          let dateStr = 'Upcoming Date';
          let timeStr = 'Upcoming Time';
          if (slotStart) {
            const sDate = new Date(slotStart);
            dateStr = sDate.toLocaleDateString('en-IN', {
              timeZone: 'Asia/Kolkata',
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
            timeStr = sDate.toLocaleTimeString('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
          }

          const variables = [name || 'Patient', dateStr, timeStr];
          const waPayload = buildAgentBandhuPayload({
            to: formattedTo,
            templateName: templateName,
            variables: variables,
            reference: `cal_${calBookingUid}`
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

          whatsappSent = waResp.ok;
        } catch (waErr) {
          console.warn('WhatsApp Direct Dispatch Warning:', waErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        bookingUid: calBookingUid,
        calApiSuccess,
        calApiError,
        patient: {
          name,
          phone: `+91${cleanPhone}`,
          email: patientEmail
        },
        slot: slotDisplay,
        paymentStatus,
        whatsappSent
      });

    } catch (err) {
      console.error('Cal Direct Booking Error:', err);
      return res.status(500).json({ error: 'Server error creating booking', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
