const promClient = require('prom-client');
const { logSecurityEvent, SecurityEventType, SecuritySeverity } = require('./securityLogger');

// Create a Registry
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const errorRate = new promClient.Counter({
  name: 'error_total',
  help: 'Total number of errors',
  labelNames: ['type', 'route']
});

const activeUsers = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of active users'
});

const memoryUsage = new promClient.Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(errorRate);
register.registerMetric(activeUsers);
register.registerMetric(memoryUsage);

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Track response
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.observe(
      { method: req.method, route, status: res.statusCode },
      duration
    );
    
    httpRequestTotal.inc({
      method: req.method,
      route,
      status: res.statusCode
    });

    if (res.statusCode >= 400) {
      errorRate.inc({
        type: res.statusCode >= 500 ? 'server' : 'client',
        route
      });
    }
  });

  next();
};

// Update memory usage metrics
const updateMemoryMetrics = () => {
  const usage = process.memoryUsage();
  Object.entries(usage).forEach(([type, value]) => {
    memoryUsage.set({ type }, value);
  });
};

// Update metrics every 15 seconds
setInterval(updateMemoryMetrics, 15000);

// Export metrics endpoint handler
const metricsHandler = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logSecurityEvent(
      SecurityEventType.SYSTEM,
      SecuritySeverity.ERROR,
      'Error generating metrics',
      { error: error.message }
    );
    res.status(500).end();
  }
};

module.exports = {
  performanceMiddleware,
  metricsHandler,
  activeUsers,
  errorRate,
  memoryUsage
}; 