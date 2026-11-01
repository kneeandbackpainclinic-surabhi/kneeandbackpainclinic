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

  // GET: Fetch all leads with message tagging, payment details & email
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
      const mappedLeads = rows.map(r => {
        // 1. Extract Email from column or from fallback embedded metadata
        let email = r.email || '';
        if (!email) {
          const emailMatch = (r.city || '').match(/\[Email:\s*([^\]]+)\]/i) ||
                             (r.prior_treatments || '').match(/Email:\s*([^\|\n\r\]]+)/i) ||
                             (r.slot_preference || '').match(/\[Email:\s*([^\]]+)\]/i);
          if (emailMatch) email = emailMatch[1].trim();
        }

        // 2. Clean city text if it contained [Email: ...]
        let cleanCity = (r.city || 'Thane').replace(/\[Email:\s*[^\]]+\]/gi, '').trim() || 'Thane';

        // 3. Extract Payment Status
        let paymentStatus = r.payment_status || '';
        if (!paymentStatus) {
          const payMatch = (r.slot_preference || '').match(/Payment:\s*([^\|\n\r\]]+)/i) ||
                           (r.prior_treatments || '').match(/Payment:\s*([^\|\n\r\]]+)/i);
          if (payMatch) {
            paymentStatus = payMatch[1].trim();
          } else if (r.status && (r.status.toLowerCase().includes('drop') || r.status.toLowerCase().includes('fail'))) {
            paymentStatus = 'Payment Dropped Off';
          } else if (r.status && r.status.toLowerCase().includes('paid')) {
            paymentStatus = 'Paid';
          } else {
            paymentStatus = 'Unpaid';
          }
        }

        // 4. Clean slot preference text if it had metadata tags
        let cleanSlot = (r.slot_preference || 'Flexible')
          .replace(/\[Email:\s*[^\]]+\]/gi, '')
          .replace(/\[Payment:\s*[^\]]+\]/gi, '')
          .replace(/\|\s*Payment:[^\]\|]+/gi, '')
          .replace(/\[\s*\]/g, '')
          .trim() || 'Flexible';

        return {
          id: r.id,
          name: r.name,
          phone: r.phone,
          email: email,
          city: cleanCity,
          painArea: r.pain_area,
          severity: r.severity,
          priorTreatments: r.prior_treatments,
          readiness: r.readiness,
          recommendedStep: r.recommended_step,
          slotPreference: cleanSlot,
          status: r.status,
          deliveredMessage: r.delivered_message || 'None',
          deliveredMessageTime: r.delivered_message_time || null,
          paymentStatus: paymentStatus,
          createdAt: r.created_at
        };
      });

      return res.status(200).json({ leads: mappedLeads });
    } catch (e) {
      return res.status(200).json({ leads: [], error: e.message });
    }
  }

  // PATCH: Update lead status, delivered message tag, or payment status
  if (req.method === 'PATCH') {
    try {
      const { id, status, deliveredMessage, deliveredMessageTime, paymentStatus, email } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: 'Missing lead id' });
      }

      const patchPayload = {};
      if (status !== undefined) patchPayload.status = status;
      if (email !== undefined) patchPayload.email = email;
      if (deliveredMessage !== undefined) patchPayload.delivered_message = deliveredMessage;
      if (deliveredMessageTime !== undefined) patchPayload.delivered_message_time = deliveredMessageTime;
      if (paymentStatus !== undefined) patchPayload.payment_status = paymentStatus;

      let patchResp = await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patchPayload)
      });

      // If rich patch failed due to unknown columns, fall back to safe base patch
      if (!patchResp.ok) {
        const safePatch = {};
        if (status !== undefined) safePatch.status = status;
        if (paymentStatus && status === undefined) {
          safePatch.status = `Payment Status: ${paymentStatus}`;
        }
        await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(safePatch)
        });
      }

      return res.status(200).json({ success: true, id, updated: patchPayload });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
