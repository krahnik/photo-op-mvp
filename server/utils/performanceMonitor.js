const client = require('prom-client');
const { logSecurityEvent, SecurityEventType, SecuritySeverity } = require('./securityLogger');

// Create a Registry to register metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'photo-op'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const errorRate = new client.Counter({
  name: 'error_total',
  help: 'Total number of errors',
  labelNames: ['type', 'route']
});

const activeUsers = new client.Gauge({
  name: 'active_users',
  help: 'Number of active users'
});

const memoryUsage = new client.Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type']
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestTotal);
register.registerMetric(errorRate);
register.registerMetric(activeUsers);
register.registerMetric(memoryUsage);

// Middleware to monitor request duration
const performanceMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;

    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(durationInSeconds);

    httpRequestTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    });

    if (res.statusCode >= 400) {
      errorRate.inc({
        type: res.statusCode >= 500 ? 'server' : 'client',
        route: req.route?.path || req.path
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

// Metrics endpoint handler
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