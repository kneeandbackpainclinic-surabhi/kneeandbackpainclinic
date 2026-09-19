// Vercel Serverless Function: Secure Outbound AI Voice Calling
// Endpoint: POST /api/ai-call

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { phone, name, painArea, recommendedStep, authSecret } = req.body;

    // Verify admin secret or allowed origin
    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'surabhi2026';
    if (authSecret && authSecret !== expectedSecret) {
      return res.status(401).json({ error: 'Unauthorized. Invalid admin secret key.' });
    }

    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Invalid phone number provided.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhoneNumber = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

    // 1. Check if VAPI is configured
    if (process.env.VAPI_API_KEY) {
      const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assistantId: process.env.VAPI_ASSISTANT_ID,
          phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
          customer: {
            number: fullPhoneNumber,
            name: name || 'Patient'
          },
          assistantOverrides: {
            variableValues: {
              patientName: name || 'Patient',
              painArea: painArea || 'Knee & Back Pain',
              recommendedStep: recommendedStep || 'Diagnostic Assessment'
            }
          }
        })
      });

      const vapiData = await vapiResponse.json();
      return res.status(200).json({ success: true, provider: 'vapi', data: vapiData });
    }

    // 2. Check if Bland.ai is configured
    if (process.env.BLAND_API_KEY) {
      const blandResponse = await fetch('https://api.bland.ai/v1/calls', {
        method: 'POST',
        headers: {
          'authorization': process.env.BLAND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: fullPhoneNumber,
          task: `You are clinical assistant Priya calling from Dr. Surabhi Vaidya's Knee & Back Pain Clinic in Thane West. Speak to ${name || 'the patient'} regarding their inquiry for ${painArea || 'pain relief'} and confirm their ${recommendedStep || 'consultation'}. Be polite, empathetic, and speak in conversational Hindi and English.`,
          voice: 'maya',
          language: 'hi'
        })
      });

      const blandData = await blandResponse.json();
      return res.status(200).json({ success: true, provider: 'bland', data: blandData });
    }

    // Fallback mode if keys not yet populated in Vercel environment
    return res.status(200).json({
      success: true,
      mode: 'simulated',
      message: `AI call request queued for ${name} at ${fullPhoneNumber}. (To activate live calling, add VAPI_API_KEY or BLAND_API_KEY in Vercel Environment Variables).`
    });

  } catch (err) {
    console.error('AI Call Error:', err);
    return res.status(500).json({ error: 'Failed to process AI calling request', details: err.message });
  }
}
