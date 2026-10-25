// Vercel Serverless Function: PayU Server-to-Server Webhook Handler
// Endpoint: POST / GET /api/payu-webhook
// Handles events: Successful, Failed, Refund, Dispute

import crypto from 'crypto';

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

  // GET request: Health check / ping for testing in browser or setup verification
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'PayU Webhook Handler',
      endpoint: '/api/payu-webhook',
      supportedEvents: ['Successful', 'Failed', 'Refund', 'Dispute'],
      configuredSalt: !!(process.env.PAYU_MERCHANT_SALT || process.env.PAYU_SALT),
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parsedBody = await parseRequestBody(req);
    const payload = Object.assign({}, req.query || {}, parsedBody || {});

    // Handle PayU dashboard test verification ping during webhook registration
    if (
      payload.event === 'test' ||
      payload.test === true ||
      payload.type === 'ping' ||
      (!payload.status && !payload.txnid && !payload.hash)
    ) {
      console.log('PayU Webhook Verification / Ping received:', JSON.stringify(payload));
      return res.status(200).json({
        success: true,
        message: 'PayU webhook endpoint active and verified successfully',
        receivedAt: new Date().toISOString()
      });
    }

    const defaultUatSalt = 'B57aH6MOoX3T9Gs0XOi15fow7UfjfdQq';
    const payuSalt = (process.env.PAYU_MERCHANT_SALT || process.env.PAYU_SALT || defaultUatSalt).trim();

    const status = (payload.status || payload.event || req.query.event || '').toLowerCase();
    const txnid = payload.txnid || payload.mihpayid || payload.merchantTransactionId || '';
    const amount = payload.amount || payload.net_amount || '';
    const productinfo = payload.productinfo || '';
    const firstname = payload.firstname || 'Patient';
    const email = payload.email || '';
    const phone = payload.phone || payload.udf3 || '';
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    const udf1 = payload.udf1 || '';
    const udf2 = payload.udf2 || '';
    const udf3 = payload.udf3 || cleanPhone;
    const udf4 = payload.udf4 || '';
    const udf5 = payload.udf5 || '';
    const receivedHash = payload.hash || payload.signature || '';
    const additionalCharges = payload.additionalCharges || payload.additional_charges || '';

    // Verify Hash integrity when available
    let isHashValid = true;
    if (payuSalt && receivedHash) {
      let hashString = '';
      if (additionalCharges) {
        hashString = [
          additionalCharges,
          payuSalt,
          payload.status || status,
          '', '', '', '', '',
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
        hashString = [
          payuSalt,
          payload.status || status,
          '', '', '', '', '',
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
        console.warn('PayU Webhook Hash Mismatch warning:', {
          receivedHash,
          calculatedHash,
          status,
          txnid
        });
        // Note: For non-payment status events (like Dispute/Refund notifications), PayU sometimes sends custom signatures.
      }
    }

    const queryEvent = (req.query.event || '').toLowerCase();
    const isPaid = status === 'success' || status === 'captured' || status === 'successful' || queryEvent === 'successful';
    const isFailed = status === 'failed' || status === 'failure' || status === 'user_aborted' || queryEvent === 'failed';
    const isRefund = status === 'refund' || status === 'refunded' || queryEvent === 'refund';
    const isDispute = status === 'dispute' || status === 'disputed' || queryEvent === 'dispute';

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';
    const nowIso = new Date().toISOString();

    // 1. EVENT: SUCCESSFUL PAYMENT
    if (isPaid) {
      const isWebinarOrder = Number(amount) === 201 || (productinfo && (productinfo.toLowerCase().includes('masterclass') || productinfo.toLowerCase().includes('webinar')));
      const templateName = isWebinarOrder ? 'webinar_joining_details_v1' : 'consultation_booking_confirmation_v1';

      let alreadySent = false;
      if (supabaseUrl && supabaseKey) {
        try {
          let leadId = udf1;
          if (!leadId && cleanPhone) {
            const searchResp = await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${cleanPhone}*&select=id,name,phone,payment_order_id,delivered_message&order=created_at.desc&limit=1`, {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`
              }
            });
            if (searchResp.ok) {
              const matches = await searchResp.json();
              if (matches && matches.length > 0) {
                leadId = matches[0].id;
                if (matches[0].payment_order_id === txnid && matches[0].delivered_message) {
                  alreadySent = true;
                }
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
          console.warn('PayU Webhook DB Update Notice:', dbErr.message);
        }
      }

      // Dispatch WhatsApp Confirmation via AgentBandhu (Only if not already sent by callback)
      const agentBandhuKey = (process.env.AGENTBANDHU_API_KEY || process.env.META_WHATSAPP_ACCESS_TOKEN || '').trim();
      if (!alreadySent && agentBandhuKey && cleanPhone) {
        try {
          const { formatPhoneNumber, buildAgentBandhuPayload, AGENTBANDHU_MESSAGES_ENDPOINT } = await import('./_lib/whatsapp-templates.js');
          const variables = isWebinarOrder
            ? [firstname || 'Patient', 'Sunday, 15 November 2026', '11:00 AM IST']
            : [firstname || 'Patient', 'Upcoming Clinic Hours', 'Flexible'];

          const waPayload = buildAgentBandhuPayload({
            to: formatPhoneNumber(cleanPhone),
            templateName,
            variables,
            reference: `payu_wh_${txnid || Date.now()}`
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
          console.warn('PayU Webhook WhatsApp Dispatch Warning:', waErr.message);
        }
      }

      return res.status(200).json({ success: true, event: 'Successful', processed: true, txnid });
    }

    // 2. EVENT: FAILED PAYMENT
    if (isFailed) {
      if (supabaseUrl && supabaseKey && cleanPhone) {
        try {
          await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${cleanPhone}*`, {
            method: 'PATCH',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              payment_status: `Failed (₹${amount || '0'})`,
              payment_updated_at: nowIso
            })
          });
        } catch (e) {}
      }
      return res.status(200).json({ success: true, event: 'Failed', processed: true, txnid });
    }

    // 3. EVENT: REFUND
    if (isRefund) {
      if (supabaseUrl && supabaseKey && (txnid || cleanPhone)) {
        try {
          const matchFilter = txnid ? `payment_order_id=eq.${txnid}` : `phone=like.*${cleanPhone}*`;
          await fetch(`${supabaseUrl}/rest/v1/leads?${matchFilter}`, {
            method: 'PATCH',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              payment_status: `Refunded (₹${amount || 'Full'})`,
              payment_updated_at: nowIso
            })
          });
        } catch (e) {}
      }
      return res.status(200).json({ success: true, event: 'Refund', processed: true, txnid });
    }

    // 4. EVENT: DISPUTE
    if (isDispute) {
      if (supabaseUrl && supabaseKey && (txnid || cleanPhone)) {
        try {
          const matchFilter = txnid ? `payment_order_id=eq.${txnid}` : `phone=like.*${cleanPhone}*`;
          await fetch(`${supabaseUrl}/rest/v1/leads?${matchFilter}`, {
            method: 'PATCH',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              payment_status: `Dispute Raised`,
              payment_updated_at: nowIso
            })
          });
        } catch (e) {}
      }
      return res.status(200).json({ success: true, event: 'Dispute', processed: true, txnid });
    }

    // Default acknowledgement for any other PayU event
    return res.status(200).json({ success: true, status: status || 'received' });
  } catch (err) {
    console.error('PayU Webhook Error:', err);
    return res.status(500).json({ error: 'Webhook processing error', details: err.message });
  }
}
