const winston = require('winston');
const { format } = winston;
const fs = require('fs');
const path = require('path');

// Security event types
const SecurityEventType = {
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILURE: 'auth_failure',
  RATE_LIMIT: 'rate_limit',
  FILE_UPLOAD: 'file_upload',
  INVALID_REQUEST: 'invalid_request',
  SECURITY_VIOLATION: 'security_violation',
  SYSTEM: 'system'  // Added SYSTEM type
};

// Security event severity levels
const SecuritySeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
};

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create security logger
const securityLogger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.errors({ stack: true })
  ),
  defaultMeta: { service: 'security-service' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'security.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'security-error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  securityLogger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Log security event
const logSecurityEvent = (type, severity, message, details = {}) => {
  securityLogger.log({
    level: severity.toLowerCase(),
    type,
    message,
    ...details
  });
};

// Middleware for logging security events
const securityLoggingMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logSecurityEvent(
    SecurityEventType.SYSTEM,
    SecuritySeverity.INFO,
    `API Request: ${req.method} ${req.path}`,
    {
      ip: req.ip,
      userId: req.user?.id,
      userAgent: req.get('user-agent')
    }
  );

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    if (status >= 400) {
      logSecurityEvent(
        SecurityEventType.SYSTEM,
        status >= 500 ? SecuritySeverity.ERROR : SecuritySeverity.WARNING,
        `API Response: ${req.method} ${req.path} - ${status}`,
        {
          ip: req.ip,
          userId: req.user?.id,
          duration,
          status
        }
      );
    }
  });

  next();
};

module.exports = {
  SecurityEventType,
  SecuritySeverity,
  logSecurityEvent,
  securityLoggingMiddleware
}; 