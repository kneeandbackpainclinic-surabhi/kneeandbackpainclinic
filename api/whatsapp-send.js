// Vercel Serverless Function: AgentBandhu WhatsApp Dispatcher & Test Runner
// Endpoint: POST /api/whatsapp-send & GET /api/whatsapp-send (and rewritten from /api/test-whatsapp)
// Documentation: https://agentbandhu.com/api/v1/public

import {
  AGENTBANDHU_MESSAGES_ENDPOINT,
  WHATSAPP_TEMPLATES,
  formatPhoneNumber,
  buildAgentBandhuPayload
} from './_lib/whatsapp-templates.js';

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

  const query = req.query || {};
  const body = req.body || {};

  // Check if this request is a test/diagnostic execution
  const isDiagnosticTest = query.test === 'true' || query.test === '1' || Boolean(query.phone) || (req.url && req.url.includes('test-whatsapp'));

  // DIAGNOSTIC RUNNER (Preserves backward compatibility for /api/test-whatsapp)
  if (isDiagnosticTest && (req.method === 'GET' || req.method === 'POST')) {
    const apiKey = (
      query.apiKey ||
      query.key ||
      body.apiKey ||
      process.env.AGENTBANDHU_API_KEY ||
      process.env.META_WHATSAPP_ACCESS_TOKEN ||
      ''
    ).trim();

    const testPhone = query.phone || body.phone || '+919820145872';
    const testTemplate = query.template || body.template || 'webinar_registration_confirmation_v1';
    const testName = query.name || body.name || 'Test Patient';

    const diagnostics = {
      timestamp: new Date().toISOString(),
      integration: 'AgentBandhu WhatsApp Cloud API',
      endpoint: AGENTBANDHU_MESSAGES_ENDPOINT,
      credentials: {
        keyConfigured: Boolean(apiKey),
        keyLength: apiKey.length,
        keyPreview: apiKey ? (apiKey.substring(0, 4) + '...' + apiKey.slice(-4)) : 'NOT_FOUND',
        sourceEnv: process.env.AGENTBANDHU_API_KEY ? 'AGENTBANDHU_API_KEY' : (process.env.META_WHATSAPP_ACCESS_TOKEN ? 'META_WHATSAPP_ACCESS_TOKEN' : (query.apiKey || body.apiKey ? 'MANUAL_INPUT' : 'NONE'))
      },
      testConfig: {
        recipientPhone: formatPhoneNumber(testPhone),
        template: testTemplate,
        templateValid: Boolean(WHATSAPP_TEMPLATES[testTemplate])
      },
      steps: []
    };

    if (!apiKey) {
      diagnostics.overallStatus = 'FAILED_MISSING_API_KEY';
      diagnostics.steps.push({
        step: 1,
        name: 'Check API Key Configuration',
        status: 'FAILED',
        message: 'No API key provided. Set META_WHATSAPP_ACCESS_TOKEN in environment variables, or pass ?apiKey=YOUR_KEY in the request URL.'
      });
      return res.status(200).json(diagnostics);
    }

    diagnostics.steps.push({
      step: 1,
      name: 'Check API Key Configuration',
      status: 'PASSED',
      message: 'API Key detected successfully.'
    });

    let payload;
    try {
      const tmpl = WHATSAPP_TEMPLATES[testTemplate] || WHATSAPP_TEMPLATES.webinar_registration_confirmation_v1;
      const testVars = [...tmpl.defaultVariables];
      if (testVars.length > 0) testVars[0] = testName;

      payload = buildAgentBandhuPayload({
        to: testPhone,
        templateName: tmpl.name,
        variables: testVars,
        reference: `diag_${Date.now()}`
      });

      diagnostics.steps.push({
        step: 2,
        name: 'Construct AgentBandhu JSON Payload',
        status: 'PASSED',
        payload
      });
    } catch (err) {
      diagnostics.overallStatus = 'FAILED_PAYLOAD_CONSTRUCTION';
      diagnostics.steps.push({
        step: 2,
        name: 'Construct AgentBandhu JSON Payload',
        status: 'FAILED',
        error: err.message
      });
      return res.status(200).json(diagnostics);
    }

    try {
      const resp = await fetch(AGENTBANDHU_MESSAGES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'x-api-key': apiKey,
          'api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      const respText = await resp.text();
      let respJson;
      try {
        respJson = JSON.parse(respText);
      } catch {
        respJson = { raw: respText };
      }

      diagnostics.steps.push({
        step: 3,
        name: 'AgentBandhu Public API Dispatch (POST /api/v1/public/messages)',
        httpStatus: resp.status,
        status: resp.ok ? 'PASSED' : 'FAILED',
        response: respJson
      });

      if (resp.ok) {
        diagnostics.overallStatus = 'SUCCESS';
        diagnostics.message = 'AgentBandhu accepted the message dispatch!';
      } else {
        diagnostics.overallStatus = 'FAILED_AT_API';
        diagnostics.message = respJson.error?.message || 'AgentBandhu returned an error code';
        diagnostics.recommendation = resp.status === 401
          ? 'The API Key appears to be invalid or expired. Check your AgentBandhu dashboard and copy the exact public API Key.'
          : 'Verify recipient phone number format or template variables in AgentBandhu.';
      }

      return res.status(200).json(diagnostics);
    } catch (err) {
      diagnostics.overallStatus = 'FAILED_NETWORK_EXCEPTION';
      diagnostics.steps.push({
        step: 3,
        name: 'AgentBandhu Public API Dispatch',
        status: 'FAILED',
        error: err.message
      });
      return res.status(500).json(diagnostics);
    }
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
