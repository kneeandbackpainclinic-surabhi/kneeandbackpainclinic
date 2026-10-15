// Vercel Serverless Function: AgentBandhu WhatsApp Dispatcher
// Endpoint: POST /api/whatsapp-send & GET /api/whatsapp-send
// Documentation: https://agentbandhu.com/api/v1/public

import {
  AGENTBANDHU_MESSAGES_ENDPOINT,
  WHATSAPP_TEMPLATES,
  formatPhoneNumber,
  buildAgentBandhuPayload
} from './whatsapp-templates.js';

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

  // GET: Return template catalog and integration health status
  if (req.method === 'GET') {
    const configuredKey = (process.env.AGENTBANDHU_API_KEY || process.env.META_WHATSAPP_ACCESS_TOKEN || '').trim();
    return res.status(200).json({
      success: true,
      service: 'AgentBandhu WhatsApp API',
      endpoint: AGENTBANDHU_MESSAGES_ENDPOINT,
      apiKeyConfigured: Boolean(configuredKey),
      keySource: configuredKey ? (process.env.AGENTBANDHU_API_KEY ? 'AGENTBANDHU_API_KEY' : 'META_WHATSAPP_ACCESS_TOKEN') : 'None',
      templatesCount: Object.keys(WHATSAPP_TEMPLATES).length,
      templates: WHATSAPP_TEMPLATES
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = req.body || {};
    const {
      to,
      template,
      variables,
      language,
      headerMediaUrl,
      reference,
      leadId,
      apiKey: customApiKey
    } = body;

    if (!to) {
      return res.status(400).json({ error: 'Missing recipient phone number (to)' });
    }

    if (!template) {
      return res.status(400).json({ error: 'Missing template name' });
    }

    const apiKey = (customApiKey || process.env.AGENTBANDHU_API_KEY || process.env.META_WHATSAPP_ACCESS_TOKEN || '').trim();
    if (!apiKey) {
      return res.status(400).json({
        error: 'API key not configured.',
        details: 'Please configure META_WHATSAPP_ACCESS_TOKEN in environment variables, or pass apiKey in request body.'
      });
    }

    // Format phone to E.164 (+91XXXXXXXXXX)
    const formattedTo = formatPhoneNumber(to);
    if (!formattedTo || formattedTo.length < 12) {
      return res.status(400).json({
        error: 'Invalid recipient phone number',
        provided: to,
        expected: '10-digit Indian phone or +91XXXXXXXXXX'
      });
    }

    // Construct AgentBandhu payload
    let payload;
    try {
      payload = buildAgentBandhuPayload({
        to: formattedTo,
        templateName: template,
        variables,
        language,
        headerMediaUrl,
        reference
      });
    } catch (tmplErr) {
      return res.status(400).json({ error: tmplErr.message });
    }

    // Call AgentBandhu Public API
    const response = await fetch(AGENTBANDHU_MESSAGES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey,
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    // Check if dispatch succeeded
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        status: response.status,
        error: responseData,
        message: 'AgentBandhu API rejected the request',
        payloadSent: payload
      });
    }

    // Dispatch was accepted by AgentBandhu!
    const nowIso = new Date().toISOString();

    // Sync delivery record into Supabase leads table if leadId or phone is provided
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

    if (supabaseUrl && supabaseKey) {
      try {
        if (leadId) {
          await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${leadId}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              delivered_message: template,
              delivered_message_time: nowIso
            })
          });
        } else {
          const clean10 = formattedTo.replace(/[^0-9]/g, '').slice(-10);
          await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${clean10}*`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              delivered_message: template,
              delivered_message_time: nowIso
            })
          });
        }
      } catch (dbErr) {
        console.warn('Supabase message delivery sync notice:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      status: response.status,
      message: 'WhatsApp message dispatched successfully via AgentBandhu',
      to: formattedTo,
      template,
      reference: payload.reference,
      data: responseData,
      dispatchedAt: nowIso
    });

  } catch (err) {
    console.error('AgentBandhu WhatsApp Dispatch Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to dispatch WhatsApp message',
      details: err.message
    });
  }
}
