// Vercel Serverless Function: Secure Lead Intake, Supabase Sync & WhatsApp/Email Dispatcher
// Endpoint: POST /api/lead-intake

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
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const lead = req.body || {};
    const rawPhone = lead.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Missing or invalid 10-digit mobile phone number' });
    }

    const patientName = (lead.name || 'Patient').trim();
    const patientEmail = (lead.email || '').trim().toLowerCase();
    const city = (lead.city || 'Thane').trim();
    const painArea = lead.painArea || 'Joint Pain';
    const severity = lead.severity || '';
    const priorTreatments = lead.priorTreatments || '';
    const readiness = lead.readiness || '';
    const recommendedStep = lead.recommendedStep || 'Assessment Completed';
    const slotPreference = lead.slotPreference || 'Flexible';
    const status = lead.status || 'New Lead';
    const paymentStatus = lead.paymentStatus || 'Unpaid';
    const deliveredMessage = lead.deliveredMessage || 'None';
    const createdAt = lead.createdAt || new Date().toISOString();
    const leadId = lead.id || ('LEAD-' + Math.floor(1000 + Math.random() * 9000));

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

    let syncedToSupabase = false;
    let savedLeadId = leadId;

    // 1. Resilient Sync Lead directly into Supabase Table: public.leads
    if (supabaseUrl && supabaseKey) {
      try {
        // Step 1A: Search if lead already exists by phone to update instead of duplicate
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

        // Step 1B: Attempt rich insert/update (assuming all columns exist)
        const richPayload = {
          id: savedLeadId,
          name: patientName,
          phone: cleanPhone,
          email: patientEmail,
          city: city,
          pain_area: painArea,
          severity: severity,
          prior_treatments: priorTreatments,
          readiness: readiness,
          recommended_step: recommendedStep,
          slot_preference: slotPreference,
          status: status,
          payment_status: paymentStatus,
          delivered_message: deliveredMessage,
          created_at: createdAt
        };

        let dbResp = await fetch(endpoint, {
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
          // Step 1C: Schema fallback: If custom columns (email, payment_status, delivered_message) don't exist yet in Supabase,
          // safely embed email and payment status into base columns so NO data is lost!
          const metaParts = [];
          if (patientEmail) metaParts.push(`Email: ${patientEmail}`);
          if (paymentStatus && paymentStatus !== 'Unpaid') metaParts.push(`Payment: ${paymentStatus}`);
          const metaString = metaParts.length > 0 ? ` [${metaParts.join(' | ')}]` : '';

          const basePayload = {
            id: savedLeadId,
            name: patientName,
            phone: cleanPhone,
            city: city + (patientEmail ? ` [Email: ${patientEmail}]` : ''),
            pain_area: painArea,
            severity: severity,
            prior_treatments: (priorTreatments ? `${priorTreatments} | ` : '') + (metaParts.length ? metaParts.join(' | ') : ''),
            readiness: readiness,
            recommended_step: recommendedStep,
            slot_preference: slotPreference + metaString,
            status: status,
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
        console.warn('Supabase DB Sync Notice:', dbErr.message);
      }
    }

    // 2. Trigger AgentBandhu WhatsApp Cloud API if configured and requested
    const agentBandhuKey = (process.env.AGENTBANDHU_API_KEY || process.env.META_WHATSAPP_ACCESS_TOKEN || '').trim();
    const shouldSendWhatsApp = (lead.triggerWhatsApp === true);
    if (agentBandhuKey && shouldSendWhatsApp) {
      try {
        const isWebinar = (recommendedStep || '').toLowerCase().includes('webinar') || (recommendedStep || '').toLowerCase().includes('masterclass');
        const templateName = isWebinar ? 'webinar_registration_confirmation_v1' : 'consultation_booking_confirmation_v1';
        const variables = isWebinar
          ? [patientName, 'Sunday, 15 November 2026', '11:00 AM IST']
          : [patientName, slotPreference || 'Upcoming Clinic Hours', 'Flexible'];

        const { formatPhoneNumber, buildAgentBandhuPayload, AGENTBANDHU_MESSAGES_ENDPOINT } = await import('./_lib/whatsapp-templates.js');
        const waPayload = buildAgentBandhuPayload({
          to: formatPhoneNumber(cleanPhone),
          templateName,
          variables,
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
        console.warn('AgentBandhu WhatsApp Intake Dispatch Warning:', waErr.message);
      }
    }

    // 3. Trigger External Webhook (Make.com / Zapier / Google Sheets) if configured
    const externalWebhookUrl = process.env.MAKE_WEBHOOK_URL || process.env.ZAPIER_WEBHOOK_URL;
    if (externalWebhookUrl) {
      try {
        await fetch(externalWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: savedLeadId,
            name: patientName,
            phone: cleanPhone,
            email: patientEmail,
            city: city,
            painArea: painArea,
            recommendedStep: recommendedStep,
            slotPreference: slotPreference,
            status: status,
            paymentStatus: paymentStatus,
            createdAt: createdAt,
            source: 'Google Ads / Website Direct'
          })
        });
      } catch (hookErr) {
        console.warn('Webhook dispatch warning:', hookErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Lead received and secured successfully',
      leadId: savedLeadId,
      supabaseSynced: syncedToSupabase,
      patient: {
        name: patientName,
        phone: cleanPhone,
        email: patientEmail,
        status: status,
        paymentStatus: paymentStatus
      }
    });

  } catch (err) {
    console.error('Lead Intake Error:', err);
    return res.status(500).json({ error: 'Lead processing failed', details: err.message });
  }
}
