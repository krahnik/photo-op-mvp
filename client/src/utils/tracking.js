import axios from 'axios';
import { config } from '../config';

// Tracking status constants
export const TrackingStatus = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EMAILED: 'emailed'
};

/**
 * Track an image operation
 * @param {Object} data - Tracking data
 * @param {string} data.request_id - Unique request ID
 * @param {string} data.filename - Original filename
 * @param {string} data.status - Current status
 * @param {string} [data.user_id] - Optional user ID
 * @param {Object} [data.metadata] - Optional metadata
 */
export const trackImageOperation = async (data) => {
  try {
    const timestamp = new Date().toISOString();
    const trackingData = {
      timestamp,
      ...data
    };

    // Send tracking data to server
    await axios.post(`${config.serverUrl}/track`, trackingData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Image operation tracked:', trackingData);
  } catch (error) {
    console.error('Failed to track image operation:', error);
    // Don't throw error to prevent disrupting the main flow
  }
};

/**
 * Update tracking status
 * @param {string} request_id - Request ID to update
 * @param {string} status - New status
 * @param {Object} [metadata] - Optional metadata to update
 */
export const updateTrackingStatus = async (request_id, status, metadata = {}) => {
  try {
    await axios.post(`${config.serverUrl}/track/status`, {
      request_id,
      status,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  } catch (error) {
    console.error('Failed to update tracking status:', error);
  }
};

/**
 * Get tracking history for a request
 * @param {string} request_id - Request ID to get history for
 */
export const getTrackingHistory = async (request_id) => {
  try {
    const response = await axios.get(`${config.serverUrl}/track/${request_id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get tracking history:', error);
    return null;
  }
}; 