const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');

// Store failed attempts with timestamps and cleanup old entries periodically
const failedAttempts = new Map();

// Cleanup old entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of failedAttempts.entries()) {
    if (now - value.timestamp > 15 * 60 * 1000) {
      failedAttempts.delete(key);
    }
  }
}, 15 * 60 * 1000);

// Basic rate limiter with sliding window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Allow more requests per window
  message: {
    status: 'error',
    message: 'Too many requests. Please try again in a few minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// Auth rate limit with gradual backoff
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: (req) => {
    const ip = req.ip;
    const attempts = failedAttempts.get(ip);
    if (!attempts) return 100; // Initial limit
    
    // Calculate time since last attempt
    const timeSinceLastAttempt = Date.now() - attempts.timestamp;
    
    // Reset attempts if enough time has passed
    if (timeSinceLastAttempt > 30 * 60 * 1000) { // 30 minutes
      failedAttempts.delete(ip);
      return 100;
    }
    
    // Gradual reduction based on failed attempts
    return Math.max(20, 100 - (attempts.count * 10)); // Minimum 20 attempts per hour
  },
  message: (req) => {
    const ip = req.ip;
    const attempts = failedAttempts.get(ip);
    const waitTime = attempts ? Math.min(Math.pow(1.5, attempts.count) * 60, 900) : 60; // Cap at 15 minutes
    
    return {
      status: 'error',
      message: 'Too many login attempts. Please try again later.',
      retryAfter: `${Math.ceil(waitTime / 60)} minutes`
    };
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    const ip = req.ip;
    const current = failedAttempts.get(ip) || { count: 0, timestamp: Date.now() };
    
    failedAttempts.set(ip, {
      count: current.count + 1,
      timestamp: Date.now()
    });
    
    const waitTime = Math.min(Math.pow(1.5, current.count + 1) * 60, 900);
    
    res.status(429).json({
      status: 'error',
      message: 'Too many login attempts. Please try again later.',
      retryAfter: `${Math.ceil(waitTime / 60)} minutes`
    });
  }
});

// Upload limiter with higher limits
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: {
    status: 'error',
    message: 'Upload limit reached. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Security headers middleware
const securityHeaders = helmet();

// XSS prevention middleware
const xss = () => xssClean();

// File upload security middleware
const fileUploadSecurity = (req, res, next) => {
  if (!req.file) return next();

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return res.status(400).json({ error: 'File too large' });
  }

  next();
};

module.exports = {
  limiter,
  authLimiter,
  uploadLimiter,
  securityHeaders,
  xss,
  hpp,
  mongoSanitize,
  fileUploadSecurity
}; 