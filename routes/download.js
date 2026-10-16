const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const TokenManager = require('../utils/token');
const Database = require('../db/database');
const siteConfig = require('../config/site.config');

const PDF_FILE_PATH = path.join(__dirname, '..', 'private', 'ebook.pdf');

router.get('/:token', async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return renderError(res, 'Token Missing', 'Download token nahi mila. Kripya apne email se link check karein.');
  }

  // Verify HMAC signature and expiry
  const verification = TokenManager.verifyToken(token);
  if (!verification.valid) {
    return renderError(
      res, 
      'Link Expire Ya Invalid Ho Chuka Hai', 
      `Yeh download link expire ho chuka hai ya galat hai (${verification.error}). Agar aapne payment kiya tha, to chinta mat kijiye — hume WhatsApp par message kijiye aur hum naya link bhej denge.`
    );
  }

  // Find order in DB
  const order = Database.findByToken(token);
  if (!order) {
    return renderError(res, 'Order Record Nahi Mila', 'Aapka order record verify nahi ho paya.');
  }

  // Check download limits (generous limit so legitimate buyers are never blocked)
  const maxDownloads = 100;
  if ((order.downloadCount || 0) >= maxDownloads) {
    return renderError(
      res, 
      'Maximum Download Limit Reach Ho Gayi', 
      `Aap is PDF ko download limit reach kar chuke hain. WhatsApp support par message karein (+91 9243791529).`
    );
  }

  // Check if PDF file exists on server
  if (!fs.existsSync(PDF_FILE_PATH)) {
    console.error('PDF file missing at:', PDF_FILE_PATH);
    const { generateClass10Ebook } = require('../utils/generatePdf');
    generateClass10Ebook();
  }

  // Record download count
  Database.recordDownload(token);

  const filename = 'Class-10-Maths-Made-Easy-CBSE-ThinkUnlimited.pdf';
  const isInline = req.query.view === '1' || req.query.inline === '1';

  try {
    const { generatePersonalizedPdf } = require('../utils/pdfProtector');
    const pdfBuffer = await generatePersonalizedPdf(order.name, order.phone);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `${isInline ? 'inline' : 'attachment'}; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.end(pdfBuffer);
  } catch (err) {
    console.error('Error personalizing PDF, falling back to static file:', err);
    const stat = fs.statSync(PDF_FILE_PATH);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `${isInline ? 'inline' : 'attachment'}; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    const fileStream = fs.createReadStream(PDF_FILE_PATH);
    fileStream.pipe(res);
  }
});


function renderError(res, title, message) {
  res.status(400).send(`
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | Think Unlimited</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #FFFDF5;
          color: #0B1B3A;
          margin: 0;
          padding: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .card {
          background: #ffffff;
          border: 3px solid #0B1B3A;
          box-shadow: 6px 6px 0 #0B1B3A;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          padding: 32px 24px;
          text-align: center;
        }
        .tag {
          display: inline-block;
          background: #FFEBEE;
          color: #D32F2F;
          border: 1.5px solid #D32F2F;
          padding: 4px 12px;
          font-weight: bold;
          font-size: 13px;
          border-radius: 4px;
          margin-bottom: 16px;
        }
        h1 { font-size: 22px; margin: 0 0 12px; color: #0B1B3A; }
        p { font-size: 15px; line-height: 1.6; color: #444; margin-bottom: 24px; }
        .btn-wa {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #25D366;
          color: #ffffff;
          text-decoration: none;
          font-weight: bold;
          font-size: 15px;
          padding: 12px 24px;
          border-radius: 8px;
          border: 2px solid #0B1B3A;
          box-shadow: 3px 3px 0 #0B1B3A;
        }
        .btn-home {
          display: block;
          margin-top: 16px;
          color: #0B1B3A;
          text-decoration: underline;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="tag">⚠️ Alert</span>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="${siteConfig.contacts.whatsappLink}" class="btn-wa">
          💬 WhatsApp Support Par Madad Paayein (+91 ${siteConfig.contacts.whatsapp})
        </a>
        <a href="/" class="btn-home">← Home Page Par Wapas Jaayein</a>
      </div>
    </body>
    </html>
  `);
}

module.exports = router;
