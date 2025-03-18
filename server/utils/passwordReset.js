const crypto = require('crypto');
const { logSecurityEvent, SecurityEventType, SecuritySeverity } = require('./securityLogger');

// Password reset configuration
const RESET_TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes
const TOKEN_BYTES = 32;

// Store active reset tokens (in production, use Redis or similar)
const activeTokens = new Map();

// Generate a secure reset token
const generateResetToken = (userId) => {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  const expiresAt = Date.now() + RESET_TOKEN_EXPIRY;
  
  activeTokens.set(token, {
    userId,
    expiresAt,
    used: false
  });

  logSecurityEvent(
    SecurityEventType.AUTH,
    SecuritySeverity.INFO,
    'Password reset token generated',
    { userId }
  );

  return token;
};

// Verify and consume reset token
const verifyResetToken = (token) => {
  const tokenData = activeTokens.get(token);
  
  if (!tokenData) {
    logSecurityEvent(
      SecurityEventType.AUTH,
      SecuritySeverity.WARNING,
      'Invalid password reset token attempted',
      { token }
    );
    return null;
  }

  if (tokenData.used) {
    logSecurityEvent(
      SecurityEventType.AUTH,
      SecuritySeverity.WARNING,
      'Reused password reset token attempted',
      { token, userId: tokenData.userId }
    );
    return null;
  }

  if (Date.now() > tokenData.expiresAt) {
    activeTokens.delete(token);
    logSecurityEvent(
      SecurityEventType.AUTH,
      SecuritySeverity.WARNING,
      'Expired password reset token attempted',
      { token, userId: tokenData.userId }
    );
    return null;
  }

  // Mark token as used
  tokenData.used = true;
  
  logSecurityEvent(
    SecurityEventType.AUTH,
    SecuritySeverity.INFO,
    'Password reset token verified',
    { token, userId: tokenData.userId }
  );

  return tokenData.userId;
};

// Clean up expired tokens
const cleanupExpiredTokens = () => {
  const now = Date.now();
  for (const [token, data] of activeTokens.entries()) {
    if (now > data.expiresAt) {
      activeTokens.delete(token);
    }
  }
};

// Schedule cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

module.exports = {
  generateResetToken,
  verifyResetToken,
  cleanupExpiredTokens
}; 