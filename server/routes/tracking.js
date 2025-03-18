const express = require('express');
const router = express.Router();
const trackingService = require('../services/trackingService');
const { authenticateToken } = require('../middleware/auth');

// Track a new operation
router.post('/track', authenticateToken, async (req, res) => {
  try {
    const { eventType, details } = req.body;
    const event = await trackingService.trackEvent(eventType, req.user.id, details);
    res.json({ success: true, event });
  } catch (error) {
    console.error('Error in track endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update tracking status
router.post('/track/status', authenticateToken, async (req, res) => {
  try {
    const { eventType, details } = req.body;
    const event = await trackingService.trackEvent(eventType, req.user.id, {
      ...details,
      status: 'updated'
    });
    res.json({ success: true, event });
  } catch (error) {
    console.error('Error in track/status endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tracking history for a request
router.get('/track/:requestId', authenticateToken, async (req, res) => {
  try {
    const events = await trackingService.getEvents({
      userId: req.user.id,
      requestId: req.params.requestId
    });
    res.json({ success: true, events });
  } catch (error) {
    console.error('Error in track/:requestId endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tracking statistics (admin only)
router.get('/track/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const events = await trackingService.getEvents({});
    const stats = {
      totalEvents: events.length,
      eventsByType: events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {}),
      eventsByUser: events.reduce((acc, event) => {
        acc[event.userId] = (acc[event.userId] || 0) + 1;
        return acc;
      }, {})
    };
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error in track/stats endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Track event (public endpoint)
router.post('/event', async (req, res) => {
  try {
    const { eventType, userId, details } = req.body;
    const event = await trackingService.trackEvent(eventType, userId, details);
    res.json({ success: true, event });
  } catch (error) {
    console.error('Error in event endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 