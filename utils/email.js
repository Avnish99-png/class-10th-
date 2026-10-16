const nodemailer = require('nodemailer');
const siteConfig = require('../config/site.config');

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const EmailService = {
  async sendOrderConfirmation({ order, downloadUrl }) {
    const subject = `🎉 Aapki Book Tayar Hai! - ${siteConfig.product.title} (Download Link Inside)`;
    
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFDF5; border: 2px solid #0B1B3A; border-radius: 8px; padding: 24px; color: #0B1B3A;">
        <div style="background: #0B1B3A; color: #FFFDF5; padding: 16px; border-radius: 6px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">Think Unlimited</h1>
          <p style="margin: 4px 0 0; color: #FFC700; font-weight: bold; font-size: 14px;">Maths se darr? Ab nahi.</p>
        </div>

        <div style="padding: 20px 0;">
          <h2 style="font-size: 20px; color: #0B1B3A;">Namaste ${order.name}! 📚</h2>
          <p style="font-size: 15px; line-height: 1.6;">
            Aapka payment safal raha! <strong>${siteConfig.product.title}</strong> (${siteConfig.product.subtitle}) ka instant download link neeche diya gaya hai.
          </p>

          <div style="background: #FFF9D2; border-left: 4px solid #FFC700; padding: 14px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px; font-weight: bold;">Order Details:</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
              <li><strong>Order ID:</strong> ${order.id}</li>
              <li><strong>Payment ID:</strong> ${order.razorpayPaymentId || 'PAID'}</li>
              <li><strong>Amount Paid:</strong> ₹${order.amount}</li>
              <li><strong>Validity:</strong> 48 Ghante (Max 5 downloads)</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" style="background: #FFC700; color: #0B1B3A; padding: 14px 28px; text-decoration: none; font-weight: 800; font-size: 16px; border-radius: 6px; border: 2px solid #0B1B3A; display: inline-block; box-shadow: 3px 39px 0 #0B1B3A;">
              📥 Click Here to Download PDF
            </a>
          </div>

          <div style="background: #FEF3C7; border: 1.5px solid #D97706; padding: 12px; margin: 18px 0; border-radius: 6px; text-align: left;">
            <p style="margin: 0; font-size: 14px; color: #92400E;">
              🔒 <strong>PDF Password:</strong> File open karne ka password aapka <strong>10-digit mobile number</strong> (${order.phone}) hai.
            </p>
          </div>

          <p style="font-size: 13px; color: #555; line-height: 1.5;">
            Agar upar wala button kaam na kare, to is link ko copy karke browser mein kholein:<br/>
            <a href="${downloadUrl}" style="color: #0B1B3A; word-break: break-all;">${downloadUrl}</a>
          </p>

          <div style="margin-top: 30px; border-top: 1px dashed #CCC; padding-top: 16px; font-size: 13px; color: #666;">
            <p style="margin: 0 0 6px;"><strong>Kuch problem aa rahi hai?</strong></p>
            <p style="margin: 0;">WhatsApp par message karein: <a href="https://wa.me/91${siteConfig.contacts.whatsapp}" style="color: #0B1B3A; font-weight: bold;">+91 ${siteConfig.contacts.whatsapp}</a> ya call karein: ${siteConfig.contacts.phoneSecondary}</p>
            <p style="margin: 4px 0 0;">Email: <a href="mailto:${siteConfig.contacts.supportEmail}">${siteConfig.contacts.supportEmail}</a></p>
          </div>
        </div>

        <div style="text-align: center; font-size: 11px; color: #888; border-top: 1px solid #EEE; padding-top: 12px;">
          © ${new Date().getFullYear()} Think Unlimited. CBSE Class 10 Revision Material. All rights reserved.
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`\n======================================================`);
      console.log(`[EMAIL LOG - SMTP not configured] Delivery to: ${order.email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Download URL: ${downloadUrl}`);
      console.log(`======================================================\n`);
      return { success: true, simulated: true };
    }

    try {
      const info = await transporter.sendMail({
        from: `"${siteConfig.brand.name}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: order.email,
        subject,
        html
      });
      console.log('Order confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('Failed to send order email:', err);
      return { success: false, error: err.message };
    }
  }
};

module.exports = EmailService;
