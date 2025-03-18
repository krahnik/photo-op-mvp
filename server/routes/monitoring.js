const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const MonitoringService = require('../services/monitoringService');

// Get current face preservation metrics
router.get('/current-metrics', authenticateToken, async (req, res) => {
  try {
    const metrics = await MonitoringService.getDashboardData();
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
    const analytics = await MonitoringService.getFacePreservationReport(
      new Date(startDate),
      new Date(endDate)
    );
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching face analytics:', error);
    res.status(500).json({ error: 'Failed to fetch face analytics' });
  }
});

// Get application performance metrics
router.get('/app-metrics', authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const metrics = await MonitoringService.getApplicationReport(
      new Date(startDate),
      new Date(endDate)
    );
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching application metrics:', error);
    res.status(500).json({ error: 'Failed to fetch application metrics' });
  }
});

// Get system health status
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system metrics (admin only)
router.get('/metrics', authenticateAdmin, async (req, res) => {
  try {
    const metrics = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString()
    };
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 