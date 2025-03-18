const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Account lockout configuration
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const MAX_FAILED_ATTEMPTS = 5;

// Store failed login attempts
const failedAttempts = new Map();

// Password validation
const validatePassword = (password) => {
  try {
    passwordSchema.parse(password);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors.map(err => err.message)
    };
  }
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

// Verify password
const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
      algorithm: 'HS256',
      issuer: 'photo-op',
      audience: 'photo-op-users'
    }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'photo-op',
      audience: 'photo-op-users'
    });
  } catch (error) {
    return null;
  }
};

// Check account lockout
const checkLockout = (email) => {
  const attempts = failedAttempts.get(email);
  if (attempts && attempts.count >= MAX_FAILED_ATTEMPTS) {
    const lockoutTime = attempts.lastAttempt + LOCKOUT_DURATION;
    if (Date.now() < lockoutTime) {
      return {
        locked: true,
        remainingTime: Math.ceil((lockoutTime - Date.now()) / 1000)
      };
    }
    // Reset if lockout duration has passed
    failedAttempts.delete(email);
  }
  return { locked: false };
};

// Record failed login attempt
const recordFailedAttempt = (email) => {
  const attempts = failedAttempts.get(email) || { count: 0, lastAttempt: Date.now() };
  attempts.count++;
  attempts.lastAttempt = Date.now();
  failedAttempts.set(email, attempts);
};

// Reset failed attempts
const resetFailedAttempts = (email) => {
  failedAttempts.delete(email);
};

module.exports = {
  validatePassword,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  checkLockout,
  recordFailedAttempt,
  resetFailedAttempts
}; 