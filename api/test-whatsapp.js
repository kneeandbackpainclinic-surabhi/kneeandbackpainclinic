// Vercel Serverless Function: AgentBandhu WhatsApp Integration Live Diagnostics & Test Runner
// Endpoint: GET /api/test-whatsapp & POST /api/test-whatsapp

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
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const body = req.body || {};

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

  // Step 1: Validate API Key Existence
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

  // Step 2: Build Payload
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

  // Step 3: Dispatch Test HTTP Request to AgentBandhu
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
