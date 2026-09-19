// Vercel Serverless Function: Webinar.gg Webhook Receiver
// Endpoint: POST /api/webinar-webhook
// Captures attendee join/dropoff events from Webinar.gg

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const email = body.email || (body.attendee && body.attendee.email) || '';
    const event = (body.event || body.type || body.action || 'activity').toLowerCase();
    const webinarId = body.webinarId || body.webinar_id || 'charakhealth';

    let eventType = 'activity';
    let leadStatus = null;
    if (/join|attend|present|live/.test(event)) {
      eventType = 'join';
      leadStatus = 'Webinar Attended';
    } else if (/drop|left|early|exit/.test(event)) {
      eventType = 'leave';
      leadStatus = 'Webinar Dropped Off';
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

    if (email && leadStatus && supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${email}*`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: leadStatus,
            webinar_status: eventType,
            webinar_last_event_at: new Date().toISOString()
          })
        });
      } catch (dbErr) {
        console.warn('Webinar webhook Supabase sync warning:', dbErr.message);
      }
    }

    return res.status(200).json({ status: 'ok', received: true, event: eventType });

  } catch (err) {
    console.error('Webinar webhook error:', err);
    return res.status(500).json({ error: 'Webinar webhook processing failed', details: err.message });
  }
}
