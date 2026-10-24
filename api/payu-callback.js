// Vercel Serverless Function: PayU SURL / FURL Browser Callback Handler
// Endpoint: POST / GET /api/payu-callback

import crypto from 'crypto';

// Helper to safely parse urlencoded / json body in serverless environments
async function parseRequestBody(req) {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return req.body;
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        if (raw.trim().startsWith('{')) {
          return resolve(JSON.parse(raw));
        }
        const parsed = {};
        const params = new URLSearchParams(raw);
        for (const [k, v] of params.entries()) {
          parsed[k] = v;
        }
        resolve(parsed);
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  try {
    const parsedBody = await parseRequestBody(req);
    const payload = Object.assign({}, req.query || {}, parsedBody || {});

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'kneeandbackpainclinic.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${proto}://${host}`;

    const payuSalt = (process.env.PAYU_MERCHANT_SALT || process.env.PAYU_SALT || '').trim();

    const status = (payload.status || '').toLowerCase();
    const txnid = payload.txnid || payload.mihpayid || ('TXN_' + Date.now());
    const amount = payload.amount || '';
    const productinfo = payload.productinfo || 'Charak Health Consultation';
    const firstname = payload.firstname || 'Patient';
    const email = payload.email || '';
    const phone = payload.phone || payload.udf3 || '';
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    const udf1 = payload.udf1 || '';
    const udf2 = payload.udf2 || '';
    const udf3 = payload.udf3 || cleanPhone;
    const udf4 = payload.udf4 || '';
    const udf5 = payload.udf5 || '';
    const receivedHash = payload.hash || '';
    const additionalCharges = payload.additionalCharges || payload.additional_charges || '';
    const errorMessage = payload.error_Message || payload.errorMessage || payload.unmappedstatus || 'Payment could not be completed';

    // Verify Hash integrity
    let isHashValid = false;
    const isSimulated = payload.simulated === 'true' || payload.simulated === true || !payuSalt;

    if (isSimulated) {
      isHashValid = true;
    } else if (payuSalt && receivedHash) {
      let hashString = '';
      if (additionalCharges) {
        // Reverse Hash with additionalCharges:
        // sha512(additionalCharges|salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
        hashString = [
          additionalCharges,
          payuSalt,
          payload.status,
          '', '', '', '', '', // 5 empty slots representing udf10, udf9, udf8, udf7, udf6
          udf5,
          udf4,
          udf3,
          udf2,
          udf1,
          email,
          firstname,
          productinfo,
          amount,
          txnid,
          payload.key || ''
        ].join('|');
      } else {
        // Standard Reverse Hash:
        // sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
        hashString = [
          payuSalt,
          payload.status,
          '', '', '', '', '', // 5 empty slots representing udf10, udf9, udf8, udf7, udf6
          udf5,
          udf4,
          udf3,
          udf2,
          udf1,
          email,
          firstname,
          productinfo,
          amount,
          txnid,
          payload.key || ''
        ].join('|');
      }

      const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
      isHashValid = calculatedHash.toLowerCase() === receivedHash.toLowerCase();

      if (!isHashValid) {
        console.warn('PayU Callback Hash mismatch! Possible tampering or invalid salt.');
      }
    }

    const isPaid = (status === 'success' || isSimulated) && isHashValid;

    // Supabase & WhatsApp Automation Sync upon successful payment
    if (isPaid) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
      const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

      const isWebinarOrder = Number(amount) === 201 || productinfo.toLowerCase().includes('masterclass') || productinfo.toLowerCase().includes('webinar');
      const templateName = isWebinarOrder ? 'webinar_joining_details_v1' : 'consultation_booking_confirmation_v1';
      const nowIso = new Date().toISOString();

      if (supabaseUrl && supabaseKey) {
        try {
          // Find matching lead by leadId (udf1) or clean phone
          let leadId = udf1;
          let patientName = firstname;

          if (!leadId && cleanPhone) {
            const searchResp = await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${cleanPhone}*&select=id,name,phone&order=created_at.desc&limit=1`, {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`
              }
            });
            if (searchResp.ok) {
              const matches = await searchResp.json();
              if (matches && matches.length > 0) {
                leadId = matches[0].id;
                patientName = matches[0].name || patientName;
              }
            }
          }

          if (leadId) {
            await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${leadId}`, {
              method: 'PATCH',
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: 'Paid & Confirmed',
                payment_status: `Paid via PayU (₹${amount})`,
                payment_order_id: txnid,
                payment_updated_at: nowIso,
                delivered_message: templateName,
                delivered_message_time: nowIso
              })
            });
          }
        } catch (dbErr) {
          console.warn('PayU Callback Supabase Update Warning:', dbErr.message);
        }
      }

      // Dispatch WhatsApp Confirmation via AgentBandhu
      const agentBandhuKey = (process.env.AGENTBANDHU_API_KEY || process.env.META_WHATSAPP_ACCESS_TOKEN || '').trim();
      if (agentBandhuKey && cleanPhone) {
        try {
          const { formatPhoneNumber, buildAgentBandhuPayload, AGENTBANDHU_MESSAGES_ENDPOINT } = await import('./whatsapp-templates.js');
          const variables = isWebinarOrder
            ? [firstname || 'Patient', 'Sunday, 15 November 2026', '11:00 AM IST']
            : [firstname || 'Patient', 'Upcoming Clinic Hours', 'Flexible'];

          const waPayload = buildAgentBandhuPayload({
            to: formatPhoneNumber(cleanPhone),
            templateName,
            variables,
            reference: `payu_${txnid || Date.now()}`
          });

          await fetch(AGENTBANDHU_MESSAGES_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${agentBandhuKey}`,
              'x-api-key': agentBandhuKey,
              'api-key': agentBandhuKey
            },
            body: JSON.stringify(waPayload)
          });
        } catch (waErr) {
          console.warn('PayU AgentBandhu WhatsApp Warning:', waErr.message);
        }
      }
    }

    // Determine clean target URL to return the patient to
    const redirectTarget = isPaid
      ? `${baseUrl}/?order_id=${encodeURIComponent(txnid)}&status=SUCCESS&gateway=payu&amount=${encodeURIComponent(amount)}&plan=${encodeURIComponent(productinfo)}&phone=${encodeURIComponent(cleanPhone)}&name=${encodeURIComponent(firstname)}`
      : `${baseUrl}/?order_id=${encodeURIComponent(txnid)}&status=FAILED&gateway=payu&error=${encodeURIComponent(errorMessage)}`;

    // Return HTML meta refresh and 303 Redirect so all browser types redirect reliably
    res.writeHead(303, { Location: redirectTarget });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${redirectTarget}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isPaid ? 'Payment Confirmed' : 'Payment Status'} - Dr. Surabhi Clinic</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #faf8f5; color: #1e3a2f; }
    .card { text-align: center; padding: 2.2rem 1.8rem; background: #ffffff; border-radius: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); max-width: 420px; width: 90%; }
    .icon { font-size: 3rem; margin-bottom: 12px; }
    h2 { font-size: 1.35rem; margin: 0 0 8px 0; color: #1e3a2f; }
    p { font-size: 0.92rem; color: #64748b; line-height: 1.5; margin: 0 0 18px 0; }
    .spinner { border: 3px solid #f1f5f9; border-top: 3px solid #1e3a2f; border-radius: 50%; width: 32px; height: 32px; animation: spin 0.9s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .redirect-link { display: inline-block; color: #1e3a2f; font-weight: 600; text-decoration: underline; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <div class="icon">${isPaid ? '✓' : '⚠️'}</div>
    <h2>${isPaid ? 'Payment Confirmed!' : 'Processing Payment...'}</h2>
    <p>${isPaid ? 'Your booking has been secured. Redirecting you to your confirmation screen...' : 'Returning you back to the clinic website...'}</p>
    <a class="redirect-link" href="${redirectTarget}">Click here if not redirected automatically</a>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error('PayU Callback Critical Error:', err);
    res.writeHead(303, { Location: `/?status=ERROR&gateway=payu` });
    res.end();
  }
}
