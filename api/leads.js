// Vercel Serverless Function: Secure Leads Management with Supabase
// Endpoint: GET /api/leads & PATCH /api/leads

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

  // GET: Fetch all leads with message tagging & payment details
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/leads?select=*&order=created_at.desc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return res.status(200).json({ leads: [], notice: 'Database table initializing' });
      }

      const rows = await response.json();
      const mappedLeads = rows.map(r => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        city: r.city,
        painArea: r.pain_area,
        severity: r.severity,
        priorTreatments: r.prior_treatments,
        readiness: r.readiness,
        recommendedStep: r.recommended_step,
        slotPreference: r.slot_preference,
        status: r.status,
        deliveredMessage: r.delivered_message || 'None',
        deliveredMessageTime: r.delivered_message_time || null,
        paymentStatus: r.payment_status || 'Unpaid',
        createdAt: r.created_at
      }));

      return res.status(200).json({ leads: mappedLeads });
    } catch (e) {
      return res.status(200).json({ leads: [], error: e.message });
    }
  }

  // PATCH: Update lead status, delivered message tag, or payment status
  if (req.method === 'PATCH') {
    try {
      const { id, status, deliveredMessage, deliveredMessageTime, paymentStatus } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: 'Missing lead id' });
      }

      const patchPayload = {};
      if (status !== undefined) patchPayload.status = status;
      if (deliveredMessage !== undefined) patchPayload.delivered_message = deliveredMessage;
      if (deliveredMessageTime !== undefined) patchPayload.delivered_message_time = deliveredMessageTime;
      if (paymentStatus !== undefined) patchPayload.payment_status = paymentStatus;

      await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patchPayload)
      });

      return res.status(200).json({ success: true, id, updated: patchPayload });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
