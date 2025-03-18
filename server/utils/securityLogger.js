const winston = require('winston');
const { format } = winston;

// Security event types
const SecurityEventType = {
  AUTH: 'AUTH',
  RATE_LIMIT: 'RATE_LIMIT',
  FILE_UPLOAD: 'FILE_UPLOAD',
  POLICY_VIOLATION: 'POLICY_VIOLATION',
  SYSTEM: 'SYSTEM'
};

// Security event severity levels
const SecuritySeverity = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

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
      filename: 'logs/security.log',
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'logs/security-error.log',
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
const logSecurityEvent = (eventType, severity, message, metadata = {}) => {
  const logData = {
    eventType,
    severity,
    message,
    ...metadata,
    timestamp: new Date().toISOString(),
    ip: metadata.ip || 'unknown',
    userId: metadata.userId || 'anonymous'
  };

  switch (severity) {
    case SecuritySeverity.INFO:
      securityLogger.info(message, logData);
      break;
    case SecuritySeverity.WARNING:
      securityLogger.warn(message, logData);
      break;
    case SecuritySeverity.ERROR:
      securityLogger.error(message, logData);
      break;
    case SecuritySeverity.CRITICAL:
      securityLogger.error(message, { ...logData, critical: true });
      break;
  }
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