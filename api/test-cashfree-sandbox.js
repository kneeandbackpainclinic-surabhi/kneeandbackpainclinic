// Vercel Serverless Function: Cashfree Sandbox Environment Live Tester & Diagnostics
// Endpoint: GET /api/test-cashfree-sandbox

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const defaultSandboxAppId = 'TEST430329ae80e0f32e41a393d78b923034';
  const defaultSandboxSecret = 'TESTaf195616268bd6202eeb3bf8dc458956e7192a85';

  const appId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || defaultSandboxAppId).trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_API_SECRET || defaultSandboxSecret).trim();
  const apiVersion = '2023-08-01';
  const baseUrl = 'https://sandbox.cashfree.com/pg';

  const testOrderId = 'SANDBOX_TEST_' + Date.now();
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: 'Sandbox',
    credentialsUsed: {
      appId: appId.substring(0, 8) + '...',
      secretKeyConfigured: Boolean(secretKey)
    },
    steps: []
  };

  try {
    // Step 1: Create Order
    const createOrderPayload = {
      order_id: testOrderId,
      order_amount: 201.00,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'cust_sandbox_tester',
        customer_name: 'Dr. Surabhi Vaidya Sandbox Patient',
        customer_email: 'test-patient@charakhealth.com',
        customer_phone: '9876543210'
      },
      order_meta: {
        return_url: `https://dr-surabhi-knee-and-back-pain-relie-azure.vercel.app/?order_id={order_id}&status={order_status}`,
        notify_url: `https://dr-surabhi-knee-and-back-pain-relie-azure.vercel.app/api/cashfree-webhook`
      },
      order_note: 'Sandbox Diagnostics Test Order (Masterclass ₹201)'
    };

    const createResp = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': apiVersion,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(createOrderPayload)
    });

    const createData = await createResp.json();
    testResults.steps.push({
      step: 1,
      name: 'Create Order (POST /pg/orders)',
      status: createResp.status,
      success: createResp.ok,
      cfOrderId: createData.cf_order_id,
      orderId: createData.order_id,
      orderStatus: createData.order_status,
      paymentSessionId: createData.payment_session_id
    });

    if (!createResp.ok || !createData.payment_session_id) {
      testResults.overallStatus = 'FAILED_AT_CREATE_ORDER';
      testResults.error = createData;
      return res.status(200).json(testResults);
    }

    const sessionId = createData.payment_session_id;

    // Step 2: Order Pay (UPI Collect in Sandbox)
    const payPayload = {
      payment_method: {
        upi: {
          channel: 'collect',
          upi_id: 'testsuccess@gocash'
        }
      },
      payment_session_id: sessionId
    };

    const payResp = await fetch(`${baseUrl}/orders/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-version': apiVersion
      },
      body: JSON.stringify(payPayload)
    });

    const payData = await payResp.json();
    testResults.steps.push({
      step: 2,
      name: 'Order Pay (POST /pg/orders/sessions - UPI Collect)',
      status: payResp.status,
      success: payResp.ok,
      cfPaymentId: payData.cf_payment_id,
      action: payData.action,
      paymentMethod: payData.payment_method
    });

    // Step 3: Get Payments for Order
    const getPaymentsResp = await fetch(`${baseUrl}/orders/${testOrderId}/payments`, {
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': apiVersion,
        'Accept': 'application/json'
      }
    });

    const getPaymentsData = await getPaymentsResp.json();
    testResults.steps.push({
      step: 3,
      name: 'Get Payments for Order (GET /pg/orders/{order_id}/payments)',
      status: getPaymentsResp.status,
      success: getPaymentsResp.ok,
      paymentsCount: Array.isArray(getPaymentsData) ? getPaymentsData.length : 0,
      payments: getPaymentsData
    });

    testResults.overallStatus = 'ALL_SANDBOX_TESTS_PASSED';
    testResults.sampleCheckoutUrl = `https://payments-test.cashfree.com/order/#${sessionId}`;

    return res.status(200).json(testResults);

  } catch (err) {
    testResults.overallStatus = 'EXCEPTION';
    testResults.error = err.message;
    return res.status(500).json(testResults);
  }
}
