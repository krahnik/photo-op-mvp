const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const TRACKING_FILE = path.join(__dirname, '../../ai_model/image_tracking.csv');

// Ensure tracking file exists
if (!fs.existsSync(TRACKING_FILE)) {
  const headers = ['timestamp', 'request_id', 'filename', 'status', 'user_id', 'metadata'];
  fs.writeFileSync(TRACKING_FILE, headers.join(',') + '\n');
}

const csvWriter = createCsvWriter({
  path: TRACKING_FILE,
  header: [
    { id: 'timestamp', title: 'timestamp' },
    { id: 'request_id', title: 'request_id' },
    { id: 'filename', title: 'filename' },
    { id: 'status', title: 'status' },
    { id: 'user_id', title: 'user_id' },
    { id: 'metadata', title: 'metadata' }
  ],
  append: true
});

class TrackingService {
  /**
   * Track a new image operation
   * @param {Object} data - Tracking data
   */
  static async trackOperation(data) {
    try {
      // Convert metadata to string if it's an object
      if (data.metadata && typeof data.metadata === 'object') {
        data.metadata = JSON.stringify(data.metadata);
      }

      await csvWriter.writeRecords([data]);
      return true;
    } catch (error) {
      console.error('Error tracking operation:', error);
      return false;
    }
  }

  /**
   * Get tracking history for a request
   * @param {string} requestId - Request ID to get history for
   */
  static async getTrackingHistory(requestId) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(TRACKING_FILE)
        .pipe(csv())
        .on('data', (data) => {
          if (data.request_id === requestId) {
            // Parse metadata if it exists
            if (data.metadata) {
              try {
                data.metadata = JSON.parse(data.metadata);
              } catch (e) {
                // Keep as string if parsing fails
              }
            }
            results.push(data);
          }
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  /**
   * Get all tracking records
   */
  static async getAllRecords() {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(TRACKING_FILE)
        .pipe(csv())
        .on('data', (data) => {
          // Parse metadata if it exists
          if (data.metadata) {
            try {
              data.metadata = JSON.parse(data.metadata);
            } catch (e) {
              // Keep as string if parsing fails
            }
          }
          results.push(data);
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  /**
   * Get tracking statistics
   */
  static async getStatistics() {
    const records = await this.getAllRecords();
    const stats = {
      total: records.length,
      byStatus: {},
      byUser: {},
      recent: records.slice(-10) // Last 10 records
    };

    records.forEach(record => {
      // Count by status
      stats.byStatus[record.status] = (stats.byStatus[record.status] || 0) + 1;
      
      // Count by user if user_id exists
      if (record.user_id) {
        stats.byUser[record.user_id] = (stats.byUser[record.user_id] || 0) + 1;
      }
    });

    return stats;
  }
}

module.exports = TrackingService; 