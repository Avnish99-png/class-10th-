const crypto = require('crypto');
const siteConfig = require('../config/site.config');

const SECRET = process.env.DOWNLOAD_SECRET || 'think_unlimited_super_secure_secret_2026_class10';

const TokenManager = {
  // Generate secure expiring token
  createDownloadToken(orderId, email) {
    const expiresAt = Date.now() + (siteConfig.security.tokenExpiryHours * 60 * 60 * 1000);
    const payload = `${orderId}:${email}:${expiresAt}`;
    const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    // Base64url encode payload + signature
    const token = Buffer.from(`${payload}:${hmac}`).toString('base64url');
    return token;
  },

  // Verify and decode token
  verifyToken(token) {
    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf8');
      const parts = decoded.split(':');
      if (parts.length !== 4) {
        return { valid: false, error: 'Malformed token structure' };
      }

      const [orderId, email, expiresAtStr, signature] = parts;
      const expiresAt = parseInt(expiresAtStr, 10);
      const payload = `${orderId}:${email}:${expiresAt}`;

      const expectedHmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');

      // Constant-time comparison to prevent timing attacks
      const sigBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedHmac, 'hex');

      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return { valid: false, error: 'Invalid token signature' };
      }

      if (Date.now() > expiresAt) {
        return { valid: false, error: 'Download link has expired (valid for 48 hours)' };
      }

      return {
        valid: true,
        orderId,
        email,
        expiresAt: new Date(expiresAt)
      };
    } catch (err) {
      return { valid: false, error: 'Token verification failed' };
    }
  }
};

module.exports = TokenManager;
