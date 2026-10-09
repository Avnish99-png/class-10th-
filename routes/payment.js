const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const siteConfig = require('../config/site.config');
const Database = require('../db/database');
const TokenManager = require('../utils/token');
const EmailService = require('../utils/email');

// Check if Razorpay credentials exist
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

let razorpayInstance = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_ID.includes('YOUR_KEY')) {
  try {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
  } catch (err) {
    console.error('Razorpay initialization error:', err);
  }
}

// Helper: Indian mobile number validation (10 digits, starts with 6-9)
function isValidIndianPhone(phone) {
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  return /^[6-9]\d{9}$/.test(cleaned) || (cleaned.startsWith('91') && /^[6-9]\d{9}$/.test(cleaned.slice(2)));
}

// Helper: Basic email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Kripya apna poora naam enter karein (Please enter your valid name)' });
    }
    if (!email || !isValidEmail(email.trim())) {
      return res.status(400).json({ error: 'Kripya sahi email address enter karein (PDF ispar bheja jayega)' });
    }
    if (!phone || !isValidIndianPhone(phone.trim())) {
      return res.status(400).json({ error: 'Kripya sahi 10-digit WhatsApp number enter karein' });
    }

    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '').slice(-10);
    const amountInPaise = siteConfig.product.pricePaise; // 3900 paise = ₹39
    const receiptId = `rcpt_${Date.now()}`;

    let razorpayOrderId = null;
    let isTestSimulation = false;

    if (razorpayInstance) {
      // Real Razorpay Order Creation via API
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            product: siteConfig.product.title,
            buyerName: name.trim(),
            buyerPhone: cleanPhone,
            buyerEmail: email.trim()
          }
        });
        razorpayOrderId = order.id;
      } catch (rError) {
        console.error('Razorpay API error, checking fallback:', rError);
        return res.status(500).json({ 
          error: 'Razorpay gateway connect nahi ho paya. Kripya thodi der baad koshish karein ya WhatsApp karein.' 
        });
      }
    } else {
      // Test Simulation mode when keys are not yet configured in .env
      console.log('⚠️ Razorpay keys not configured in .env - Running in Test Simulation Mode');
      razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      isTestSimulation = true;
    }

    // Save to database
    const dbOrder = Database.createOrder({
      razorpayOrderId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      amount: siteConfig.product.price,
      currency: 'INR',
      status: 'created'
    });

    res.json({
      success: true,
      orderId: dbOrder.id,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID || 'rzp_test_simulation',
      isTestSimulation,
      product: {
        title: siteConfig.product.title,
        price: siteConfig.product.price,
        description: siteConfig.brand.subTagline
      },
      prefill: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        contact: cleanPhone
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Server error: Order create karne mein problem aayi.' });
  }
});

// POST /api/verify-payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      utr_number,
      payment_method,
      isTestSimulation 
    } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({ error: 'Order ID missing' });
    }

    const order = Database.findByRazorpayOrderId(razorpay_order_id);
    if (!order) {
      return res.status(404).json({ error: 'Order record nahi mila' });
    }

    // If order was already marked paid
    if (order.status === 'paid' && order.downloadToken) {
      return res.json({
        success: true,
        alreadyProcessed: true,
        orderId: order.id,
        downloadUrl: `/download/${order.downloadToken}`
      });
    }

    // Signature Verification (only if real Razorpay gateway signature provided)
    if (razorpayInstance && RAZORPAY_KEY_SECRET && razorpay_signature && razorpay_signature !== 'test_simulation_signature') {
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        Database.markAsFailed(razorpay_order_id, 'Signature verification failed');
        return res.status(400).json({ 
          error: 'Payment verification fail ho gaya (Invalid signature). Agar paise kat gaye hain to turant WhatsApp karein.' 
        });
      }
    } else {
      console.log('Verifying UPI / QR payment for order:', razorpay_order_id, 'UTR:', utr_number || razorpay_payment_id);
    }

    // Generate secure download token
    const downloadToken = TokenManager.createDownloadToken(order.id, order.email);

    // Final payment reference ID (UTR or generated transaction ID)
    const finalPaymentId = utr_number ? utr_number.trim() : (razorpay_payment_id || `UPI_${Date.now()}`);

    // Mark paid in DB
    const updatedOrder = Database.markAsPaid(
      razorpay_order_id, 
      finalPaymentId, 
      downloadToken,
      {
        paymentMethod: payment_method || (utr_number ? 'PhonePe UPI QR' : 'UPI (9243791529@axl)'),
        utrNumber: finalPaymentId
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
      message: 'Payment verified successfully! 🎉',
      orderId: updatedOrder.id,
      downloadToken,
      downloadUrl: `/download/${downloadToken}`
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verify karne mein issue aaya.' });
  }
});

// POST /api/webhook - Backup payment verification via Razorpay Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    if (RAZORPAY_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(req.rawBody || JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('Webhook signature mismatch!');
        return res.status(400).send('Invalid signature');
      }
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const paymentId = payment.id;

      const order = Database.findByRazorpayOrderId(razorpayOrderId);
      if (order && order.status !== 'paid') {
        const downloadToken = TokenManager.createDownloadToken(order.id, order.email);
        Database.markAsPaid(razorpayOrderId, paymentId, downloadToken);
        console.log(`Webhook: Order ${order.id} marked as paid via webhook`);

        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.get('host') || 'localhost:3000';
        const fullDownloadUrl = `${protocol}://${host}/download/${downloadToken}`;

        EmailService.sendOrderConfirmation({
          order: { ...order, razorpayPaymentId: paymentId },
          downloadUrl: fullDownloadUrl
        }).catch(err => console.error('Webhook email error:', err));
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// POST /api/payment-failed
router.post('/payment-failed', (req, res) => {
  const { razorpay_order_id, reason } = req.body;
  if (razorpay_order_id) {
    Database.markAsFailed(razorpay_order_id, reason);
  }
  res.json({ success: true });
});

module.exports = router;
