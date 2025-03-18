const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');
const { authenticateAdmin } = require('../middleware/auth');

/**
 * @route GET /api/analytics/dashboard
 * @desc Get analytics dashboard data
 * @access Private (Admin only)
 */
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const dashboardData = await AnalyticsService.getDashboardData();
    
    // Add time-based filtering
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - parseInt(timeRange));
    
    // Get processing time trend
    const processingTimeTrend = await AnalyticsService.getProcessingTimeTrend(startTime);
    
    res.json({
      ...dashboardData,
      processingTimeTrend
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * @route GET /api/analytics/leads
 * @desc Get lead generation analytics
 * @access Private (Admin only)
 */
router.get('/leads', authenticateAdmin, async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - parseInt(timeRange));
    
    const leadAnalytics = await AnalyticsService.getLeadAnalytics(startTime);
    res.json(leadAnalytics);
  } catch (error) {
    console.error('Lead analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch lead analytics' });
  }
});

/**
 * @route GET /api/analytics/performance
 * @desc Get performance metrics
 * @access Private (Admin only)
 */
router.get('/performance', authenticateAdmin, async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - parseInt(timeRange));
    
    const performanceMetrics = await AnalyticsService.getPerformanceMetrics(startTime);
    res.json(performanceMetrics);
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

/**
 * @route GET /api/analytics/errors
 * @desc Get error analytics
 * @access Private (Admin only)
 */
router.get('/errors', authenticateAdmin, async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - parseInt(timeRange));
    
    const errorAnalytics = await AnalyticsService.getErrorAnalytics(startTime);
    res.json(errorAnalytics);
  } catch (error) {
    console.error('Error analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch error analytics' });
  }
});

module.exports = router; 