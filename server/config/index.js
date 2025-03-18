require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/photo_op',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:5002',
  monitoringServiceUrl: process.env.MONITORING_SERVICE_URL || 'http://localhost:5003',
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  },
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

module.exports = { config }; 