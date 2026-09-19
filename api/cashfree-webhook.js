// Vercel Serverless Function: Cashfree Payment Gateway Webhook
// Endpoint: POST /api/cashfree-webhook

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body || {};
    const eventType = payload.type || payload.event || '';
    const orderData = (payload.data && payload.data.order) ? payload.data.order : (payload.order || payload);
    const paymentData = (payload.data && payload.data.payment) ? payload.data.payment : (payload.payment || {});

    const orderId = orderData.order_id || payload.orderId || '';
    const orderStatus = orderData.order_status || paymentData.payment_status || '';
    const orderAmount = orderData.order_amount || paymentData.payment_amount || '';
    const customerPhone = (orderData.customer_details && orderData.customer_details.customer_phone) || '';
    const customerEmail = (orderData.customer_details && orderData.customer_details.customer_email) || '';

    const isPaid = orderStatus === 'PAID' || orderStatus === 'SUCCESS' || eventType.includes('PAYMENT_SUCCESS');

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leqbwiexuzggdxgxngrm.supabase.co';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nC7DTCfJj_vhf3YsK0LW9w_NKk54fd4';

    if (isPaid && supabaseUrl && supabaseKey) {
      const cleanPhone = customerPhone.replace(/[^0-9]/g, '').slice(-10);

      // Find matching lead by phone
      if (cleanPhone) {
        try {
          const searchResp = await fetch(`${supabaseUrl}/rest/v1/leads?phone=like.*${cleanPhone}*&select=id,name,phone`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });

          if (searchResp.ok) {
            const matches = await searchResp.json();
            if (matches && matches.length > 0) {
              const leadId = matches[0].id;
              await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${leadId}`, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  status: 'Paid & Confirmed',
                  payment_status: `Paid (₹${orderAmount})`,
                  payment_order_id: orderId,
                  payment_updated_at: new Date().toISOString()
                })
              });
            }
          }
        } catch (dbErr) {
          console.warn('Webhook lead update error:', dbErr.message);
        }
      }
    }

    return res.status(200).json({ status: 'ok', received: true, orderId, orderStatus });

  } catch (err) {
    console.error('Cashfree Webhook Error:', err);
    return res.status(500).json({ error: 'Webhook processing error', details: err.message });
  }
}
