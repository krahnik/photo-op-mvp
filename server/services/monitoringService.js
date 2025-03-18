const axios = require('axios');
const { config } = require('../config');

class MonitoringService {
  /**
   * Track face preservation metrics
   * @param {Object} metrics - Face preservation metrics
   */
  static async trackFacePreservationMetrics(metrics) {
    try {
      const formData = new FormData();
      formData.append('metrics', JSON.stringify({
        timestamp: new Date().toISOString(),
        ...metrics
      }));

      await axios.post(
        `${config.monitoringServiceUrl}/track-face-metrics`,
        formData,
        {
          headers: formData.getHeaders()
        }
      );
    } catch (error) {
      console.error('Error tracking face metrics:', error);
    }
  }

  /**
   * Track application performance metrics
   * @param {Object} metrics - Application performance metrics
   */
  static async trackApplicationMetrics(metrics) {
    try {
      const formData = new FormData();
      formData.append('metrics', JSON.stringify({
        timestamp: new Date().toISOString(),
        ...metrics
      }));

      await axios.post(
        `${config.monitoringServiceUrl}/track-app-metrics`,
        formData,
        {
          headers: formData.getHeaders()
        }
      );
    } catch (error) {
      console.error('Error tracking application metrics:', error);
    }
  }

  /**
   * Get face preservation quality report
   * @param {Date} startDate - Start date for the report
   * @param {Date} endDate - End date for the report
   */
  static async getFacePreservationReport(startDate, endDate) {
    try {
      const response = await axios.get(
        `${config.monitoringServiceUrl}/face-preservation-report`,
        {
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting face preservation report:', error);
      throw error;
    }
  }

  /**
   * Get application performance report
   * @param {Date} startDate - Start date for the report
   * @param {Date} endDate - End date for the report
   */
  static async getApplicationReport(startDate, endDate) {
    try {
      const response = await axios.get(
        `${config.monitoringServiceUrl}/application-report`,
        {
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting application report:', error);
      throw error;
    }
  }

  /**
   * Get real-time monitoring dashboard data
   */
  static async getDashboardData() {
    try {
      const [faceMetrics, appMetrics] = await Promise.all([
        axios.get(`${config.monitoringServiceUrl}/face-metrics-summary`),
        axios.get(`${config.monitoringServiceUrl}/app-metrics-summary`)
      ]);

      return {
        face_metrics: faceMetrics.data,
        app_metrics: appMetrics.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }
}

module.exports = MonitoringService; 