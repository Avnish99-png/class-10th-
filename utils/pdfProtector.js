const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { encryptPDF } = require('@pdfsmaller/pdf-encrypt');
const fs = require('fs');
const path = require('path');

const ORIGINAL_PDF_PATH = path.join(__dirname, '..', 'private', 'ebook.pdf');

// Cache original raw bytes in memory for high-speed delivery
let cachedBuffer = null;
function getOriginalBuffer() {
  if (!cachedBuffer) {
    if (!fs.existsSync(ORIGINAL_PDF_PATH)) {
      throw new Error(`Original PDF not found at ${ORIGINAL_PDF_PATH}`);
    }
    cachedBuffer = fs.readFileSync(ORIGINAL_PDF_PATH);
  }
  return cachedBuffer;
}

// Invalidate in-memory cache if ebook.pdf is replaced on disk
try {
  fs.watch(ORIGINAL_PDF_PATH, () => {
    cachedBuffer = null;
  });
} catch (e) {
  // Silent fallback
}

/**
 * Stamps personalized watermark on all pages and encrypts PDF with customer's 10-digit phone number.
 * @param {string} customerName
 * @param {string} customerPhone
 * @returns {Promise<Buffer>}
 */
async function generatePersonalizedPdf(customerName, customerPhone) {
  const cleanPhone = (customerPhone || '').replace(/\D/g, '').slice(-10);
  const name = (customerName || 'Student').trim();

  const fileBytes = getOriginalBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const watermarkText = `Licensed to: ${name} | Phone: +91 ${cleanPhone} | Single-User Copy - Think Unlimited`;

  pages.forEach((page) => {
    const { width } = page.getSize();
    const textWidth = font.widthOfTextAtSize(watermarkText, 7.5);
    const x = Math.max(10, (width - textWidth) / 2);
    const y = 8; // Placed neatly in the bottom margin

    page.drawText(watermarkText, {
      x,
      y,
      size: 7.5,
      font,
      color: rgb(0.2, 0.25, 0.35),
      opacity: 0.8
    });
  });

  const stampedBytes = await pdfDoc.save();

  // If a valid 10-digit phone exists, password-protect with it
  if (cleanPhone.length === 10) {
    try {
      const encryptedBytes = await encryptPDF(stampedBytes, cleanPhone);
      return Buffer.from(encryptedBytes);
    } catch (encErr) {
      console.error('PDF encryption warning, returning stamped PDF:', encErr);
      return Buffer.from(stampedBytes);
    }
  }

  return Buffer.from(stampedBytes);
}

module.exports = {
  generatePersonalizedPdf
};
