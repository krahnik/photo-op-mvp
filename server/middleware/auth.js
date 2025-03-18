const jwt = require('jsonwebtoken');
const { logSecurityEvent, SecurityEventType, SecuritySeverity } = require('../utils/securityLogger');

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logSecurityEvent(
      SecurityEventType.AUTH_FAILURE,
      SecuritySeverity.MEDIUM,
      'Missing authentication token',
      { ip: req.ip }
    );
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    logSecurityEvent(
      SecurityEventType.AUTH_FAILURE,
      SecuritySeverity.HIGH,
      'Invalid authentication token',
      { ip: req.ip, error: error.message }
    );
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to authenticate admin users
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logSecurityEvent(
      SecurityEventType.AUTH_FAILURE,
      SecuritySeverity.HIGH,
      'Missing admin authentication token',
      { ip: req.ip }
    );
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!user.isAdmin) {
      logSecurityEvent(
        SecurityEventType.AUTH_FAILURE,
        SecuritySeverity.HIGH,
        'Non-admin user attempted to access admin endpoint',
        { ip: req.ip, userId: user.id }
      );
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    logSecurityEvent(
      SecurityEventType.AUTH_FAILURE,
      SecuritySeverity.HIGH,
      'Invalid admin authentication token',
      { ip: req.ip, error: error.message }
    );
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = {
  authenticateToken,
  authenticateAdmin
}; 