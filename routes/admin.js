const express = require('express');
const router = express.Router();
const Database = require('../db/database');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'thinkunlimited2026';

// Middleware to check admin authorization
function checkAdminAuth(req, res, next) {
  const authHeader = req.headers['x-admin-password'];
  const queryPass = req.query.password;
  const passedPass = authHeader || queryPass;

  if (passedPass && passedPass === ADMIN_PASSWORD) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Galat password ya session expire ho gaya.' });
}

// POST /api/admin/verify
router.post('/verify', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, message: 'Authenticated successfully' });
  }
  return res.status(401).json({ success: false, error: 'Galat admin password enter kiya hai.' });
});

// GET /api/admin/orders
router.get('/orders', checkAdminAuth, (req, res) => {
  const orders = Database.getAllOrders();
  const summary = {
    totalOrders: orders.length,
    paidOrders: orders.filter(o => o.status === 'paid').length,
    totalRevenue: orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.amount || 0), 0),
    totalDownloads: orders.reduce((sum, o) => sum + (o.downloadCount || 0), 0)
  };
  res.json({ success: true, summary, orders });
});

// GET /api/admin/export-csv
router.get('/export-csv', checkAdminAuth, (req, res) => {
  const orders = Database.getAllOrders();

  const headers = [
    'Order ID',
    'Razorpay Order ID',
    'Payment ID',
    'Name',
    'Email',
    'Phone',
    'Amount (INR)',
    'Status',
    'Downloads',
    'Created At',
    'Paid At'
  ];

  const rows = orders.map(o => [
    `"${o.id || ''}"`,
    `"${o.razorpayOrderId || ''}"`,
    `"${o.razorpayPaymentId || ''}"`,
    `"${(o.name || '').replace(/"/g, '""')}"`,
    `"${o.email || ''}"`,
    `"${o.phone || ''}"`,
    o.amount || 39,
    `"${o.status || ''}"`,
    o.downloadCount || 0,
    `"${o.createdAt || ''}"`,
    `"${o.paidAt || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="think-unlimited-orders-${Date.now()}.csv"`);
  res.status(200).send(csvContent);
});

module.exports = router;
