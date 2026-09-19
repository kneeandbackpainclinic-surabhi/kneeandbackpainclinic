// Vercel Serverless Function: Webinar.gg Join Token Generator
// Endpoint: POST /api/get-webinar-token
// Follows Webinar.gg API architecture (from One-page-plan)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = (process.env.WEBINAR_GG_API_KEY || process.env.WEBINAR_GG_API_TOKEN || '').trim();
    const defaultWebinarId = (process.env.WEBINAR_GG_WEBINAR_ID || 'charakhealth').trim();

    const { name, email, phone, webinarId: requestedWebinarId } = req.body || {};
    const webinarId = (requestedWebinarId || defaultWebinarId || 'charakhealth').trim();

    const fullName = (name || 'Patient Attendee').trim().slice(0, 120);
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const validEmail = (email && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email))
      ? email.trim().toLowerCase()
      : `${cleanPhone || 'patient'}@charakhealth.com`;

    // If live Webinar.gg API key is present, request official token from webinar-api.webinar.gg
    if (apiKey) {
      const parts = fullName.split(/\s+/);
      const upstream = await fetch('https://webinar-api.webinar.gg/api/v1/webinar/join-token', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${apiKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          webinarId: webinarId,
          firstName: parts[0] || 'Patient',
          lastName: parts.length > 1 ? parts.slice(1).join(' ') : 'Attendee',
          name: fullName,
          email: validEmail,
          phone: cleanPhone ? `+91${cleanPhone.slice(-10)}` : '+919999999999',
          passcode: (process.env.WEBINAR_GG_PASSCODE || '').trim()
        })
      });

      const raw = await upstream.text();
      if (!upstream.ok) {
        console.error('webinar.gg join-token upstream failed:', upstream.status, raw);
        // Fallback gracefully so patient isn't blocked
        const fallbackJoinUrl = `https://webinar.gg/${webinarId}?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(validEmail)}`;
        return res.status(200).json({
          token: 'token_' + Date.now(),
          webinarId,
          joinUrl: fallbackJoinUrl,
          upstreamStatus: upstream.status
        });
      }

      let token = '';
      try {
        const parsed = JSON.parse(raw);
        const nested = parsed.data || {};
        token = parsed.token || parsed.joinToken || nested.token || nested.joinToken || '';
      } catch {
        token = raw.trim();
      }

      const joinUrl = token
        ? `https://webinar.gg/${webinarId}?token=${token}`
        : `https://webinar.gg/${webinarId}`;

      return res.status(200).json({
        token,
        webinarId,
        joinUrl
      });
    }

    // Default fallback room URL for Webinar.gg Charak Health room
    const directJoinUrl = `https://webinar.gg/${webinarId}?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(validEmail)}`;
    return res.status(200).json({
      token: 'simulated_token_' + Date.now(),
      webinarId,
      joinUrl: directJoinUrl,
      notice: 'WEBINAR_GG_API_KEY pending in environment. Room URL ready.'
    });

  } catch (err) {
    console.error('get-webinar-token handler error:', err);
    return res.status(500).json({ error: 'Failed to generate webinar token', details: err.message });
  }
}
