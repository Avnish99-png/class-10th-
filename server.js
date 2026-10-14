require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const siteConfig = require('./config/site.config');
const { generateClass10Ebook, PDF_PATH } = require('./utils/generatePdf');

// Ensure e-book PDF exists on boot
if (!fs.existsSync(PDF_PATH)) {
  console.log('E-book PDF not found on startup, generating now...');
  generateClass10Ebook();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public (no-cache for immediate client updates)
app.use(express.static(path.join(__dirname, 'public'), { etag: false, maxAge: 0 }));

// Public API Config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    brand: siteConfig.brand,
    product: siteConfig.product,
    contacts: siteConfig.contacts,
    upi: siteConfig.upi,
    socials: siteConfig.socials,
    refundPolicy: siteConfig.refundPolicy,
    analytics: siteConfig.analytics
  });
});


// Mount Routes
app.use('/api', require('./routes/payment'));
app.use('/api/cashfree', require('./routes/cashfree'));
app.use('/api/admin', require('./routes/admin'));
app.use('/download', require('./routes/download'));

// Web Page HTML Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

app.get('/refund', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'refund.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #FFFDF5; min-height: 100vh;">
      <h1 style="color: #0B1B3A;">404 - Page Nahi Mila</h1>
      <p style="color: #555;">Aap jo page dhoondh rahe hain woh yahan nahi hai.</p>
      <a href="/" style="display: inline-block; background: #FFC700; color: #0B1B3A; padding: 10px 20px; font-weight: bold; text-decoration: none; border: 2px solid #0B1B3A; border-radius: 6px;">Home Page Par Jaayein</a>
    </div>
  `);
});

function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`\n========================================================`);
    console.log(`🚀 Think Unlimited Server Running!`);
    console.log(`📡 URL: http://localhost:${portToTry}`);
    console.log(`📖 E-book: ${PDF_PATH} (Ready)`);
    console.log(`🔐 Admin Panel: http://localhost:${portToTry}/admin`);
    console.log(`========================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${portToTry} is in use, trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

const START_PORT = parseInt(process.env.PORT || '3000', 10);
startServer(START_PORT);

