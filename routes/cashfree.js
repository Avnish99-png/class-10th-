const express = require('express');
const router = express.Router();
const siteConfig = require('../config/site.config');
const Database = require('../db/database');
const TokenManager = require('../utils/token');
const EmailService = require('../utils/email');

// Cashfree Gateway Credentials
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'TEST').toUpperCase(); // TEST or PROD
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2023-08-01';

const CASHFREE_BASE_URL = CASHFREE_ENV === 'PROD' 
  ? 'https://api.cashfree.com/pg' 
  : 'https://sandbox.cashfree.com/pg';

function hasValidCredentials() {
  return CASHFREE_APP_ID && 
         CASHFREE_SECRET_KEY && 
         !CASHFREE_APP_ID.includes('YOUR_') && 
         !CASHFREE_SECRET_KEY.includes('YOUR_');
}

// Helper: Indian mobile number validation
function isValidIndianPhone(phone) {
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  return /^[6-9]\d{9}$/.test(cleaned) || (cleaned.startsWith('91') && /^[6-9]\d{9}$/.test(cleaned.slice(2)));
}

// Helper: Basic email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/cashfree/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Kripya apna poora naam enter karein (Please enter your name)' });
    }
    if (!email || !isValidEmail(email.trim())) {
      return res.status(400).json({ error: 'Kripya sahi email address enter karein (PDF ispar bheja jayega)' });
    }
    if (!phone || !isValidIndianPhone(phone.trim())) {
      return res.status(400).json({ error: 'Kripya sahi 10-digit WhatsApp number enter karein' });
    }

    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '').slice(-10);
    const orderId = `cf_ord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    if (hasValidCredentials()) {
      // Real Cashfree API Call
      console.log(`Connecting to Cashfree (${CASHFREE_ENV}) at: ${CASHFREE_BASE_URL}/orders`);
      
      const cfPayload = {
        order_id: orderId,
        order_amount: siteConfig.product.price, // ₹39
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${cleanPhone}`,
          customer_name: name.trim(),
          customer_email: email.trim().toLowerCase(),
          customer_phone: cleanPhone
        },
        order_meta: {
          return_url: `${baseUrl}/api/cashfree/return?order_id={order_id}`,
          notify_url: `${baseUrl}/api/cashfree/webhook`
        },
        order_note: `${siteConfig.product.title} - CBSE 2026/27`
      };

      const cfRes = await fetch(`${CASHFREE_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'x-api-version': CASHFREE_API_VERSION,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cfPayload)
      });

      const cfData = await cfRes.json();

      if (!cfRes.ok || !cfData.payment_session_id) {
        console.error('Cashfree API error:', cfData);
        return res.status(500).json({ 
          error: cfData.message || 'Cashfree payment session create nahi ho paya. Kripya details check karein.' 
        });
      }

      // Save to DB
      const dbOrder = Database.createOrder({
        cashfreeOrderId: orderId,
        gateway: 'cashfree',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        amount: siteConfig.product.price,
        currency: 'INR',
        status: 'created'
      });

      return res.json({
        success: true,
        orderId: dbOrder.id,
        cashfreeOrderId: orderId,
        paymentSessionId: cfData.payment_session_id,
        environment: CASHFREE_ENV,
        amount: siteConfig.product.price,
        product: {
          title: siteConfig.product.title,
          price: siteConfig.product.price
        },
        customer: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanPhone
        },
        prefill: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          contact: cleanPhone
        }
      });

    } else {
      // Test simulation fallback when keys are not yet added in .env
      console.log('⚠️ Cashfree credentials not configured in .env - Running in Simulation Mode');

      const dbOrder = Database.createOrder({
        cashfreeOrderId: orderId,
        gateway: 'cashfree_simulation',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        amount: siteConfig.product.price,
        currency: 'INR',
        status: 'created'
      });

      return res.json({
        success: true,
        isSimulation: true,
        orderId: dbOrder.id,
        cashfreeOrderId: orderId,
        environment: 'TEST',
        amount: siteConfig.product.price,
        product: {
          title: siteConfig.product.title,
          price: siteConfig.product.price
        },
        customer: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanPhone
        },
        prefill: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          contact: cleanPhone
        }
      });
    }

  } catch (err) {
    console.error('Cashfree order creation error:', err);
    res.status(500).json({ error: 'Server error: Cashfree order generate nahi ho paya.' });
  }
});

// POST /api/cashfree/verify
router.post('/verify', async (req, res) => {
  try {
    const { order_id, isSimulation } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'Order ID required for verification' });
    }

    const order = Database.findByAnyOrderId(order_id);
    if (!order) {
      return res.status(404).json({ error: 'Order record nahi mila' });
    }

    if (order.status === 'paid' && order.downloadToken) {
      return res.json({
        success: true,
        alreadyProcessed: true,
        orderId: order.id,
        downloadUrl: `/download/${order.downloadToken}`
      });
    }

    let paymentId = `cf_pay_${Date.now()}`;
    let paymentMethod = 'Cashfree PG';

    if (hasValidCredentials() && !isSimulation) {
      // Query Cashfree Order Status directly from API
      const checkRes = await fetch(`${CASHFREE_BASE_URL}/orders/${order_id}`, {
        method: 'GET',
        headers: {
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'x-api-version': CASHFREE_API_VERSION
        }
      });

      const checkData = await checkRes.json();

      if (checkData.order_status !== 'PAID') {
        return res.status(400).json({ 
          error: `Payment status: ${checkData.order_status || 'NOT PAID'}. Agar aapke paise kat gaye hain to support par WhatsApp karein.` 
        });
      }

      // Try fetching payment details for exact payment_id
      try {
        const payRes = await fetch(`${CASHFREE_BASE_URL}/orders/${order_id}/payments`, {
          headers: {
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'x-api-version': CASHFREE_API_VERSION
          }
        });
        const payments = await payRes.json();
        if (Array.isArray(payments) && payments.length > 0) {
          const successPay = payments.find(p => p.payment_status === 'SUCCESS') || payments[0];
          paymentId = successPay.cf_payment_id || successPay.payment_id || paymentId;
          paymentMethod = `Cashfree (${successPay.payment_group || 'UPI/Card'})`;
        }
      } catch (pErr) {
        console.warn('Could not fetch payments list from Cashfree, continuing with order_status verification');
      }
    }

    // Generate secure download token
    const downloadToken = TokenManager.createDownloadToken(order.id, order.email);

    // Update Order in DB
    const updatedOrder = Database.markAsPaid(
      order.id,
      paymentId,
      downloadToken,
      {
        paymentMethod,
        utrNumber: paymentId
      }
    );

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const fullDownloadUrl = `${protocol}://${host}/download/${downloadToken}`;

    // Send confirmation email
    EmailService.sendOrderConfirmation({
      order: updatedOrder,
      downloadUrl: fullDownloadUrl
    }).catch(err => console.error('Background email sending error:', err));

    res.json({
      success: true,
      message: 'Cashfree payment verified successfully! 🎉',
      orderId: updatedOrder.id,
      downloadToken,
      downloadUrl: `/download/${downloadToken}`
    });

  } catch (err) {
    console.error('Cashfree verification error:', err);
    res.status(500).json({ error: 'Cashfree payment verify karne mein problem aayi.' });
  }
});

// GET /api/cashfree/return (Redirect Return URL)
router.get('/return', async (req, res) => {
  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res.redirect('/?payment=missing_order');
    }

    const order = Database.findByAnyOrderId(order_id);
    if (!order) {
      return res.redirect('/?payment=order_not_found');
    }

    if (order.status === 'paid' && order.downloadToken) {
      return res.redirect(`/success?token=${order.downloadToken}&orderId=${order.id}`);
    }

    if (hasValidCredentials()) {
      const checkRes = await fetch(`${CASHFREE_BASE_URL}/orders/${order_id}`, {
        method: 'GET',
        headers: {
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'x-api-version': CASHFREE_API_VERSION
        }
      });
      const checkData = await checkRes.json();

      if (checkData.order_status === 'PAID') {
        const downloadToken = TokenManager.createDownloadToken(order.id, order.email);
        Database.markAsPaid(order.id, `cf_${Date.now()}`, downloadToken, { paymentMethod: 'Cashfree Redirect' });

        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        EmailService.sendOrderConfirmation({
          order: { ...order, status: 'paid' },
          downloadUrl: `${protocol}://${host}/download/${downloadToken}`
        }).catch(e => console.error(e));

        return res.redirect(`/success?token=${downloadToken}&orderId=${order.id}`);
      }
    }

    // If payment not successful
    return res.redirect('/?payment=failed#pricing');
  } catch (err) {
    console.error('Return URL handler error:', err);
    res.redirect('/?payment=error');
  }
});

// POST /api/cashfree/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (event.type === 'PAYMENT_SUCCESS_WEBHOOK' || event.event === 'order.paid') {
      const orderData = event.data?.order || event.order;
      const paymentData = event.data?.payment || event.payment;
      const orderId = orderData?.order_id;
      const paymentId = paymentData?.cf_payment_id || `cf_wh_${Date.now()}`;

      if (orderId) {
        const order = Database.findByAnyOrderId(orderId);
        if (order && order.status !== 'paid') {
          const downloadToken = TokenManager.createDownloadToken(order.id, order.email);
          Database.markAsPaid(order.id, paymentId, downloadToken, { paymentMethod: 'Cashfree Webhook' });
          console.log(`Cashfree Webhook: Order ${order.id} marked as paid`);

          const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
          const host = req.get('host') || 'localhost:3002';
          EmailService.sendOrderConfirmation({
            order: { ...order, status: 'paid', razorpayPaymentId: paymentId },
            downloadUrl: `${protocol}://${host}/download/${downloadToken}`
          }).catch(e => console.error(e));
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Cashfree Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

module.exports = router;
