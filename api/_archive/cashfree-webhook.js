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
              const matchedLead = matches[0];
              const leadId = matchedLead.id;
              const leadName = matchedLead.name || 'Patient';

              // Determine appropriate confirmation template
              const isWebinarOrder = Number(orderAmount) === 201 || (orderId && orderId.toLowerCase().includes('webinar'));
              const templateName = isWebinarOrder ? 'webinar_joining_details_v1' : 'consultation_booking_confirmation_v1';
              const nowIso = new Date().toISOString();

              // Update Supabase lead record
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
                  payment_updated_at: nowIso,
                  delivered_message: templateName,
                  delivered_message_time: nowIso
                })
              });

              // Dispatch WhatsApp Confirmation via AgentBandhu
              const agentBandhuKey = (process.env.AGENTBANDHU_API_KEY || process.env.META_WHATSAPP_ACCESS_TOKEN || '').trim();
              if (agentBandhuKey) {
                try {
                  const { formatPhoneNumber, buildAgentBandhuPayload, AGENTBANDHU_MESSAGES_ENDPOINT } = await import('../_lib/whatsapp-templates.js');
                  const variables = isWebinarOrder
                    ? [leadName, 'Sunday, 15 November 2026', '11:00 AM IST']
                    : [leadName, 'Upcoming Clinic Hours', 'Flexible'];

                  const waPayload = buildAgentBandhuPayload({
                    to: formatPhoneNumber(customerPhone || matchedLead.phone),
                    templateName,
                    variables,
                    reference: `pay_${orderId || Date.now()}`
                  });

                  await fetch(AGENTBANDHU_MESSAGES_ENDPOINT, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${agentBandhuKey}`,
                      'x-api-key': agentBandhuKey,
                      'api-key': agentBandhuKey
                    },
                    body: JSON.stringify(waPayload)
                  });
                } catch (waErr) {
                  console.warn('AgentBandhu Webhook WhatsApp Dispatch Warning:', waErr.message);
                }
              }
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
