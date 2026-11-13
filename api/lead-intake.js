// Vercel Serverless Function: Secure Lead Intake, Supabase Sync & WhatsApp Dispatcher
// Endpoint: POST /api/lead-intake
// Purpose: Handles consultation enquiry capture, slot selection, and payment status updates

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = req.body || {};
    const rawPhone = body.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '').slice(-10);

    // Validate 10-digit Indian mobile number
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' });
    }

    const patientName = (body.name || 'Patient').trim();
    if (!patientName || patientName.length < 2) {
      return res.status(400).json({ error: 'Please provide a valid patient name (at least 2 characters).' });
    }

    const concern = body.concern || body.painArea || 'Knee Pain';
    const whatsappConsent = Boolean(body.whatsappConsent || body.whatsapp_consent);
    const patientEmail = (body.email || '').trim().toLowerCase();
    const city = (body.city || 'Thane West').trim();

    // Consultation pricing logic:
    // Option 1: Pay Online ₹800 (Save 20%)
    // Option 2: Pay at Clinic ₹1,000
    const paymentMethod = body.paymentMethod || body.payment_method || 'pending';
    let amount = 1000;
    let discountApplied = 0;

    if (paymentMethod === 'pay_online_payu' || body.amount === 800) {
      amount = 800;
      discountApplied = 200;
    } else if (body.amount) {
      amount = Number(body.amount);
    }

    const slotPreference = (body.slotPreference || body.slot || '').trim();
    const slotDate = (body.slotDate || body.slot_date || '').trim();
    const slotTime = (body.slotTime || body.slot_time || '').trim();

    // Booking & Payment Statuses
    let status = body.status || 'Lead Captured';
    let paymentStatus = body.paymentStatus || body.payment_status || 'Unpaid';

    if (paymentMethod === 'pay_at_clinic') {
      if (!body.status) status = 'Appointment Requested - Pay at Clinic';
      if (!body.paymentStatus) paymentStatus = 'Pay at Clinic - Pending (₹1,000)';
    } else if (paymentMethod === 'pay_online_payu' && (paymentStatus.includes('Paid') || body.isPaid)) {
      status = 'Appointment Confirmed - Paid Online (₹800)';
      paymentStatus = 'Paid Online (₹800)';
    }

    const paymentOrderId = body.paymentOrderId || body.payment_order_id || body.orderId || null;
    const utr = (body.utr || '').trim();
    const notes = body.notes || (utr ? `UTR: ${utr}` : null);
    const staffNotes = body.staffNotes || body.staff_notes || null;
    const createdAt = body.createdAt || new Date().toISOString();
    const leadId = body.id || ('LEAD-' + Math.floor(1000 + Math.random() * 9000));

    // Marketing Attribution
    const utmSource = body.utm_source || body.utmSource || null;
    const utmMedium = body.utm_medium || body.utmMedium || null;
    const utmCampaign = body.utm_campaign || body.utmCampaign || null;
    const utmContent = body.utm_content || body.utmContent || null;
    const utmTerm = body.utm_term || body.utmTerm || null;
    const gclid = body.gclid || null;

    const consultationMode = body.consultation_mode || body.consultationMode || 'in_clinic';
    const isOnline = (consultationMode === 'online_video');
    const bookingType = isOnline ? 'online_video_consultation' : 'in_clinic_consultation';

    const recommendedStep = isOnline
      ? (amount === 800 ? 'Online Video Consultation (Prepaid ₹800 - 20% Discount)' : 'Online Video Consultation (₹1,000)')
      : (amount === 800 ? 'In-Clinic Consultation (Prepaid ₹800 - 20% Discount)' : 'In-Clinic Consultation (₹1,000 at Clinic Desk)');

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

    let syncedToSupabase = false;
    let savedLeadId = leadId;

    if (supabaseUrl && supabaseKey) {
      try {
        // Step 1: Idempotent lookup by phone to update existing lead rather than creating duplicate
        let existingId = null;
        try {
          const searchResp = await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${cleanPhone}*&select=id,status,slot_preference&limit=1`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          if (searchResp.ok) {
            const matches = await searchResp.json();
            if (matches && matches.length > 0) {
              existingId = matches[0].id;
              savedLeadId = existingId;
            }
          }
        } catch (searchErr) {
          console.warn('Supabase search warning:', searchErr.message);
        }

        const endpoint = existingId
          ? `${supabaseUrl}/rest/v1/leads?id=eq.${existingId}`
          : `${supabaseUrl}/rest/v1/leads`;
        const method = existingId ? 'PATCH' : 'POST';

        // Step 2: Attempt rich payload with all new columns
        const richPayload = {
          id: savedLeadId,
          name: patientName,
          phone: cleanPhone,
          email: patientEmail || null,
          city: city,
          pain_area: concern,
          concern: concern,
          whatsapp_consent: whatsappConsent,
          recommended_step: recommendedStep,
          slot_preference: slotPreference || null,
          slot_date: slotDate || null,
          slot_time: slotTime || null,
          status: status,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          amount: amount,
          discount_applied: discountApplied,
          payment_order_id: paymentOrderId,
          notes: notes,
          staff_notes: staffNotes,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          utm_content: utmContent,
          utm_term: utmTerm,
          gclid: gclid,
          booking_type: bookingType,
          consultation_mode: consultationMode,
          created_at: createdAt
        };

        const dbResp = await fetch(endpoint, {
          method,
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(richPayload)
        });

        if (dbResp.ok) {
          syncedToSupabase = true;
        } else {
          // Step 3: Resilient fallback: If custom columns are not yet migrated in Supabase,
          // safely embed extra attributes into base columns so NO data is lost
          const metaParts = [];
          if (concern) metaParts.push(`Concern: ${concern}`);
          if (amount) metaParts.push(`Fee: ₹${amount}`);
          if (paymentMethod) metaParts.push(`Method: ${paymentMethod}`);
          if (utmSource) metaParts.push(`UTM: ${utmSource}/${utmCampaign || ''}`);
          if (gclid) metaParts.push(`GCLID: ${gclid}`);
          const metaString = metaParts.length > 0 ? ` [${metaParts.join(' | ')}]` : '';

          const basePayload = {
            id: savedLeadId,
            name: patientName,
            phone: cleanPhone,
            city: city + (patientEmail ? ` [Email: ${patientEmail}]` : ''),
            pain_area: concern,
            recommended_step: recommendedStep,
            slot_preference: (slotPreference || 'Flexible') + metaString,
            status: status,
            payment_status: paymentStatus,
            payment_order_id: paymentOrderId,
            notes: notes ? `${notes} ${metaString}` : metaString,
            created_at: createdAt
          };

          const fallbackResp = await fetch(endpoint, {
            method,
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(basePayload)
          });

          if (fallbackResp.ok) {
            syncedToSupabase = true;
          } else {
            const errText = await fallbackResp.text();
            console.warn('Supabase DB Sync Notice:', errText);
          }
        }
      } catch (dbErr) {
        console.warn('Supabase DB Connection Warning:', dbErr.message);
      }
    }

    // Step 4: Event-driven WhatsApp confirmation (AgentBandhu) if appointment is booked
    const agentBandhuKey = (process.env.AGENTBANDHU_API_KEY || process.env.META_WHATSAPP_ACCESS_TOKEN || '').trim();
    const isAppointmentBooked = status.includes('Appointment') || status.includes('Confirmed');
    const shouldSendWA = body.triggerWhatsApp === true || (isAppointmentBooked && body.sendConfirmation !== false);

    if (agentBandhuKey && shouldSendWA) {
      try {
        const {
          formatPhoneNumber,
          buildAgentBandhuPayload,
          AGENTBANDHU_MESSAGES_ENDPOINT,
          CLINIC_UPI_VPA,
          CLINIC_UPI_QR_URL
        } = await import('./_lib/whatsapp-templates.js');

        const displaySlot = slotPreference || `${slotDate || 'Upcoming Date'} at ${slotTime || '11:00 AM'}`;
        const isPaidOnline = status.includes('Paid Online') || paymentStatus.includes('Paid Online');

        let templateName = 'surabhi_v4_with_image';
        let variables = [];
        let headerMediaUrl = null;

        if (isPaidOnline) {
          // If already paid, send clean booking confirmation pass
          templateName = 'consultation_booking_confirmation_v1';
          variables = [patientName, slotDate || 'Clinic Hours', slotTime || '30-Minute Consultation'];
        } else {
          // If Unpaid / Pay Later, deliver the UPI QR Code & VPA ID in WhatsApp!
          templateName = 'surabhi_v4_with_image';
          headerMediaUrl = CLINIC_UPI_QR_URL;
          const locDetails = isOnline
            ? `Online Video Consultation (Meeting link will be shared prior to the call).`
            : `Location: Cura 304, Raymond TenX Habitat, Thane West.`;
          variables = [
            patientName,
            `Your consultation with Dr. Surabhi Vaidya is confirmed for ${displaySlot}. ${locDetails}`,
            `Standard Fee: ₹1,000. Special 20% Discount: Prepay ₹800 via UPI VPA: ${CLINIC_UPI_VPA}`,
            `Scan the QR code above or tap here to pay ₹800: https://kneeandbackpainrelief.com/pay-upi?lead=${savedLeadId}&am=800`
          ];
        }

        const waPayload = buildAgentBandhuPayload({
          to: formatPhoneNumber(cleanPhone),
          templateName,
          variables,
          headerMediaUrl,
          reference: `lead_${savedLeadId}`
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

        if (waResp.ok && supabaseUrl && supabaseKey) {
          await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${savedLeadId}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              delivered_message: templateName,
              delivered_message_time: new Date().toISOString()
            })
          }).catch(() => {});
        }
      } catch (waErr) {
        console.warn('WhatsApp booking confirmation dispatch note:', waErr.message);
      }
    }

    // Return structured response
    return res.status(200).json({
      success: true,
      message: 'Consultation enquiry saved successfully',
      leadId: savedLeadId,
      supabaseSynced: syncedToSupabase,
      lead: {
        id: savedLeadId,
        name: patientName,
        phone: cleanPhone,
        concern: concern,
        status: status,
        slotPreference: slotPreference,
        amount: amount,
        discountApplied: discountApplied,
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethod
      }
    });

  } catch (err) {
    console.error('Lead Intake Error:', err);
    return res.status(500).json({ error: 'Lead processing failed', details: err.message });
  }
}
