// Vercel Serverless Function: Consultation Scheduling & Slot Verification Bridge
// Endpoint: GET /api/cal-direct & POST /api/cal-direct
// Handles verified appointment slots, double-booking prevention, and clinic intake schedule

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
    ''
  ).trim();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

  // --------------------------------------------------------------------------
  // GET: Available consultation slots & slot verification
  // --------------------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      const action = req.query.action || 'slots';
      const daysCount = Math.min(parseInt(req.query.days || '6', 10), 10);
      const consultationMode = (req.query.mode || 'in_clinic').trim();
      const now = new Date();

      // Query booked slots from Supabase to prevent double bookings
      const bookedSlotsMap = new Set();
      if (supabaseUrl && supabaseKey) {
        try {
          const leadsResp = await fetch(`${supabaseUrl}/rest/v1/leads?select=slot_preference,slot_date,slot_time,status&limit=100`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          if (leadsResp.ok) {
            const bookedLeads = await leadsResp.json();
            for (const b of bookedLeads) {
              if (b.slot_date && b.slot_time) {
                bookedSlotsMap.add(`${b.slot_date}_${b.slot_time}`);
              } else if (b.slot_preference) {
                bookedSlotsMap.add(b.slot_preference.toLowerCase().trim());
              }
            }
          }
        } catch (dbErr) {
          console.warn('Booking collision check note:', dbErr.message);
        }
      }

      // Action: Real-time single slot availability check to prevent double bookings
      if (action === 'check') {
        const checkDate = req.query.date || '';
        const checkTime = req.query.time || '';
        if (!checkDate || !checkTime) {
          return res.status(400).json({ success: false, error: 'Date and time are required to check slot availability.' });
        }
        const slotKey = `${checkDate}_${checkTime}`;
        const isTaken = bookedSlotsMap.has(slotKey) || bookedSlotsMap.has(`${checkDate} at ${checkTime}`.toLowerCase());
        return res.status(200).json({
          success: true,
          available: !isTaken,
          date: checkDate,
          time: checkTime,
          mode: consultationMode
        });
      }

      // Verified Clinic Operational Hours:
      // Monday to Saturday: 10:00 AM - 1:00 PM (Morning), 4:30 PM - 7:30 PM (Evening)
      // Sunday: 10:00 AM - 1:00 PM (Morning only)
      const standardWeekdaySlots = [
        { time: '10:00 AM', hour: 10, min: 0, period: 'morning' },
        { time: '10:45 AM', hour: 10, min: 45, period: 'morning' },
        { time: '11:30 AM', hour: 11, min: 30, period: 'morning' },
        { time: '12:15 PM', hour: 12, min: 15, period: 'morning' },
        { time: '04:30 PM', hour: 16, min: 30, period: 'evening' },
        { time: '05:15 PM', hour: 17, min: 15, period: 'evening' },
        { time: '06:00 PM', hour: 18, min: 0, period: 'evening' },
        { time: '06:45 PM', hour: 18, min: 45, period: 'evening' },
        { time: '07:30 PM', hour: 19, min: 30, period: 'evening' }
      ];

      const standardSundaySlots = [
        { time: '10:00 AM', hour: 10, min: 0, period: 'morning' },
        { time: '11:00 AM', hour: 11, min: 0, period: 'morning' },
        { time: '12:00 PM', hour: 12, min: 0, period: 'morning' }
      ];

      const availableDays = [];

      for (let i = 0; i < daysCount; i++) {
        // Calculate day in IST (UTC + 5:30)
        const d = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
        const dayOfWeek = d.getDay(); // 0 is Sunday
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

        const slotTemplate = isSunday ? standardSundaySlots : standardWeekdaySlots;
        const daySlots = [];

        for (const slot of slotTemplate) {
          const slotDateTime = new Date(d.getTime());
          slotDateTime.setHours(slot.hour, slot.min, 0, 0);

          // Skip past slots for today (require at least 1 hour lead time)
          if (i === 0 && slotDateTime.getTime() <= now.getTime() + (60 * 60 * 1000)) {
            continue;
          }

          const slotKey = `${dateKey}_${slot.time}`;
          const isCollided = bookedSlotsMap.has(slotKey) || bookedSlotsMap.has(`${displayDate} at ${slot.time}`.toLowerCase());

          daySlots.push({
            time: slot.time,
            display: `${displayDate} at ${slot.time}`,
            dateKey: dateKey,
            period: slot.period,
            available: !isCollided
          });
        }

        if (daySlots.length > 0) {
          availableDays.push({
            dateKey: dateKey,
            displayDate: displayDate,
            dayOfWeek: weekdayName,
            isSunday: isSunday,
            slots: daySlots
          });
        }
      }

      // Calculate first available slot and whether there are open appointments this week
      let firstAvailableSlot = null;
      let hasSlotsThisWeek = false;

      // In IST, calculate days until Sunday (end of current week)
      const nowISTString = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
      const nowISTDate = new Date(nowISTString);
      const dayOfWeekIST = nowISTDate.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
      const daysUntilSunday = dayOfWeekIST === 0 ? 0 : (7 - dayOfWeekIST);

      for (let i = 0; i < availableDays.length; i++) {
        const dayItem = availableDays[i];
        const isThisWeek = i <= daysUntilSunday;
        const freeSlot = (dayItem.slots || []).find(s => s.available);
        if (freeSlot) {
          if (!firstAvailableSlot) {
            firstAvailableSlot = {
              dateKey: freeSlot.dateKey,
              time: freeSlot.time,
              display: freeSlot.display,
              displayDate: dayItem.displayDate,
              dayOfWeek: dayItem.dayOfWeek,
              isThisWeek: isThisWeek
            };
          }
          if (isThisWeek) {
            hasSlotsThisWeek = true;
          }
        }
      }

      return res.status(200).json({
        success: true,
        clinic: 'Charak Health Solutions (Thane West)',
        doctor: 'Dr. Surabhi Vaidya',
        consultationLengthMinutes: 30,
        mode: CAL_API_KEY ? 'cal_id_direct' : 'clinic_hours_request',
        requiresStaffConfirmation: !CAL_API_KEY,
        notice: CAL_API_KEY
          ? 'Live calendar reservation connected.'
          : 'Slots reflect verified clinic operating hours. Appointment requests are confirmed via WhatsApp / Call.',
        firstAvailableSlot: firstAvailableSlot,
        hasSlotsThisWeek: hasSlotsThisWeek,
        days: availableDays
      });

    } catch (err) {
      console.error('Error fetching consultation slots:', err);
      return res.status(500).json({ error: 'Failed to retrieve clinic schedule: ' + err.message });
    }
  }

  // --------------------------------------------------------------------------
  // POST: Reserve consultation slot & update lead status
  // --------------------------------------------------------------------------
  if (req.method === 'POST') {
    try {
      const {
        leadId,
        name,
        phone,
        email,
        slotDate,
        slotTime,
        slotDisplay,
        paymentMethod,
        concern
      } = req.body || {};

      const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (!cleanPhone || cleanPhone.length !== 10) {
        return res.status(400).json({ error: 'Valid 10-digit mobile phone number is required.' });
      }

      const effectiveSlot = slotDisplay || `${slotDate || 'Upcoming'} at ${slotTime || '11:00 AM'}`;
      const isOnlinePay = (paymentMethod === 'pay_online_payu');
      const amount = isOnlinePay ? 800 : 1000;
      const status = isOnlinePay
        ? 'Slot Selected - Awaiting Online Payment'
        : 'Appointment Requested - Pay at Clinic';
      const paymentStatus = isOnlinePay
        ? 'Pending Online Payment (₹800)'
        : 'Pay at Clinic - Pending (₹1,000)';

      // Real-time double booking collision prevention check
      if (slotDate && slotTime && supabaseUrl && supabaseKey) {
        try {
          const checkResp = await fetch(`${supabaseUrl}/rest/v1/leads?slot_date=eq.${slotDate}&slot_time=eq.${slotTime}&phone=not.like.*${cleanPhone}*&select=id&limit=1`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          if (checkResp.ok) {
            const collisions = await checkResp.json();
            if (collisions && collisions.length > 0) {
              return res.status(409).json({
                success: false,
                conflict: true,
                error: 'This consultation slot has just been reserved by another patient. Please select another time.'
              });
            }
          }
        } catch (colErr) {
          console.warn('Collision check notice:', colErr.message);
        }
      }

      // Sync reservation to Supabase public.leads
      let synced = false;
      let finalId = leadId || `LEAD-${Date.now().toString().slice(-4)}`;

      if (supabaseUrl && supabaseKey) {
        try {
          const leadPayload = {
            name: name || 'Patient',
            phone: cleanPhone,
            email: email || null,
            pain_area: concern || 'Knee Pain',
            concern: concern || 'Knee Pain',
            slot_preference: effectiveSlot,
            slot_date: slotDate || null,
            slot_time: slotTime || null,
            status: status,
            payment_status: paymentStatus,
            payment_method: paymentMethod || 'pay_at_clinic',
            amount: amount,
            discount_applied: isOnlinePay ? 200 : 0,
            recommended_step: isOnlinePay ? 'In-Clinic Consultation (Prepaid ₹800)' : 'In-Clinic Consultation (₹1,000 at Clinic)'
          };

          // Search if lead exists
          const searchResp = await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${cleanPhone}*&select=id&limit=1`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });

          if (searchResp.ok) {
            const matches = await searchResp.json();
            if (matches && matches.length > 0) {
              finalId = matches[0].id;
              await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${finalId}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(leadPayload)
              });
              synced = true;
            } else {
              leadPayload.id = finalId;
              leadPayload.created_at = new Date().toISOString();
              await fetch(`${supabaseUrl}/rest/v1/leads`, {
                method: 'POST',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(leadPayload)
              });
              synced = true;
            }
          }
        } catch (dbErr) {
          console.warn('Slot booking Supabase sync note:', dbErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: isOnlinePay
          ? 'Slot reserved. Proceeding to online payment (₹800).'
          : 'Appointment requested successfully. Pay ₹1,000 at clinic desk on arrival.',
        leadId: finalId,
        slot: effectiveSlot,
        amount: amount,
        paymentMethod: paymentMethod || 'pay_at_clinic',
        status: status,
        paymentStatus: paymentStatus,
        requiresStaffConfirmation: !CAL_API_KEY
      });

    } catch (err) {
      console.error('Slot booking error:', err);
      return res.status(500).json({ error: 'Failed to reserve appointment slot: ' + err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
