// Vercel Serverless Function: PayU Payment Gateway Order & Hash Generator
// Endpoint: POST /api/create-payu-order

import crypto from 'crypto';

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
    const { orderAmount, customerName, customerPhone, customerEmail, planType, leadId } = req.body || {};

    const amountNum = Number(orderAmount);
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid order amount' });
    }
    const formattedAmount = amountNum.toFixed(2);

    const cleanPhone = (customerPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10);
    const txnid = 'TXN_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
    const firstname = (customerName || 'Patient').trim().replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 50) || 'Patient';
    const email = (customerEmail || `${cleanPhone || 'patient'}@patient.charakhealth.com`).trim().toLowerCase();
    const productinfo = (planType || 'Consultation Booking').replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 100).trim() || 'Charak Health Booking';

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'kneeandbackpainclinic.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${proto}://${host}`;

    const defaultUatKey = '46AxYt';
    const defaultUatSalt = 'B57aH6MOoX3T9Gs0XOi15fow7UfjfdQq';

    const payuKey = (process.env.PAYU_MERCHANT_KEY || process.env.PAYU_KEY || defaultUatKey).trim();
    const payuSalt = (process.env.PAYU_MERCHANT_SALT || process.env.PAYU_SALT || defaultUatSalt).trim();
    const environment = (process.env.PAYU_ENVIRONMENT || 'sandbox').toLowerCase().trim();
    const isProduction = environment === 'production' || environment === 'live';

    const surl = `${baseUrl}/api/payu-callback`;
    const furl = `${baseUrl}/api/payu-callback`;

    // UDF parameter tracking
    const udf1 = leadId || '';
    const udf2 = planType || '';
    const udf3 = cleanPhone || '';
    const udf4 = email || '';
    const udf5 = '';

    // Record checkout initiation in Supabase before redirecting so drop-offs are captured
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';
    if (supabaseUrl && supabaseKey && cleanPhone && cleanPhone.length === 10) {
      try {
        const searchResp = await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${cleanPhone}*&select=id,slot_preference&limit=1`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
        });
        if (searchResp.ok) {
          const rows = await searchResp.json();
          if (rows && rows.length > 0) {
            await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${rows[0].id}`, {
              method: 'PATCH',
              headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'Payment Initiated (Gateway In-Progress)',
                slot_preference: (rows[0].slot_preference || 'Flexible') + ` [Email: ${email} | Payment: Pending PayU TXN ${txnid}]`
              })
            }).catch(() => {});
          }
        }
      } catch (dbErr) {
        console.warn('Checkout initiation sync warning:', dbErr.message);
      }
    }

    // If real PayU credentials are set in environment variables
    if (payuKey && payuSalt) {
      // Standard PayU SHA-512 Hash Sequence:
      // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
      const hashSequence = [
        payuKey,
        txnid,
        formattedAmount,
        productinfo,
        firstname,
        email,
        udf1,
        udf2,
        udf3,
        udf4,
        udf5,
        '', '', '', '', '', // udf6, udf7, udf8, udf9, udf10 (empty)
        payuSalt
      ].join('|');

      const hash = crypto.createHash('sha512').update(hashSequence).digest('hex');
      const actionUrl = isProduction
        ? 'https://secure.payu.in/_payment'
        : 'https://test.payu.in/_payment';

      return res.status(200).json({
        success: true,
        action: actionUrl,
        environment: isProduction ? 'production' : 'sandbox',
        params: {
          key: payuKey,
          txnid: txnid,
          amount: formattedAmount,
          productinfo: productinfo,
          firstname: firstname,
          email: email,
          phone: cleanPhone.length === 10 ? cleanPhone : '9999999999',
          surl: surl,
          furl: furl,
          hash: hash,
          udf1: udf1,
          udf2: udf2,
          udf3: udf3,
          udf4: udf4,
          udf5: udf5
        }
      });
    }

    // Fallback if PAYU_MERCHANT_KEY & SALT are not yet entered in Vercel:
    return res.status(200).json({
      success: true,
      simulated: true,
      action: `${baseUrl}/api/payu-callback?simulated=true`,
      notice: 'Running in simulation mode.',
      environment: 'simulation',
      params: {
        key: 'SIMULATED_KEY',
        txnid: txnid,
        amount: formattedAmount,
        productinfo: productinfo,
        firstname: firstname,
        email: email,
        phone: cleanPhone,
        surl: surl,
        furl: furl,
        hash: 'simulated_hash',
        udf1: udf1,
        udf2: udf2,
        udf3: udf3,
        status: 'success'
      }
    });
  } catch (err) {
    console.error('PayU PG Handler Error:', err);
    return res.status(500).json({ error: 'Server error preparing PayU order', details: err.message });
  }
}
