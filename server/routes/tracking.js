const express = require('express');
const router = express.Router();
const TrackingService = require('../services/trackingService');
const { authenticateToken } = require('../middleware/auth');

// Track a new operation
router.post('/track', authenticateToken, async (req, res) => {
  try {
    const success = await TrackingService.trackOperation({
      ...req.body,
      user_id: req.user.id // Add user ID from authentication
    });

    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Failed to track operation' });
    }
  } catch (error) {
    console.error('Error in track endpoint:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update tracking status
router.post('/track/status', authenticateToken, async (req, res) => {
  try {
    const success = await TrackingService.trackOperation({
      ...req.body,
      user_id: req.user.id
    });

    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update status' });
    }
  } catch (error) {
    console.error('Error in track/status endpoint:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get tracking history for a request
router.get('/track/:requestId', authenticateToken, async (req, res) => {
  try {
    const history = await TrackingService.getTrackingHistory(req.params.requestId);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error in track/:requestId endpoint:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get tracking statistics (admin only)
router.get('/track/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const stats = await TrackingService.getStatistics();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error in track/stats endpoint:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router; 