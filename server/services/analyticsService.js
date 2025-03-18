const PostHog = require('posthog-node');
const Sentry = require('@sentry/node');
const { register, Counter, Histogram, Gauge } = require('prom-client');
const { config } = require('../config');
const mongoose = require('mongoose');

// Initialize PostHog client
const posthog = new PostHog(config.POSTHOG_API_KEY, {
  host: config.POSTHOG_HOST,
  flushAt: 1,
  flushInterval: 0
});

// Initialize Sentry
Sentry.init({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0
});

// Prometheus metrics
const metrics = {
  // User metrics
  activeUsers: new Gauge({
    name: 'photo_op_active_users',
    help: 'Number of active users'
  }),
  totalTransforms: new Counter({
    name: 'photo_op_total_transforms',
    help: 'Total number of image transformations'
  }),
  
  // Performance metrics
  transformDuration: new Histogram({
    name: 'photo_op_transform_duration_seconds',
    help: 'Duration of image transformations',
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  }),
  
  // Error metrics
  errorCount: new Counter({
    name: 'photo_op_error_count',
    help: 'Total number of errors',
    labelNames: ['type']
  }),
  
  // Quality metrics
  faceDetectionSuccess: new Counter({
    name: 'photo_op_face_detection_success',
    help: 'Number of successful face detections'
  }),
  styleTransferQuality: new Gauge({
    name: 'photo_op_style_transfer_quality',
    help: 'Quality score of style transfers',
    labelNames: ['style']
  })
};

// MongoDB schemas for analytics
const UserSessionSchema = new mongoose.Schema({
  sessionId: String,
  userId: String,
  startTime: Date,
  endTime: Date,
  deviceInfo: Object,
  location: Object,
  events: [{
    type: String,
    timestamp: Date,
    properties: Object
  }]
});

const TransformEventSchema = new mongoose.Schema({
  userId: String,
  sessionId: String,
  timestamp: Date,
  style: String,
  adjustments: Object,
  quality: Object,
  faceMetrics: Object,
  demographicMetrics: Object,
  expressionMetrics: Object,
  processingTime: Number,
  success: Boolean,
  error: Object
});

const LeadSchema = new mongoose.Schema({
  email: String,
  name: String,
  timestamp: Date,
  source: String,
  events: [{
    type: String,
    timestamp: Date,
    properties: Object
  }],
  conversion: {
    status: String,
    timestamp: Date,
    value: Number
  }
});

// Create models
const UserSession = mongoose.model('UserSession', UserSessionSchema);
const TransformEvent = mongoose.model('TransformEvent', TransformEventSchema);
const Lead = mongoose.model('Lead', LeadSchema);

class AnalyticsService {
  /**
   * Track user session
   * @param {Object} sessionData - Session information
   */
  static async trackSession(sessionData) {
    try {
      // Track in PostHog
      await posthog.capture({
        distinctId: sessionData.userId,
        event: 'session_start',
        properties: {
          deviceInfo: sessionData.deviceInfo,
          location: sessionData.location
        }
      });

      // Store in MongoDB
      const session = new UserSession({
        sessionId: sessionData.sessionId,
        userId: sessionData.userId,
        startTime: new Date(),
        deviceInfo: sessionData.deviceInfo,
        location: sessionData.location
      });
      await session.save();

      // Update Prometheus metrics
      metrics.activeUsers.inc();
    } catch (error) {
      console.error('Session tracking error:', error);
      Sentry.captureException(error);
    }
  }

  /**
   * Track image transformation event
   * @param {Object} eventData - Transformation event data
   */
  static async trackTransform(eventData) {
    try {
      // Track in PostHog
      await posthog.capture({
        distinctId: eventData.userId,
        event: 'image_transform',
        properties: {
          style: eventData.style,
          adjustments: eventData.adjustments,
          quality: eventData.quality,
          processingTime: eventData.processingTime
        }
      });

      // Store in MongoDB
      const transform = new TransformEvent({
        userId: eventData.userId,
        sessionId: eventData.sessionId,
        timestamp: new Date(),
        style: eventData.style,
        adjustments: eventData.adjustments,
        quality: eventData.quality,
        faceMetrics: eventData.faceMetrics,
        demographicMetrics: eventData.demographicMetrics,
        expressionMetrics: eventData.expressionMetrics,
        processingTime: eventData.processingTime,
        success: eventData.success,
        error: eventData.error
      });
      await transform.save();

      // Update Prometheus metrics
      metrics.totalTransforms.inc();
      metrics.transformDuration.observe(eventData.processingTime);
      
      if (eventData.faceMetrics?.detection_confidence > 0.9) {
        metrics.faceDetectionSuccess.inc();
      }
      
      if (eventData.quality?.score) {
        metrics.styleTransferQuality.set({ style: eventData.style }, eventData.quality.score);
      }
    } catch (error) {
      console.error('Transform tracking error:', error);
      Sentry.captureException(error);
    }
  }

  /**
   * Track lead generation
   * @param {Object} leadData - Lead information
   */
  static async trackLead(leadData) {
    try {
      // Track in PostHog
      await posthog.capture({
        distinctId: leadData.email,
        event: 'lead_capture',
        properties: {
          name: leadData.name,
          source: leadData.source
        }
      });

      // Store in MongoDB
      const lead = new Lead({
        email: leadData.email,
        name: leadData.name,
        timestamp: new Date(),
        source: leadData.source,
        events: [{
          type: 'capture',
          timestamp: new Date(),
          properties: leadData
        }]
      });
      await lead.save();
    } catch (error) {
      console.error('Lead tracking error:', error);
      Sentry.captureException(error);
    }
  }

  /**
   * Track error event
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  static async trackError(error, context = {}) {
    try {
      // Track in Sentry
      Sentry.withScope(scope => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        Sentry.captureException(error);
      });

      // Update Prometheus metrics
      metrics.errorCount.inc({ type: error.name });

      // Track in PostHog
      await posthog.capture({
        distinctId: context.userId || 'anonymous',
        event: 'error',
        properties: {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          },
          context
        }
      });
    } catch (trackingError) {
      console.error('Error tracking error:', trackingError);
    }
  }

  /**
   * Get analytics dashboard data
   * @returns {Promise<Object>} Dashboard metrics
   */
  static async getDashboardData() {
    try {
      const [
        activeUsers,
        totalTransforms,
        recentLeads,
        errorRate,
        transformQuality
      ] = await Promise.all([
        UserSession.countDocuments({ endTime: null }),
        TransformEvent.countDocuments(),
        Lead.find().sort({ timestamp: -1 }).limit(10),
        metrics.errorCount.get(),
        TransformEvent.aggregate([
          { $group: { _id: '$style', avgQuality: { $avg: '$quality.score' } } }
        ])
      ]);

      return {
        activeUsers,
        totalTransforms,
        recentLeads,
        errorRate: errorRate.values[0].value,
        transformQuality,
        prometheusMetrics: await register.metrics()
      };
    } catch (error) {
      console.error('Dashboard data error:', error);
      Sentry.captureException(error);
      throw error;
    }
  }
}

module.exports = AnalyticsService; 