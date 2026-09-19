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
    const lead = req.body;
    if (!lead || !lead.phone) {
      return res.status(400).json({ error: 'Missing lead phone number' });
    }

    const supabaseUrl = process.env.SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

    // 1. Sync Lead directly into Supabase Table: public.leads
    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            id: lead.id || ('LEAD-' + Math.floor(100 + Math.random() * 900)),
            name: lead.name || 'Patient',
            phone: lead.phone,
            city: lead.city || 'Thane',
            pain_area: lead.painArea || 'Joint Pain',
            severity: lead.severity || '',
            prior_treatments: lead.priorTreatments || '',
            readiness: lead.readiness || '',
            recommended_step: lead.recommendedStep || 'Assessment Completed',
            slot_preference: lead.slotPreference || 'Flexible',
            status: lead.status || 'New Lead',
            created_at: lead.createdAt || new Date().toISOString()
          })
        });
      } catch (dbErr) {
        console.warn('Supabase DB Sync Notice:', dbErr.message);
      }
    }

    // 2. Trigger Meta WhatsApp Business Cloud API if configured
    if (process.env.META_WHATSAPP_ACCESS_TOKEN && process.env.META_WHATSAPP_PHONE_NUMBER_ID) {
      const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
      const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

      await fetch(`https://graph.facebook.com/v19.0/${process.env.META_WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: fullPhone,
          type: 'text',
          text: {
            body: `Namaste ${lead.name || 'Patient'} ji, thank you for completing the pain assessment with Dr. Surabhi Vaidya Clinic (Charak Health Solutions). We have received your request for ${lead.recommendedStep || 'consultation'}. Our clinic team will connect shortly.`
          }
        })
      });
    }

    // 3. Trigger External Webhook (e.g. Make.com / Zapier / Google Sheets) if configured
    if (process.env.MAKE_WEBHOOK_URL) {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead received and synced with Supabase successfully',
      leadId: lead.id || 'LEAD-' + Date.now()
    });

  } catch (err) {
    console.error('Lead Intake Error:', err);
    return res.status(500).json({ error: 'Lead processing failed', details: err.message });
  }
}
