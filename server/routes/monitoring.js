const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const MonitoringService = require('../services/monitoringService');

// Get current face preservation metrics
router.get('/current-metrics', authenticateToken, async (req, res) => {
  try {
    const metrics = await MonitoringService.getCurrentMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching current metrics:', error);
    res.status(500).json({ error: 'Failed to fetch current metrics' });
  }
});

// Get face analytics data for a date range
router.get('/face-analytics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await MonitoringService.getFaceAnalytics(startDate, endDate);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching face analytics:', error);
    res.status(500).json({ error: 'Failed to fetch face analytics' });
  }
});

// Get application performance metrics
router.get('/app-metrics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const metrics = await MonitoringService.getApplicationMetrics(startDate, endDate);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching application metrics:', error);
    res.status(500).json({ error: 'Failed to fetch application metrics' });
  }
});

// Get detailed face preservation report
router.get('/face-report', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await MonitoringService.getFacePreservationReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error('Error fetching face preservation report:', error);
    res.status(500).json({ error: 'Failed to fetch face preservation report' });
  }
});

// Get system health status
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const health = await MonitoringService.getSystemHealth();
    res.json(health);
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
});

module.exports = router; 