// Vercel Serverless Function: Cashfree Payment Gateway Order Creator
// Endpoint: POST /api/create-cashfree-order

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

    const amount = Number(orderAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid order amount' });
    }

    const cleanPhone = (customerPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10);
    const orderId = 'ORD_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
    const customerId = 'CUST_' + (cleanPhone.length === 10 ? cleanPhone : Math.floor(100000 + Math.random() * 900000));
    const name = customerName || 'Patient';
    const email = customerEmail || `${cleanPhone}@patient.charakhealth.com`;
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'dr-surabhi-knee-and-back-pain-relie-azure.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${proto}://${host}`;

    const defaultSandboxAppId = 'TEST430329ae80e0f32e41a393d78b923034';
    const defaultSandboxSecret = 'TESTaf195616268bd6202eeb3bf8dc458956e7192a85';
    const cashfreeAppId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || defaultSandboxAppId).trim();
    const cashfreeSecret = (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_API_SECRET || defaultSandboxSecret).trim();
    const isSandbox = (process.env.CASHFREE_ENVIRONMENT || 'sandbox').toLowerCase() === 'sandbox' || cashfreeAppId.startsWith('TEST');

    const endpoint = isSandbox
      ? 'https://sandbox.cashfree.com/pg/orders'
      : 'https://api.cashfree.com/pg/orders';

    // If Cashfree keys are configured in environment variables
    if (cashfreeAppId && cashfreeSecret) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-client-id': cashfreeAppId,
          'x-client-secret': cashfreeSecret,
          'x-api-version': '2023-08-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: amount,
          order_currency: 'INR',
          customer_details: {
            customer_id: customerId,
            customer_name: name,
            customer_phone: cleanPhone.length === 10 ? cleanPhone : '9999999999',
            customer_email: email
          },
          order_meta: {
            return_url: `${baseUrl}/?order_id={order_id}&status={order_status}&lead_id=${encodeURIComponent(leadId || '')}`,
            notify_url: `${baseUrl}/api/cashfree-webhook`
          },
          order_note: `Charak Health: ${planType || 'Consultation Booking'} (Dr. Surabhi Vaidya Clinic)`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Cashfree API error:', response.status, data);
        return res.status(response.status).json({
          error: 'cashfree_order_failed',
          details: data.message || data
        });
      }

      return res.status(200).json({
        success: true,
        order_id: data.order_id,
        payment_session_id: data.payment_session_id,
        order_status: data.order_status,
        environment: isSandbox ? 'sandbox' : 'production'
      });
    }

    // Fallback if live Cashfree credentials are being set up: Return a structured mock session
    return res.status(200).json({
      success: true,
      simulated: true,
      order_id: orderId,
      payment_session_id: 'session_' + orderId,
      notice: 'CASHFREE_APP_ID & CASHFREE_SECRET_KEY not yet set in Vercel. Simulating order.',
      environment: 'sandbox'
    });

  } catch (err) {
    console.error('Cashfree PG Handler Error:', err);
    return res.status(500).json({ error: 'Server error creating Cashfree order', details: err.message });
  }
}
