const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname);
const DB_FILE = path.join(DB_DIR, 'orders.json');

// Ensure DB directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

function readOrders() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading orders DB:', err);
    return [];
  }
}

function writeOrders(orders) {
  try {
    // Atomic write via temp file
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(orders, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error saving orders DB:', err);
    return false;
  }
}

const Database = {
  // Create pending order
  createOrder(orderData) {
    const orders = readOrders();
    const newOrder = {
      id: orderData.id || `ord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      razorpayOrderId: orderData.razorpayOrderId,
      razorpayPaymentId: orderData.razorpayPaymentId || null,
      name: orderData.name,
      email: orderData.email,
      phone: orderData.phone,
      amount: orderData.amount, // in INR
      currency: orderData.currency || 'INR',
      status: orderData.status || 'created', // created | paid | failed
      downloadToken: orderData.downloadToken || null,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    orders.unshift(newOrder); // newest first
    writeOrders(orders);
    return newOrder;
  },

  // Find order by Razorpay Order ID
  findByRazorpayOrderId(orderId) {
    const orders = readOrders();
    return orders.find(o => o.razorpayOrderId === orderId);
  },

  // Find order by internal ID
  findById(id) {
    const orders = readOrders();
    return orders.find(o => o.id === id);
  },

  // Find order by download token
  findByToken(token) {
    const orders = readOrders();
    return orders.find(o => o.downloadToken === token);
  },

  // Update order status after payment verification
  markAsPaid(razorpayOrderId, paymentId, downloadToken) {
    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.razorpayOrderId === razorpayOrderId);
    if (orderIndex === -1) return null;

    orders[orderIndex].status = 'paid';
    orders[orderIndex].razorpayPaymentId = paymentId;
    orders[orderIndex].downloadToken = downloadToken;
    orders[orderIndex].paidAt = new Date().toISOString();
    orders[orderIndex].updatedAt = new Date().toISOString();

    writeOrders(orders);
    return orders[orderIndex];
  },

  // Increment download counter
  recordDownload(token) {
    const orders = readOrders();
    const order = orders.find(o => o.downloadToken === token);
    if (!order) return null;

    order.downloadCount = (order.downloadCount || 0) + 1;
    order.lastDownloadedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    writeOrders(orders);
    return order;
  },

  // Mark order as failed
  markAsFailed(razorpayOrderId, reason) {
    const orders = readOrders();
    const order = orders.find(o => o.razorpayOrderId === razorpayOrderId);
    if (order) {
      order.status = 'failed';
      order.failureReason = reason || 'Payment failed or cancelled';
      order.updatedAt = new Date().toISOString();
      writeOrders(orders);
    }
  },

  // Get all orders (for admin)
  getAllOrders() {
    return readOrders();
  }
};

module.exports = Database;
